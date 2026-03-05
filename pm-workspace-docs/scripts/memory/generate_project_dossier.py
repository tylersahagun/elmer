#!/usr/bin/env python3
"""
Generate a project dossier markdown snapshot from initiative docs + metrics contract.
"""

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

SCRIPT_DIR = Path(__file__).resolve().parent
WORKSPACE_DOCS = SCRIPT_DIR.parent.parent
ACTIVE_INITIATIVES_DIR = WORKSPACE_DOCS / "initiatives" / "active"
REGISTRY_PATH = WORKSPACE_DOCS / "company-context" / "project-registry.json"
STATUS_PROJECTS_DIR = WORKSPACE_DOCS / "status" / "projects"


def read_json(path: Path) -> Dict[str, Any]:
    return json.loads(path.read_text())


def safe_read(path: Path) -> str:
    return path.read_text() if path.exists() else ""


def normalize_ref(ref: str, initiative_dir: Path) -> str:
    ref_path = Path(ref)
    if ref_path.is_absolute():
        try:
            return str(ref_path.relative_to(WORKSPACE_DOCS.parent))
        except ValueError:
            return str(ref_path)

    candidate = WORKSPACE_DOCS.parent / ref
    if candidate.exists():
        return str(candidate.relative_to(WORKSPACE_DOCS.parent))

    initiative_candidate = initiative_dir / ref
    if initiative_candidate.exists():
        return str(initiative_candidate.relative_to(WORKSPACE_DOCS.parent))

    return ref


def extract_decision_highlights(decisions_text: str, limit: int = 3) -> List[str]:
    highlights = []
    for line in decisions_text.splitlines():
        stripped = line.strip()
        if stripped.startswith("## ") or stripped.startswith("### "):
            highlights.append(stripped.lstrip("# ").strip())
        elif stripped.startswith("- ") and len(highlights) < limit:
            highlights.append(stripped[2:].strip())
        if len(highlights) >= limit:
            break
    return highlights


def build_dossier(initiative: str) -> str:
    initiative_dir = ACTIVE_INITIATIVES_DIR / initiative
    if not initiative_dir.exists():
        raise SystemExit(f"Initiative not found: {initiative}")

    meta = read_json(initiative_dir / "_meta.json")
    metrics = read_json(initiative_dir / "metrics-contract.json")
    decisions_text = safe_read(initiative_dir / "decisions.md")
    prd_text = safe_read(initiative_dir / "prd.md")
    now = datetime.now(timezone.utc).isoformat()

    decision_highlights = extract_decision_highlights(decisions_text)
    validation = metrics.get("validation", {})
    blockers = meta.get("blockers", []) or []

    evidence_refs = []
    prototype_feedback = meta.get("prototype_feedback", {}) or {}
    if prototype_feedback.get("signal_doc"):
        evidence_refs.append(normalize_ref(prototype_feedback["signal_doc"], initiative_dir))
    if prototype_feedback.get("analysis_doc"):
        evidence_refs.append(normalize_ref(prototype_feedback["analysis_doc"], initiative_dir))
    validation_meta = meta.get("validation", {}) or {}
    if validation_meta.get("report"):
        report_path = initiative_dir / validation_meta["report"]
        evidence_refs.append(str(report_path.relative_to(WORKSPACE_DOCS.parent)))
    evidence_refs.append(str((initiative_dir / "metrics-contract.json").relative_to(WORKSPACE_DOCS.parent)))
    evidence_refs = list(dict.fromkeys(evidence_refs))

    open_loops = []
    for gap in validation.get("gaps", []):
        open_loops.append(f"{gap.get('type')}: {gap.get('detail')}")
    for blocker in blockers:
        open_loops.append(blocker)
    open_loops = open_loops[:8]

    prd_excerpt = ""
    for line in prd_text.splitlines():
        stripped = line.strip()
        if stripped and not stripped.startswith("#"):
            prd_excerpt = stripped
            break

    lines = [
        f"# Project Dossier — {meta.get('name') or initiative.replace('-', ' ').title()}",
        "",
        f"**Project ID:** `{initiative}`",
        f"**As of:** {now}",
        f"**Phase:** {meta.get('phase')} ({meta.get('status')})",
        f"**Owner:** {meta.get('owner') or 'UNASSIGNED'}",
        "",
        "## Summary",
        "",
        prd_excerpt or meta.get("next_action", "No summary available."),
        "",
        "## Measurement Readiness",
        "",
        f"- **Status:** {validation.get('status', 'missing')}",
        f"- **Last Validated:** {validation.get('last_validated_at')}",
        f"- **North Star:** {metrics.get('north_star_metric', {}).get('name')}",
        f"- **Linked Linear Issues:** {', '.join(validation.get('linked_linear_issue_ids', [])) or 'None'}",
        "",
        "## Open Loops",
        "",
    ]
    if open_loops:
        lines.extend([f"- {item}" for item in open_loops])
    else:
        lines.append("- None")

    lines.extend(["", "## Recent Decisions", ""])
    if decision_highlights:
        lines.extend([f"- {item}" for item in decision_highlights])
    else:
        lines.append("- No recent decision highlights found.")

    lines.extend(["", "## Evidence References", ""])
    lines.extend([f"- `{ref}`" for ref in evidence_refs])
    lines.extend(
        [
            "",
            "## As-of Notes",
            "",
            "- Generated from local initiative artifacts and metrics contract.",
            "- Memory MCP enrichment can append additional evidence IDs and live open loops.",
            "",
        ]
    )

    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("initiative", help="Initiative slug in initiatives/active/")
    parser.add_argument("--write", action="store_true", help="Write dossier snapshot to status/projects")
    args = parser.parse_args()

    if not REGISTRY_PATH.exists():
        raise SystemExit("project-registry.json missing. Run generate_project_registry.py first.")

    dossier = build_dossier(args.initiative)
    if not args.write:
        print(dossier)
        return 0

    date_key = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    out_dir = STATUS_PROJECTS_DIR / args.initiative
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"dossier-{date_key}.md"
    out_path.write_text(dossier)
    print(f"Wrote {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
