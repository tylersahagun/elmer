#!/usr/bin/env python3
"""
Sync Slack/Gmail/Status digests into Product OS evidence store.

Adds evidence-pointer records for operational status artifacts so project and
portfolio agents can reason over communication and status flow outputs.
"""

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List

SCRIPT_DIR = Path(__file__).resolve().parent
WORKSPACE_DOCS = SCRIPT_DIR.parent.parent
WORKSPACE_ROOT = WORKSPACE_DOCS.parent
STATUS_DIR = WORKSPACE_DOCS / "status"
REGISTRY_PATH = WORKSPACE_DOCS / "company-context" / "project-registry.json"
EVIDENCE_STORE_PATH = WORKSPACE_ROOT / "packages" / "product-os-memory" / "data" / "evidence-store.json"


def read_json(path: Path) -> Dict:
    return json.loads(path.read_text())


def load_registry_projects() -> List[Dict]:
    if not REGISTRY_PATH.exists():
        return []
    registry = read_json(REGISTRY_PATH)
    return registry.get("projects", [])


def collect_digest_files() -> List[Path]:
    paths = []
    paths.extend(sorted((STATUS_DIR / "slack" / "digests").glob("*.md")))
    paths.extend(sorted((STATUS_DIR / "gmail" / "digests").glob("*.md")))
    paths.extend(sorted(STATUS_DIR.glob("status-all-*.md")))
    paths.extend(sorted((STATUS_DIR / "portfolio").glob("head-of-product-*.md")))
    paths.extend(sorted((STATUS_DIR / "projects").glob("*/dossier-*.md")))
    paths.extend(sorted((STATUS_DIR / "daily").glob("*.md")))

    # Include legacy top-level digest files
    paths.extend(sorted((STATUS_DIR / "gmail").glob("gmail-digest-*.md")))
    return sorted(set(paths))


def infer_projects_from_text(text: str, projects: List[Dict]) -> List[str]:
    normalized = text.lower()
    matches = []
    for project in projects:
        pid = project.get("project_id")
        pname = (project.get("initiative_name") or "").lower()
        if not pid:
            continue
        if pid in normalized or (pname and pname in normalized):
            matches.append(pid)
    return sorted(set(matches))


def source_type_for_path(path: Path) -> str:
    path_str = str(path)
    if "/slack/" in path_str:
        return "slack_message"
    if "/gmail/" in path_str:
        return "gmail_thread"
    return "doc_fragment"


def source_system_for_path(path: Path) -> str:
    path_str = str(path)
    if "/slack/" in path_str:
        return "slack"
    if "/gmail/" in path_str:
        return "gmail"
    return "local-docs"


def load_or_init_store() -> Dict:
    if EVIDENCE_STORE_PATH.exists():
        return read_json(EVIDENCE_STORE_PATH)
    return {
        "$schema": "product-os-evidence-store-v1",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source": "memory.sync",
        "total_evidence_items": 0,
        "evidence": [],
    }


def upsert(store: Dict, record: Dict) -> None:
    items = store.setdefault("evidence", [])
    for idx, item in enumerate(items):
        if item.get("evidence_id") == record["evidence_id"]:
            merged = dict(item)
            merged.update(record)
            merged["ingested_at"] = datetime.now(timezone.utc).isoformat()
            items[idx] = merged
            return
    items.append(record)


def main() -> int:
    projects = load_registry_projects()
    files = collect_digest_files()
    store = load_or_init_store()
    now = datetime.now(timezone.utc).isoformat()

    created_count = 0
    for file_path in files:
        relative_path = str(file_path.relative_to(WORKSPACE_ROOT))
        text = file_path.read_text()
        header = text.splitlines()[0].strip() if text.splitlines() else file_path.name
        matched_projects = infer_projects_from_text(text, projects)
        if not matched_projects:
            matched_projects = [None]

        for project_id in matched_projects:
            suffix = f"__{project_id}" if project_id else ""
            evidence_id = f"evi_status_{file_path.stem}{suffix}"
            record = {
                "evidence_id": evidence_id,
                "source_type": source_type_for_path(file_path),
                "source_system": source_system_for_path(file_path),
                "external_id": file_path.stem,
                "source_url": f"file://{file_path}",
                "project_id": project_id,
                "actor_person_ids": [],
                "occurred_at": datetime.fromtimestamp(file_path.stat().st_mtime, tz=timezone.utc).isoformat(),
                "ingested_at": now,
                "summary_snippet": header,
                "scope": "team",
                "metadata": {
                    "status_artifact": True,
                    "file_path": relative_path,
                },
            }
            upsert(store, record)
            created_count += 1

    store["generated_at"] = now
    store["total_evidence_items"] = len(store.get("evidence", []))
    store["source"] = "pm-workspace-docs/status/*"
    EVIDENCE_STORE_PATH.parent.mkdir(parents=True, exist_ok=True)
    EVIDENCE_STORE_PATH.write_text(json.dumps(store, indent=2) + "\n")
    print(f"Wrote {EVIDENCE_STORE_PATH} ({store['total_evidence_items']} total evidence records)")
    print(f"Processed {len(files)} status files and upserted {created_count} records")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
