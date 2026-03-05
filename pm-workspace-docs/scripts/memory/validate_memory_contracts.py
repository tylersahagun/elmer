#!/usr/bin/env python3
"""
Validate Project Registry and Metrics Contract coverage.

Checks:
1. Every active initiative exists in project-registry.json.
2. Registry paths resolve to real initiative folders.
3. Every active initiative has metrics-contract.json.
"""

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List

SCRIPT_DIR = Path(__file__).resolve().parent
WORKSPACE_DOCS = SCRIPT_DIR.parent.parent
ACTIVE_INITIATIVES_DIR = WORKSPACE_DOCS / "initiatives" / "active"
REGISTRY_PATH = WORKSPACE_DOCS / "company-context" / "project-registry.json"
AUDIT_PATH = WORKSPACE_DOCS / "maintenance" / "memory-contract-audit.md"


def _load_json(path: Path) -> Dict:
    return json.loads(path.read_text())


def _active_initiatives() -> List[str]:
    initiatives = []
    for meta_path in sorted(ACTIVE_INITIATIVES_DIR.glob("*/_meta.json")):
        initiatives.append(meta_path.parent.name)
    return initiatives


def _write_report(
    active: List[str],
    missing_registry: List[str],
    missing_metrics: List[str],
    bad_registry_paths: List[str],
    registry_only: List[str],
) -> None:
    now = datetime.now(timezone.utc).isoformat()
    lines = [
        "# Memory Contract Audit",
        "",
        f"**Generated:** {now}",
        "",
        "## Summary",
        "",
        f"- Active initiatives: {len(active)}",
        f"- Missing in registry: {len(missing_registry)}",
        f"- Missing metrics contracts: {len(missing_metrics)}",
        f"- Broken registry paths: {len(bad_registry_paths)}",
        f"- Registry entries with no active initiative: {len(registry_only)}",
        "",
        "## Missing in project-registry.json",
        "",
    ]
    lines.extend([f"- {item}" for item in missing_registry] or ["- None"])
    lines.extend(["", "## Missing metrics-contract.json", ""])
    lines.extend([f"- {item}" for item in missing_metrics] or ["- None"])
    lines.extend(["", "## Broken registry paths", ""])
    lines.extend([f"- {item}" for item in bad_registry_paths] or ["- None"])
    lines.extend(["", "## Registry-only entries", ""])
    lines.extend([f"- {item}" for item in registry_only] or ["- None"])
    lines.append("")

    AUDIT_PATH.parent.mkdir(parents=True, exist_ok=True)
    AUDIT_PATH.write_text("\n".join(lines))


def main() -> int:
    if not REGISTRY_PATH.exists():
        print(f"Missing registry file: {REGISTRY_PATH}")
        return 2

    registry = _load_json(REGISTRY_PATH)
    projects = registry.get("projects", [])
    registry_ids = {project.get("project_id") for project in projects if project.get("project_id")}
    active = _active_initiatives()
    active_set = set(active)

    missing_registry = sorted(active_set - registry_ids)
    registry_only = sorted(registry_ids - active_set)

    missing_metrics = []
    for initiative in active:
        metrics_contract = ACTIVE_INITIATIVES_DIR / initiative / "metrics-contract.json"
        if not metrics_contract.exists():
            missing_metrics.append(initiative)

    bad_registry_paths = []
    for project in projects:
        project_id = project.get("project_id")
        initiative_path = project.get("initiative_path")
        if not project_id or not initiative_path:
            bad_registry_paths.append(f"{project_id or 'unknown'} (missing initiative_path)")
            continue

        resolved = WORKSPACE_DOCS / initiative_path
        if not resolved.exists():
            bad_registry_paths.append(f"{project_id} -> {initiative_path}")

    _write_report(
        active=active,
        missing_registry=missing_registry,
        missing_metrics=missing_metrics,
        bad_registry_paths=bad_registry_paths,
        registry_only=registry_only,
    )

    total_issues = (
        len(missing_registry)
        + len(missing_metrics)
        + len(bad_registry_paths)
    )
    if total_issues > 0:
        print(f"Validation failed with {total_issues} issue(s). See {AUDIT_PATH}")
        return 1

    print(f"Validation passed. See {AUDIT_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
