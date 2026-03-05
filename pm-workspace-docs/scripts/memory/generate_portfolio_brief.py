#!/usr/bin/env python3
"""
Generate Head-of-Product portfolio brief from project registry + metrics contracts + dossiers.
"""

import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List

SCRIPT_DIR = Path(__file__).resolve().parent
WORKSPACE_DOCS = SCRIPT_DIR.parent.parent
REGISTRY_PATH = WORKSPACE_DOCS / "company-context" / "project-registry.json"
ACTIVE_INITIATIVES_DIR = WORKSPACE_DOCS / "initiatives" / "active"
STATUS_PROJECTS_DIR = WORKSPACE_DOCS / "status" / "projects"
OUT_DIR = WORKSPACE_DOCS / "status" / "portfolio"


def read_json(path: Path) -> Dict:
    return json.loads(path.read_text())


def latest_dossier_path(project_id: str) -> Path | None:
    project_dir = STATUS_PROJECTS_DIR / project_id
    if not project_dir.exists():
        return None
    files = sorted(project_dir.glob("dossier-*.md"))
    return files[-1] if files else None


def metrics_status(project_id: str) -> Dict:
    contract_path = ACTIVE_INITIATIVES_DIR / project_id / "metrics-contract.json"
    if not contract_path.exists():
        return {"status": "missing", "gaps": []}
    contract = read_json(contract_path)
    validation = contract.get("validation", {})
    return {
        "status": validation.get("status", "missing"),
        "gaps": validation.get("gaps", []),
        "linked_linear_issue_ids": validation.get("linked_linear_issue_ids", []),
    }


def build_brief() -> str:
    registry = read_json(REGISTRY_PATH)
    projects: List[Dict] = registry.get("projects", [])
    now = datetime.now(timezone.utc).isoformat()

    status_counter = Counter()
    phase_counter = Counter()
    portfolio_rows = []
    top_risks = []

    for project in projects:
        project_id = project["project_id"]
        readiness = metrics_status(project_id)
        status_counter[readiness["status"]] += 1
        phase_counter[project.get("phase") or "unknown"] += 1

        gaps = readiness.get("gaps", [])
        high_gaps = [gap for gap in gaps if (gap.get("severity") or "").lower() == "high"]
        if high_gaps:
            top_risks.append(
                {
                    "project_id": project_id,
                    "risk": high_gaps[0].get("detail", "High severity instrumentation gap"),
                }
            )

        dossier = latest_dossier_path(project_id)
        portfolio_rows.append(
            {
                "project_id": project_id,
                "phase": project.get("phase"),
                "status": project.get("status"),
                "owner": project.get("owner") or "unassigned",
                "readiness": readiness["status"],
                "dossier": str(dossier.relative_to(WORKSPACE_DOCS.parent)) if dossier else "missing",
            }
        )

    top_risks = top_risks[:10]
    portfolio_rows.sort(key=lambda row: (row["readiness"], row["phase"] or ""))

    lines = [
        "# Head of Product Portfolio Brief",
        "",
        f"**As of:** {now}",
        f"**Projects tracked:** {len(projects)}",
        "",
        "## Measurement Readiness Coverage",
        "",
        f"- instrumented: {status_counter.get('instrumented', 0)}",
        f"- partial: {status_counter.get('partial', 0)}",
        f"- missing: {status_counter.get('missing', 0)}",
        "",
        "## Phase Distribution",
        "",
    ]
    for phase, count in sorted(phase_counter.items()):
        lines.append(f"- {phase}: {count}")

    lines.extend(["", "## Top Portfolio Risks", ""])
    if not top_risks:
        lines.append("- No high-severity measurement risks detected.")
    else:
        for risk in top_risks:
            lines.append(f"- `{risk['project_id']}`: {risk['risk']}")

    lines.extend(
        [
            "",
            "## Project Snapshot",
            "",
            "| Project | Phase | Status | Owner | Readiness | Latest Dossier |",
            "| --- | --- | --- | --- | --- | --- |",
        ]
    )

    for row in portfolio_rows:
        lines.append(
            f"| `{row['project_id']}` | {row['phase']} | {row['status']} | {row['owner']} | {row['readiness']} | {row['dossier']} |"
        )

    lines.extend(
        [
            "",
            "## Recommended Focus (Next 7 Days)",
            "",
            "1. Close high-severity readiness gaps for pilot and P0 initiatives.",
            "2. Ensure every active project has a fresh dossier snapshot.",
            "3. Convert extracted action candidates into committed Linear tasks where needed.",
            "",
        ]
    )

    return "\n".join(lines)


def main() -> int:
    if not REGISTRY_PATH.exists():
        raise SystemExit("project-registry.json is missing. Run generate_project_registry.py first.")

    brief = build_brief()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    date_key = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    out_path = OUT_DIR / f"head-of-product-{date_key}.md"
    out_path.write_text(brief)
    print(f"Wrote {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
