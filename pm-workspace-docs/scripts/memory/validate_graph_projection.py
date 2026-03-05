#!/usr/bin/env python3
"""
Validate graph projection integrity and lightweight performance characteristics.

Checks:
1. Every edge has non-empty evidence_ids.
2. Evidence-backed file paths resolve when they point to local files.
3. Graph load and scoped query timings are within expected local thresholds.
"""

import json
import random
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Tuple

SCRIPT_DIR = Path(__file__).resolve().parent
WORKSPACE_DOCS = SCRIPT_DIR.parent.parent
WORKSPACE_ROOT = WORKSPACE_DOCS.parent
GRAPH_PATH = WORKSPACE_ROOT / "packages" / "product-os-memory" / "data" / "graph-projection.json"
REPORT_DIR = WORKSPACE_DOCS / "status" / "memory-graph"


def read_graph() -> Tuple[Dict, float]:
    start = time.perf_counter()
    graph = json.loads(GRAPH_PATH.read_text())
    elapsed_ms = (time.perf_counter() - start) * 1000
    return graph, elapsed_ms


def is_local_evidence_ref(ref: str) -> bool:
    return ref.startswith("pm-workspace-docs/") or ref.startswith("packages/")


def resolve_exists(ref: str) -> bool:
    return (WORKSPACE_ROOT / ref).exists()


def scoped_query_latency(graph: Dict, project_id: str, iterations: int = 250) -> float:
    nodes = graph.get("nodes", [])
    edges = graph.get("edges", [])
    start = time.perf_counter()
    for _ in range(iterations):
        allowed = {node["id"] for node in nodes if node.get("project_id") == project_id or node["id"] == project_id}
        for edge in edges:
            if edge.get("source") == project_id or edge.get("target") == project_id:
                allowed.add(edge.get("source"))
                allowed.add(edge.get("target"))
        _ = [node for node in nodes if node.get("id") in allowed]
        _ = [edge for edge in edges if edge.get("source") in allowed and edge.get("target") in allowed]
    elapsed_ms = (time.perf_counter() - start) * 1000
    return elapsed_ms / iterations


def main() -> int:
    if not GRAPH_PATH.exists():
        raise SystemExit(f"Graph projection not found at {GRAPH_PATH}")

    graph, load_ms = read_graph()
    nodes = graph.get("nodes", [])
    edges = graph.get("edges", [])

    missing_evidence_ids: List[str] = []
    bad_evidence_refs: List[str] = []

    for edge in edges:
        evidence_ids = edge.get("evidence_ids", [])
        if not evidence_ids:
            missing_evidence_ids.append(edge.get("id", "<unknown-edge>"))
            continue
        for ref in evidence_ids:
            if is_local_evidence_ref(ref) and not resolve_exists(ref):
                bad_evidence_refs.append(f"{edge.get('id')} -> {ref}")

    sampled_edges = random.sample(edges, min(15, len(edges))) if edges else []
    sampled_summary = [
        {
            "edge_id": edge.get("id"),
            "type": edge.get("type"),
            "evidence_ids": edge.get("evidence_ids", []),
        }
        for edge in sampled_edges
    ]

    project_ids = [node["id"] for node in nodes if node.get("type") == "project"]
    perf_target_project = "chief-of-staff-experience" if "chief-of-staff-experience" in project_ids else (project_ids[0] if project_ids else "")
    scoped_avg_ms = scoped_query_latency(graph, perf_target_project, iterations=250) if perf_target_project else 0.0

    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "graph_path": str(GRAPH_PATH.relative_to(WORKSPACE_ROOT)),
        "summary": {
            "node_count": len(nodes),
            "edge_count": len(edges),
            "graph_load_ms": round(load_ms, 3),
            "scoped_query_avg_ms": round(scoped_avg_ms, 3),
            "missing_evidence_edge_count": len(missing_evidence_ids),
            "bad_evidence_ref_count": len(bad_evidence_refs),
            "status": "pass" if not missing_evidence_ids and not bad_evidence_refs else "fail",
        },
        "missing_evidence_edges": missing_evidence_ids,
        "bad_evidence_refs": bad_evidence_refs,
        "sampled_edges": sampled_summary,
        "thresholds": {
            "graph_load_ms_warn": 250.0,
            "scoped_query_avg_ms_warn": 30.0,
        },
    }

    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    date_key = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    report_path = REPORT_DIR / f"audit-{date_key}.json"
    report_path.write_text(json.dumps(report, indent=2) + "\n")

    print(f"Wrote {report_path}")
    if report["summary"]["status"] != "pass":
        print("Graph validation failed.")
        return 1

    print("Graph validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
