#!/usr/bin/env python3
"""
Run Notion sync for Linear→Product Feedback.
Reads lane_a.json and lane_b.json, outputs a run summary.
Use with: cursor compose or manual MCP invocations.
This script prepares the payloads; actual sync is done via MCP in Cursor.
"""
import json
from pathlib import Path

BASE = Path("/Users/tylersahagun/Source/pm-workspace/.linear-notion-triage")
DB_ID = "308f79b2-c8ac-81d1-a3ff-f1dad31a4edd"

def load_payloads():
    la = json.loads((BASE / "lane_a.json").read_text())
    lb = json.loads((BASE / "lane_b.json").read_text())
    return la, lb

def props_to_mcp_args(props):
    """Convert props list to NOTION_INSERT_ROW_DATABASE properties arg."""
    return [{"name": p["name"], "type": p["type"], "value": p["value"]} for p in props if p.get("value") or p["type"] == "title"]

if __name__ == "__main__":
    la, lb = load_payloads()
    print(f"Lane A: {len(la)} items")
    print(f"Lane B: {len(lb)} items")
    # Output first few as sample for debugging
    for i, item in enumerate(la[:2]):
        src = item["issue"]["id"]
        print(f"  A{i}: linear:{src} -> {item['props'][0]['value'][:40]}...")
