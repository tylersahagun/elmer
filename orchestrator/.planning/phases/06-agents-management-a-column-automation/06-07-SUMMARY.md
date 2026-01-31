---
phase: 06-agents-management-a-column-automation
plan: 07
subsystem: automation
tags: [column-automation, loop-prevention, stage-transitions, after-hook]

dependency-graph:
  requires:
    - 06-01 # Agents page and list
    - 06-05 # Agent enabled/disabled state
  provides:
    - Column automation trigger service
    - Loop prevention for automation cycles
    - Stage transition job tracking
  affects:
    - 06-08 # Execution status in column header
    - 06-09 # Final verification

tech-stack:
  added: []
  patterns:
    - "next/server after() for non-blocking execution"
    - "Loop prevention via transition counting"
    - "Audit trail with automationJobIds tracking"

key-files:
  created:
    - src/lib/automation/column-automation.ts
    - drizzle/0015_automation_job_tracking.sql
  modified:
    - src/app/api/projects/[id]/route.ts
    - src/lib/db/schema.ts

decisions:
  - id: LOOP_PREVENTION_WINDOW
    choice: "1 minute window, max 3 transitions"
    reason: "Prevents infinite loops while allowing legitimate rapid changes"
  - id: AFTER_HOOK
    choice: "Use next/server after() for automation"
    reason: "Non-blocking execution - response returns immediately to user"
  - id: ACTOR_FORMAT
    choice: "user:{userId} or 'automation' string"
    reason: "Consistent with existing stageTransitionEvents actor pattern"

metrics:
  duration: 3m 4s
  completed: 2026-01-27
---

# Phase 06 Plan 07: Column Automation Trigger Summary

Backend automation trigger service that executes configured agents when projects move to columns with loop prevention.

## One-liner

Column automation service with loop prevention via 1-minute/3-transition window, wired into project stage changes via after().

## What Changed

### Created: Column Automation Service

**src/lib/automation/column-automation.ts**

New service that handles automation triggering on stage changes:

```typescript
export async function triggerColumnAutomation(
  workspaceId: string,
  projectId: string,
  toStage: ProjectStage,
  triggeredBy: string // "user:{id}" | "automation"
): Promise<AutomationTriggerResult>
```

Features:
- Fetches column config for target stage
- Sorts agent triggers by priority
- Skips disabled agents (agent.enabled === false)
- Creates jobs for each enabled trigger
- Records stage transition with automationJobIds

Loop prevention via `isAutomationLoop()`:
- 1-minute window
- Max 3 transitions to same stage
- Only applies when triggeredBy === "automation"

### Modified: Project Update Endpoint

**src/app/api/projects/[id]/route.ts**

Added automation trigger after stage change:

```typescript
import { after } from "next/server";
import { triggerColumnAutomation } from "@/lib/automation/column-automation";

// In PATCH handler after stage update:
after(async () => {
  try {
    const result = await triggerColumnAutomation(
      project.workspaceId,
      id,
      stage as ProjectStage,
      `user:${membership.userId}`
    );
    if (result.triggered) {
      console.log(`[ColumnAutomation] Triggered ${result.jobIds.length} jobs`);
    }
  } catch (error) {
    console.error("[ColumnAutomation] Error:", error);
  }
});
```

Key decision: Use `after()` for non-blocking execution so response returns immediately.

### Schema: Automation Job Tracking

**src/lib/db/schema.ts** - Added automationJobIds field:

```typescript
export const stageTransitionEvents = pgTable("stage_transition_events", {
  // ... existing fields
  automationJobIds: jsonb("automation_job_ids").$type<string[]>(),
});
```

**drizzle/0015_automation_job_tracking.sql** - Migration:

```sql
ALTER TABLE "stage_transition_events"
ADD COLUMN IF NOT EXISTS "automation_job_ids" jsonb;
```

## Decisions Made

1. **Loop Prevention Parameters**: 1-minute window with max 3 transitions strikes balance between preventing runaway automation and allowing legitimate batch operations.

2. **Non-blocking Execution**: Using `after()` ensures the PATCH response returns immediately. Automation failures don't break the drag-drop UX.

3. **Actor Format**: Consistent `user:{userId}` format for audit trail, falling back to "automation" for automated triggers.

4. **Job ID Tracking**: Recording automationJobIds in transition events enables future UI to show "3 automations triggered" with links to job logs.

## Verification Checklist

- [x] Module exports triggerColumnAutomation and isAutomationLoop
- [x] after() imported from next/server
- [x] Schema has automationJobIds field
- [x] Migration file created

## Integration Points

- **Upstream**: Uses getColumnConfigs for automation rules, createJob for execution
- **Downstream**: Jobs created go to job queue, picked up by execute_agent_definition handler
- **UI**: Stage transition events with automationJobIds for audit display

## Commits

| Hash | Message |
|------|---------|
| 08c852e | feat(06-07): add column automation trigger service |
| 4b63357 | feat(06-07): wire column automation into project update endpoint |
| d49da48 | feat(06-07): add automation job tracking to stage transition events |

## Next Phase Readiness

Ready for:
- 06-08 (Execution status in column header) - Can query automationJobIds
- 06-09 (Final verification) - All backend pieces in place

No blockers identified.
