#!/usr/bin/env python3
"""
Generate project-registry.json from active initiative metadata.
"""

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional

SCRIPT_DIR = Path(__file__).resolve().parent
WORKSPACE_DOCS = SCRIPT_DIR.parent.parent
ACTIVE_INITIATIVES_DIR = WORKSPACE_DOCS / "initiatives" / "active"
REGISTRY_PATH = WORKSPACE_DOCS / "company-context" / "project-registry.json"


def _to_list(value) -> List[str]:
    if value is None:
        return []
    if isinstance(value, list):
        return [str(v) for v in value if v]
    if isinstance(value, str) and value.strip():
        return [value.strip()]
    return []


def _read_json(path: Path) -> Optional[Dict]:
    try:
        return json.loads(path.read_text())
    except Exception:
        return None


def _build_entry(meta_path: Path) -> Optional[Dict]:
    meta = _read_json(meta_path)
    if not meta:
        return None

    initiative_dir = meta_path.parent
    slug = initiative_dir.name
    posthog = meta.get("posthog", {}) or {}

    slack_channel_ids = []
    slack_channel_ids.extend(_to_list(meta.get("slack_channel_ids")))
    slack_channel_ids.extend(_to_list(meta.get("slack_channel")))
    # de-duplicate while preserving order
    slack_channel_ids = list(dict.fromkeys(slack_channel_ids))

    dashboard_ids = []
    dashboard_id = posthog.get("dashboard_id")
    if dashboard_id:
        dashboard_ids.append(str(dashboard_id))
    dashboard_ids.extend(_to_list(meta.get("posthog_dashboard_ids")))
    dashboard_ids = list(dict.fromkeys(dashboard_ids))

    return {
        "project_id": slug,
        "initiative_name": meta.get("name") or slug.replace("-", " ").title(),
        "initiative_path": str(initiative_dir.relative_to(WORKSPACE_DOCS)),
        "pilot": slug == "chief-of-staff-experience",
        "phase": meta.get("phase"),
        "status": meta.get("status"),
        "owner": meta.get("owner"),
        "sponsor": meta.get("sponsor"),
        "linear": {
            "project_id": meta.get("linear_project_id"),
            "project_url": meta.get("linear_project_url"),
        },
        "notion": {
            "project_id": meta.get("notion_project_id"),
            "project_url": meta.get("notion_project_url"),
        },
        "slack": {
            "channel_ids": slack_channel_ids,
        },
        "posthog": {
            "dashboard_ids": dashboard_ids,
        },
        "last_synced_at": datetime.now(timezone.utc).isoformat(),
    }


def main() -> int:
    if not ACTIVE_INITIATIVES_DIR.exists():
        raise SystemExit(f"Active initiatives dir not found: {ACTIVE_INITIATIVES_DIR}")

    entries = []
    invalid = []

    for meta_path in sorted(ACTIVE_INITIATIVES_DIR.glob("*/_meta.json")):
        entry = _build_entry(meta_path)
        if entry:
            entries.append(entry)
        else:
            invalid.append(str(meta_path))

    entries.sort(key=lambda e: e["project_id"])

    registry = {
        "$schema": "product-os-project-registry-v1",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source": str(ACTIVE_INITIATIVES_DIR.relative_to(WORKSPACE_DOCS)),
        "total_projects": len(entries),
        "projects": entries,
    }
    if invalid:
        registry["warnings"] = {
            "invalid_meta_files": invalid,
        }

    REGISTRY_PATH.parent.mkdir(parents=True, exist_ok=True)
    REGISTRY_PATH.write_text(json.dumps(registry, indent=2) + "\n")
    print(f"Wrote {REGISTRY_PATH} with {len(entries)} projects")
    if invalid:
        print(f"Warnings: {len(invalid)} invalid metadata files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
