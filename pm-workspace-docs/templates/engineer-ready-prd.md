# Engineer-Ready PRD Template (The Ivan Test)

**Purpose:** Ensure documentation is clear enough that a new engineer with minimal context can execute excellently without doing deep research.

---

## The Ivan Test

Before moving an issue to `workflow/ready-to-build`, the documentation must pass these criteria:

- [ ] No open questions in PRD/spec (all decisions logged)
- [ ] Acceptance criteria are testable (Given/When/Then format)
- [ ] Edge cases documented with expected behavior
- [ ] Build order and dependencies clear
- [ ] Autonomy boundaries defined (when to ask vs proceed)

If any checkbox is unchecked, apply `workflow/needs-decisions` label.

---

## Required Sections

### 1. TL;DR for Engineers

```markdown
## TL;DR for Engineers

- **What:** [One sentence describing the feature]
- **Why now:** [Business driver - not just "we decided to"]
- **Success looks like:** [Observable outcome when feature works]
- **Scope boundary:** [What's explicitly OUT of scope]
- **Ship date target:** [Date or "No hard deadline"]
```

**Example:**

```markdown
## TL;DR for Engineers

- **What:** Replace Pipedream integrations with Composio for Linear, Notion, and Google Drive
- **Why now:** Pipedream is deprecating their API and reliability has dropped to <95%
- **Success looks like:** Workflows execute without auth failures; users see "Connected" status for all migrated integrations
- **Scope boundary:** NOT building new integrations beyond current parity; NOT supporting Monday, Confluence, Sendoso (no Composio support)
- **Ship date target:** March 1, 2026 (before Pipedream EOL)
```

---

### 2. Decision Log (No Open Questions)

```markdown
## Decisions Made

| Decision   | Choice          | Alternatives Considered | Decided By | Date   |
| ---------- | --------------- | ----------------------- | ---------- | ------ |
| [Question] | [Answer chosen] | [Other options]         | [Person]   | [Date] |
```

**Rules:**

- Every open question in the original PRD must have a row here
- If a question is still open, the issue gets `workflow/needs-decisions` label
- Include WHO decided, not just what was decided

**Example:**

```markdown
## Decisions Made

| Decision                 | Choice                         | Alternatives Considered   | Decided By    | Date       |
| ------------------------ | ------------------------------ | ------------------------- | ------------- | ---------- |
| Auth scope for workflows | Workspace-level by default     | User-level, hybrid        | Tyler + Brian | 2026-01-30 |
| Missing integrations     | Deprecate without replacement  | Wait for Composio support | Tyler         | 2026-01-30 |
| Migration path           | Prompt user to reconnect       | Auto-migrate silently     | Tyler + Brian | 2026-01-30 |
| Data model               | Add to integration_connections | Keep session-only         | Brian         | 2026-01-30 |
```

---

### 3. Acceptance Criteria (Testable)

```markdown
## Acceptance Criteria

- [ ] Given [precondition], when [action], then [result]
```

**Rules:**

- Every criterion must be testable - someone can verify pass/fail
- Use Given/When/Then format for clarity
- Include both happy path and error cases

**Example:**

```markdown
## Acceptance Criteria

### Happy Path

- [ ] Given a user with Pipedream Linear connected, when they visit Integrations settings, then they see "Migration Available" prompt
- [ ] Given user clicks "Migrate to Composio", when OAuth completes, then connection shows "Connected via Composio" status
- [ ] Given a workflow with Linear action, when workflow runs, then action executes with workspace-level auth

### Error Cases

- [ ] Given OAuth times out, when user sees error, then "Try Again" button is visible
- [ ] Given Composio API is down, when workflow runs, then action fails gracefully with logged error (no silent failure)
- [ ] Given user has Monday integration (no Composio), when they view settings, then "Deprecated - no replacement" banner is shown
```

---

### 4. Edge Cases & Error Handling

```markdown
## Edge Cases

| Scenario               | Expected Behavior | Notes                |
| ---------------------- | ----------------- | -------------------- |
| [What happens when...] | [System does...]  | [Additional context] |
```

**Example:**

```markdown
## Edge Cases

| Scenario                                      | Expected Behavior                                       | Notes                  |
| --------------------------------------------- | ------------------------------------------------------- | ---------------------- |
| OAuth flow times out                          | Show retry button + "Connection timed out. Try again."  | Log to Sentry          |
| Composio API is down                          | Graceful failure; workflow logs error but doesn't crash | Alert ops-channel      |
| User has Pipedream but hasn't migrated        | Show migration prompt; don't auto-migrate               | Respect user agency    |
| Workspace has mixed (some migrated, some not) | Each integration shows its own status                   | No global state        |
| User revokes Composio OAuth after migration   | Show "Reconnect" button                                 | Same as new connection |
```

---

### 5. Dependencies & Sequencing

```markdown
## Build Order

1. [Layer] Task description (blocks: X, Y)
2. [Layer] Task description (needs: #1)
   ...
```

**Example:**

```markdown
## Build Order

1. [DB] Add Composio fields to integration_connections schema (blocks all else)
2. [API] Extend integration data source to query Composio status (needs #1)
3. [UI] Settings page: add migration prompt component (needs #2)
4. [Logic] Workflow scope validation for Composio tools (parallel with #3)
5. [UI] Connection state indicators (needs #2)
6. [Test] Integration tests for migration flow (needs #3, #4)
```

---

### 6. Autonomy Boundaries

```markdown
## Decision Rights

- **Engineer decides:** [List of things engineer can choose without asking]
- **Check with Tyler:** [List of things that need PM input]
- **Check with Brian:** [List of things that need tech lead input]
- **Check with Skylar:** [List of things that need design input]
```

**Example:**

```markdown
## Decision Rights

- **Engineer decides:**
  - Implementation details (data structures, helper functions)
  - Error message copy (within tone guidelines)
  - Logging approach and verbosity
  - Test coverage beyond minimum requirements

- **Check with Tyler:**
  - Any scope changes (even "small" ones)
  - New edge cases not documented here
  - Timeline risk (>1 day slip)
  - User-facing copy that differs from spec

- **Check with Brian:**
  - Architecture changes (new services, DB schema beyond spec)
  - Performance concerns (>100ms latency added)
  - Security implications
  - Third-party API usage changes

- **Check with Skylar:**
  - UI patterns not in design system
  - New components (even "simple" ones)
  - Animation/transition changes
  - Error state visual treatment
```

---

### 7. Definition of Done

```markdown
## Definition of Done

- [ ] All acceptance criteria pass
- [ ] Unit tests for new logic (>80% coverage on new code)
- [ ] Error states have user-facing messages
- [ ] Feature flag configured and tested
- [ ] Staging deployment verified
- [ ] Tyler has seen it working (live demo)
- [ ] No P0/P1 bugs in QA
```

---

## Usage

1. **When writing a PRD:** Include all 7 sections
2. **Before `ready-to-build`:** Review with this checklist
3. **If sections are incomplete:** Apply `workflow/needs-decisions` label
4. **When handing off to engineering:** Walk through the TL;DR and Autonomy Boundaries together

## Template Files

- PRD template: `pm-workspace-docs/initiatives/_template/prd.md`
- This guide: `pm-workspace-docs/templates/engineer-ready-prd.md`
