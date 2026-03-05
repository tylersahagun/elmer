#!/usr/bin/env python3
"""
Ingest core PM workspace context into Obsidian notes.
"""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path


WORKSPACE_ROOT = Path("/Users/tylersahagun/Source/pm-workspace")
PM_DOCS_ROOT = WORKSPACE_ROOT / "pm-workspace-docs"
DEFAULT_VAULT = Path(
    "/Users/tylersahagun/Library/Mobile Documents/com~apple~CloudDocs/data/obsidian-vault"
)

CORE_FILES = [
    "company-context/product-vision.md",
    "company-context/strategic-guardrails.md",
    "company-context/tyler-context.md",
    "company-context/org-chart.md",
    "roadmap/roadmap.md",
]


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def fm_value(value: str) -> str:
    return value.replace('"', '\\"')


def to_note(source_rel: str, source_text: str) -> str:
    now = utc_now()
    title = source_rel.replace("/", " / ")
    frontmatter = (
        "---\n"
        f'title: "{fm_value(title)}"\n'
        'source: "pm-workspace"\n'
        'provider: "pm-workspace"\n'
        f'source_file: "{fm_value(source_rel)}"\n'
        f'imported_at: "{now}"\n'
        "tags: [pm-workspace, context]\n"
        "---\n\n"
    )
    body = f"# {title}\n\n{source_text.rstrip()}\n"
    return frontmatter + body


def build_initiatives_index() -> str:
    active_dir = PM_DOCS_ROOT / "initiatives/active"
    rows = []
    for meta_file in sorted(active_dir.rglob("_meta.json")):
        try:
            data = json.loads(meta_file.read_text(encoding="utf-8"))
        except Exception:
            continue
        rows.append(
            {
                "initiative": data.get("initiative", meta_file.parent.name),
                "phase": data.get("phase", "unknown"),
                "status": data.get("status", "unknown"),
                "owner": data.get("owner", "unknown"),
                "path": str(meta_file.parent.relative_to(PM_DOCS_ROOT)),
            }
        )

    lines = [
        "---",
        'title: "Active initiatives index"',
        'source: "pm-workspace"',
        'provider: "pm-workspace"',
        f'imported_at: "{utc_now()}"',
        "tags: [pm-workspace, initiatives, index]",
        "---",
        "",
        "# Active Initiatives",
        "",
        f"Total initiatives: {len(rows)}",
        "",
        "| Initiative | Phase | Status | Owner | Path |",
        "| --- | --- | --- | --- | --- |",
    ]
    for row in rows:
        lines.append(
            f"| {row['initiative']} | {row['phase']} | {row['status']} | {row['owner']} | `{row['path']}` |"
        )
    lines.append("")
    return "\n".join(lines)


def ingest(vault_path: Path) -> dict:
    created = 0
    missing = []
    output_root = vault_path / "10_sources/pm-workspace"

    for rel in CORE_FILES:
        source_file = PM_DOCS_ROOT / rel
        if not source_file.exists():
            missing.append(rel)
            continue

        note_path = output_root / rel
        note = to_note(rel, read_text(source_file))
        write_text(note_path, note)
        created += 1

    initiatives_index = build_initiatives_index()
    write_text(vault_path / "20_entities/projects/index.md", initiatives_index)

    summary = {
        "generated_at": utc_now(),
        "vault_path": str(vault_path),
        "core_notes_written": created,
        "missing_core_files": missing,
        "initiatives_index_written": True,
        "status": "ok",
    }
    write_text(
        vault_path / "_system/reports/ingest-pm-workspace-report.json",
        json.dumps(summary, indent=2),
    )
    return summary


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest PM workspace context notes.")
    parser.add_argument("--vault-path", type=Path, default=DEFAULT_VAULT)
    args = parser.parse_args()
    result = ingest(args.vault_path)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
