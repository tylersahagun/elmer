#!/usr/bin/env python3
"""
Complete Linear feedback cleanup. Requires notion-client and NOTION_API_KEY.

Usage:
  pip install notion-client
  export NOTION_API_KEY="secret_..."
  python complete-linear-cleanup.py
"""
import json
import os
import sys

try:
    from notion_client import Client
except ImportError:
    print("Run: pip install notion-client", file=sys.stderr)
    sys.exit(1)

# First 40 rows archived via MCP in initial run (2026-02-19)
ALREADY_DELETED = {
    "30df79b2-c8ac-8100-a1f7-cff1f724fa72", "30df79b2-c8ac-8102-94c2-e43f7fdc6a47",
    "30df79b2-c8ac-8102-975d-c300ab5551ef", "30df79b2-c8ac-8102-ac8d-dd12c884ae26",
    "30df79b2-c8ac-8103-ad87-ff04fbdb1185", "30df79b2-c8ac-8104-a08d-e0922c5fb4fe",
    "30df79b2-c8ac-8104-a764-e3a183821a4a", "30df79b2-c8ac-8104-ae90-ed687ca7e513",
    "30df79b2-c8ac-8105-af8f-c68bcad0f93b", "30df79b2-c8ac-8106-848a-ff3afbf21fc3",
    "30df79b2-c8ac-8107-a730-c90cd1c2fc18", "30df79b2-c8ac-8108-a325-ca7cef1ead45",
    "30df79b2-c8ac-810d-9289-db217469272f", "30df79b2-c8ac-810f-b4e4-d73c48f70c22",
    "30df79b2-c8ac-8110-aac5-cfe0bfa432c3", "30df79b2-c8ac-8111-a7cd-cb758a19edfa",
    "30df79b2-c8ac-8115-81b9-f265d2110a7b", "30df79b2-c8ac-8115-99e5-d5a3e84c8232",
    "30df79b2-c8ac-8118-ae8a-c2ae012962ae", "30df79b2-c8ac-8118-aeff-d4ff26a3ee46",
    "30df79b2-c8ac-811b-84b1-db4f69869146", "30df79b2-c8ac-811e-8fd7-ffbaeb1ba965",
    "30df79b2-c8ac-8120-896e-fde00a267a43", "30df79b2-c8ac-8121-92c0-d3ee1d176cf6",
    "30df79b2-c8ac-8122-802a-ca6263c4cdee", "30df79b2-c8ac-8126-a82e-ecc676a7ee13",
    "30df79b2-c8ac-8127-b54c-edd5ec871348", "30df79b2-c8ac-8128-9b4d-f80b0ed978d3",
    "30df79b2-c8ac-8128-bb8b-c41ac78a0998", "30df79b2-c8ac-8129-ba49-d6adce7adeaf",
    "30df79b2-c8ac-812a-bc15-f420856107eb", "30df79b2-c8ac-812f-89d1-efb49c0deb8a",
    "30df79b2-c8ac-812f-b0b7-f9af3d5e9c5d", "30df79b2-c8ac-8135-b02d-fa7ddf74411a",
    "30df79b2-c8ac-813a-aa84-da227aaf08a3", "30df79b2-c8ac-813c-8035-d008ae531ea1",
    "30df79b2-c8ac-813c-93f8-eab74343929c", "30df79b2-c8ac-8143-bee8-d884de588499",
    "30df79b2-c8ac-8144-866a-e0085b81ef7f", "30df79b2-c8ac-8144-941f-c955c5ff71c3",
}

def main():
    api_key = os.environ.get("NOTION_API_KEY")
    if not api_key:
        print("Set NOTION_API_KEY", file=sys.stderr)
        sys.exit(1)

    base = os.path.dirname(__file__)
    with open(os.path.join(base, "linear-cleanup-to-delete.json")) as f:
        to_delete = json.load(f)

    remaining = [r for r in to_delete if r["id"] not in ALREADY_DELETED]
    if not remaining:
        print("All target rows already archived.")
        return

    notion = Client(auth=api_key)
    ok, errs = 0, []

    for r in remaining:
        try:
            notion.pages.update(page_id=r["id"], archived=True)
            ok += 1
            print(f"Archived: {r['title'][:50]}...")
        except Exception as e:
            errs.append((r["id"], r["title"], str(e)))
            print(f"FAIL: {r['id']} - {e}", file=sys.stderr)

    print(f"\nDone: {ok} archived, {len(errs)} failures")
    if errs:
        with open(os.path.join(base, "linear-cleanup-failures.json"), "w") as f:
            json.dump([{"id": i, "title": t, "error": e} for i, t, e in errs], f, indent=2)
        print(f"Failures written to linear-cleanup-failures.json")

if __name__ == "__main__":
    main()
