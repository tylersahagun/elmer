#!/usr/bin/env python3
"""
Build knowledge-graph projection from registry, metrics contracts, dossiers, and action candidates.
"""

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List

SCRIPT_DIR = Path(__file__).resolve().parent
WORKSPACE_DOCS = SCRIPT_DIR.parent.parent
WORKSPACE_ROOT = WORKSPACE_DOCS.parent
REGISTRY_PATH = WORKSPACE_DOCS / "company-context" / "project-registry.json"
ACTIVE_INITIATIVES_DIR = WORKSPACE_DOCS / "initiatives" / "active"
STATUS_PROJECTS_DIR = WORKSPACE_DOCS / "status" / "projects"
ACTION_CANDIDATES_PATH = WORKSPACE_ROOT / "packages" / "product-os-memory" / "data" / "action-candidates.json"
OUT_PATH = WORKSPACE_ROOT / "packages" / "product-os-memory" / "data" / "graph-projection.json"
STATUS_OUT_PATH = WORKSPACE_DOCS / "status" / "memory-graph" / "latest.json"


def read_json(path: Path) -> Dict:
    return json.loads(path.read_text())


def latest_dossier(project_id: str) -> Path | None:
    project_dir = STATUS_PROJECTS_DIR / project_id
    if not project_dir.exists():
        return None
    files = sorted(project_dir.glob("dossier-*.md"))
    return files[-1] if files else None


def add_node(nodes: Dict[str, Dict], node: Dict) -> None:
    nodes[node["id"]] = node


def append_edge(edges: List[Dict], edge: Dict) -> None:
    edges.append(edge)


def build_graph() -> Dict:
    registry = read_json(REGISTRY_PATH)
    action_candidates = read_json(ACTION_CANDIDATES_PATH) if ACTION_CANDIDATES_PATH.exists() else {"candidates": []}

    nodes: Dict[str, Dict] = {}
    edges: List[Dict] = []

    for project in registry.get("projects", []):
        project_id = project["project_id"]
        add_node(
            nodes,
            {
                "id": project_id,
                "type": "project",
                "label": project.get("initiative_name") or project_id,
                "project_id": project_id,
                "metadata": {
                    "phase": project.get("phase"),
                    "status": project.get("status"),
                    "owner": project.get("owner"),
                },
            },
        )

        metrics_path = ACTIVE_INITIATIVES_DIR / project_id / "metrics-contract.json"
        if metrics_path.exists():
            metrics = read_json(metrics_path)
            metric_node_id = f"metric:{project_id}"
            add_node(
                nodes,
                {
                    "id": metric_node_id,
                    "type": "metric_contract",
                    "label": metrics.get("north_star_metric", {}).get("name", "Metrics Contract"),
                    "project_id": project_id,
                    "metadata": {
                        "readiness": metrics.get("validation", {}).get("status", "missing"),
                    },
                },
            )
            append_edge(
                edges,
                {
                    "id": f"edge:{project_id}:metrics",
                    "source": project_id,
                    "target": metric_node_id,
                    "type": "has_metrics_contract",
                    "evidence_ids": [str(metrics_path.relative_to(WORKSPACE_ROOT))],
                },
            )

        dossier = latest_dossier(project_id)
        if dossier:
            dossier_node_id = f"dossier:{project_id}"
            add_node(
                nodes,
                {
                    "id": dossier_node_id,
                    "type": "dossier",
                    "label": dossier.name,
                    "project_id": project_id,
                    "metadata": {"path": str(dossier.relative_to(WORKSPACE_ROOT))},
                },
            )
            append_edge(
                edges,
                {
                    "id": f"edge:{project_id}:dossier",
                    "source": project_id,
                    "target": dossier_node_id,
                    "type": "has_dossier",
                    "evidence_ids": [str(dossier.relative_to(WORKSPACE_ROOT))],
                },
            )

        meta_path = ACTIVE_INITIATIVES_DIR / project_id / "_meta.json"
        if meta_path.exists():
            meta = read_json(meta_path)
            for related in meta.get("related_initiatives", [])[:10]:
                if related == project_id:
                    continue
                add_node(
                    nodes,
                    {
                        "id": related,
                        "type": "project",
                        "label": related.replace("-", " ").title(),
                        "project_id": related,
                        "metadata": {},
                    },
                )
                append_edge(
                    edges,
                    {
                        "id": f"edge:{project_id}:related:{related}",
                        "source": project_id,
                        "target": related,
                        "type": "related_to",
                        "evidence_ids": [str(meta_path.relative_to(WORKSPACE_ROOT))],
                    },
                )

    for candidate in action_candidates.get("candidates", []):
        node_id = f"candidate:{candidate['candidate_id']}"
        project_id = candidate.get("project_id")
        add_node(
            nodes,
            {
                "id": node_id,
                "type": "action_candidate",
                "label": candidate.get("title"),
                "project_id": project_id,
                "metadata": {
                    "state": candidate.get("state"),
                    "priority": candidate.get("priority"),
                },
            },
        )
        if project_id:
            append_edge(
                edges,
                {
                    "id": f"edge:{project_id}:candidate:{candidate['candidate_id']}",
                    "source": project_id,
                    "target": node_id,
                    "type": "has_candidate",
                    "evidence_ids": candidate.get("evidence_refs", []),
                },
            )

    return {
        "$schema": "product-os-graph-projection-v1",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "nodes": sorted(nodes.values(), key=lambda node: node["id"]),
        "edges": edges,
        "summary": {
            "node_count": len(nodes),
            "edge_count": len(edges),
        },
    }


def main() -> int:
    if not REGISTRY_PATH.exists():
        raise SystemExit("project-registry.json not found")

    graph = build_graph()
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    STATUS_OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(graph, indent=2) + "\n")
    STATUS_OUT_PATH.write_text(json.dumps(graph, indent=2) + "\n")
    print(f"Wrote {OUT_PATH} and {STATUS_OUT_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
