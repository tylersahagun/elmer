#!/usr/bin/env python3
"""
Run MCP JSON-RPC smoke tests against product-os-memory server.
"""

from __future__ import annotations

import json
import os
import subprocess
from pathlib import Path
from typing import Dict, List

SCRIPT_DIR = Path(__file__).resolve().parent
WORKSPACE_DOCS = SCRIPT_DIR.parent.parent
WORKSPACE_ROOT = WORKSPACE_DOCS.parent
SERVER_PATH = WORKSPACE_ROOT / "packages" / "product-os-memory" / "server.py"


def run_requests(requests: List[Dict], env: Dict[str, str] | None = None) -> List[Dict]:
    payload = "\n".join(json.dumps(item) for item in requests) + "\n"
    merged_env = dict(os.environ)
    if env:
        merged_env.update(env)
    completed = subprocess.run(
        ["python3", str(SERVER_PATH)],
        cwd=WORKSPACE_ROOT,
        text=True,
        input=payload,
        capture_output=True,
        env=merged_env,
        check=False,
        timeout=30,
    )
    if completed.returncode != 0:
        raise RuntimeError(f"Server failed: {completed.stderr.strip()}")
    outputs = []
    for line in completed.stdout.strip().splitlines():
        line = line.strip()
        if not line:
            continue
        outputs.append(json.loads(line))
    return outputs


def assert_ok(result: Dict, message: str) -> None:
    if not result.get("ok"):
        raise AssertionError(f"{message}: {result}")


def main() -> int:
    requests = [
        {"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {}},
        {"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}},
        {
            "jsonrpc": "2.0",
            "id": 3,
            "method": "tools/call",
            "params": {
                "name": "memory.get_measurement_readiness",
                "arguments": {"project_id": "chief-of-staff-experience", "scope": "team"},
            },
        },
        {
            "jsonrpc": "2.0",
            "id": 4,
            "method": "tools/call",
            "params": {
                "name": "memory.search",
                "arguments": {
                    "query": "chief of staff missing dashboard",
                    "project_id": "chief-of-staff-experience",
                    "k": 3,
                    "scope": "team",
                },
            },
        },
        {
            "jsonrpc": "2.0",
            "id": 5,
            "method": "tools/call",
            "params": {
                "name": "memory.get_graph_view",
                "arguments": {"project_id": "chief-of-staff-experience", "scope": "team"},
            },
        },
    ]
    outputs = run_requests(requests)
    if len(outputs) < 5:
        raise AssertionError(f"Expected 5 responses, got {len(outputs)}")

    tools_result = outputs[1]["result"]
    tools = tools_result.get("tools", [])
    tool_names = {tool.get("name") for tool in tools}
    required = {
        "memory.upsert_evidence",
        "memory.write_derived",
        "memory.search",
        "memory.get_project_dossier",
        "memory.get_person_dossier",
        "memory.get_measurement_readiness",
        "memory.commit_candidate_to_linear",
        "memory.get_graph_view",
    }
    missing = sorted(required - tool_names)
    if missing:
        raise AssertionError(f"Missing required tools: {missing}")

    readiness_result = outputs[2]["result"]
    assert_ok(readiness_result, "Readiness query failed")
    if readiness_result.get("project_id") != "chief-of-staff-experience":
        raise AssertionError("Readiness project mismatch")

    search_result = outputs[3]["result"]
    assert_ok(search_result, "Search query failed")
    if not isinstance(search_result.get("results"), list):
        raise AssertionError("Search results shape invalid")

    graph_result = outputs[4]["result"]
    assert_ok(graph_result, "Graph query failed")
    if "nodes" not in graph_result or "edges" not in graph_result:
        raise AssertionError("Graph result missing nodes/edges")

    # Scope denial check
    denied_outputs = run_requests(
        [
            {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "tools/call",
                "params": {
                    "name": "memory.upsert_evidence",
                    "arguments": {
                        "evidence_id": "evi_scope_test_smoke",
                        "source_type": "doc_fragment",
                        "source_system": "local-docs",
                        "external_id": "scope-test-smoke",
                        "source_url": "file:///tmp/scope-test",
                        "project_id": "chief-of-staff-experience",
                        "actor_person_ids": [],
                        "occurred_at": "2026-03-01T00:00:00Z",
                        "summary_snippet": "scope denial smoke",
                        "scope": "private",
                    },
                },
            }
        ],
        env={
            "PRODUCT_OS_MEMORY_ALLOWED_SCOPES": "team",
        },
    )
    denied = denied_outputs[0]["result"]
    if denied.get("error", {}).get("code") != "scope_denied":
        raise AssertionError(f"Expected scope_denied, got {denied}")

    print("MCP smoke tests passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
