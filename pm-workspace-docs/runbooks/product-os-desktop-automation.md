# Runbook: Product OS Desktop Automation Flow

## Purpose

Define the fully automated flow between desktop actions, shared memory, and task creation.

## App Surface

`product-os-desktop/`

## Automated Flow (MVP)

1. User selects project in desktop app.
2. App loads:
   - registry entry (`project-registry.json`)
   - metrics contract (`metrics-contract.json`)
   - latest dossier snapshot (`status/projects/...`)
3. User asks project question.
4. Project agent returns:
   - answer,
   - as-of timestamp,
   - readiness state,
   - evidence refs.
5. User clicks "Generate Dossier Snapshot".
6. Local script regenerates dossier markdown.
7. Graph projection job refreshes knowledge graph (`build_graph_projection.py`).
8. (When memory backend is active) write derived dossier to `memory.write_derived`.
9. (When instrumentation gaps are high severity) auto-create Linear remediation tasks.

## Fully Automated Task Policy

- Instrumentation gap remediation is automatic in MVP.
- Use deterministic title hashing to avoid duplicate tickets.
- Attach evidence refs to every created task.

## Failure Behavior

If memory server is unavailable:

1. Continue with local artifact generation.
2. Mark response:
   - `memory_unavailable: true`
   - fallback used: `local-docs-only`
3. Keep dossier generation operational.

If desktop session key validation fails:

1. Keep app locked.
2. Reject project and graph queries until valid key is provided.

## Manual Recovery Steps

1. Restart stub memory server:
   - `python3 packages/product-os-memory/server.py`
2. Re-run project dossier generation:
   - `python3 pm-workspace-docs/scripts/memory/generate_project_dossier.py <initiative> --write`
3. Rebuild graph:
   - `python3 pm-workspace-docs/scripts/memory/build_graph_projection.py`
4. Re-run validation:
   - `python3 pm-workspace-docs/scripts/memory/validate_memory_contracts.py`
