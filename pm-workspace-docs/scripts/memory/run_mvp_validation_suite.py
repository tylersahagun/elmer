#!/usr/bin/env python3
"""
Run Product OS memory MVP validation suite and emit markdown report.
"""

from __future__ import annotations

import subprocess
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import List

SCRIPT_DIR = Path(__file__).resolve().parent
WORKSPACE_DOCS = SCRIPT_DIR.parent.parent
WORKSPACE_ROOT = WORKSPACE_DOCS.parent
REPORT_DIR = WORKSPACE_DOCS / "status" / "memory-graph"


@dataclass
class CheckResult:
    name: str
    command: List[str]
    returncode: int
    stdout: str
    stderr: str
    duration_ms: float


def run_check(name: str, command: List[str]) -> CheckResult:
    start = datetime.now(timezone.utc)
    completed = subprocess.run(
        command,
        cwd=WORKSPACE_ROOT,
        text=True,
        capture_output=True,
        timeout=120,
        check=False,
    )
    end = datetime.now(timezone.utc)
    duration_ms = (end - start).total_seconds() * 1000
    return CheckResult(
        name=name,
        command=command,
        returncode=completed.returncode,
        stdout=completed.stdout.strip(),
        stderr=completed.stderr.strip(),
        duration_ms=duration_ms,
    )


def main() -> int:
    checks = [
        ("Generate project registry", ["python3", "pm-workspace-docs/scripts/memory/generate_project_registry.py"]),
        ("Validate registry + metrics contracts", ["python3", "pm-workspace-docs/scripts/memory/validate_memory_contracts.py"]),
        ("Sync signals into evidence store", ["python3", "pm-workspace-docs/scripts/memory/sync_signals_to_memory.py"]),
        ("Sync status digests into evidence store", ["python3", "pm-workspace-docs/scripts/memory/sync_status_digests_to_memory.py"]),
        ("Generate action candidates", ["python3", "pm-workspace-docs/scripts/memory/generate_action_candidates.py"]),
        (
            "Auto-commit instrumentation candidates",
            ["python3", "pm-workspace-docs/scripts/memory/auto_commit_instrumentation_candidates.py"],
        ),
        ("Generate pilot dossier", ["python3", "pm-workspace-docs/scripts/memory/generate_project_dossier.py", "chief-of-staff-experience", "--write"]),
        ("Generate portfolio brief", ["python3", "pm-workspace-docs/scripts/memory/generate_portfolio_brief.py"]),
        ("Build graph projection", ["python3", "pm-workspace-docs/scripts/memory/build_graph_projection.py"]),
        ("Validate graph projection", ["python3", "pm-workspace-docs/scripts/memory/validate_graph_projection.py"]),
        ("Run MCP smoke tests", ["python3", "pm-workspace-docs/scripts/memory/run_mcp_smoke_tests.py"]),
        ("Desktop shell lint", ["npm", "run", "lint", "--prefix", "product-os-desktop"]),
    ]

    results: List[CheckResult] = []
    for name, command in checks:
        results.append(run_check(name, command))

    all_passed = all(result.returncode == 0 for result in results)
    now = datetime.now(timezone.utc)
    date_key = now.strftime("%Y-%m-%d")
    report_path = REPORT_DIR / f"validation-suite-{date_key}.md"
    REPORT_DIR.mkdir(parents=True, exist_ok=True)

    lines: List[str] = [
        "# Product OS Memory MVP Validation Suite",
        "",
        f"**Generated:** {now.isoformat()}",
        f"**Overall Status:** {'PASS' if all_passed else 'FAIL'}",
        "",
        "## Results",
        "",
        "| Check | Status | Duration (ms) |",
        "| --- | --- | ---: |",
    ]
    for result in results:
        status = "✅ PASS" if result.returncode == 0 else "❌ FAIL"
        lines.append(f"| {result.name} | {status} | {result.duration_ms:.1f} |")

    for result in results:
        lines.extend(
            [
                "",
                f"## {result.name}",
                "",
                f"**Command:** `{' '.join(result.command)}`",
                f"**Exit Code:** {result.returncode}",
                "",
                "### Stdout",
                "```text",
                result.stdout or "(empty)",
                "```",
            ]
        )
        if result.stderr:
            lines.extend(
                [
                    "",
                    "### Stderr",
                    "```text",
                    result.stderr,
                    "```",
                ]
            )

    report_path.write_text("\n".join(lines) + "\n")
    print(f"Wrote {report_path}")
    print("PASS" if all_passed else "FAIL")
    return 0 if all_passed else 1


if __name__ == "__main__":
    raise SystemExit(main())
