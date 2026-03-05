#!/usr/bin/env python3
"""
Generate deduplicated action-item candidates from initiative blockers + metrics gaps.
"""

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List

SCRIPT_DIR = Path(__file__).resolve().parent
WORKSPACE_DOCS = SCRIPT_DIR.parent.parent
WORKSPACE_ROOT = WORKSPACE_DOCS.parent
ACTIVE_INITIATIVES_DIR = WORKSPACE_DOCS / "initiatives" / "active"
OUTPUT_DIR = WORKSPACE_ROOT / "packages" / "product-os-memory" / "data"
OUTPUT_PATH = OUTPUT_DIR / "action-candidates.json"


def candidate_id(project_id: str, title: str) -> str:
    digest = hashlib.sha1(f"{project_id}:{title}".encode("utf-8")).hexdigest()[:12]
    return f"ac_{digest}"


def read_json(path: Path) -> Dict:
    return json.loads(path.read_text())


def make_candidate(
    project_id: str,
    title: str,
    description: str,
    priority: str,
    owner: str,
    evidence_refs: List[str],
) -> Dict:
    now = datetime.now(timezone.utc).isoformat()
    cid = candidate_id(project_id, title)
    return {
        "candidate_id": cid,
        "project_id": project_id,
        "title": title,
        "description": description,
        "priority": priority,
        "proposed_owner": owner,
        "state": "extracted",
        "confidence": 0.72,
        "target_system": "linear",
        "target_external_id": None,
        "evidence_refs": evidence_refs,
        "created_at": now,
        "updated_at": now,
    }


def build_candidates_for_project(project_dir: Path) -> List[Dict]:
    project_id = project_dir.name
    meta_path = project_dir / "_meta.json"
    metrics_path = project_dir / "metrics-contract.json"
    if not meta_path.exists() or not metrics_path.exists():
        return []

    meta = read_json(meta_path)
    metrics = read_json(metrics_path)
    owner = meta.get("owner") or "unassigned"

    candidates: List[Dict] = []
    for blocker in meta.get("blockers", [])[:5]:
        blocker_text = blocker if isinstance(blocker, str) else json.dumps(blocker, sort_keys=True)
        title = f"[{project_id}] Resolve blocker: {blocker_text[:70]}"
        candidates.append(
            make_candidate(
                project_id=project_id,
                title=title,
                description=blocker_text,
                priority="P1",
                owner=owner,
                evidence_refs=[
                    f"pm-workspace-docs/initiatives/active/{project_id}/_meta.json",
                ],
            )
        )

    validation = metrics.get("validation", {})
    status = validation.get("status")
    if status in {"missing", "partial"}:
        for gap in validation.get("gaps", [])[:5]:
            gap_type = gap.get("type", "gap")
            raw_gap_detail = gap.get("detail", "Instrumentation gap")
            gap_detail = raw_gap_detail if isinstance(raw_gap_detail, str) else json.dumps(raw_gap_detail, sort_keys=True)
            severity = (gap.get("severity") or "medium").lower()
            priority = "P1" if severity == "high" else "P2"
            title = f"[{project_id}] Instrumentation gap: {gap_type}"
            candidates.append(
                make_candidate(
                    project_id=project_id,
                    title=title,
                    description=gap_detail,
                    priority=priority,
                    owner=owner,
                    evidence_refs=[
                        f"pm-workspace-docs/initiatives/active/{project_id}/metrics-contract.json",
                    ],
                )
            )

    return candidates


def dedupe(candidates: List[Dict]) -> List[Dict]:
    deduped: Dict[str, Dict] = {}
    for candidate in candidates:
        deduped[candidate["candidate_id"]] = candidate
    return list(deduped.values())


def load_existing_state() -> Dict[str, Dict]:
    if not OUTPUT_PATH.exists():
        return {}
    payload = json.loads(OUTPUT_PATH.read_text())
    existing = {}
    for candidate in payload.get("candidates", []):
        cid = candidate.get("candidate_id")
        if cid:
            existing[cid] = candidate
    return existing


def main() -> int:
    existing_state = load_existing_state()
    all_candidates: List[Dict] = []
    for project_dir in sorted(ACTIVE_INITIATIVES_DIR.iterdir()):
        if not project_dir.is_dir():
            continue
        all_candidates.extend(build_candidates_for_project(project_dir))

    deduped = dedupe(all_candidates)
    for candidate in deduped:
        previous = existing_state.get(candidate["candidate_id"])
        if not previous:
            continue
        if previous.get("state") == "committed":
            candidate["state"] = "committed"
            candidate["target_external_id"] = previous.get("target_external_id")
            candidate["linear_identifier"] = previous.get("linear_identifier")
    deduped.sort(key=lambda item: (item["priority"], item["project_id"], item["title"]))

    payload = {
        "$schema": "product-os-action-candidates-v1",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total_candidates": len(deduped),
        "candidates": deduped,
    }
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(payload, indent=2) + "\n")
    print(f"Wrote {OUTPUT_PATH} ({len(deduped)} candidates)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
