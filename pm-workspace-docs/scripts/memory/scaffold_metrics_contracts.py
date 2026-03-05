#!/usr/bin/env python3
"""
Scaffold metrics-contract.json for active initiatives.
"""

import json
import argparse
from datetime import datetime, timezone
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
WORKSPACE_DOCS = SCRIPT_DIR.parent.parent
ACTIVE_INITIATIVES_DIR = WORKSPACE_DOCS / "initiatives" / "active"


def build_contract(project_id: str, meta: dict) -> dict:
    dashboard_id = (meta.get("posthog") or {}).get("dashboard_id")
    dashboard_ids = [str(dashboard_id)] if dashboard_id else []
    now = datetime.now(timezone.utc).isoformat()

    return {
        "$schema": "product-os-metrics-contract-v1",
        "project_id": project_id,
        "north_star_metric": {
            "name": f"{project_id.replace('-', ' ').title()} North Star",
            "definition": "TODO: define measurable user-to-business outcome chain metric",
            "unit": "percentage",
            "window": "7d",
            "segmentation": ["workspace", "persona"],
        },
        "instrumentation": {
            "required_events": [],
            "posthog": {
                "dashboard_ids": dashboard_ids,
                "insight_ids": [],
            },
        },
        "validation": {
            "status": "missing",
            "last_validated_at": None,
            "gaps": [
                {
                    "type": "definition_incomplete",
                    "severity": "high",
                    "detail": "North star metric and instrumentation events not fully defined",
                    "recommended_action": "Run /metrics <initiative> to define and validate instrumentation",
                }
            ],
            "linked_linear_issue_ids": [],
        },
        "meta": {
            "created_at": now,
            "updated_at": now,
            "owner": meta.get("owner"),
            "pilot": project_id == "chief-of-staff-experience",
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--update-existing",
        action="store_true",
        help="Apply schema backfill updates to existing contracts",
    )
    args = parser.parse_args()

    created = 0
    updated = 0
    for meta_path in sorted(ACTIVE_INITIATIVES_DIR.glob("*/_meta.json")):
        initiative_dir = meta_path.parent
        project_id = initiative_dir.name
        contract_path = initiative_dir / "metrics-contract.json"

        meta = json.loads(meta_path.read_text())
        if contract_path.exists():
            if not args.update_existing:
                continue
            contract = json.loads(contract_path.read_text())
            contract.setdefault("$schema", "product-os-metrics-contract-v1")
            contract.setdefault("project_id", project_id)
            contract.setdefault("validation", {}).setdefault("status", "missing")
            contract.setdefault("validation", {}).setdefault("gaps", [])
            contract.setdefault("validation", {}).setdefault("linked_linear_issue_ids", [])
            contract.setdefault("meta", {})
            contract["meta"]["updated_at"] = datetime.now(timezone.utc).isoformat()
            contract_path.write_text(json.dumps(contract, indent=2) + "\n")
            updated += 1
            continue

        contract = build_contract(project_id=project_id, meta=meta)
        contract_path.write_text(json.dumps(contract, indent=2) + "\n")
        created += 1

    print(f"Created {created} metrics contracts; updated {updated}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
