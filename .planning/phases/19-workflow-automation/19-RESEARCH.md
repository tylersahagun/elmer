# Phase 19: Workflow Automation - Research

**Researched:** 2026-01-23
**Domain:** Event-driven automation, threshold-based triggers, configurable notification systems
**Confidence:** HIGH

## Summary

Phase 19 implements automatic workflow triggers based on signal patterns and configurable thresholds. The codebase already has:

1. **Signal clustering via `/synthesize`** - Discovers semantically similar unlinked signals with themes and suggested actions (Phase 16)
2. **Create project from cluster** - `POST /api/projects/from-cluster` creates projects and bulk-links signals (Phase 18)
3. **Workspace settings infrastructure** - `WorkspaceSettings` interface in schema.ts with UI in WorkspaceSettingsModal.tsx
4. **Notification system** - `notifications` table with types, priorities, and configurable browser notification preferences
5. **Stage automation system** - `stageRecipes` with automation levels (fully_auto, auto_notify, human_approval, manual)
6. **Background worker** - Run manager and execution worker for processing jobs asynchronously

The main work is:
1. **Automation depth per stage** - Extend existing `stageRecipes.automationLevel` concept to signal processing
2. **Auto-PRD trigger** - Watch for cluster threshold (N+ signals) and auto-create project/trigger PRD generation
3. **Notification thresholds** - Only fire notifications when configurable criteria are met
4. **Auto-initiative creation** - Automatically create initiatives from signal clusters above threshold

**Primary recommendation:** Use event-driven architecture with the existing `after()` pattern for async processing. Extend `WorkspaceSettings` with signal automation configuration. Leverage existing notification infrastructure with threshold-aware filtering.

## Standard Stack

### Core (Already Available)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| drizzle-orm | ^0.45.1 | ORM with relations | Already installed |
| @tanstack/react-query | ^5.90.18 | Data fetching/caching | Already installed |
| @anthropic-ai/sdk | ^0.71.2 | LLM for theme generation | Already installed |
| next | 16.x | Framework with after() API | Already installed |

### Supporting (Already Available)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| nanoid | ^5.x | ID generation | Already installed |
| zod | ^3.x | Schema validation | Already installed |

**No new packages required.** All functionality extends existing infrastructure.

## Architecture Patterns

### Recommended Project Structure
```
orchestrator/src/
├── lib/
│   ├── automation/
│   │   ├── signal-automation.ts    # NEW: Signal automation orchestration
│   │   ├── threshold-checker.ts    # NEW: Threshold evaluation logic
│   │   └── auto-actions.ts         # NEW: Auto-trigger actions (PRD, initiative)
│   ├── notifications/
│   │   └── threshold-filter.ts     # NEW: Notification threshold filtering
│   └── db/
│       └── schema.ts               # ENHANCE: Add automation settings
├── app/api/
│   ├── automation/
│   │   ├── config/
│   │   │   └── route.ts            # NEW: Get/update automation config
│   │   └── check-thresholds/
│   │       └── route.ts            # NEW: Manual threshold check trigger
│   └── cron/
│       └── signal-automation/
│           └── route.ts            # NEW: Cron endpoint for automation checks
└── components/
    └── settings/
        └── SignalAutomationSettings.tsx  # NEW: Automation config UI
```

### Pattern 1: Automation Depth Configuration
**What:** Per-workspace settings for signal automation behavior
**When to use:** Controlling how aggressively the system auto-acts on signals
**Example:**
```typescript
// Extend WorkspaceSettings in schema.ts
export interface WorkspaceSettings {
  // ... existing settings ...

  // Signal Automation Settings (Phase 19)
  signalAutomation?: SignalAutomationSettings;
}

export interface SignalAutomationSettings {
  // Automation depth: how much the system does automatically
  automationDepth: "manual" | "suggest" | "auto_create" | "full_auto";

  // Threshold for auto-PRD trigger (number of signals in cluster)
  autoPrdThreshold: number;  // Default: 5

  // Threshold for auto-initiative creation (cluster size)
  autoInitiativeThreshold: number;  // Default: 3

  // Minimum cluster confidence for automation (0-1)
  minClusterConfidence: number;  // Default: 0.7

  // Severity filter: only auto-act on signals at or above this severity
  minSeverityForAuto: SignalSeverity | null;  // Default: null (any)

  // Notification thresholds
  notifyOnClusterSize: number | null;  // Only notify when cluster >= N signals
  notifyOnSeverity: SignalSeverity | null;  // Only notify when severity >= X
  suppressDuplicateNotifications: boolean;  // Don't notify for same cluster twice

  // Rate limiting
  maxAutoActionsPerDay: number;  // Default: 10
  cooldownMinutes: number;  // Minutes between auto-actions on same cluster
}

// Default configuration
export const DEFAULT_SIGNAL_AUTOMATION: SignalAutomationSettings = {
  automationDepth: "suggest",
  autoPrdThreshold: 5,
  autoInitiativeThreshold: 3,
  minClusterConfidence: 0.7,
  minSeverityForAuto: null,
  notifyOnClusterSize: 3,
  notifyOnSeverity: null,
  suppressDuplicateNotifications: true,
  maxAutoActionsPerDay: 10,
  cooldownMinutes: 60,
};
```

### Pattern 2: Threshold-Based Auto-Trigger
**What:** Automatically trigger PRD generation when cluster threshold is met
**When to use:** AUTO-02 requirement - Auto-PRD trigger when N+ signals cluster
**Example:**
```typescript
// lib/automation/signal-automation.ts
import { findSignalClusters } from "@/lib/classification";
import { createProjectFromCluster, triggerPrdGeneration } from "@/lib/automation/auto-actions";
import { getWorkspaceAutomationSettings } from "@/lib/db/queries";
import { recordAutomationAction, canPerformAutoAction } from "@/lib/automation/rate-limiter";

export interface AutomationCheckResult {
  clustersChecked: number;
  actionsTriggered: AutoActionRecord[];
  skipped: SkippedCluster[];
}

export interface AutoActionRecord {
  clusterId: string;
  action: "initiative_created" | "prd_triggered" | "notification_sent";
  projectId?: string;
  timestamp: string;
}

export interface SkippedCluster {
  clusterId: string;
  reason: "below_threshold" | "low_confidence" | "rate_limited" | "cooldown" | "already_actioned";
}

/**
 * Check signal clusters and trigger automation based on workspace settings.
 * Called from cron job or after signal ingestion.
 */
export async function checkSignalAutomation(
  workspaceId: string
): Promise<AutomationCheckResult> {
  const settings = await getWorkspaceAutomationSettings(workspaceId);
  const actionsTriggered: AutoActionRecord[] = [];
  const skipped: SkippedCluster[] = [];

  // Exit early if automation is manual
  if (settings.automationDepth === "manual") {
    return { clustersChecked: 0, actionsTriggered, skipped };
  }

  // Find current clusters
  const clusters = await findSignalClusters(workspaceId, 2);

  for (const cluster of clusters) {
    // Check rate limiting
    if (!await canPerformAutoAction(workspaceId, cluster.id, settings)) {
      skipped.push({ clusterId: cluster.id, reason: "rate_limited" });
      continue;
    }

    // Check confidence threshold
    if (cluster.confidence < settings.minClusterConfidence) {
      skipped.push({ clusterId: cluster.id, reason: "low_confidence" });
      continue;
    }

    // Check severity filter
    if (settings.minSeverityForAuto &&
        !meetsServerityThreshold(cluster.severity, settings.minSeverityForAuto)) {
      skipped.push({ clusterId: cluster.id, reason: "below_threshold" });
      continue;
    }

    const now = new Date().toISOString();

    // AUTO-04: Auto-create initiative from cluster above threshold
    if (settings.automationDepth === "auto_create" || settings.automationDepth === "full_auto") {
      if (cluster.signalCount >= settings.autoInitiativeThreshold) {
        const projectId = await createProjectFromCluster(workspaceId, cluster, "automation");
        actionsTriggered.push({
          clusterId: cluster.id,
          action: "initiative_created",
          projectId,
          timestamp: now,
        });

        // AUTO-02: Auto-trigger PRD if threshold met
        if (settings.automationDepth === "full_auto" &&
            cluster.signalCount >= settings.autoPrdThreshold) {
          await triggerPrdGeneration(projectId, workspaceId);
          actionsTriggered.push({
            clusterId: cluster.id,
            action: "prd_triggered",
            projectId,
            timestamp: now,
          });
        }

        await recordAutomationAction(workspaceId, cluster.id, "initiative_created");
      }
    }
  }

  return {
    clustersChecked: clusters.length,
    actionsTriggered,
    skipped,
  };
}

function meetsServerityThreshold(
  clusterSeverity: SignalSeverity,
  minSeverity: SignalSeverity
): boolean {
  const severityOrder: SignalSeverity[] = ["critical", "high", "medium", "low"];
  const clusterIdx = severityOrder.indexOf(clusterSeverity);
  const minIdx = severityOrder.indexOf(minSeverity);
  return clusterIdx <= minIdx; // Lower index = higher severity
}
```

### Pattern 3: Notification Threshold Filtering
**What:** Only fire notifications when configurable criteria are met
**When to use:** AUTO-03 requirement - notification thresholds
**Example:**
```typescript
// lib/notifications/threshold-filter.ts
import { db } from "@/lib/db";
import { notifications, type NotificationType } from "@/lib/db/schema";
import { nanoid } from "nanoid";
import { getWorkspaceAutomationSettings } from "@/lib/db/queries";

export interface NotificationContext {
  workspaceId: string;
  type: NotificationType;
  // Cluster-specific context
  clusterId?: string;
  clusterSize?: number;
  clusterSeverity?: SignalSeverity;
  // General context
  projectId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Check if a notification should be sent based on workspace thresholds.
 */
export async function shouldSendNotification(
  context: NotificationContext
): Promise<{ send: boolean; reason?: string }> {
  const settings = await getWorkspaceAutomationSettings(context.workspaceId);

  // Check cluster size threshold
  if (context.clusterSize !== undefined && settings.notifyOnClusterSize !== null) {
    if (context.clusterSize < settings.notifyOnClusterSize) {
      return {
        send: false,
        reason: `Cluster size ${context.clusterSize} below threshold ${settings.notifyOnClusterSize}`
      };
    }
  }

  // Check severity threshold
  if (context.clusterSeverity && settings.notifyOnSeverity) {
    if (!meetsServerityThreshold(context.clusterSeverity, settings.notifyOnSeverity)) {
      return {
        send: false,
        reason: `Severity ${context.clusterSeverity} below threshold ${settings.notifyOnSeverity}`,
      };
    }
  }

  // Check for duplicate suppression
  if (settings.suppressDuplicateNotifications && context.clusterId) {
    const recentNotification = await findRecentClusterNotification(
      context.workspaceId,
      context.clusterId,
      settings.cooldownMinutes
    );
    if (recentNotification) {
      return {
        send: false,
        reason: `Duplicate notification suppressed (cooldown: ${settings.cooldownMinutes}m)`,
      };
    }
  }

  return { send: true };
}

/**
 * Create notification with threshold checking.
 * Returns notification ID if created, null if filtered out.
 */
export async function createThresholdAwareNotification(
  context: NotificationContext,
  title: string,
  message: string,
  priority: NotificationPriority = "medium"
): Promise<string | null> {
  const { send, reason } = await shouldSendNotification(context);

  if (!send) {
    console.log(`[Notification] Filtered: ${reason}`);
    return null;
  }

  const notificationId = nanoid();

  await db.insert(notifications).values({
    id: notificationId,
    workspaceId: context.workspaceId,
    type: context.type,
    priority,
    title,
    message,
    projectId: context.projectId,
    metadata: {
      ...context.metadata,
      clusterId: context.clusterId,
      clusterSize: context.clusterSize,
      clusterSeverity: context.clusterSeverity,
    },
    createdAt: new Date(),
  });

  return notificationId;
}
```

### Pattern 4: Event-Driven Automation with after()
**What:** Trigger automation checks after signal ingestion using Next.js after() API
**When to use:** Async processing without blocking request response
**Example:**
```typescript
// In signal ingestion endpoints (already using this pattern)
import { after } from "next/server";
import { processSignalExtraction } from "@/lib/signals/processor";
import { checkSignalAutomationForNewSignal } from "@/lib/automation/signal-automation";

export async function POST(request: NextRequest) {
  // ... create signal ...

  const signalId = createdSignal.id;
  const workspaceId = createdSignal.workspaceId;

  // Queue async processing
  after(async () => {
    // Existing: Process signal (extract, embed, classify)
    await processSignalExtraction(signalId);

    // NEW: Check if automation thresholds are now met
    await checkSignalAutomationForNewSignal(workspaceId, signalId);
  });

  return NextResponse.json({ success: true, signalId });
}

// lib/automation/signal-automation.ts
export async function checkSignalAutomationForNewSignal(
  workspaceId: string,
  triggeringSignalId: string
): Promise<void> {
  const settings = await getWorkspaceAutomationSettings(workspaceId);

  // Exit early if automation is disabled
  if (settings.automationDepth === "manual") return;

  // Run full automation check
  const result = await checkSignalAutomation(workspaceId);

  // Log for observability
  if (result.actionsTriggered.length > 0) {
    console.log(`[SignalAutomation] Triggered ${result.actionsTriggered.length} actions after signal ${triggeringSignalId}`);
  }
}
```

### Pattern 5: Cron-Based Periodic Automation Check
**What:** Periodic check for automation thresholds (backup to event-driven)
**When to use:** Catch any missed triggers, batch processing
**Example:**
```typescript
// app/api/cron/signal-automation/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { workspaces } from "@/lib/db/schema";
import { checkSignalAutomation } from "@/lib/automation/signal-automation";

export const maxDuration = 300; // 5 minutes max
export const dynamic = "force-dynamic";

/**
 * Cron endpoint for periodic automation checks.
 * Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/signal-automation",
 *     "schedule": "0 * * * *"  // Every hour
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sets this automatically)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get all workspaces with signal automation enabled
  const workspaceList = await db
    .select({ id: workspaces.id })
    .from(workspaces);

  const results = [];

  for (const workspace of workspaceList) {
    try {
      const result = await checkSignalAutomation(workspace.id);
      results.push({
        workspaceId: workspace.id,
        ...result,
      });
    } catch (error) {
      console.error(`Automation check failed for workspace ${workspace.id}:`, error);
      results.push({
        workspaceId: workspace.id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    workspacesChecked: workspaceList.length,
    results,
  });
}
```

### Pattern 6: Auto-Actions Implementation
**What:** Actions triggered by automation (create project, trigger PRD, send notification)
**When to use:** AUTO-02, AUTO-04 requirements
**Example:**
```typescript
// lib/automation/auto-actions.ts
import { db } from "@/lib/db";
import { projects, signalProjects, signals, jobs } from "@/lib/db/schema";
import { nanoid } from "nanoid";
import { inArray } from "drizzle-orm";
import { logProjectCreated } from "@/lib/activity";
import type { SignalCluster } from "@/lib/classification";

/**
 * Create a project from a signal cluster (automated version).
 */
export async function createProjectFromCluster(
  workspaceId: string,
  cluster: SignalCluster,
  triggeredBy: "automation" | "user"
): Promise<string> {
  const projectId = `proj_${nanoid()}`;
  const now = new Date();

  // Create project with cluster theme as name
  await db.insert(projects).values({
    id: projectId,
    workspaceId,
    name: cluster.theme,
    description: `Auto-created from ${cluster.signalCount} signal cluster. Severity: ${cluster.severity}`,
    stage: "inbox",
    status: "active",
    metadata: {
      autoCreated: true,
      sourceClusterId: cluster.id,
      clusterConfidence: cluster.confidence,
    },
    createdAt: now,
    updatedAt: now,
  });

  // Bulk link signals
  const signalIds = cluster.signals.map(s => s.id);
  await db.insert(signalProjects).values(
    signalIds.map(signalId => ({
      id: nanoid(),
      signalId,
      projectId,
      linkReason: `Auto-linked from cluster: ${cluster.theme}`,
      confidence: cluster.confidence,
      linkedAt: now,
    }))
  );

  // Update signal statuses
  await db
    .update(signals)
    .set({ status: "linked", updatedAt: now })
    .where(inArray(signals.id, signalIds));

  // Log activity
  await logProjectCreated(workspaceId, "automation", projectId, cluster.theme);

  return projectId;
}

/**
 * Trigger PRD generation for a project.
 */
export async function triggerPrdGeneration(
  projectId: string,
  workspaceId: string
): Promise<string> {
  const jobId = `job_${nanoid()}`;
  const now = new Date();

  // First, move project to discovery stage (prerequisite for PRD)
  await db
    .update(projects)
    .set({ stage: "discovery", updatedAt: now })
    .where(eq(projects.id, projectId));

  // Create PRD generation job
  await db.insert(jobs).values({
    id: jobId,
    projectId,
    workspaceId,
    type: "generate_prd",
    status: "pending",
    input: {
      autoTriggered: true,
      triggeredBy: "automation",
    },
    createdAt: now,
  });

  return jobId;
}
```

### Anti-Patterns to Avoid
- **Blocking request on automation:** Never run automation synchronously in request handlers. Use `after()` or job queues.
- **Missing rate limiting:** Without rate limits, a flood of signals could trigger excessive auto-actions.
- **Hard-coded thresholds:** Always read thresholds from workspace settings, never hard-code.
- **Notification spam:** Always check `suppressDuplicateNotifications` before creating notifications.
- **Missing idempotency:** Automation actions should be idempotent - check if action already taken before proceeding.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Async processing | Custom job queue | Next.js `after()` API | Built-in, reliable, no infrastructure |
| Cron scheduling | Custom scheduler | Vercel Cron + API route | Managed, production-tested |
| Threshold config storage | Separate table | Extend WorkspaceSettings | Consistent with existing patterns |
| Rate limiting | Custom implementation | Track actions in notifications table | Simpler, queryable |
| Cluster detection | Custom algorithm | Existing `findSignalClusters()` | Already implemented in Phase 16 |

**Key insight:** Phase 19 is primarily about wiring existing components together with configurable thresholds. The clustering, project creation, and notification infrastructure already exists - this phase adds the automation layer on top.

## Common Pitfalls

### Pitfall 1: Automation Runs on Every Signal
**What goes wrong:** System triggers automation check after every single signal, causing performance issues
**Why it happens:** No debouncing or batching of automation checks
**How to avoid:** Use cron-based periodic checks as primary, with signal-triggered checks as optimization
**Warning signs:** High API costs, slow signal ingestion, excessive notifications

### Pitfall 2: Duplicate Project Creation
**What goes wrong:** Same cluster creates multiple projects
**Why it happens:** Race condition between multiple automation triggers
**How to avoid:**
- Record automation actions with cluster ID
- Check for existing project with same source cluster before creating
- Use database transaction for create-and-record
**Warning signs:** Duplicate projects with similar names

### Pitfall 3: Threshold Bypass via Manual Actions
**What goes wrong:** Manual "Create Project" from cluster bypasses automation tracking
**Why it happens:** Manual actions don't record to automation history
**How to avoid:** Both manual and auto actions should record to same tracking table
**Warning signs:** Automation triggers for clusters that already have projects

### Pitfall 4: Notification Fatigue
**What goes wrong:** Users overwhelmed with notifications
**Why it happens:** Thresholds too low, no cooldown, no deduplication
**How to avoid:**
- Default to conservative thresholds (3+ signals, 60min cooldown)
- Always respect `suppressDuplicateNotifications`
- Group related notifications
**Warning signs:** Users disabling notifications entirely

### Pitfall 5: Stale Cluster Data
**What goes wrong:** Automation acts on outdated cluster information
**Why it happens:** Cluster detection runs but signals have since been linked/archived
**How to avoid:** Re-verify cluster signals before acting, use fresh queries
**Warning signs:** Projects created with 0 linked signals

### Pitfall 6: Settings Not Persisted
**What goes wrong:** Automation settings reset on workspace update
**Why it happens:** Partial workspace settings update overwrites signalAutomation
**How to avoid:** Merge settings rather than replace: `{ ...existing.settings, ...updates }`
**Warning signs:** Settings reverting to defaults

## Code Examples

### Database Migration for Automation Tracking
```sql
-- Track automation actions for rate limiting and deduplication
CREATE TABLE IF NOT EXISTS automation_actions (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  cluster_id TEXT NOT NULL,
  action_type TEXT NOT NULL,  -- 'initiative_created', 'prd_triggered', 'notification_sent'
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  triggered_at TIMESTAMP NOT NULL DEFAULT NOW(),
  metadata JSONB
);

CREATE INDEX automation_actions_workspace_cluster_idx
ON automation_actions(workspace_id, cluster_id);

CREATE INDEX automation_actions_workspace_time_idx
ON automation_actions(workspace_id, triggered_at DESC);
```

### Workspace Settings UI Component
```typescript
// components/settings/SignalAutomationSettings.tsx
"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { DEFAULT_SIGNAL_AUTOMATION, type SignalAutomationSettings } from "@/lib/db/schema";

interface Props {
  settings: SignalAutomationSettings;
  onChange: (settings: SignalAutomationSettings) => void;
}

export function SignalAutomationSettingsPanel({ settings, onChange }: Props) {
  const update = <K extends keyof SignalAutomationSettings>(
    key: K,
    value: SignalAutomationSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Automation Depth */}
      <div className="space-y-2">
        <Label>Automation Depth</Label>
        <Select
          value={settings.automationDepth}
          onValueChange={(v) => update("automationDepth", v as SignalAutomationSettings["automationDepth"])}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">Manual - No auto-actions</SelectItem>
            <SelectItem value="suggest">Suggest - Show recommendations only</SelectItem>
            <SelectItem value="auto_create">Auto-Create - Create initiatives automatically</SelectItem>
            <SelectItem value="full_auto">Full Auto - Create initiatives + trigger PRD</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Control how aggressively the system acts on signal patterns.
        </p>
      </div>

      {/* Thresholds */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Auto-Initiative Threshold</Label>
          <Input
            type="number"
            min={2}
            max={20}
            value={settings.autoInitiativeThreshold}
            onChange={(e) => update("autoInitiativeThreshold", Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">
            Minimum signals in cluster to auto-create initiative.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Auto-PRD Threshold</Label>
          <Input
            type="number"
            min={3}
            max={30}
            value={settings.autoPrdThreshold}
            onChange={(e) => update("autoPrdThreshold", Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">
            Minimum signals to auto-trigger PRD generation.
          </p>
        </div>
      </div>

      {/* Confidence Threshold */}
      <div className="space-y-2">
        <Label>Minimum Cluster Confidence</Label>
        <Input
          type="number"
          min={0.5}
          max={1}
          step={0.05}
          value={settings.minClusterConfidence}
          onChange={(e) => update("minClusterConfidence", Number(e.target.value))}
        />
        <p className="text-xs text-muted-foreground">
          Clusters below this similarity score won't trigger automation.
        </p>
      </div>

      {/* Notification Settings */}
      <div className="space-y-4 pt-4 border-t">
        <h4 className="font-medium">Notification Thresholds</h4>

        <div className="space-y-2">
          <Label>Notify on Cluster Size</Label>
          <Input
            type="number"
            min={1}
            max={20}
            value={settings.notifyOnClusterSize ?? ""}
            placeholder="Any size"
            onChange={(e) => update("notifyOnClusterSize", e.target.value ? Number(e.target.value) : null)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Suppress Duplicates</Label>
            <p className="text-xs text-muted-foreground">
              Don't notify for same cluster within cooldown period.
            </p>
          </div>
          <Switch
            checked={settings.suppressDuplicateNotifications}
            onCheckedChange={(v) => update("suppressDuplicateNotifications", v)}
          />
        </div>

        <div className="space-y-2">
          <Label>Cooldown Period (minutes)</Label>
          <Input
            type="number"
            min={5}
            max={1440}
            value={settings.cooldownMinutes}
            onChange={(e) => update("cooldownMinutes", Number(e.target.value))}
          />
        </div>
      </div>

      {/* Rate Limiting */}
      <div className="space-y-2 pt-4 border-t">
        <Label>Max Auto-Actions Per Day</Label>
        <Input
          type="number"
          min={1}
          max={100}
          value={settings.maxAutoActionsPerDay}
          onChange={(e) => update("maxAutoActionsPerDay", Number(e.target.value))}
        />
        <p className="text-xs text-muted-foreground">
          Safety limit to prevent runaway automation.
        </p>
      </div>
    </div>
  );
}
```

### Rate Limiter Implementation
```typescript
// lib/automation/rate-limiter.ts
import { db } from "@/lib/db";
import { automationActions } from "@/lib/db/schema";
import { eq, and, gt, count } from "drizzle-orm";
import { nanoid } from "nanoid";

/**
 * Check if automation action can be performed (rate limits, cooldown).
 */
export async function canPerformAutoAction(
  workspaceId: string,
  clusterId: string,
  settings: SignalAutomationSettings
): Promise<boolean> {
  const now = new Date();

  // Check cooldown for this specific cluster
  const cooldownThreshold = new Date(now.getTime() - settings.cooldownMinutes * 60 * 1000);
  const recentClusterAction = await db
    .select()
    .from(automationActions)
    .where(and(
      eq(automationActions.workspaceId, workspaceId),
      eq(automationActions.clusterId, clusterId),
      gt(automationActions.triggeredAt, cooldownThreshold)
    ))
    .limit(1);

  if (recentClusterAction.length > 0) {
    return false; // In cooldown
  }

  // Check daily rate limit
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);

  const dailyCount = await db
    .select({ count: count() })
    .from(automationActions)
    .where(and(
      eq(automationActions.workspaceId, workspaceId),
      gt(automationActions.triggeredAt, dayStart)
    ));

  if (dailyCount[0].count >= settings.maxAutoActionsPerDay) {
    return false; // Rate limited
  }

  return true;
}

/**
 * Record an automation action.
 */
export async function recordAutomationAction(
  workspaceId: string,
  clusterId: string,
  actionType: "initiative_created" | "prd_triggered" | "notification_sent",
  projectId?: string
): Promise<string> {
  const actionId = nanoid();

  await db.insert(automationActions).values({
    id: actionId,
    workspaceId,
    clusterId,
    actionType,
    projectId,
    triggeredAt: new Date(),
  });

  return actionId;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual cluster review | Configurable auto-triggers | Phase 19 | Reduced PM overhead |
| All-or-nothing automation | Depth levels (suggest/auto/full) | Phase 19 | Gradual automation adoption |
| Every event notifies | Threshold-based notifications | Phase 19 | Reduced notification fatigue |
| Global automation settings | Per-workspace configuration | Phase 19 | Team-specific workflows |

**Current in codebase:**
- `findSignalClusters()` discovers patterns but requires manual action
- Workspace settings exist but don't include signal automation
- Notification system exists but no threshold filtering
- `after()` pattern already used for async signal processing

## Open Questions

1. **Automation Action History UI**
   - What we know: Actions need tracking for rate limiting
   - What's unclear: Should users see automation history in UI?
   - Recommendation: **Add to workspace settings modal**, show recent auto-actions for transparency

2. **Cross-Workspace Clusters**
   - What we know: Clusters are workspace-scoped
   - What's unclear: Should patterns across workspaces be surfaced?
   - Recommendation: **Keep workspace-scoped for Phase 19**, consider cross-workspace in future

3. **Undo Auto-Actions**
   - What we know: Auto-created projects can be manually deleted
   - What's unclear: Should there be a dedicated "undo" mechanism?
   - Recommendation: **Use existing delete flow**, mark auto-created for easy identification

4. **Notification Aggregation**
   - What we know: Individual notifications for each cluster
   - What's unclear: Should multiple cluster notifications be grouped?
   - Recommendation: **Individual for Phase 19**, consider digest mode in future

## Sources

### Primary (HIGH confidence)
- `/orchestrator/src/lib/classification/clustering.ts` - Existing cluster detection
- `/orchestrator/src/lib/db/schema.ts` - WorkspaceSettings pattern
- `/orchestrator/src/lib/signals/processor.ts` - after() pattern for async processing
- `/orchestrator/src/app/api/projects/from-cluster/route.ts` - Project creation from cluster
- `/orchestrator/src/components/kanban/WorkspaceSettingsModal.tsx` - Settings UI pattern

### Secondary (MEDIUM confidence)
- Phase 16 RESEARCH.md - Clustering architecture
- Phase 18 RESEARCH.md - Project from cluster pattern
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs) - Cron scheduling for periodic checks
- [Next.js after() API](https://nextjs.org/docs/app/api-reference/functions/after) - Async processing pattern

### Tertiary (LOW confidence)
- [Typed Workflows Article](https://medium.com/@2nick2patel2/typed-workflows-are-the-new-microservices-n8n-typescript-for-automations-you-can-refactor-safely-1323877b272e) - Event-driven workflow patterns
- [IT Alerting Software Comparison](https://www.atera.com/blog/best-network-alerting-software/) - Threshold-based alerting patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new dependencies, all existing
- Automation settings: HIGH - Extends established WorkspaceSettings pattern
- Threshold filtering: HIGH - Straightforward conditional logic
- Event-driven triggers: HIGH - Uses existing after() pattern
- Cron scheduling: MEDIUM - Vercel-specific, needs local dev consideration

**Research date:** 2026-01-23
**Valid until:** 90 days (stable patterns, no external dependencies)

---

## Implementation Readiness

| Requirement | Research Finding | Implementation Gap | Risk |
|-------------|------------------|-------------------|------|
| AUTO-01: Configurable automation depth | Extend WorkspaceSettings | Add signalAutomation settings, UI panel | LOW |
| AUTO-02: Auto-PRD when N+ signals cluster | Use existing cluster detection + threshold check | Wire automation check after signal processing | LOW |
| AUTO-03: Notification thresholds | Filter notifications before creation | Add threshold-filter.ts module | LOW |
| AUTO-04: Auto-initiative from clusters | Existing from-cluster API + automation wrapper | Add rate limiting, action tracking | LOW |

**All requirements have clear implementation paths.** The infrastructure is complete - Phase 19 is primarily configuration and wiring.

**No blocking gaps identified.** Ready for planning.
