#!/usr/bin/env python3
"""
Workflow Runner: Stage-based workflow executor for Cursor-native orchestration.

Usage:
  python workflow-runner.py --project <slug>
  python workflow-runner.py --project <slug> --stage <stage_id>
  python workflow-runner.py --project <slug> --dry-run
"""

import argparse
import json
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

try:
    import yaml  # type: ignore
except ImportError:
    raise SystemExit("PyYAML not installed. Run: pip install pyyaml")

WORKSPACE_ROOT = Path(__file__).parent.parent.parent
WORKFLOWS_DIR = WORKSPACE_ROOT / "workflows"
INITIATIVES_DIR = WORKSPACE_ROOT / "initiatives"
STATUS_DIR = WORKSPACE_ROOT / "status"
WORKSPACE_CONFIG_PATH = WORKFLOWS_DIR / "workspace-config.yaml"
METRICS_GATES_PATH = WORKFLOWS_DIR / "metrics-gates.yaml"


def load_yaml(path: Path) -> dict:
    with open(path, "r") as f:
        return yaml.safe_load(f)


def load_json(path: Path) -> dict:
    with open(path, "r") as f:
        return json.load(f)


def save_json(path: Path, data: dict):
    with open(path, "w") as f:
        json.dump(data, f, indent=2)


def ensure_state(project: str) -> Path:
    template_path = INITIATIVES_DIR / "_template" / "state.json"
    project_dir = INITIATIVES_DIR / project
    project_dir.mkdir(parents=True, exist_ok=True)
    state_path = project_dir / "state.json"
    if not state_path.exists():
        state = load_json(template_path)
        state["name"] = project
        save_json(state_path, state)
    return state_path


def load_workspace_config() -> dict:
    if WORKSPACE_CONFIG_PATH.exists():
        return load_yaml(WORKSPACE_CONFIG_PATH)
    return {}


def load_metrics_gates() -> dict:
    if METRICS_GATES_PATH.exists():
        return load_yaml(METRICS_GATES_PATH)
    return {"gates": {}}


def get_stage(workflow: dict, stage_id: str) -> Optional[dict]:
    return next((s for s in workflow.get("stage_graph", []) if s["id"] == stage_id), None)


def load_metrics_snapshot(project_dir: Path) -> Optional[dict]:
    candidate_files = [
        project_dir / "posthog-metrics.json",
        project_dir / "metrics.json",
        project_dir / "metrics-gate.json",
    ]
    for file_path in candidate_files:
        if file_path.exists():
            return load_json(file_path)
    return None


def evaluate_metrics_gate(
    gate_id: str,
    gate_config: dict,
    project_dir: Path,
) -> dict:
    snapshot = load_metrics_snapshot(project_dir)
    evaluated_at = datetime.now().isoformat()
    if not snapshot:
        return {
            "id": gate_id,
            "status": "needs_data",
            "evaluated_at": evaluated_at,
            "details": "No metrics snapshot found. Add posthog-metrics.json to initiative.",
        }

    posthog_config = gate_config.get("posthog", {})
    errors_config = gate_config.get("errors", {})
    thresholds = {
        "min_unique_users": posthog_config.get("min_unique_users"),
        "min_conversion_rate": posthog_config.get("min_conversion_rate"),
        "max_error_rate": errors_config.get("max_error_rate"),
        "observation_window_days": gate_config.get("observation_window_days"),
    }

    observed = {
        "event": snapshot.get("event"),
        "unique_users": snapshot.get("unique_users"),
        "conversion_rate": snapshot.get("conversion_rate"),
        "error_rate": snapshot.get("error_rate"),
        "window_days": snapshot.get("window_days"),
        "source": snapshot.get("source", "posthog"),
        "evaluated_at": snapshot.get("evaluated_at"),
    }

    failures = []
    if thresholds["min_unique_users"] is not None:
        if (observed["unique_users"] or 0) < thresholds["min_unique_users"]:
            failures.append("unique_users")
    if thresholds["min_conversion_rate"] is not None:
        if (observed["conversion_rate"] or 0) < thresholds["min_conversion_rate"]:
            failures.append("conversion_rate")
    if thresholds["max_error_rate"] is not None:
        if (observed["error_rate"] or 0) > thresholds["max_error_rate"]:
            failures.append("error_rate")

    status = "pass" if not failures else "fail"
    return {
        "id": gate_id,
        "status": status,
        "evaluated_at": evaluated_at,
        "thresholds": thresholds,
        "observed": observed,
        "failed_checks": failures,
    }


def format_gate_summary(gate_result: Optional[dict]) -> Tuple[str, str]:
    if not gate_result:
        return "-", "-"
    gate_id = gate_result.get("id") or "-"
    status = gate_result.get("status") or "-"
    return gate_id, status


def write_project_status(project: str, state: dict, stage: dict, workflow: dict, gate_result: Optional[dict]):
    status_path = STATUS_DIR / "workflow" / "initiatives" / f"project-{project}.md"
    status_path.parent.mkdir(parents=True, exist_ok=True)
    next_stage = stage.get("next")
    gate_id, gate_status = format_gate_summary(gate_result)
    lines = [
        f"# Project Status: {project}",
        "",
        f"**Stage:** {stage.get('label')} (`{stage.get('id')}`)",
        f"**Status:** {state.get('status')}",
        f"**Automation Policy:** {state.get('automation_policy')}",
        f"**Confidence:** {state.get('confidence')}",
        f"**Iteration Count:** {state.get('iteration_count')}",
        f"**Last Run:** {state.get('last_run_at')}",
        f"**Next Stage:** `{next_stage}`" if next_stage else "**Next Stage:** -",
        f"**Metrics Gate:** `{gate_id}`",
        f"**Metrics Gate Status:** `{gate_status}`",
        "",
        "## Actions",
    ]
    if stage.get("commands"):
        lines.append("### Commands")
        lines.extend([f"- `{cmd}`" for cmd in stage["commands"]])
    if stage.get("agents"):
        lines.append("### Agents")
        lines.extend([f"- `{agent}`" for agent in stage["agents"]])
    if stage.get("outputs"):
        lines.append("### Outputs")
        lines.extend([f"- `{output}`" for output in stage["outputs"]])
    lines.append("")
    status_path.write_text("\n".join(lines))


def collect_project_states(workflow: dict) -> List[Dict[str, Any]]:
    results: List[Dict[str, Any]] = []
    for project_dir in INITIATIVES_DIR.iterdir():
        if not project_dir.is_dir() or project_dir.name.startswith("_"):
            continue
        state_path = project_dir / "state.json"
        if not state_path.exists():
            continue
        state = load_json(state_path)
        stage = get_stage(workflow, state.get("stage_id") or "intake") or {}
        results.append(
            {
                "project": project_dir.name,
                "state": state,
                "stage": stage,
            }
        )
    return results


def write_workflow_dashboard(workflow: dict, workspace_config: dict):
    output_path = STATUS_DIR / "workflow" / "dashboards" / "workflow-dashboard.md"
    outputs_config = workspace_config.get("outputs", {}) if workspace_config else {}
    configured_output = outputs_config.get("workflow_dashboard")
    if configured_output:
        output_path = Path(configured_output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    projects = collect_project_states(workflow)
    lines = [
        "# Workflow Dashboard",
        "",
        f"Last updated: {datetime.now().isoformat()}",
        "",
        "## Repo Bindings",
    ]

    repos = workspace_config.get("repos", []) if workspace_config else []
    if repos:
        for repo in repos:
            lines.append(f"- **{repo.get('label', repo.get('id'))}**: `{repo.get('root_path')}`")
            prototypes_path = repo.get("prototypes_path")
            if prototypes_path:
                lines.append(f"  - Prototypes: `{prototypes_path}`")
            storybook_path = repo.get("storybook_path")
            if storybook_path:
                lines.append(f"  - Storybook: `{storybook_path}`")
            links = repo.get("links", {})
            storybook_url = links.get("storybook_local")
            if storybook_url:
                lines.append(f"  - Storybook URL: `{storybook_url}`")
            chromatic_template = links.get("chromatic_app_template")
            if chromatic_template:
                lines.append(f"  - Chromatic App URL: `{chromatic_template}`")
    else:
        lines.append("- No repos configured.")

    lines.extend(["", "## Projects", ""])
    if not projects:
        lines.append("_No project states found._")
        output_path.write_text("\n".join(lines))
        return

    lines.append("| Project | Stage | Status | Policy | Gate | Gate Status | Confidence | Last Run | Next Action |")
    lines.append("| --- | --- | --- | --- | --- | --- | --- | --- | --- |")
    for entry in sorted(projects, key=lambda item: item["project"]):
        state = entry["state"]
        stage = entry["stage"]
        gate_result = state.get("metrics_gate")
        gate_id, gate_status = format_gate_summary(gate_result if isinstance(gate_result, dict) else None)
        lines.append(
            "| {project} | {stage} | {status} | {policy} | {gate} | {gate_status} | {confidence} | {last_run} | {next_action} |".format(
                project=entry["project"],
                stage=stage.get("label", "-"),
                status=state.get("status", "-"),
                policy=state.get("automation_policy", "-"),
                gate=gate_id,
                gate_status=gate_status,
                confidence=state.get("confidence", "-"),
                last_run=state.get("last_run_at", "-"),
                next_action=state.get("next_action", "-"),
            )
        )

    output_path.write_text("\n".join(lines))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--project", required=True)
    parser.add_argument("--stage", required=False)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    workflow = load_yaml(WORKFLOWS_DIR / "workflow.yaml")
    policies = load_yaml(WORKFLOWS_DIR / "automation-policies.yaml")
    metrics_gates = load_metrics_gates()
    workspace_config = load_workspace_config()

    state_path = ensure_state(args.project)
    state = load_json(state_path)

    stage_id = args.stage or state.get("stage_id") or "intake"
    stage = get_stage(workflow, stage_id)
    if not stage:
        raise SystemExit(f"Stage not found: {stage_id}")

    policy_id = stage.get("automation_policy") or workflow["defaults"]["automation_policy_default"]
    policy = policies["policies"].get(policy_id, {})

    if args.dry_run:
        print(f"[DRY RUN] Project={args.project} Stage={stage_id} Policy={policy_id}")
        return

    # Update state
    state["stage_id"] = stage_id
    state["stage_label"] = stage.get("label")
    state["automation_policy"] = policy_id
    state["status"] = "running" if policy_id != "manual" else "awaiting_manual"
    state["last_run_at"] = datetime.now().isoformat()

    gate_result = None
    if stage.get("metrics_gate"):
        gate_id = stage["metrics_gate"]
        gate_config = metrics_gates.get("gates", {}).get(gate_id, {})
        if gate_config:
            gate_result = evaluate_metrics_gate(gate_id, gate_config, INITIATIVES_DIR / args.project)
            state["metrics_gate"] = gate_result
            if gate_result.get("status") == "fail":
                state["status"] = "blocked"
                state.setdefault("blockers", [])
                if f"metrics_gate:{gate_id}" not in state["blockers"]:
                    state["blockers"].append(f"metrics_gate:{gate_id}")

    save_json(state_path, state)
    write_project_status(args.project, state, stage, workflow, gate_result)
    write_workflow_dashboard(workflow, workspace_config)

    print(f"Updated {state_path} and status dashboard for {args.project}.")


if __name__ == "__main__":
    main()
