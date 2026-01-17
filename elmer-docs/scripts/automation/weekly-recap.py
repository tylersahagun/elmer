#!/usr/bin/env python3
"""
Weekly recap script.
Run via cron on Monday morning for weekly summary.

Generates:
- Week-over-week progress comparison
- Phase transitions
- New initiatives
- Completed work
- Upcoming focus areas
"""

import json
import os
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional

# Configuration
SCRIPT_DIR = Path(__file__).parent
WORKSPACE_ROOT = SCRIPT_DIR.parent.parent
ROADMAP_PATH = WORKSPACE_ROOT / "roadmap" / "roadmap.json"
SNAPSHOTS_PATH = WORKSPACE_ROOT / "roadmap" / "snapshots"
SLACK_WEBHOOK_URL = os.environ.get("PM_SLACK_WEBHOOK")


def load_roadmap() -> Dict:
    """Load current roadmap."""
    if not ROADMAP_PATH.exists():
        return {"initiatives": [], "summary": {}}
    return json.loads(ROADMAP_PATH.read_text())


def load_previous_snapshot() -> Optional[Dict]:
    """Load the snapshot from ~7 days ago."""
    if not SNAPSHOTS_PATH.exists():
        return None
    
    target_date = datetime.now() - timedelta(days=7)
    
    # Find closest snapshot to 7 days ago
    snapshots = list(SNAPSHOTS_PATH.glob("*.json"))
    if not snapshots:
        return None
    
    closest = None
    closest_delta = None
    
    for snap in snapshots:
        try:
            snap_date = datetime.strptime(snap.stem, "%Y-%m-%d")
            delta = abs((snap_date - target_date).days)
            if closest_delta is None or delta < closest_delta:
                closest = snap
                closest_delta = delta
        except ValueError:
            continue
    
    if closest and closest_delta <= 10:  # Within 10 days
        return json.loads(closest.read_text())
    
    return None


def compare_roadmaps(current: Dict, previous: Optional[Dict]) -> Dict:
    """Compare current roadmap to previous snapshot."""
    changes = {
        "phase_transitions": [],
        "new_initiatives": [],
        "status_changes": [],
        "days_progressed": {},
        "summary_comparison": {}
    }
    
    if not previous:
        return changes
    
    # Build lookup for previous initiatives
    prev_lookup = {
        init["id"]: init 
        for init in previous.get("initiatives", [])
    }
    
    current_ids = set()
    
    for init in current.get("initiatives", []):
        init_id = init["id"]
        current_ids.add(init_id)
        name = init.get("name", init_id)
        
        if init_id not in prev_lookup:
            changes["new_initiatives"].append({
                "name": name,
                "phase": init.get("phase"),
                "priority": init.get("priority")
            })
        else:
            prev = prev_lookup[init_id]
            
            # Check phase transition
            if init.get("phase") != prev.get("phase"):
                changes["phase_transitions"].append({
                    "name": name,
                    "from_phase": prev.get("phase"),
                    "to_phase": init.get("phase")
                })
            
            # Check status change
            if init.get("status") != prev.get("status"):
                changes["status_changes"].append({
                    "name": name,
                    "from_status": prev.get("status"),
                    "to_status": init.get("status")
                })
    
    # Compare summaries
    curr_summary = current.get("summary", {})
    prev_summary = previous.get("summary", {})
    
    changes["summary_comparison"] = {
        "total_change": curr_summary.get("total_initiatives", 0) - prev_summary.get("total_initiatives", 0),
        "current_by_phase": curr_summary.get("by_phase", {}),
        "previous_by_phase": prev_summary.get("by_phase", {})
    }
    
    return changes


def calculate_focus_areas(roadmap: Dict) -> List[Dict]:
    """Determine recommended focus areas for the week."""
    focus = []
    
    initiatives = roadmap.get("initiatives", [])
    
    # P0 items not in launch/measure/learn
    active_phases = ["discovery", "define", "build", "validate"]
    p0_active = [
        init for init in initiatives 
        if init.get("priority") == "P0" and init.get("phase") in active_phases
    ]
    
    for init in p0_active[:3]:  # Top 3 P0s
        focus.append({
            "name": init.get("name"),
            "phase": init.get("phase"),
            "reason": "P0 priority",
            "next_action": init.get("next_action", "Review status")
        })
    
    # Items close to phase transition
    for init in initiatives:
        days = init.get("metrics", {}).get("days_in_phase", 0)
        if days >= 5 and init.get("phase") in ["define", "build"]:
            if init["id"] not in [f["name"] for f in focus]:
                focus.append({
                    "name": init.get("name"),
                    "phase": init.get("phase"),
                    "reason": f"{days} days in phase - check graduation criteria",
                    "next_action": f"Run /validate {init['id']}"
                })
    
    return focus[:5]  # Top 5 focus areas


def format_slack_message(roadmap: Dict, changes: Dict, focus: List[Dict]) -> Dict:
    """Format weekly recap for Slack."""
    blocks = []
    
    # Header
    blocks.append({
        "type": "header",
        "text": {
            "type": "plain_text",
            "text": "📊 Weekly PM Recap"
        }
    })
    
    # Date range
    blocks.append({
        "type": "context",
        "elements": [{
            "type": "mrkdwn",
            "text": f"Week of {datetime.now().strftime('%B %d, %Y')}"
        }]
    })
    
    # Summary
    summary = roadmap.get("summary", {})
    total = summary.get("total_initiatives", 0)
    total_change = changes.get("summary_comparison", {}).get("total_change", 0)
    change_text = f" ({'+' if total_change > 0 else ''}{total_change})" if total_change != 0 else ""
    
    blocks.append({
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": f"*{total} total initiatives{change_text}*"
        }
    })
    
    # Phase transitions
    if changes.get("phase_transitions"):
        trans_text = "*🎯 Phase Transitions:*\n"
        for t in changes["phase_transitions"]:
            trans_text += f"• {t['name']}: {t['from_phase']} → {t['to_phase']}\n"
        blocks.append({
            "type": "section",
            "text": {"type": "mrkdwn", "text": trans_text}
        })
    
    # New initiatives
    if changes.get("new_initiatives"):
        new_text = "*🆕 New Initiatives:*\n"
        for n in changes["new_initiatives"]:
            new_text += f"• {n['name']} ({n['priority']}) - {n['phase']}\n"
        blocks.append({
            "type": "section",
            "text": {"type": "mrkdwn", "text": new_text}
        })
    
    # Focus areas
    if focus:
        blocks.append({"type": "divider"})
        focus_text = "*🎯 This Week's Focus:*\n"
        for i, f in enumerate(focus, 1):
            focus_text += f"{i}. *{f['name']}* ({f['phase']})\n   _{f['reason']}_\n"
        blocks.append({
            "type": "section",
            "text": {"type": "mrkdwn", "text": focus_text}
        })
    
    # Footer
    blocks.append({"type": "divider"})
    blocks.append({
        "type": "context",
        "elements": [{
            "type": "mrkdwn",
            "text": "Run `/roadmap` for full details | `/status [name]` for initiative status"
        }]
    })
    
    return {"blocks": blocks}


def format_terminal_output(roadmap: Dict, changes: Dict, focus: List[Dict]) -> str:
    """Format for terminal output."""
    lines = []
    lines.append("\n" + "=" * 60)
    lines.append("WEEKLY PM RECAP")
    lines.append(f"Week of {datetime.now().strftime('%B %d, %Y')}")
    lines.append("=" * 60)
    
    # Summary
    summary = roadmap.get("summary", {})
    total = summary.get("total_initiatives", 0)
    lines.append(f"\nTotal Initiatives: {total}")
    
    by_phase = summary.get("by_phase", {})
    lines.append("\nCurrent Distribution:")
    for phase, count in by_phase.items():
        if count > 0:
            lines.append(f"  {phase.title()}: {count}")
    
    # Changes
    if changes.get("phase_transitions"):
        lines.append("\n🎯 PHASE TRANSITIONS:")
        for t in changes["phase_transitions"]:
            lines.append(f"  • {t['name']}: {t['from_phase']} → {t['to_phase']}")
    
    if changes.get("new_initiatives"):
        lines.append("\n🆕 NEW INITIATIVES:")
        for n in changes["new_initiatives"]:
            lines.append(f"  • {n['name']} ({n['priority']}) - {n['phase']}")
    
    if changes.get("status_changes"):
        lines.append("\n📊 STATUS CHANGES:")
        for s in changes["status_changes"]:
            lines.append(f"  • {s['name']}: {s['from_status']} → {s['to_status']}")
    
    # Focus areas
    if focus:
        lines.append("\n" + "-" * 40)
        lines.append("🎯 THIS WEEK'S FOCUS:")
        for i, f in enumerate(focus, 1):
            lines.append(f"\n  {i}. {f['name']} ({f['phase']})")
            lines.append(f"     Reason: {f['reason']}")
            lines.append(f"     Action: {f['next_action']}")
    
    lines.append("\n" + "=" * 60)
    return "\n".join(lines)


def send_slack_notification(message: Dict) -> bool:
    """Send to Slack."""
    if not SLACK_WEBHOOK_URL:
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


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Weekly PM recap")
    parser.add_argument("--slack", action="store_true", help="Send to Slack")
    args = parser.parse_args()
    
    # Load data
    roadmap = load_roadmap()
    previous = load_previous_snapshot()
    
    # Analyze
    changes = compare_roadmaps(roadmap, previous)
    focus = calculate_focus_areas(roadmap)
    
    # Output
    print(format_terminal_output(roadmap, changes, focus))
    
    if args.slack:
        message = format_slack_message(roadmap, changes, focus)
        if send_slack_notification(message):
            print("✅ Sent to Slack")


if __name__ == "__main__":
    main()
