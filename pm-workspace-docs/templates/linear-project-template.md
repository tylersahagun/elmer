# Linear Project Template — Product Work

Use this as the **project description** in Linear, and create the **standard issues** below.

---

## Project Description (paste into Linear Project)

```markdown
# [Project Name]

**Outcome:** [What user outcome do we want?]
**Why now:** [Business driver, not just “because we want to”]
**Success metrics:** [1–2 observable metrics + baseline if known]
**In scope:** [What is included]
**Out of scope:** [What is explicitly not included]
**Target date:** [Date or “TBD”]

## Ownership

- **PM:** [Name]
- **Eng Lead:** [Name]
- **Design:** [Name]
- **GTM:** [Name, optional]

## Required Artifacts

- PRD: [link]
- Design Brief: [link]
- Eng Spec: [link]
- Prototype: [link]
- Release Criteria: [link]
- Metrics/Instrumentation: [link]

## Status

- **Phase:** discovery | define | build | validate | launch
- **Current blocker:** [If any]
- **Next milestone:** [What happens next]
```

---

## Standard Issues to Create

1. **[Release Criteria] {Project Name}** (use template)
2. **PRD — {Project Name}**
3. **Design Brief — {Project Name}**
4. **Engineering Spec — {Project Name}**
5. **Prototype — {Project Name}**
6. **Instrumentation/Analytics — {Project Name}**
7. **QA/Launch Checklist — {Project Name}** (optional)

---

## Workflow Labels (apply as needed)

- `workflow/needs-prd`
- `workflow/needs-design`
- `workflow/needs-eng-spec`
- `workflow/needs-decisions`
- `workflow/ready-to-build`
- `workflow/in-review`
- `workflow/blocked`

---

## Suggested Issue Description (PRD / Eng Spec)

```markdown
## TL;DR for Engineers

- **What:** [...]
- **Why now:** [...]
- **Success looks like:** [...]
- **Scope boundary:** [...]
- **Ship date target:** [...]

## Decisions Made

| Decision | Choice | Alternatives Considered | Decided By | Date |
| -------- | ------ | ----------------------- | ---------- | ---- |

## Acceptance Criteria

### Happy Path

- [ ] Given [...], when [...], then [...]

### Error Cases

- [ ] Given [...], when [...], then [...]

## Edge Cases

| Scenario | Expected Behavior | Notes |
| -------- | ----------------- | ----- |

## Build Order / Dependencies

1. [...]

## Decision Rights

- **Engineer decides:** [...]
- **Check with Tyler:** [...]
- **Check with Brian:** [...]
- **Check with Skylar:** [...]

## Definition of Done

- [ ] All acceptance criteria pass
- [ ] Feature flag configured and tested
- [ ] Staging verified
- [ ] Tyler has seen it working
```
