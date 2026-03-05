# Cursor Workspace Optimization Plan v2

**Created:** 2026-01-23
**Goal:** Complete the remaining 32% of ChatGPT's recommendations

---

## Overview

This plan addresses all gaps identified in the ChatGPT Deep Research Audit:

| Category                            | Items       | Priority |
| ----------------------------------- | ----------- | -------- |
| Heavy commands → thin orchestrators | 14 commands | High     |
| Missing subagents                   | 4 subagents | Medium   |
| Missing skills                      | 3 skills    | Medium   |
| Legacy rule cleanup                 | 12 rules    | Low      |

**Estimated work:** 4 phases, ~60 tasks

---

## Phase 1: Create Missing Subagents & Skills

### 1.1 Create Missing Subagents

| Subagent                | Purpose                                  | Handles Commands               |
| ----------------------- | ---------------------------------------- | ------------------------------ |
| `signals-processor`     | Process and categorize incoming signals  | `/ingest`, `/synthesize`       |
| `figma-sync`            | Extract Figma designs to Storybook       | `/figma-sync`                  |
| `context-proto-builder` | Build prototypes with placement analysis | `/context-proto`, `/placement` |
| `docs-generator`        | Generate AGENTS.md and documentation     | `/agents`                      |
| `hypothesis-manager`    | Manage hypothesis lifecycle              | `/hypothesis`                  |
| `workspace-admin`       | Workspace maintenance and admin tasks    | `/maintain`, `/admin`          |

### 1.2 Create Missing Skills

| Skill                | Purpose                                  | Used By                 |
| -------------------- | ---------------------------------------- | ----------------------- |
| `placement-analysis` | Analyze codebase for component placement | `context-proto-builder` |
| `agents-generator`   | Generate AGENTS.md documentation         | `docs-generator`        |
| `signals-synthesis`  | Pattern recognition across signals       | `signals-processor`     |

---

## Phase 2: Update Heavy Commands to Thin Orchestrators

### 2.1 Signal Processing Commands

| Command       | Current State       | Target State                     |
| ------------- | ------------------- | -------------------------------- |
| `/ingest`     | 200+ lines embedded | Delegates to `signals-processor` |
| `/synthesize` | Full logic          | Delegates to `signals-processor` |

### 2.2 Hypothesis & Planning Commands

| Command             | Current State            | Target State                               |
| ------------------- | ------------------------ | ------------------------------------------ |
| `/hypothesis`       | 200+ lines state machine | Delegates to `hypothesis-manager` subagent |
| `/brainstorm-board` | Full logic               | Uses `brainstorm` skill                    |
| `/roadmap`          | Full logic               | Thin wrapper (simple enough)               |

### 2.3 Design & Figma Commands

| Command           | Current State | Target State                         |
| ----------------- | ------------- | ------------------------------------ |
| `/figma-sync`     | 400+ lines    | Delegates to `figma-sync` subagent   |
| `/context-proto`  | 400+ lines    | Delegates to `context-proto-builder` |
| `/placement`      | Full logic    | Delegates to `context-proto-builder` |
| `/design-handoff` | Full logic    | Uses `design-companion` skill        |
| `/design-system`  | Full logic    | Thin wrapper (read-only)             |

### 2.4 Git & Workspace Commands

| Command     | Current State          | Target State                   |
| ----------- | ---------------------- | ------------------------------ |
| `/share`    | Shell scripts embedded | Thin wrapper (git commands)    |
| `/maintain` | Full logic             | Delegates to `workspace-admin` |
| `/admin`    | Full logic             | Delegates to `workspace-admin` |
| `/agents`   | Full logic             | Delegates to `docs-generator`  |
| `/sync`     | Full logic             | Thin wrapper (simple)          |

### 2.5 Initiative Commands

| Command           | Current State | Target State                           |
| ----------------- | ------------- | -------------------------------------- |
| `/new-initiative` | Full logic    | Thin wrapper (file creation)           |
| `/lofi-proto`     | Full logic    | Delegates to `proto-builder` with flag |

---

## Phase 3: Legacy Rule Cleanup

### 3.1 Rules to Archive/Update

| Rule                        | Current State | Action                                 |
| --------------------------- | ------------- | -------------------------------------- |
| `agents-generator.mdc`      | Active        | Move to `docs-generator` skill         |
| `context-orchestrator.mdc`  | Active        | Archive (replaced by pm-foundation)    |
| `cursor-admin.mdc`          | Active, heavy | Slim down or move to `workspace-admin` |
| `growth-companion.mdc`      | Active        | Keep (Tyler-specific, low context)     |
| `interface-design.mdc`      | Active        | Move to `prototype-builder` skill      |
| `workspace-maintenance.mdc` | Active        | Move to `workspace-admin` subagent     |

### 3.2 Rules Already Archived (Verify)

| Rule                    | Status   | Verify               |
| ----------------------- | -------- | -------------------- |
| `pm-copilot.mdc`        | ARCHIVED | ✓ alwaysApply: false |
| `pm-workspace.mdc`      | ARCHIVED | ✓ alwaysApply: false |
| `command-router.mdc`    | ARCHIVED | ✓ alwaysApply: false |
| `prototype-builder.mdc` | LEGACY   | ✓ Points to skill    |
| `research-analyst.mdc`  | LEGACY   | ✓ Points to skill    |
| `prd-writer.mdc`        | LEGACY   | ✓ Points to skill    |
| `jury-system.mdc`       | LEGACY   | ✓ Points to skill    |
| `design-companion.mdc`  | LEGACY   | ✓ Points to skill    |

### 3.3 Rules to Keep

| Rule                     | Reason                                |
| ------------------------ | ------------------------------------- |
| `pm-foundation.mdc`      | Core always-apply (already optimized) |
| `component-patterns.mdc` | Agent-requested, globs-based          |
| `growth-companion.mdc`   | Tyler-specific, low overhead          |

---

## Phase 4: Verification & Testing

### 4.1 Test Each Command

For each updated command, verify:

- [ ] Command file is thin (<30 lines)
- [ ] Delegates to subagent or skill
- [ ] Subagent/skill has full logic
- [ ] End-to-end workflow works

### 4.2 Context Efficiency Check

Measure:

- [ ] Only 1 rule with alwaysApply: true
- [ ] All subagents have `model:` specified
- [ ] Skills are discovered when needed
- [ ] No duplicate logic between files

---

## Task Breakdown

### Phase 1 Tasks (Subagents & Skills)

1. [ ] Create `signals-processor` subagent
2. [ ] Create `figma-sync` subagent
3. [ ] Create `context-proto-builder` subagent
4. [ ] Create `docs-generator` subagent
5. [ ] Create `hypothesis-manager` subagent
6. [ ] Create `workspace-admin` subagent
7. [ ] Create `placement-analysis` skill
8. [ ] Create `agents-generator` skill
9. [ ] Create `signals-synthesis` skill

### Phase 2 Tasks (Commands)

10. [ ] Update `/ingest` → delegate to signals-processor
11. [ ] Update `/synthesize` → delegate to signals-processor
12. [ ] Update `/hypothesis` → delegate to hypothesis-manager
13. [ ] Update `/brainstorm-board` → thin wrapper
14. [ ] Update `/figma-sync` → delegate to figma-sync subagent
15. [ ] Update `/context-proto` → delegate to context-proto-builder
16. [ ] Update `/placement` → delegate to context-proto-builder
17. [ ] Update `/design-handoff` → use design-companion skill
18. [ ] Update `/design-system` → thin wrapper
19. [ ] Update `/share` → thin wrapper
20. [ ] Update `/maintain` → delegate to workspace-admin
21. [ ] Update `/admin` → delegate to workspace-admin
22. [ ] Update `/agents` → delegate to docs-generator
23. [ ] Update `/sync` → thin wrapper
24. [ ] Update `/new-initiative` → thin wrapper
25. [ ] Update `/lofi-proto` → delegate to proto-builder with flag

### Phase 3 Tasks (Rules)

26. [ ] Archive `context-orchestrator.mdc`
27. [ ] Slim down `cursor-admin.mdc`
28. [ ] Move `interface-design.mdc` content to skill
29. [ ] Move `workspace-maintenance.mdc` content to subagent
30. [ ] Move `agents-generator.mdc` content to skill
31. [ ] Verify all LEGACY rules point to correct locations

### Phase 4 Tasks (Verification)

32. [ ] Test `/ingest` workflow
33. [ ] Test `/hypothesis` workflow
34. [ ] Test `/figma-sync` workflow
35. [ ] Test `/context-proto` workflow
36. [ ] Test `/maintain` workflow
37. [ ] Verify only 1 alwaysApply rule
38. [ ] Document final architecture

---

## Success Criteria

| Metric                              | Before     | Target      |
| ----------------------------------- | ---------- | ----------- |
| Commands as thin orchestrators      | 8/30 (27%) | 25/30 (83%) |
| Subagents                           | 4          | 10          |
| Skills                              | 5          | 8           |
| alwaysApply rules                   | 1          | 1           |
| Active (non-archived) rules         | 8          | 4           |
| ChatGPT recommendations implemented | 68%        | 95%+        |

---

## Architecture After Completion

```
.cursor/
├── rules/
│   └── pm-foundation.mdc          # ONLY always-apply rule (~200 lines)
│   └── component-patterns.mdc     # Globs-based, agent-requested
│   └── growth-companion.mdc       # Tyler-specific, low overhead
│   └── [archived]/*               # Legacy rules, alwaysApply: false
│
├── agents/                         # 10 subagents
│   ├── proto-builder.md           # /proto
│   ├── research-analyzer.md       # /research
│   ├── validator.md               # /validate
│   ├── iterator.md                # /iterate
│   ├── signals-processor.md       # /ingest, /synthesize (NEW)
│   ├── figma-sync.md              # /figma-sync (NEW)
│   ├── context-proto-builder.md   # /context-proto, /placement (NEW)
│   ├── docs-generator.md          # /agents (NEW)
│   ├── hypothesis-manager.md      # /hypothesis (NEW)
│   └── workspace-admin.md         # /maintain, /admin (NEW)
│
├── skills/                         # 8 skills
│   ├── research-analyst/
│   ├── prd-writer/
│   ├── prototype-builder/
│   ├── jury-system/
│   ├── design-companion/
│   ├── placement-analysis/        # (NEW)
│   ├── agents-generator/          # (NEW)
│   └── signals-synthesis/         # (NEW)
│
└── commands/                       # 30 commands (all thin)
    └── [all commands delegate to subagents/skills]
```

---

## Execution Order

1. **Phase 1.1** - Create 6 new subagents (foundation for command updates)
2. **Phase 1.2** - Create 3 new skills (knowledge for subagents)
3. **Phase 2** - Update 16 commands to thin orchestrators
4. **Phase 3** - Clean up legacy rules
5. **Phase 4** - Test and verify

Start with Phase 1.1 as subagents are prerequisites for command updates.
