# Product OS Memory MVP Validation Suite

**Generated:** 2026-03-01T08:06:11.050977+00:00
**Overall Status:** PASS

## Results

| Check | Status | Duration (ms) |
| --- | --- | ---: |
| Generate project registry | ✅ PASS | 29.6 |
| Validate registry + metrics contracts | ✅ PASS | 24.5 |
| Sync signals into evidence store | ✅ PASS | 26.2 |
| Sync status digests into evidence store | ✅ PASS | 27.7 |
| Generate action candidates | ✅ PASS | 31.2 |
| Auto-commit instrumentation candidates | ✅ PASS | 22.9 |
| Generate pilot dossier | ✅ PASS | 29.2 |
| Generate portfolio brief | ✅ PASS | 22.9 |
| Build graph projection | ✅ PASS | 27.1 |
| Validate graph projection | ✅ PASS | 25.9 |
| Run MCP smoke tests | ✅ PASS | 85.1 |
| Desktop shell lint | ✅ PASS | 132.3 |

## Generate project registry

**Command:** `python3 pm-workspace-docs/scripts/memory/generate_project_registry.py`
**Exit Code:** 0

### Stdout
```text
Wrote /workspace/pm-workspace-docs/company-context/project-registry.json with 16 projects
```

## Validate registry + metrics contracts

**Command:** `python3 pm-workspace-docs/scripts/memory/validate_memory_contracts.py`
**Exit Code:** 0

### Stdout
```text
Validation passed. See /workspace/pm-workspace-docs/maintenance/memory-contract-audit.md
```

## Sync signals into evidence store

**Command:** `python3 pm-workspace-docs/scripts/memory/sync_signals_to_memory.py`
**Exit Code:** 0

### Stdout
```text
Wrote /workspace/packages/product-os-memory/data/evidence-store.json (61 evidence items)
```

## Sync status digests into evidence store

**Command:** `python3 pm-workspace-docs/scripts/memory/sync_status_digests_to_memory.py`
**Exit Code:** 0

### Stdout
```text
Wrote /workspace/packages/product-os-memory/data/evidence-store.json (99 total evidence records)
Processed 12 status files and upserted 38 records
```

## Generate action candidates

**Command:** `python3 pm-workspace-docs/scripts/memory/generate_action_candidates.py`
**Exit Code:** 0

### Stdout
```text
Wrote /workspace/packages/product-os-memory/data/action-candidates.json (29 candidates)
```

## Auto-commit instrumentation candidates

**Command:** `python3 pm-workspace-docs/scripts/memory/auto_commit_instrumentation_candidates.py`
**Exit Code:** 0

### Stdout
```text
Committed 0 instrumentation candidates
Updated 0 metrics contracts
```

## Generate pilot dossier

**Command:** `python3 pm-workspace-docs/scripts/memory/generate_project_dossier.py chief-of-staff-experience --write`
**Exit Code:** 0

### Stdout
```text
Wrote /workspace/pm-workspace-docs/status/projects/chief-of-staff-experience/dossier-2026-03-01.md
```

## Generate portfolio brief

**Command:** `python3 pm-workspace-docs/scripts/memory/generate_portfolio_brief.py`
**Exit Code:** 0

### Stdout
```text
Wrote /workspace/pm-workspace-docs/status/portfolio/head-of-product-2026-03-01.md
```

## Build graph projection

**Command:** `python3 pm-workspace-docs/scripts/memory/build_graph_projection.py`
**Exit Code:** 0

### Stdout
```text
Wrote /workspace/packages/product-os-memory/data/graph-projection.json and /workspace/pm-workspace-docs/status/memory-graph/latest.json
```

## Validate graph projection

**Command:** `python3 pm-workspace-docs/scripts/memory/validate_graph_projection.py`
**Exit Code:** 0

### Stdout
```text
Wrote /workspace/pm-workspace-docs/status/memory-graph/audit-2026-03-01.json
Graph validation passed.
```

## Run MCP smoke tests

**Command:** `python3 pm-workspace-docs/scripts/memory/run_mcp_smoke_tests.py`
**Exit Code:** 0

### Stdout
```text
MCP smoke tests passed
```

## Desktop shell lint

**Command:** `npm run lint --prefix product-os-desktop`
**Exit Code:** 0

### Stdout
```text
> product-os-desktop@0.1.0 lint
> node --check main.js && node --check preload.js && node --check renderer/app.js
```
