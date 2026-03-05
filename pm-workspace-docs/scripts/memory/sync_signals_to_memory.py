#!/usr/bin/env python3
"""
Sync signals index entries into Product OS evidence store.

This builds immutable evidence-pointer records from pm-workspace-docs/signals/_index.json
without copying full source payloads.
"""

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List

SCRIPT_DIR = Path(__file__).resolve().parent
WORKSPACE_DOCS = SCRIPT_DIR.parent.parent
WORKSPACE_ROOT = WORKSPACE_DOCS.parent
SIGNALS_INDEX_PATH = WORKSPACE_DOCS / "signals" / "_index.json"
REGISTRY_PATH = WORKSPACE_DOCS / "company-context" / "project-registry.json"
OUTPUT_DIR = WORKSPACE_ROOT / "packages" / "product-os-memory" / "data"
OUTPUT_PATH = OUTPUT_DIR / "evidence-store.json"


SOURCE_TYPE_MAP = {
    "transcript": "meeting_transcript",
    "slack": "slack_message",
    "issue": "linear_issue",
    "release": "github_pr",
    "research": "doc_fragment",
    "ticket": "linear_issue",
    "conversation": "doc_fragment",
}

SOURCE_SYSTEM_MAP = {
    "meeting": "askelephant",
    "slack-ingest": "slack",
    "slack": "slack",
    "linear": "linear",
    "linear-mcp": "linear",
    "github": "github",
    "competitive-analysis": "local-docs",
    "hubspot": "hubspot",
}


def read_json(path: Path) -> Dict:
    return json.loads(path.read_text())


def make_project_set() -> set:
    if not REGISTRY_PATH.exists():
        return set()
    registry = read_json(REGISTRY_PATH)
    return {item["project_id"] for item in registry.get("projects", [])}


def normalize_path(path_value: str) -> str:
    if path_value.startswith("pm-workspace-docs/"):
        return path_value
    return f"pm-workspace-docs/{path_value}".replace("//", "/")


def signal_to_evidence(signal: Dict, projects: set) -> List[Dict]:
    related = signal.get("related_initiatives") or []
    valid_related = [item for item in related if item in projects]
    if not valid_related:
        valid_related = [None]

    source_path = normalize_path(signal.get("path", ""))
    source_url = f"file://{WORKSPACE_ROOT / source_path}" if source_path else None
    participants = signal.get("participants") or []

    evidence_items = []
    for project_id in valid_related:
        evidence_id = f"evi_{signal.get('id')}" if not project_id else f"evi_{signal.get('id')}__{project_id}"
        evidence_items.append(
            {
                "evidence_id": evidence_id,
                "source_type": SOURCE_TYPE_MAP.get(signal.get("type"), "doc_fragment"),
                "source_system": SOURCE_SYSTEM_MAP.get(signal.get("source"), "local-docs"),
                "external_id": signal.get("id"),
                "source_url": source_url,
                "project_id": project_id,
                "actor_person_ids": participants,
                "occurred_at": signal.get("captured_at"),
                "ingested_at": datetime.now(timezone.utc).isoformat(),
                "summary_snippet": signal.get("topic"),
                "scope": "team",
                "metadata": {
                    "signal_type": signal.get("type"),
                    "status": signal.get("status"),
                    "strategic_alignment": signal.get("strategic_alignment"),
                    "key_themes": signal.get("key_themes", []),
                },
            }
        )
    return evidence_items


def main() -> int:
    if not SIGNALS_INDEX_PATH.exists():
        raise SystemExit(f"Missing signals index: {SIGNALS_INDEX_PATH}")

    signals_index = read_json(SIGNALS_INDEX_PATH)
    projects = make_project_set()
    evidence_items: List[Dict] = []

    for signal in signals_index.get("signals", []):
        evidence_items.extend(signal_to_evidence(signal, projects))

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    payload = {
        "$schema": "product-os-evidence-store-v1",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source": str(SIGNALS_INDEX_PATH.relative_to(WORKSPACE_ROOT)),
        "total_evidence_items": len(evidence_items),
        "evidence": evidence_items,
    }
    OUTPUT_PATH.write_text(json.dumps(payload, indent=2) + "\n")
    print(f"Wrote {OUTPUT_PATH} ({len(evidence_items)} evidence items)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
