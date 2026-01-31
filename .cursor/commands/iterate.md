# Prototype Iteration

**Delegates to:** `iterator` subagent (see `.cursor/agents/iterator.md`)

Iterate on an existing prototype using new feedback (transcripts, notes, or conversations).

## Auto-Context Loading

When iterating on a prototype, automatically load context per `context-orchestrator.mdc`:

1. Load foundation: `@elmer-docs/company-context/product-vision.md`, `strategic-guardrails.md`
2. Load initiative metadata: `@elmer-docs/initiatives/[name]/_meta.json`
3. Load PRD: `@elmer-docs/initiatives/[name]/prd.md`
4. Load Design Brief: `@elmer-docs/initiatives/[name]/design-brief.md`
5. Load Prototype Notes: `@elmer-docs/initiatives/[name]/prototype-notes.md`
6. Load latest jury evaluations (if any): `@elmer-docs/initiatives/[name]/jury-evaluations/`

## Inputs (user may provide any subset)

- Transcript text or file paths
- Updated goals or constraints
- Which prototype version to refine (v1/v2/v3 or specific stories)
- Jury evaluation results

## Workflow

1. Locate initiative docs:
   - elmer-docs/initiatives/[project]/prd.md
   - elmer-docs/initiatives/[project]/design-brief.md
   - elmer-docs/initiatives/[project]/prototype-notes.md
   - elmer-docs/initiatives/[project]/\_meta.json

2. **Detect prototype type** from `_meta.json`:

   | `prototype_type` | What to iterate         | File structure                    |
   | ---------------- | ----------------------- | --------------------------------- |
   | `"standalone"`   | Isolated component      | `[ProjectName]/v2/*.tsx`          |
   | `"context"`      | Context-aware component | `[ProjectName]/contexts/v2/*.tsx` |
   | `"both"`         | Both versions           | Update both locations             |
   | `undefined`      | Infer from files        | Check for `contexts/` folder      |

   **Inference fallback** (if `prototype_type` not set):
   - If `contexts/` folder exists → treat as context prototype
   - If `placement-research.md` exists → treat as context prototype
   - Otherwise → treat as standalone prototype

3. Parse the new feedback:
   - Summarize decisions, action items, and key pain points
   - Pull direct quotes when helpful
   - Identify deltas vs existing PRD/design assumptions

4. Update docs:
   - PRD: adjust problem framing, scope, success metrics, open questions
   - Design brief: update flows, states, edge cases, accessibility
   - Prototype notes: add a dated "Iteration" section with rationale

5. Create a new full prototype version **based on prototype type**:

   **For `standalone` prototypes:**
   - Create new version folder: `[ProjectName]/v2/`, `v3/`, etc.
   - Rebuild all component variants and states
   - Story naming: `V2_OptionA`, `V2_Loading`, etc.

   **For `context` prototypes:**
   - Create new version folder: `[ProjectName]/contexts/v2/`, `v3/`, etc.
   - Rebuild context wrappers (InPage, InPanel, Navigation)
   - Story naming: `InContext_V2_AsFullPage`, etc.
   - Update `placement-research.md` if integration approach changed

   **For `both` prototypes:**
   - Iterate on BOTH standalone and context versions
   - Keep them in sync (same functionality, different contexts)
   - Ask user which to prioritize if feedback is ambiguous

   **General rules:**
   - Always create a new version folder with a complete rebuild
   - Do NOT create an "iterations" story/section or partial delta-only story
   - Replicate all relevant states in the new version (not just a single view)
   - Preserve prior versions for comparison
   - Keep Storybook stories grouped under the version and cover all required states

6. Publish Storybook to Chromatic (automatic on new versions):
   - Ensure Chromatic is installed: `npm install --save-dev chromatic`
   - Run from the prototype package root with the project token set as env:
     - `CHROMATIC_PROJECT_TOKEN="chpt_46b823319a0135f" npm run chromatic`
   - If the repo has multiple packages, run it where `storybook` is configured

7. **Update `_meta.json`**:

   ```json
   {
     "updated_at": "[current timestamp]",
     "prototype_type": "[preserve existing or set if newly detected]",
     "metrics": {
       "total_iterations": [increment by 1]
     },
     "iteration_history": [
       // append new entry
       {
         "version": "v[N]",
         "date": "[timestamp]",
         "prototype_type": "[standalone|context|both]",
         "focus": "[what changed]",
         "feedback_source": "[where feedback came from]"
       }
     ]
   }
   ```

8. Summarize outcomes:
   - What changed and why
   - Open questions
   - Recommended next feedback session

## Output Expectations

- Updated docs in elmer-docs/initiatives/[project]/
- Updated prototype components/stories
- Updated `_meta.json` with incremented iteration count
- Short recap with next steps

## After Iteration

1. **Check if ready for validation**:
   - If all states implemented and ready for jury, suggest: "Run `/validate [name]`"
2. **Update roadmap if significant**:
   - Run `/roadmap refresh` if status or progress changed

3. **Suggest next steps**:
   - "Ready for jury? Run `/validate [name]`"
   - "More feedback needed? Schedule stakeholder review"
   - "Check status: Run `/status [name]`"
