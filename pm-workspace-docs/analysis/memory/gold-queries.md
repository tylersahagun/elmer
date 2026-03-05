# Product OS Memory Gold Queries (Regression Set)

Use these queries to verify memory + dossier + readiness behavior after any workflow or schema changes.

## Query Set

1. **Measurement readiness by initiative**
   - "What is measurement readiness for `chief-of-staff-experience`?"

2. **Missing instrumentation detail**
   - "Which PostHog events or properties are missing for `chief-of-staff-experience` north star?"

3. **Portfolio readiness coverage**
   - "How many active initiatives are `instrumented` vs `partial` vs `missing`?"

4. **Exec sponsor open loops**
   - "What open loops involve Woody for `chief-of-staff-experience`?"

5. **Recent decisions with provenance**
   - "List decisions made in the last 14 days for `chief-of-staff-experience` with evidence links."

6. **Action candidate lifecycle**
   - "Show all `action_item_candidate` records in state `extracted` older than 7 days."

7. **Dossier freshness**
   - "When was the last dossier generated for `chief-of-staff-experience` and what was readiness at that time?"

8. **Registry integrity**
   - "Which active initiatives are missing from `project-registry.json`?"

9. **Metrics contract completeness**
   - "Which active initiatives are missing `metrics-contract.json`?"

10. **Evidence-backed edge check**
    - "For project `chief-of-staff-experience`, return decision-to-evidence edges without evidence IDs."

11. **Stakeholder dossier**
    - "What is the communication state with `sam-ho` across Slack/Linear/meetings for this week?"

12. **Automated instrumentation tickets**
    - "Which initiatives have high-severity measurement gaps but no linked Linear issue IDs?"

## Pass Criteria

For each query, expected output must include:

- explicit `as_of` timestamp,
- deterministic project or person scope,
- evidence references (or explicit evidence gap),
- readiness state where relevant.

## Manual Validation Procedure

1. Run `python3 pm-workspace-docs/scripts/memory/generate_project_registry.py`
2. Run `python3 pm-workspace-docs/scripts/memory/validate_memory_contracts.py`
3. Run `python3 pm-workspace-docs/scripts/memory/generate_project_dossier.py chief-of-staff-experience --write`
4. Verify that:
   - registry has 0 missing initiatives,
   - metrics contract coverage is complete,
   - chief-of-staff dossier includes readiness + evidence references.
