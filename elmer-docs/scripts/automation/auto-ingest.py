#!/usr/bin/env python3
"""
Auto-Ingest: Monitor inbox folders and process new signals.

This script watches the signals/inbox/ folders for new files and:
1. Extracts basic metadata from the content
2. Moves files to the appropriate signals folder with proper naming
3. Updates the signals/_index.json
4. Optionally sends Slack notifications for new signals

Usage:
    python auto-ingest.py                    # Process all inbox files once
    python auto-ingest.py --watch            # Watch continuously (every 60s)
    python auto-ingest.py --slack            # Send Slack notifications
    python auto-ingest.py --dry-run          # Preview without processing
"""

import os
import sys
import json
import re
import shutil
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict
import argparse
import time
import urllib.request
import urllib.error

# Paths
WORKSPACE_ROOT = Path(__file__).parent.parent.parent
SIGNALS_DIR = WORKSPACE_ROOT / "signals"
INBOX_DIR = SIGNALS_DIR / "inbox"
INDEX_FILE = SIGNALS_DIR / "_index.json"

# Signal type mapping from inbox folder to signals folder
INBOX_TO_SIGNALS = {
    "transcripts": "transcripts",
    "tickets": "tickets",
    "conversations": "conversations",
    "misc": "issues"  # misc goes to issues for manual categorization
}

# Keywords for persona detection
PERSONA_KEYWORDS = {
    "sales-rep": ["ae", "account executive", "sales rep", "seller", "quota", "deal", "prospect", "pipeline"],
    "sales-leader": ["sales manager", "vp sales", "director of sales", "sales leader", "team performance", "forecast"],
    "csm": ["csm", "customer success", "renewal", "churn", "nps", "health score", "onboarding"],
    "revops": ["revops", "revenue operations", "ops", "reporting", "dashboard", "metrics", "data quality"]
}

# Keywords for severity detection
SEVERITY_KEYWORDS = {
    "high": ["critical", "urgent", "blocker", "broken", "can't", "cannot", "impossible", "frustrated", "angry"],
    "medium": ["difficult", "confusing", "slow", "annoying", "workaround", "should", "need"],
    "low": ["nice to have", "would be great", "minor", "small", "eventually"]
}


def extract_metadata(content: str, filename: str) -> dict:
    """Extract basic metadata from content."""
    content_lower = content.lower()
    
    # Detect personas mentioned
    personas = []
    for persona, keywords in PERSONA_KEYWORDS.items():
        if any(kw in content_lower for kw in keywords):
            personas.append(persona)
    
    # Detect severity
    severity = "medium"  # default
    for level, keywords in SEVERITY_KEYWORDS.items():
        if any(kw in content_lower for kw in keywords):
            severity = level
            break
    
    # Extract potential problems (sentences with problem indicators)
    problem_indicators = ["problem", "issue", "bug", "error", "broken", "doesn't work", "can't", "unable", "frustrated"]
    problems = []
    sentences = re.split(r'[.!?]+', content)
    for sentence in sentences:
        if any(indicator in sentence.lower() for indicator in problem_indicators):
            clean = sentence.strip()
            if len(clean) > 20 and len(clean) < 500:
                problems.append(clean)
    
    # Generate a topic from filename or first line
    topic = filename.replace(".md", "").replace(".txt", "").replace("_", "-").replace(" ", "-")
    first_line = content.split('\n')[0].strip()
    if first_line.startswith('#'):
        topic = first_line.lstrip('#').strip()[:50].replace(" ", "-").lower()
    
    # Generate unique ID
    content_hash = hashlib.md5(content.encode()).hexdigest()[:8]
    
    return {
        "personas": personas if personas else ["unknown"],
        "severity": severity,
        "problems": problems[:5],  # limit to 5
        "topic": re.sub(r'[^a-z0-9-]', '', topic.lower())[:40],
        "content_hash": content_hash,
        "word_count": len(content.split()),
        "has_quotes": '"' in content or "'" in content
    }


def load_index() -> dict:
    """Load signals index."""
    if INDEX_FILE.exists():
        with open(INDEX_FILE, 'r') as f:
            return json.load(f)
    return {
        "$schema": "elmer-signals-index-v1",
        "last_updated": datetime.now().isoformat(),
        "total_signals": 0,
        "by_source": {"transcript": 0, "ticket": 0, "issue": 0, "conversation": 0},
        "by_status": {"unprocessed": 0, "processed": 0},
        "signals": []
    }


def save_index(index: dict):
    """Save signals index."""
    index["last_updated"] = datetime.now().isoformat()
    with open(INDEX_FILE, 'w') as f:
        json.dump(index, f, indent=2)


def process_inbox_file(inbox_path: Path, signal_type: str, dry_run: bool = False) -> Optional[dict]:
    """Process a single inbox file."""
    try:
        with open(inbox_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
    except Exception as e:
        print(f"  ❌ Error reading {inbox_path}: {e}")
        return None
    
    if len(content.strip()) < 50:
        print(f"  ⚠️ Skipping {inbox_path.name} - too short ({len(content)} chars)")
        return None
    
    # Extract metadata
    metadata = extract_metadata(content, inbox_path.name)
    
    # Generate new filename
    date_str = datetime.now().strftime("%Y-%m-%d")
    new_filename = f"{date_str}-{metadata['topic']}-{metadata['content_hash']}.md"
    
    # Determine destination
    dest_folder = SIGNALS_DIR / INBOX_TO_SIGNALS.get(signal_type, "issues")
    dest_path = dest_folder / new_filename
    
    # Create signal entry
    signal_entry = {
        "id": f"sig-{date_str}-{metadata['content_hash']}",
        "type": signal_type.rstrip('s'),  # transcripts -> transcript
        "source": inbox_path.name,
        "topic": metadata["topic"],
        "captured_at": datetime.now().isoformat(),
        "status": "unprocessed",  # needs manual /ingest for full processing
        "problems_extracted": metadata["problems"][:3],
        "personas_mentioned": metadata["personas"],
        "severity": metadata["severity"],
        "word_count": metadata["word_count"],
        "file_path": str(dest_path.relative_to(WORKSPACE_ROOT)),
        "hypothesis_matches": [],
        "hypothesis_candidates": []
    }
    
    if dry_run:
        print(f"  📋 Would process: {inbox_path.name}")
        print(f"     → {dest_path.name}")
        print(f"     Personas: {metadata['personas']}")
        print(f"     Severity: {metadata['severity']}")
        print(f"     Problems: {len(metadata['problems'])} found")
        return signal_entry
    
    # Create processed signal file with header
    processed_content = f"""# Signal: {metadata['topic'].replace('-', ' ').title()}

**Captured:** {date_str}
**Source:** {inbox_path.name}
**Type:** {signal_type}
**Status:** Needs full processing (run `/ingest` for AI extraction)

## Auto-Detected Metadata

- **Personas:** {', '.join(metadata['personas'])}
- **Severity:** {metadata['severity']}
- **Word Count:** {metadata['word_count']}

## Problems Detected (Auto)

{chr(10).join(f'- {p}' for p in metadata['problems'][:5]) if metadata['problems'] else '- No problems auto-detected'}

---

## Original Content

{content}
"""
    
    # Write processed file
    dest_folder.mkdir(parents=True, exist_ok=True)
    with open(dest_path, 'w') as f:
        f.write(processed_content)
    
    # Remove from inbox
    inbox_path.unlink()
    
    print(f"  ✅ Processed: {inbox_path.name} → {new_filename}")
    
    return signal_entry


def process_all_inboxes(dry_run: bool = False) -> list:
    """Process all files in all inbox folders."""
    processed = []
    
    for inbox_type, signals_type in INBOX_TO_SIGNALS.items():
        inbox_folder = INBOX_DIR / inbox_type
        if not inbox_folder.exists():
            continue
        
        files = list(inbox_folder.glob("*"))
        files = [f for f in files if f.is_file() and not f.name.startswith('.')]
        
        if files:
            print(f"\n📁 Processing {inbox_type}/ ({len(files)} files)")
            for file_path in files:
                result = process_inbox_file(file_path, inbox_type, dry_run)
                if result:
                    processed.append(result)
    
    return processed


def send_slack_notification(signals: list):
    """Send Slack notification about new signals."""
    webhook_url = os.environ.get("PM_SLACK_WEBHOOK")
    if not webhook_url or webhook_url.startswith("$"):
        return False
    
    if not signals:
        return True
    
    # Build message
    blocks = [
        {
            "type": "header",
            "text": {"type": "plain_text", "text": f"📥 {len(signals)} New Signal{'s' if len(signals) > 1 else ''} Ingested"}
        }
    ]
    
    for sig in signals[:5]:  # limit to 5
        severity_emoji = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(sig.get("severity", "medium"), "⚪")
        blocks.append({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"{severity_emoji} *{sig['topic'].replace('-', ' ').title()}*\n"
                        f"Type: {sig['type']} | Personas: {', '.join(sig['personas_mentioned'])}\n"
                        f"Problems: {len(sig.get('problems_extracted', []))} detected"
            }
        })
    
    if len(signals) > 5:
        blocks.append({
            "type": "context",
            "elements": [{"type": "mrkdwn", "text": f"_...and {len(signals) - 5} more_"}]
        })
    
    blocks.append({
        "type": "context",
        "elements": [{"type": "mrkdwn", "text": "Run `/ingest` in Cursor for full AI processing"}]
    })
    
    payload = json.dumps({"blocks": blocks})
    
    try:
        req = urllib.request.Request(
            webhook_url,
            data=payload.encode('utf-8'),
            headers={"Content-Type": "application/json"}
        )
        urllib.request.urlopen(req, timeout=10)
        return True
    except Exception as e:
        print(f"⚠️ Slack notification failed: {e}")
        return False


def watch_mode(interval: int = 60, slack: bool = False):
    """Watch inbox folders continuously."""
    print(f"👀 Watching inbox folders (checking every {interval}s)")
    print("   Press Ctrl+C to stop\n")
    
    while True:
        try:
            processed = process_all_inboxes()
            
            if processed:
                # Update index
                index = load_index()
                for sig in processed:
                    index["signals"].append(sig)
                    sig_type = sig["type"]
                    if sig_type in index["by_source"]:
                        index["by_source"][sig_type] += 1
                    index["by_status"]["unprocessed"] += 1
                index["total_signals"] = len(index["signals"])
                save_index(index)
                
                print(f"\n📊 Index updated: {len(processed)} new signals")
                
                if slack:
                    send_slack_notification(processed)
            
            time.sleep(interval)
            
        except KeyboardInterrupt:
            print("\n\n👋 Stopped watching")
            break


def main():
    parser = argparse.ArgumentParser(description="Auto-ingest signals from inbox folders")
    parser.add_argument("--watch", action="store_true", help="Watch continuously")
    parser.add_argument("--interval", type=int, default=60, help="Watch interval in seconds")
    parser.add_argument("--slack", action="store_true", help="Send Slack notifications")
    parser.add_argument("--dry-run", action="store_true", help="Preview without processing")
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("AUTO-INGEST: Signal Processing")
    print("=" * 60)
    print(f"Inbox: {INBOX_DIR}")
    print(f"Index: {INDEX_FILE}")
    
    if args.dry_run:
        print("🔍 DRY RUN - no changes will be made\n")
    
    if args.watch:
        watch_mode(args.interval, args.slack)
    else:
        processed = process_all_inboxes(args.dry_run)
        
        if processed and not args.dry_run:
            # Update index
            index = load_index()
            for sig in processed:
                index["signals"].append(sig)
                sig_type = sig["type"]
                if sig_type in index["by_source"]:
                    index["by_source"][sig_type] += 1
                index["by_status"]["unprocessed"] += 1
            index["total_signals"] = len(index["signals"])
            save_index(index)
            
            print(f"\n📊 Index updated: {len(processed)} new signals")
            print("💡 Run `/ingest` in Cursor for full AI processing")
            
            if args.slack:
                send_slack_notification(processed)
        
        elif not processed:
            print("\n📭 No files in inbox folders")
        
        print("")


if __name__ == "__main__":
    main()
