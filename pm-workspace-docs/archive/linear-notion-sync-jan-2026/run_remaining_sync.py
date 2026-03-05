#!/usr/bin/env python3
"""
Read batch files and output one JSON payload per line for MCP INSERT.
Lane A: A_057 (10) + A_067 first 1 = 11 items
Lane B: B_010 through B_120 = 119 items (skip B_000 done)
Truncates rich_text to 1900 chars.
"""
import json
from pathlib import Path

BATCH_DIR = Path("/tmp/sync_batches")

def truncate(props):
    for p in props:
        if p.get("type") == "rich_text" and len(p.get("value", "")) > 1900:
            p["value"] = p["value"][:1900] + "..."
    return props

def main():
    # Lane A remaining: 11 (A_057 all 10 + A_067 first 1)
    lane_a_files = ["A_057_10.jsonl"]
    count = 0
    for fn in lane_a_files:
        p = BATCH_DIR / fn
        if not p.exists():
            continue
        lines = p.read_text().strip().split("\n")
        if fn == "A_057_10.jsonl":
            batch = lines[:10]  # all 10
        for line in batch:
            if not line.strip():
                continue
            d = json.loads(line)
            d["properties"] = truncate([p for p in d["properties"] if p.get("value") or p["type"] == "title"])
            print("A", json.dumps({"database_id": d["database_id"], "properties": d["properties"]}, default=str))
            count += 1
    # + 1 from A_067
    a067 = BATCH_DIR / "A_067_10.jsonl"
    if a067.exists():
        line = a067.read_text().strip().split("\n")[0]
        d = json.loads(line)
        d["properties"] = truncate([p for p in d["properties"] if p.get("value") or p["type"] == "title"])
        print("A", json.dumps({"database_id": d["database_id"], "properties": d["properties"]}, default=str))
        count += 1
    print(f"# Lane A: {count}", file=__import__("sys").stderr)

    # Lane B: B_010 through B_120
    count_b = 0
    for i in range(10, 130, 10):
        for tail in [f"B_{i:03d}_10.jsonl", f"B_{i:03d}_9.jsonl"]:
            p = BATCH_DIR / tail
            if p.exists():
                for line in p.read_text().strip().split("\n"):
                    if not line.strip():
                        continue
                    d = json.loads(line)
                    d["properties"] = truncate([p for p in d["properties"] if p.get("value") or p["type"] == "title"])
                    print("B", json.dumps({"database_id": d["database_id"], "properties": d["properties"]}, default=str))
                    count_b += 1
                break
    print(f"# Lane B: {count_b}", file=__import__("sys").stderr)

if __name__ == "__main__":
    main()
