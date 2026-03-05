#!/usr/bin/env python3
"""
Output MCP-ready insert payloads for remaining Linear→Notion sync.
Usage: python3 notion_sync_batch.py [--lane A|B] [--skip N] [--limit N]
Outputs JSON objects, one per line, for NOTION_INSERT_ROW_DATABASE.
"""
import argparse
import json
import sys
from pathlib import Path

BASE = Path(__file__).parent / ".linear-notion-triage"
DB_ID = "308f79b2-c8ac-81d1-a3ff-f1dad31a4edd"

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--lane", choices=["A", "B"], required=True)
    ap.add_argument("--skip", type=int, default=0)
    ap.add_argument("--limit", type=int, default=100)
    args = ap.parse_args()
    fn = "lane_a.json" if args.lane == "A" else "lane_b.json"
    data = json.loads((BASE / fn).read_text())
    batch = data[args.skip : args.skip + args.limit]
    for item in batch:
        props = [p for p in item["props"] if p.get("value") or p["type"] == "title"]
        out = {"database_id": DB_ID, "properties": props}
        print(json.dumps(out, default=str))

if __name__ == "__main__":
    main()
