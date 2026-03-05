#!/usr/bin/env python3
"""
Automatically commit high-priority instrumentation action candidates.

Behavior:
- Finds action candidates with "Instrumentation gap" in title and priority P1
- Commits them with deterministic AUTO identifiers
- Updates each initiative's metrics-contract.json with linked_linear_issue_ids
"""

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List

SCRIPT_DIR = Path(__file__).resolve().parent
WORKSPACE_DOCS = SCRIPT_DIR.parent.parent
WORKSPACE_ROOT = WORKSPACE_DOCS.parent
ACTION_CANDIDATES_PATH = WORKSPACE_ROOT / "packages" / "product-os-memory" / "data" / "action-candidates.json"
ACTIVE_INITIATIVES_DIR = WORKSPACE_DOCS / "initiatives" / "active"
LOG_DIR = WORKSPACE_DOCS / "status" / "memory-graph"


def read_json(path: Path) -> Dict:
    return json.loads(path.read_text())


def write_json(path: Path, payload: Dict) -> None:
    path.write_text(json.dumps(payload, indent=2) + "\n")


def append_log(event: Dict) -> None:
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    date_key = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    log_path = LOG_DIR / f"auto-commit-log-{date_key}.jsonl"
    with log_path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(event) + "\n")


def deterministic_linear_id(candidate_id: str) -> str:
    return f"AUTO-{candidate_id[-6:].upper()}"


def update_metrics_contract(project_id: str, linear_id: str) -> bool:
    contract_path = ACTIVE_INITIATIVES_DIR / project_id / "metrics-contract.json"
    if not contract_path.exists():
        return False

    contract = read_json(contract_path)
    validation = contract.setdefault("validation", {})
    linked = validation.setdefault("linked_linear_issue_ids", [])
    if linear_id not in linked:
        linked.append(linear_id)
    validation["last_validated_at"] = datetime.now(timezone.utc).isoformat()
    contract.setdefault("meta", {})["updated_at"] = datetime.now(timezone.utc).isoformat()
    write_json(contract_path, contract)
    return True


def should_auto_commit(candidate: Dict) -> bool:
    if candidate.get("state") == "committed":
        return False
    if candidate.get("priority") != "P1":
        return False
    title = (candidate.get("title") or "").lower()
    return "instrumentation gap" in title


def main() -> int:
    if not ACTION_CANDIDATES_PATH.exists():
        raise SystemExit(f"Missing action candidates store: {ACTION_CANDIDATES_PATH}")

    payload = read_json(ACTION_CANDIDATES_PATH)
    candidates: List[Dict] = payload.get("candidates", [])
    committed_count = 0
    updated_contracts = 0

    for candidate in candidates:
        if not should_auto_commit(candidate):
            continue
        candidate_id = candidate["candidate_id"]
        linear_id = deterministic_linear_id(candidate_id)
        candidate["state"] = "committed"
        candidate["target_external_id"] = linear_id
        candidate["linear_identifier"] = linear_id
        candidate["updated_at"] = datetime.now(timezone.utc).isoformat()
        committed_count += 1

        project_id = candidate.get("project_id")
        if project_id and update_metrics_contract(project_id, linear_id):
            updated_contracts += 1

        append_log(
            {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "event": "candidate_committed",
                "candidate_id": candidate_id,
                "project_id": project_id,
                "linear_identifier": linear_id,
                "reason": "auto_commit_instrumentation_gap_p1",
            }
        )

    payload["generated_at"] = datetime.now(timezone.utc).isoformat()
    write_json(ACTION_CANDIDATES_PATH, payload)

    append_log(
        {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "event": "run_summary",
            "committed_count": committed_count,
            "updated_contracts": updated_contracts,
            "candidates_total": len(candidates),
        }
    )

    print(f"Committed {committed_count} instrumentation candidates")
    print(f"Updated {updated_contracts} metrics contracts")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
