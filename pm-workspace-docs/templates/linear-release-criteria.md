# Linear Release Criteria Template

This template defines the standard release criteria checklist for Linear projects. Copy this when creating a new "Release Criteria" issue in Linear.

---

## Issue Title Format

```
[Release Criteria] {Initiative Name}
```

## Issue Description Template

```markdown
# Release Criteria: {Initiative Name}

**Priority:** {P0/P1/P2/P3}
**Target:** {Date or "TBD"}
**Owner:** {Name}

## Pre-Build

- [ ] PRD approved by stakeholders (@Tyler)
- [ ] Design review complete (@Skylar sign-off)
- [ ] Engineering spec reviewed (@Brian)
- [ ] All open questions resolved (no `workflow/needs-decisions` label)
- [ ] Passes Ivan Test (documentation quality)

## Build

- [ ] Core functionality implemented
- [ ] Error states have user-facing messages
- [ ] Unit tests for new logic
- [ ] Edge cases documented and handled

## Pre-Launch

- [ ] Feature flag configured
- [ ] Staging deployment verified
- [ ] QA pass complete
- [ ] Tyler has seen it working

## Launch Readiness

- [ ] GTM brief shared with marketing (if customer-facing)
- [ ] Stakeholder demo complete
- [ ] Documentation updated
- [ ] Support team briefed (if applicable)

## Links

- PRD: [link]
- Design: [Figma link]
- Eng Spec: [link]
- Prototype: [Chromatic link]
```

---

## Usage Instructions

1. **When to create:** As soon as a Linear project is created for an initiative
2. **Who creates:** PM (Tyler) or whoever creates the project
3. **How to update:** Team members check off items as they complete
4. **Visibility:** Pin this issue to the project for easy access

## Workflow Labels

Apply these labels to the Release Criteria issue as status changes:

| Stage              | Label                      |
| ------------------ | -------------------------- |
| Needs PRD          | `workflow/needs-prd`       |
| Needs Design       | `workflow/needs-design`    |
| Needs Eng Spec     | `workflow/needs-eng-spec`  |
| Has Open Questions | `workflow/needs-decisions` |
| Ready to Build     | `workflow/ready-to-build`  |
| In Review          | `workflow/in-review`       |
| Blocked            | `workflow/blocked`         |

## Graduation Criteria

Issue can be closed when:

- All checkboxes are checked
- Feature is live in production
- No critical bugs reported in first 48 hours

---

## Example: Flagship Meeting Recap

```markdown
# Release Criteria: Flagship Meeting Recap

**Priority:** P1
**Target:** TBD
**Owner:** Tyler

## Pre-Build

- [x] PRD approved by stakeholders (@Tyler)
- [ ] Design review complete (@Skylar sign-off)
- [x] Engineering spec reviewed (@Brian)
- [ ] All open questions resolved - BLOCKED: Privacy gating rules
- [ ] Passes Ivan Test (documentation quality)

## Build

- [ ] Core functionality implemented
- [ ] Error states have user-facing messages
- [ ] Unit tests for new logic
- [ ] Edge cases documented and handled

...
```
