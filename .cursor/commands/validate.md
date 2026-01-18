# Initiative Validation

Run jury evaluation and check graduation criteria for an initiative.

## Usage

- `validate [initiative-name]` - Run full validation
- `validate [initiative-name] --phase [phase]` - Validate specific phase
- `validate [initiative-name] --criteria-only` - Check graduation criteria without jury

## Process

### 1. Load Initiative Context

Read from `elmer-docs/initiatives/[name]/`:
- `_meta.json` - Current phase, status, criteria
- `research.md` - Research findings
- `prd.md` - Requirements (if exists)
- `design-brief.md` - Design spec (if exists)
- `prototype-notes.md` - Prototype info (if exists)

### 2. Check Graduation Criteria

Based on current phase, check if ready to advance:

#### Discovery → Define
- [ ] `research.md` exists and is complete
- [ ] User problems documented with quotes
- [ ] Persona(s) identified
- [ ] 3+ evidence points

#### Define → Build
- [ ] `prd.md` exists and approved
- [ ] `design-brief.md` exists
- [ ] `measurement-plan.md` exists with event taxonomy
- [ ] Outcome chain defined
- [ ] Success metrics specified with formulas (not vague)

#### Build → Validate
- [ ] `prototype-notes.md` exists
- [ ] Prototype covers all required states
- [ ] Storybook stories complete
- [ ] Design review passed

#### Validate → Launch
- [ ] Jury evaluation pass rate ≥ 70%
- [ ] Stakeholder approval
- [ ] No P0 blockers
- [ ] GTM brief complete
- [ ] Instrumentation confirmed (events implemented in code)
- [ ] At least one dashboard created/verified in PostHog

### 3. Run Jury Evaluation (if applicable)

For `build` and `validate` phases, run synthetic user validation:

```bash
python elmer-docs/scripts/jury-system/simulate_jury.py \
  --initiative [name] \
  --phase [current-phase] \
  --jury-size 100
```

### 4. Generate Validation Report

Output format:

```markdown
# Validation Report: [Initiative Name]

**Date:** YYYY-MM-DD
**Current Phase:** [phase]
**Validation Type:** [criteria-check | jury-evaluation | both]

## Graduation Criteria

### [Current Phase] → [Next Phase]

| Criterion | Status | Notes |
|-----------|--------|-------|
| [criterion 1] | ✅ Met | [details] |
| [criterion 2] | ❌ Not Met | [what's missing] |
| [criterion 3] | ⚠️ Partial | [details] |

**Overall:** [Ready to advance | Not ready - X criteria missing]

## Jury Evaluation (if run)

| Metric | Value | Target |
|--------|-------|--------|
| Approval Rate | X% | ≥60% |
| Conditional Rate | X% | - |
| Rejection Rate | X% | <40% |
| Combined Pass | X% | ≥70% |

### By Persona
| Persona | Pass Rate |
|---------|-----------|
| Sales Rep | X% |
| RevOps | X% |

### Top Concerns
1. [Concern 1] - X mentions
2. [Concern 2] - X mentions

### Top Suggestions
1. [Suggestion 1] - X mentions
2. [Suggestion 2] - X mentions

## Recommendation

[One of:]
- ✅ **Ready to advance to [next phase]**
- ⚠️ **Iterate first** - Address: [list items]
- ❌ **Not ready** - Missing: [list items]

## Next Steps

1. [Specific action 1]
2. [Specific action 2]
3. [Specific action 3]
```

### 5. Update Initiative State

If validation passes and user confirms advancement:

1. Update `_meta.json`:
   - Change `phase` to next phase
   - Add entry to `phase_history`
   - Update `updated_at`
   - Clear `graduation_criteria` for old phase
   
2. Run `/roadmap refresh` to update roadmap

3. Suggest next command for new phase

## Phase-Specific Validation

### Research Phase (Discovery)
- Check research.md completeness
- Verify evidence quality
- Assess persona clarity

### PRD Phase (Define)
- Check PRD structure
- Verify outcome chain
- Assess requirements clarity

### Prototype Phase (Build)
- Check Storybook coverage
- Verify all states implemented
- Assess design compliance

### User Testing Phase (Validate)
- Run jury evaluation
- Check stakeholder feedback
- Assess launch readiness

## Integration with Jury System

The validate command integrates with the existing jury system:

- Uses personas from `elmer-docs/personas/`
- Runs simulation via `scripts/jury-system/simulate_jury.py`
- Saves results to `initiatives/[name]/jury-evaluations/`
- Generates reports in markdown format

## Quick Actions After Validation

Based on results, suggest:
- If passed: "Advance phase with `/status [name]` and update `_meta.json`"
- If failed: "Run `/iterate [name]` to address feedback"
- If jury needed: "Re-run with more personas for higher confidence"
