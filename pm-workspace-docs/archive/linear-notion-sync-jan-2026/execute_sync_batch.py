#!/usr/bin/env python3
"""Extract batch payloads for Linear→Notion sync. Outputs JSON for MCP INSERT."""
import json
import sys
from pathlib import Path

BASE = Path(__file__).parent / ".linear-notion-triage"
DB_ID = "308f79b2-c8ac-81d1-a3ff-f1dad31a4edd"

def main():
    lane = sys.argv[1]  # A or B
    start = int(sys.argv[2])
    count = int(sys.argv[3])
    fn = "lane_a.json" if lane == "A" else "lane_b.json"
    data = json.loads((BASE / fn).read_text())
    batch = data[start:start+count]
    for i, item in enumerate(batch):
        props = [p for p in item["props"] if p.get("value") or p["type"]=="title"]
        for p in props:
            if p["type"] == "rich_text" and len(p.get("value","")) > 1900:
                p["value"] = p["value"][:1900] + "..."
        out = {"database_id": DB_ID, "properties": props}
        print(json.dumps(out, default=str))

if __name__ == "__main__":
    main()
