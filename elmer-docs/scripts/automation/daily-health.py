#!/usr/bin/env python3
"""
Daily health check script.
Run via cron at 9am to get morning status update.

Checks:
- Stale initiatives (>7 days warning, >14 days alert)
- Blocked items
- Items missing owners
- Phase distribution
- Workspace integrity
"""

import json
import os
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional
import subprocess

# Configuration
SCRIPT_DIR = Path(__file__).parent
WORKSPACE_ROOT = SCRIPT_DIR.parent.parent
ROADMAP_PATH = WORKSPACE_ROOT / "roadmap" / "roadmap.json"
SLACK_WEBHOOK_URL = os.environ.get("PM_SLACK_WEBHOOK")  # Set in environment

# Thresholds
STALE_WARNING_DAYS = 7
STALE_ALERT_DAYS = 14


def load_roadmap() -> Dict:
    """Load the current roadmap data."""
    if not ROADMAP_PATH.exists():
        return {"initiatives": [], "summary": {}}
    return json.loads(ROADMAP_PATH.read_text())


def check_health(roadmap: Dict) -> Dict:
    """Run health checks and return findings."""
    findings = {
        "stale_alerts": [],      # >14 days
        "stale_warnings": [],    # 7-14 days
        "blocked": [],
        "missing_owner": [],
        "at_risk": [],
        "ready_to_advance": [],
        "summary": {}
    }
    
    for init in roadmap.get("initiatives", []):
        name = init.get("name", init.get("id", "Unknown"))
        phase = init.get("phase", "unknown")
        days = init.get("timeline", {}).get("days_in_phase", 0)
        days = days if days else init.get("metrics", {}).get("days_in_phase", 0)
        status = init.get("status", "unknown")
        owner = init.get("owner")
        blockers = init.get("blockers", [])
        priority = init.get("priority", "P2")
        
        # Check stale
        if days >= STALE_ALERT_DAYS:
            findings["stale_alerts"].append({
                "name": name, "phase": phase, "days": days, "priority": priority
            })
        elif days >= STALE_WARNING_DAYS:
            findings["stale_warnings"].append({
                "name": name, "phase": phase, "days": days, "priority": priority
            })
        
        # Check blocked
        if blockers or status == "blocked":
            findings["blocked"].append({
                "name": name, "phase": phase, "blockers": blockers
            })
        
        # Check at risk
        if status == "at_risk":
            findings["at_risk"].append({
                "name": name, "phase": phase, "days": days
            })
        
        # Check missing owner
        if not owner and priority in ["P0", "P1"]:
            findings["missing_owner"].append({
                "name": name, "phase": phase, "priority": priority
            })
    
    # Add summary
    findings["summary"] = roadmap.get("summary", {})
    
    return findings


def format_slack_message(findings: Dict) -> Dict:
    """Format findings as a Slack message."""
    blocks = []
    
    # Header
    health_emoji = "✅" if not findings["stale_alerts"] and not findings["blocked"] else "⚠️"
    blocks.append({
        "type": "header",
        "text": {
            "type": "plain_text",
            "text": f"{health_emoji} Daily PM Health Check"
        }
    })
    
    # Summary section
    summary = findings.get("summary", {})
    total = summary.get("total_initiatives", 0)
    by_phase = summary.get("by_phase", {})
    
    phase_text = " | ".join([
        f"{phase.title()}: {count}" 
        for phase, count in by_phase.items() 
        if count > 0
    ])
    
    blocks.append({
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": f"*{total} initiatives* across phases:\n{phase_text}"
        }
    })
    
    # Alerts section
    if findings["stale_alerts"]:
        alert_text = "*🚨 Stale Alerts (>14 days):*\n"
        for item in findings["stale_alerts"]:
            alert_text += f"• *{item['name']}* - {item['days']} days in {item['phase']} ({item['priority']})\n"
        blocks.append({
            "type": "section",
            "text": {"type": "mrkdwn", "text": alert_text}
        })
    
    # Warnings section
    if findings["stale_warnings"]:
        warn_text = "*⚠️ Approaching Stale (7-14 days):*\n"
        for item in findings["stale_warnings"]:
            warn_text += f"• {item['name']} - {item['days']} days in {item['phase']}\n"
        blocks.append({
            "type": "section",
            "text": {"type": "mrkdwn", "text": warn_text}
        })
    
    # Blocked section
    if findings["blocked"]:
        blocked_text = "*🚫 Blocked:*\n"
        for item in findings["blocked"]:
            blockers = ", ".join(item["blockers"]) if item["blockers"] else "No blocker details"
            blocked_text += f"• {item['name']} - {blockers}\n"
        blocks.append({
            "type": "section",
            "text": {"type": "mrkdwn", "text": blocked_text}
        })
    
    # All clear
    if not findings["stale_alerts"] and not findings["stale_warnings"] and not findings["blocked"]:
        blocks.append({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "✅ *All initiatives healthy!* No stale or blocked items."
            }
        })
    
    # Actions section
    blocks.append({"type": "divider"})
    blocks.append({
        "type": "context",
        "elements": [{
            "type": "mrkdwn",
            "text": f"Generated {datetime.now().strftime('%Y-%m-%d %H:%M')} | Run `/roadmap` for details"
        }]
    })
    
    return {"blocks": blocks}


def format_terminal_output(findings: Dict) -> str:
    """Format findings for terminal output."""
    lines = []
    lines.append("\n" + "=" * 60)
    lines.append("DAILY PM HEALTH CHECK")
    lines.append("=" * 60)
    lines.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n")
    
    # Summary
    summary = findings.get("summary", {})
    total = summary.get("total_initiatives", 0)
    lines.append(f"Total Initiatives: {total}")
    
    by_phase = summary.get("by_phase", {})
    lines.append("\nBy Phase:")
    for phase, count in by_phase.items():
        if count > 0:
            lines.append(f"  {phase.title()}: {count}")
    
    # Health status
    health = summary.get("health", {})
    lines.append("\nHealth:")
    for status, count in health.items():
        if count > 0:
            emoji = {"on_track": "✅", "at_risk": "⚠️", "blocked": "🚫", "stale": "💤"}.get(status, "")
            lines.append(f"  {emoji} {status.replace('_', ' ').title()}: {count}")
    
    # Alerts
    if findings["stale_alerts"]:
        lines.append("\n🚨 STALE ALERTS (>14 days):")
        for item in findings["stale_alerts"]:
            lines.append(f"  • {item['name']} - {item['days']} days in {item['phase']} ({item['priority']})")
    
    if findings["stale_warnings"]:
        lines.append("\n⚠️ APPROACHING STALE (7-14 days):")
        for item in findings["stale_warnings"]:
            lines.append(f"  • {item['name']} - {item['days']} days in {item['phase']}")
    
    if findings["blocked"]:
        lines.append("\n🚫 BLOCKED:")
        for item in findings["blocked"]:
            blockers = ", ".join(item["blockers"]) if item["blockers"] else "No details"
            lines.append(f"  • {item['name']} - {blockers}")
    
    if findings["missing_owner"]:
        lines.append("\n👤 MISSING OWNER (P0/P1):")
        for item in findings["missing_owner"]:
            lines.append(f"  • {item['name']} ({item['priority']})")
    
    if not findings["stale_alerts"] and not findings["stale_warnings"] and not findings["blocked"]:
        lines.append("\n✅ All initiatives healthy!")
    
    lines.append("\n" + "=" * 60)
    return "\n".join(lines)


def send_slack_notification(message: Dict) -> bool:
    """Send notification to Slack via webhook."""
    if not SLACK_WEBHOOK_URL:
        print("No Slack webhook configured. Set PM_SLACK_WEBHOOK environment variable.")
        return False
    
    import urllib.request
    import urllib.error
    
    data = json.dumps(message).encode('utf-8')
    req = urllib.request.Request(
        SLACK_WEBHOOK_URL,
        data=data,
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        urllib.request.urlopen(req)
        return True
    except urllib.error.URLError as e:
        print(f"Failed to send Slack notification: {e}")
        return False


def refresh_roadmap():
    """Refresh roadmap data before health check."""
    generate_script = WORKSPACE_ROOT / "scripts" / "generate-roadmap.py"
    if generate_script.exists():
        subprocess.run(["python3", str(generate_script)], capture_output=True)


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Daily PM health check")
    parser.add_argument("--slack", action="store_true", help="Send to Slack")
    parser.add_argument("--refresh", action="store_true", help="Refresh roadmap first")
    parser.add_argument("--quiet", action="store_true", help="Only output if issues found")
    args = parser.parse_args()
    
    # Refresh roadmap if requested
    if args.refresh:
        refresh_roadmap()
    
    # Load and check
    roadmap = load_roadmap()
    findings = check_health(roadmap)
    
    # Determine if we have issues
    has_issues = bool(
        findings["stale_alerts"] or 
        findings["stale_warnings"] or 
        findings["blocked"] or
        findings["missing_owner"]
    )
    
    # Output to terminal (unless quiet mode with no issues)
    if not args.quiet or has_issues:
        print(format_terminal_output(findings))
    
    # Send to Slack if requested
    if args.slack:
        message = format_slack_message(findings)
        if send_slack_notification(message):
            print("✅ Sent to Slack")
        else:
            print("❌ Failed to send to Slack")
    
    # Exit with code based on health
    if findings["stale_alerts"] or findings["blocked"]:
        exit(1)  # Critical issues
    elif findings["stale_warnings"]:
        exit(2)  # Warnings
    else:
        exit(0)  # All good


if __name__ == "__main__":
    main()
