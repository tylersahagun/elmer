#!/usr/bin/env python3
"""
Process all remaining Lane A and Lane B items.
Outputs batches to /tmp/sync_batches/ for MCP consumption.
Usage: python3 complete_sync.py
"""
import json
from pathlib import Path

BASE = Path(__file__).parent / ".linear-notion-triage"
OUT = Path("/tmp/sync_batches")
OUT.mkdir(exist_ok=True)

def main():
    la = json.loads((BASE / "lane_a.json").read_text())
    lb = json.loads((BASE / "lane_b.json").read_text())
    # Lane A: 27-86 (60 remaining)
    # Lane B: 0-128 (129 items)
    batch_size = 10
    total = 0
    for lane, data, start, count in [
        ("A", la, 27, len(la) - 27),
        ("B", lb, 0, len(lb)),
    ]:
        for i in range(0, count, batch_size):
            batch = data[start + i : start + i + batch_size]
            out_file = OUT / f"{lane}_{start+i:03d}_{len(batch)}.jsonl"
            with open(out_file, "w") as f:
                for item in batch:
                    props = [p for p in item["props"] if p.get("value") or p["type"] == "title"]
                    for p in props:
                        if p["type"] == "rich_text" and len(p.get("value", "")) > 1900:
                            p["value"] = p["value"][:1900] + "..."
                    row = {"database_id": "308f79b2-c8ac-81d1-a3ff-f1dad31a4edd", "properties": props}
                    f.write(json.dumps(row, default=str) + "\n")
            total += len(batch)
    print(f"Wrote {total} items to {OUT}")

if __name__ == "__main__":
    main()
