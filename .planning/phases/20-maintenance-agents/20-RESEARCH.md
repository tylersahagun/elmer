# Phase 20: Maintenance Agents - Research

**Researched:** 2026-01-23
**Domain:** Signal hygiene, orphan detection, duplicate merging, archival workflows
**Confidence:** HIGH

## Summary

Phase 20 implements maintenance agents that keep the signal system healthy through automated cleanup suggestions and archival workflows. The codebase already has:

1. **Signal status lifecycle** - `SignalStatus` type with "new" | "reviewed" | "linked" | "archived" states (Phase 11)
2. **Signal clustering infrastructure** - `findSignalClusters()` with semantic similarity via pgvector (Phase 16)
3. **Automation settings system** - `SignalAutomationSettings` in WorkspaceSettings with thresholds and rate limiting (Phase 19)
4. **Cron job infrastructure** - `/api/cron/signal-automation` pattern for periodic checks (Phase 19)
5. **Junction table with provenance** - `signalProjects` tracks `linkedAt`, `linkedBy`, `linkReason` (Phase 12.5)
6. **Notification system** - Threshold-aware notifications via `createThresholdAwareNotification()` (Phase 19)
7. **Automation action tracking** - `automationActions` table for rate limiting and audit (Phase 19)

The main work is:
1. **Cleanup agent** - Suggest signal-to-project associations for unlinked signals (extends Phase 17 suggestions)
2. **Orphan detection** - Flag signals unlinked after configurable N days
3. **Duplicate detection** - Identify semantically similar signals and suggest merges
4. **Archival workflow** - Move old signals to archived status with provenance preservation

**Primary recommendation:** Extend existing automation patterns rather than building new. The infrastructure is complete - this phase adds maintenance-specific agents on top of the Phase 19 automation foundation.

## Architecture Patterns

### Recommended Project Structure
```
orchestrator/src/
├── lib/
│   ├── maintenance/
│   │   ├── orphan-detector.ts     # NEW: Find signals unlinked after N days
│   │   ├── duplicate-detector.ts  # NEW: Find semantically similar signals
│   │   ├── cleanup-agent.ts       # NEW: Orchestrate cleanup suggestions
│   │   └── archival.ts            # NEW: Archival workflow logic
│   └── db/
│       └── schema.ts              # ENHANCE: Add maintenance settings
├── app/api/
│   ├── cron/
│   │   └── maintenance/
│   │       └── route.ts           # NEW: Cron endpoint for maintenance
│   ├── signals/
│   │   ├── orphans/
│   │   │   └── route.ts           # NEW: Get orphan signals
│   │   ├── duplicates/
│   │   │   └── route.ts           # NEW: Get duplicate suggestions
│   │   └── archive/
│   │       └── route.ts           # NEW: Archive workflow endpoint
│   └── maintenance/
│       └── suggestions/
│           └── route.ts           # NEW: Get all maintenance suggestions
└── components/
    └── signals/
        ├── OrphanSignalsBanner.tsx      # NEW: Banner showing orphan count
        ├── DuplicateSuggestionCard.tsx  # NEW: Merge suggestion UI
        └── MaintenanceDashboard.tsx     # NEW: Maintenance overview panel
```

### Pattern 1: Orphan Signal Detection

**What:** Identify signals that have been in "new" status for longer than configurable threshold
**Definition:** A signal is orphaned when:
- Status is "new" (never reviewed, linked, or archived)
- Created more than N days ago (configurable, default: 14 days)
- Not linked to any project or persona

**Example:**
```typescript
// lib/maintenance/orphan-detector.ts
import { db } from "@/lib/db";
import { signals, signalProjects, signalPersonas } from "@/lib/db/schema";
import { eq, and, lt, isNull, notExists, sql } from "drizzle-orm";

export interface OrphanSignal {
  id: string;
  verbatim: string;
  source: string;
  createdAt: Date;
  daysOrphaned: number;
}

export interface OrphanDetectionResult {
  signals: OrphanSignal[];
  total: number;
  oldestDays: number;
}

/**
 * Find orphan signals - unlinked signals older than threshold.
 *
 * @param workspaceId - Workspace to check
 * @param thresholdDays - Days after which unlinked signal is orphaned (default: 14)
 * @param limit - Max signals to return (default: 50)
 */
export async function findOrphanSignals(
  workspaceId: string,
  thresholdDays = 14,
  limit = 50
): Promise<OrphanDetectionResult> {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - thresholdDays);

  // Find signals that are:
  // 1. In "new" status
  // 2. Created before threshold date
  // 3. Not linked to any project
  // 4. Not linked to any persona
  const orphans = await db
    .select({
      id: signals.id,
      verbatim: signals.verbatim,
      source: signals.source,
      createdAt: signals.createdAt,
      severity: signals.severity,
    })
    .from(signals)
    .where(and(
      eq(signals.workspaceId, workspaceId),
      eq(signals.status, "new"),
      lt(signals.createdAt, thresholdDate),
      notExists(
        db.select({ id: signalProjects.id })
          .from(signalProjects)
          .where(eq(signalProjects.signalId, signals.id))
      ),
      notExists(
        db.select({ id: signalPersonas.id })
          .from(signalPersonas)
          .where(eq(signalPersonas.signalId, signals.id))
      )
    ))
    .orderBy(signals.createdAt)
    .limit(limit);

  const now = new Date();
  const results = orphans.map(s => ({
    id: s.id,
    verbatim: s.verbatim,
    source: s.source || "unknown",
    createdAt: s.createdAt,
    daysOrphaned: Math.floor((now.getTime() - s.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
  }));

  return {
    signals: results,
    total: results.length,
    oldestDays: results.length > 0 ? results[0].daysOrphaned : 0,
  };
}
```

### Pattern 2: Duplicate Detection via Semantic Similarity

**What:** Identify signals that are semantically similar and may be duplicates
**Definition:** Two signals are potential duplicates when:
- Cosine similarity > 0.9 (very high similarity threshold)
- Neither is already archived
- Both have embeddings

**Approach:** Use existing pgvector infrastructure from Phase 16, with higher similarity threshold.

**Example:**
```typescript
// lib/maintenance/duplicate-detector.ts
import { db } from "@/lib/db";
import { signals } from "@/lib/db/schema";
import { eq, and, ne, isNotNull, sql } from "drizzle-orm";

export interface DuplicatePair {
  id: string;  // Unique pair ID
  signal1: {
    id: string;
    verbatim: string;
    source: string;
    createdAt: Date;
  };
  signal2: {
    id: string;
    verbatim: string;
    source: string;
    createdAt: Date;
  };
  similarity: number;
}

export interface DuplicateDetectionResult {
  pairs: DuplicatePair[];
  total: number;
}

// Higher threshold than clustering - we want high-confidence duplicates
const DUPLICATE_DISTANCE_THRESHOLD = 0.1; // cosine distance < 0.1 = similarity > 0.9

/**
 * Find potential duplicate signal pairs.
 *
 * Algorithm:
 * 1. For each signal with embedding, find very similar signals
 * 2. Filter to pairs above similarity threshold
 * 3. Deduplicate pairs (A-B same as B-A)
 */
export async function findDuplicateSignals(
  workspaceId: string,
  limit = 20
): Promise<DuplicateDetectionResult> {
  // Get signals with embeddings that are not archived
  const candidates = await db
    .select({
      id: signals.id,
      verbatim: signals.verbatim,
      source: signals.source,
      createdAt: signals.createdAt,
      embeddingVector: signals.embeddingVector,
    })
    .from(signals)
    .where(and(
      eq(signals.workspaceId, workspaceId),
      ne(signals.status, "archived"),
      isNotNull(signals.embeddingVector)
    ))
    .limit(100); // Process up to 100 signals

  const pairs: DuplicatePair[] = [];
  const seenPairs = new Set<string>();

  for (const signal of candidates) {
    if (!signal.embeddingVector) continue;

    // Find similar signals using pgvector
    const similar = await db
      .select({
        id: signals.id,
        verbatim: signals.verbatim,
        source: signals.source,
        createdAt: signals.createdAt,
        distance: sql<number>`${signals.embeddingVector} <=> ${JSON.stringify(signal.embeddingVector)}::vector`,
      })
      .from(signals)
      .where(and(
        eq(signals.workspaceId, workspaceId),
        ne(signals.id, signal.id),
        ne(signals.status, "archived"),
        isNotNull(signals.embeddingVector)
      ))
      .orderBy(sql`${signals.embeddingVector} <=> ${JSON.stringify(signal.embeddingVector)}::vector`)
      .limit(5);

    for (const match of similar) {
      // Only include if very similar
      if (match.distance > DUPLICATE_DISTANCE_THRESHOLD) continue;

      // Create canonical pair ID to avoid A-B and B-A duplicates
      const pairId = [signal.id, match.id].sort().join("-");
      if (seenPairs.has(pairId)) continue;
      seenPairs.add(pairId);

      pairs.push({
        id: pairId,
        signal1: {
          id: signal.id,
          verbatim: signal.verbatim,
          source: signal.source || "unknown",
          createdAt: signal.createdAt,
        },
        signal2: {
          id: match.id,
          verbatim: match.verbatim,
          source: match.source || "unknown",
          createdAt: match.createdAt,
        },
        similarity: 1 - match.distance,
      });

      if (pairs.length >= limit) break;
    }

    if (pairs.length >= limit) break;
  }

  // Sort by similarity (highest first)
  pairs.sort((a, b) => b.similarity - a.similarity);

  return {
    pairs,
    total: pairs.length,
  };
}
```

### Pattern 3: Cleanup Agent - Association Suggestions

**What:** Proactively suggest signal-to-project associations for unlinked signals
**Extends:** Phase 17 suggestion infrastructure

**Example:**
```typescript
// lib/maintenance/cleanup-agent.ts
import { db } from "@/lib/db";
import { signals, projects } from "@/lib/db/schema";
import { findSimilarProjects } from "@/lib/classification";
import { eq, and, isNull, isNotNull, ne } from "drizzle-orm";

export interface AssociationSuggestion {
  signalId: string;
  signal: {
    verbatim: string;
    source: string;
    createdAt: Date;
  };
  suggestedProject: {
    id: string;
    name: string;
    stage: string;
  };
  confidence: number;
  reason: string;
}

/**
 * Generate association suggestions for unlinked signals.
 * Uses embedding similarity to find relevant projects.
 */
export async function generateAssociationSuggestions(
  workspaceId: string,
  limit = 20
): Promise<AssociationSuggestion[]> {
  // Find unlinked signals with embeddings that haven't been dismissed
  const unlinked = await db
    .select({
      id: signals.id,
      verbatim: signals.verbatim,
      source: signals.source,
      createdAt: signals.createdAt,
      embeddingVector: signals.embeddingVector,
    })
    .from(signals)
    .where(and(
      eq(signals.workspaceId, workspaceId),
      eq(signals.status, "new"),
      isNotNull(signals.embeddingVector),
      isNull(signals.suggestionDismissedAt)
    ))
    .limit(50);

  const suggestions: AssociationSuggestion[] = [];

  for (const signal of unlinked) {
    if (!signal.embeddingVector) continue;

    // Find similar projects
    const projectMatches = await findSimilarProjects(
      workspaceId,
      signal.embeddingVector,
      3 // Top 3 matches
    );

    // Only suggest if confidence is high enough
    const topMatch = projectMatches[0];
    if (topMatch && topMatch.confidence > 0.6) {
      suggestions.push({
        signalId: signal.id,
        signal: {
          verbatim: signal.verbatim,
          source: signal.source || "unknown",
          createdAt: signal.createdAt,
        },
        suggestedProject: {
          id: topMatch.projectId,
          name: topMatch.projectName,
          stage: topMatch.stage,
        },
        confidence: topMatch.confidence,
        reason: `Semantically similar to project "${topMatch.projectName}"`,
      });
    }

    if (suggestions.length >= limit) break;
  }

  return suggestions.sort((a, b) => b.confidence - a.confidence);
}
```

### Pattern 4: Archival Workflow with Provenance Preservation

**What:** Move old signals to archived status while preserving all metadata
**Key principle:** Archival is soft-delete - signal data is preserved, just hidden from active views

**Example:**
```typescript
// lib/maintenance/archival.ts
import { db } from "@/lib/db";
import { signals, signalProjects, signalPersonas, activityLogs } from "@/lib/db/schema";
import { eq, and, lt, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface ArchivalResult {
  archivedCount: number;
  signalIds: string[];
  archivedAt: Date;
}

export interface ArchivalCriteria {
  // Archive signals in "linked" status older than N days
  linkedOlderThanDays?: number;
  // Archive signals in "reviewed" status older than N days (not linked)
  reviewedOlderThanDays?: number;
  // Manual selection
  signalIds?: string[];
}

/**
 * Archive signals based on criteria.
 * Preserves all data - just updates status to "archived".
 */
export async function archiveSignals(
  workspaceId: string,
  criteria: ArchivalCriteria,
  userId?: string
): Promise<ArchivalResult> {
  const now = new Date();
  let signalIdsToArchive: string[] = [];

  // Manual selection
  if (criteria.signalIds && criteria.signalIds.length > 0) {
    signalIdsToArchive = criteria.signalIds;
  }

  // Time-based linked signals
  if (criteria.linkedOlderThanDays) {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - criteria.linkedOlderThanDays);

    const oldLinked = await db
      .select({ id: signals.id })
      .from(signals)
      .where(and(
        eq(signals.workspaceId, workspaceId),
        eq(signals.status, "linked"),
        lt(signals.updatedAt, threshold)
      ));

    signalIdsToArchive.push(...oldLinked.map(s => s.id));
  }

  // Time-based reviewed signals
  if (criteria.reviewedOlderThanDays) {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - criteria.reviewedOlderThanDays);

    const oldReviewed = await db
      .select({ id: signals.id })
      .from(signals)
      .where(and(
        eq(signals.workspaceId, workspaceId),
        eq(signals.status, "reviewed"),
        lt(signals.updatedAt, threshold)
      ));

    signalIdsToArchive.push(...oldReviewed.map(s => s.id));
  }

  // Deduplicate
  signalIdsToArchive = [...new Set(signalIdsToArchive)];

  if (signalIdsToArchive.length === 0) {
    return { archivedCount: 0, signalIds: [], archivedAt: now };
  }

  // Archive signals (update status, preserve everything else)
  await db
    .update(signals)
    .set({
      status: "archived",
      updatedAt: now,
    })
    .where(and(
      eq(signals.workspaceId, workspaceId),
      inArray(signals.id, signalIdsToArchive)
    ));

  // Log activity for audit trail
  await db.insert(activityLogs).values({
    id: nanoid(),
    workspaceId,
    userId: userId ?? null,
    action: "signals.archived",
    targetType: "signals",
    targetId: null,
    metadata: {
      count: signalIdsToArchive.length,
      signalIds: signalIdsToArchive,
      criteria,
    },
    createdAt: now,
  });

  return {
    archivedCount: signalIdsToArchive.length,
    signalIds: signalIdsToArchive,
    archivedAt: now,
  };
}

/**
 * Restore archived signals.
 */
export async function unarchiveSignals(
  workspaceId: string,
  signalIds: string[],
  userId?: string
): Promise<{ restoredCount: number }> {
  const now = new Date();

  // Restore to "reviewed" status (not "new" since they were processed)
  await db
    .update(signals)
    .set({
      status: "reviewed",
      updatedAt: now,
    })
    .where(and(
      eq(signals.workspaceId, workspaceId),
      eq(signals.status, "archived"),
      inArray(signals.id, signalIds)
    ));

  // Log activity
  await db.insert(activityLogs).values({
    id: nanoid(),
    workspaceId,
    userId: userId ?? null,
    action: "signals.unarchived",
    targetType: "signals",
    targetId: null,
    metadata: {
      count: signalIds.length,
      signalIds,
    },
    createdAt: now,
  });

  return { restoredCount: signalIds.length };
}
```

### Pattern 5: Merge Duplicate Signals

**What:** Combine two duplicate signals into one, preserving provenance
**Key principle:** Keep the older signal as primary, merge metadata from secondary

**Example:**
```typescript
// lib/maintenance/merge.ts
import { db } from "@/lib/db";
import { signals, signalProjects, signalPersonas, activityLogs } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface MergeResult {
  primarySignalId: string;
  mergedSignalId: string;
  projectsTransferred: number;
  personasTransferred: number;
}

/**
 * Merge two duplicate signals.
 *
 * Strategy:
 * 1. Keep the older signal as primary (has more history)
 * 2. Transfer all project/persona links from secondary to primary
 * 3. Archive the secondary signal
 * 4. Preserve merge history in activity log
 */
export async function mergeSignals(
  workspaceId: string,
  primarySignalId: string,
  secondarySignalId: string,
  userId?: string
): Promise<MergeResult> {
  const now = new Date();

  // Verify both signals exist and belong to workspace
  const [primary, secondary] = await Promise.all([
    db.select().from(signals).where(and(
      eq(signals.id, primarySignalId),
      eq(signals.workspaceId, workspaceId)
    )).limit(1),
    db.select().from(signals).where(and(
      eq(signals.id, secondarySignalId),
      eq(signals.workspaceId, workspaceId)
    )).limit(1),
  ]);

  if (primary.length === 0 || secondary.length === 0) {
    throw new Error("One or both signals not found");
  }

  // Transfer project links from secondary to primary
  // First, get existing primary project IDs to avoid duplicates
  const existingProjectLinks = await db
    .select({ projectId: signalProjects.projectId })
    .from(signalProjects)
    .where(eq(signalProjects.signalId, primarySignalId));

  const existingProjectIds = new Set(existingProjectLinks.map(l => l.projectId));

  // Get secondary's project links
  const secondaryProjectLinks = await db
    .select()
    .from(signalProjects)
    .where(eq(signalProjects.signalId, secondarySignalId));

  // Transfer non-duplicate links
  let projectsTransferred = 0;
  for (const link of secondaryProjectLinks) {
    if (!existingProjectIds.has(link.projectId)) {
      await db.insert(signalProjects).values({
        id: nanoid(),
        signalId: primarySignalId,
        projectId: link.projectId,
        linkedAt: link.linkedAt,
        linkedBy: link.linkedBy,
        linkReason: `Merged from signal ${secondarySignalId}: ${link.linkReason || ""}`,
        confidence: link.confidence,
      });
      projectsTransferred++;
    }
  }

  // Transfer persona links (similar logic)
  const existingPersonaLinks = await db
    .select({ personaId: signalPersonas.personaId })
    .from(signalPersonas)
    .where(eq(signalPersonas.signalId, primarySignalId));

  const existingPersonaIds = new Set(existingPersonaLinks.map(l => l.personaId));

  const secondaryPersonaLinks = await db
    .select()
    .from(signalPersonas)
    .where(eq(signalPersonas.signalId, secondarySignalId));

  let personasTransferred = 0;
  for (const link of secondaryPersonaLinks) {
    if (!existingPersonaIds.has(link.personaId)) {
      await db.insert(signalPersonas).values({
        id: nanoid(),
        signalId: primarySignalId,
        personaId: link.personaId,
        linkedAt: link.linkedAt,
        linkedBy: link.linkedBy,
      });
      personasTransferred++;
    }
  }

  // Archive the secondary signal (not delete - preserve history)
  await db
    .update(signals)
    .set({
      status: "archived",
      updatedAt: now,
    })
    .where(eq(signals.id, secondarySignalId));

  // Log the merge activity
  await db.insert(activityLogs).values({
    id: nanoid(),
    workspaceId,
    userId: userId ?? null,
    action: "signals.merged",
    targetType: "signals",
    targetId: primarySignalId,
    metadata: {
      primarySignalId,
      secondarySignalId,
      projectsTransferred,
      personasTransferred,
      primaryVerbatim: primary[0].verbatim.slice(0, 100),
      secondaryVerbatim: secondary[0].verbatim.slice(0, 100),
    },
    createdAt: now,
  });

  return {
    primarySignalId,
    mergedSignalId: secondarySignalId,
    projectsTransferred,
    personasTransferred,
  };
}
```

### Pattern 6: Maintenance Settings Extension

**What:** Extend WorkspaceSettings with maintenance-specific configuration
**Example:**
```typescript
// Addition to schema.ts

export interface MaintenanceSettings {
  // Orphan detection
  orphanThresholdDays: number;           // Default: 14
  flagOrphansEnabled: boolean;            // Default: true

  // Duplicate detection
  duplicateDetectionEnabled: boolean;     // Default: true
  duplicateSimilarityThreshold: number;   // Default: 0.9 (very high)

  // Auto-archival
  autoArchiveEnabled: boolean;            // Default: false (manual trigger)
  autoArchiveLinkedAfterDays: number;     // Default: 90
  autoArchiveReviewedAfterDays: number;   // Default: 30

  // Cleanup suggestions
  suggestAssociationsEnabled: boolean;    // Default: true
  minSuggestionConfidence: number;        // Default: 0.6

  // Notification settings
  notifyOnOrphanThreshold: number | null; // Notify when orphan count exceeds N
  notifyOnDuplicates: boolean;            // Default: false (can be noisy)
}

export const DEFAULT_MAINTENANCE_SETTINGS: MaintenanceSettings = {
  orphanThresholdDays: 14,
  flagOrphansEnabled: true,
  duplicateDetectionEnabled: true,
  duplicateSimilarityThreshold: 0.9,
  autoArchiveEnabled: false,
  autoArchiveLinkedAfterDays: 90,
  autoArchiveReviewedAfterDays: 30,
  suggestAssociationsEnabled: true,
  minSuggestionConfidence: 0.6,
  notifyOnOrphanThreshold: 10,
  notifyOnDuplicates: false,
};

// Add to WorkspaceSettings interface
export interface WorkspaceSettings {
  // ... existing settings ...

  // Maintenance Settings (Phase 20)
  maintenance?: MaintenanceSettings;
}
```

### Pattern 7: Maintenance Cron Job

**What:** Periodic maintenance check similar to signal-automation cron
**Example:**
```typescript
// app/api/cron/maintenance/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { workspaces } from "@/lib/db/schema";
import { findOrphanSignals } from "@/lib/maintenance/orphan-detector";
import { findDuplicateSignals } from "@/lib/maintenance/duplicate-detector";
import { archiveSignals } from "@/lib/maintenance/archival";
import { getWorkspaceMaintenanceSettings } from "@/lib/db/queries";
import { createThresholdAwareNotification } from "@/lib/notifications";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (process.env.NODE_ENV === "production" && cronSecret) {
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const startTime = Date.now();
  const workspaceList = await db
    .select({ id: workspaces.id, name: workspaces.name })
    .from(workspaces);

  const results = [];

  for (const workspace of workspaceList) {
    try {
      const settings = await getWorkspaceMaintenanceSettings(workspace.id);
      const workspaceResult: Record<string, unknown> = {
        workspaceId: workspace.id,
      };

      // Orphan detection
      if (settings.flagOrphansEnabled) {
        const orphans = await findOrphanSignals(
          workspace.id,
          settings.orphanThresholdDays
        );
        workspaceResult.orphanCount = orphans.total;

        // Notify if threshold exceeded
        if (settings.notifyOnOrphanThreshold &&
            orphans.total >= settings.notifyOnOrphanThreshold) {
          await createThresholdAwareNotification(
            {
              workspaceId: workspace.id,
              type: "action_required",
              metadata: { orphanCount: orphans.total },
            },
            `${orphans.total} orphan signals need attention`,
            `Signals unlinked for ${settings.orphanThresholdDays}+ days need review or archival.`,
            { priority: "medium", actionUrl: "/signals?status=orphan" }
          );
        }
      }

      // Duplicate detection
      if (settings.duplicateDetectionEnabled) {
        const duplicates = await findDuplicateSignals(workspace.id);
        workspaceResult.duplicatePairs = duplicates.total;
      }

      // Auto-archival
      if (settings.autoArchiveEnabled) {
        const archived = await archiveSignals(workspace.id, {
          linkedOlderThanDays: settings.autoArchiveLinkedAfterDays,
          reviewedOlderThanDays: settings.autoArchiveReviewedAfterDays,
        });
        workspaceResult.archivedCount = archived.archivedCount;
      }

      results.push(workspaceResult);
    } catch (error) {
      console.error(`Maintenance failed for workspace ${workspace.id}:`, error);
      results.push({
        workspaceId: workspace.id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    durationMs: Date.now() - startTime,
    workspacesChecked: workspaceList.length,
    results,
  });
}
```

### Anti-Patterns to Avoid

- **Hard delete signals:** Never permanently delete signals - always use archival (soft delete). Signals are evidence and must be preserved for audit.
- **Auto-merge without confirmation:** Duplicate merging should always require user confirmation. False positives can destroy data.
- **Orphan auto-archive:** Don't automatically archive orphans - notify and let users decide. Orphans may need review, not disposal.
- **Ignoring provenance on merge:** When merging duplicates, always preserve the merge history in activity log.
- **Aggressive archival:** Default archival thresholds should be conservative (90+ days for linked signals).

## Standard Stack

### Core (Already Available)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| drizzle-orm | ^0.45.1 | ORM with relations | Already installed |
| pgvector | via neon | Vector similarity search | Already installed |
| @tanstack/react-query | ^5.90.18 | Data fetching/caching | Already installed |
| nanoid | ^5.x | ID generation | Already installed |

**No new packages required.** All functionality extends existing infrastructure.

## Feature Implementation Matrix

| Requirement | Feature | Implementation | Complexity |
|-------------|---------|----------------|------------|
| MAINT-01: Cleanup suggestions | Association suggestions for unlinked signals | Extend Phase 17 suggestions API | LOW |
| MAINT-02: Orphan detection | Find signals unlinked after N days | New query + UI banner | LOW |
| MAINT-03: Duplicate detection | Semantic similarity with high threshold | pgvector query + merge UI | MEDIUM |
| MAINT-04: Archival workflow | Status change + provenance preservation | New archive API + UI | LOW |

## UI Patterns for Maintenance Suggestions

### Orphan Signals Banner
Display at top of signals list when orphans exist:
```
[!] 8 signals have been unlinked for 14+ days
    [Review Orphans] [Archive All] [Dismiss]
```

### Duplicate Suggestion Card
Show in maintenance dashboard or inline:
```
+------------------------------------------+
| Potential Duplicate (92% similar)         |
|------------------------------------------|
| Signal A: "Users keep asking for..."     |
| Signal B: "Customers want to be able..." |
|                                          |
| [Merge] [Ignore] [View Both]             |
+------------------------------------------+
```

### Maintenance Dashboard
Summary panel in workspace settings or signals page:
```
Signal Health
+------------------+-------+--------+
| Metric           | Count | Action |
+------------------+-------+--------+
| Orphan signals   | 8     | Review |
| Duplicate pairs  | 3     | Merge  |
| Archivable       | 12    | Archive|
+------------------+-------+--------+
```

## Common Pitfalls

### Pitfall 1: False Positive Duplicates
**What goes wrong:** System flags semantically similar but distinct signals as duplicates
**Why it happens:** Similarity threshold too low, or signals about same topic but different concerns
**How to avoid:**
- Use high threshold (0.9+) for duplicate detection
- Always require user confirmation for merges
- Show full signal content in merge UI for comparison
**Warning signs:** Users complaining about unrelated signals flagged as duplicates

### Pitfall 2: Orphan Detection Performance
**What goes wrong:** Orphan detection query becomes slow with many signals
**Why it happens:** Complex NOT EXISTS subqueries on large tables
**How to avoid:**
- Index `signals.status` and `signals.createdAt`
- Limit orphan query to reasonable batch size (50-100)
- Cache orphan count for display
**Warning signs:** Maintenance cron taking > 30 seconds

### Pitfall 3: Archival Without Notification
**What goes wrong:** Users surprised to find signals missing
**Why it happens:** Auto-archival without clear communication
**How to avoid:**
- Default auto-archival to OFF
- Always notify before bulk archival
- Provide easy "show archived" toggle in UI
**Warning signs:** Support requests about "missing" signals

### Pitfall 4: Merge Destroys Links
**What goes wrong:** Merging duplicates loses project/persona links
**Why it happens:** Secondary signal links not transferred
**How to avoid:**
- Transfer all links from secondary to primary
- Handle duplicate links gracefully (skip, don't error)
- Log everything in activity log
**Warning signs:** Projects lose signal count after merge

### Pitfall 5: Provenance Loss on Archive
**What goes wrong:** Can't trace decisions back to archived signals
**Why it happens:** Archive hides signals from project views
**How to avoid:**
- Junction table links preserved (just signal status changes)
- PRD citations should still reference archived signals
- Archived signals accessible via filter
**Warning signs:** "Signal not found" errors in project provenance

## Open Questions

1. **Merge vs Archive for Duplicates**
   - What we know: Duplicates should be consolidated
   - What's unclear: Keep both archived, or fully merge content?
   - Recommendation: **Archive secondary**, keep primary with merged links. Preserves history.

2. **Orphan Threshold Default**
   - What we know: Need configurable threshold
   - What's unclear: What's the right default?
   - Recommendation: **14 days default**, allow 7-90 day range. Two weeks is reasonable review window.

3. **Maintenance Notification Frequency**
   - What we know: Don't spam users
   - What's unclear: How often to notify about orphans/duplicates?
   - Recommendation: **Daily digest** not per-item notifications. Consolidate into single daily summary.

4. **Auto-Archive Behavior**
   - What we know: Linked signals eventually become historical
   - What's unclear: Should this be automatic?
   - Recommendation: **Off by default**, manual trigger preferred. Too aggressive can lose context.

## Sources

### Primary (HIGH confidence)
- `/orchestrator/src/lib/db/schema.ts` - Signal schema with status lifecycle
- `/orchestrator/src/lib/classification/clustering.ts` - Semantic similarity patterns
- `/orchestrator/src/lib/automation/signal-automation.ts` - Cron job patterns
- `/orchestrator/src/lib/automation/rate-limiter.ts` - Action tracking patterns
- `/orchestrator/src/lib/notifications/threshold-filter.ts` - Notification patterns

### Secondary (MEDIUM confidence)
- [CRM Data Hygiene: 2026 Best Practice Guide](https://www.default.com/post/crm-data-hygiene) - Data hygiene patterns
- [Orphaned Data Detection and Management Framework](https://dev3lop.com/orphaned-data-detection-and-management-framework/) - Orphan detection patterns
- [Understanding Soft Delete and Hard Delete](https://surajsinghbisht054.medium.com/understanding-soft-delete-and-hard-delete-in-software-development-best-practices-and-importance-539a935d71b5) - Archival best practices
- [A threshold-based similarity measure for duplicate detection](https://www.researchgate.net/publication/261240298_A_threshold-based_similarity_measure_for_duplicate_detection) - Duplicate detection thresholds
- [Data Archival Strategy Guide 2025](https://www.bizdata360.com/data-archival-strategy-guide-2025/) - Archival workflow patterns

### Tertiary (LOW confidence)
- [Audit Trails and Explainability for Compliance](https://lawrence-emenike.medium.com/audit-trails-and-explainability-for-compliance-building-the-transparency-layer-financial-services-d24961bad987) - Provenance preservation patterns
- [Beyond Garbage Collection: Tackling Orphaned Datasets](https://www.ascend.io/blog/beyond-garbage-collection-tackling-the-challenge-of-orphaned-datasets) - Orphan management strategies

## Implementation Readiness

| Requirement | Research Finding | Implementation Gap | Risk |
|-------------|------------------|-------------------|------|
| MAINT-01: Cleanup suggestions | Extend Phase 17 suggestions with higher-confidence matches | New query function + UI component | LOW |
| MAINT-02: Orphan detection | Query unlinked signals older than N days | New detector module + cron integration | LOW |
| MAINT-03: Duplicate detection | pgvector with 0.9+ similarity threshold | New detector + merge workflow + UI | MEDIUM |
| MAINT-04: Archival workflow | Soft delete via status change | New archive API + activity logging | LOW |

**MAINT-03 is MEDIUM risk** - duplicate detection at high thresholds may still have false positives, and merge workflow needs careful UX design.

**No blocking gaps identified.** Ready for planning.

## Metadata

**Confidence breakdown:**
- Orphan detection: HIGH - Simple query on existing schema
- Duplicate detection: HIGH - Extends existing pgvector infrastructure
- Archival workflow: HIGH - Uses existing status field
- Cleanup suggestions: HIGH - Extends Phase 17 pattern
- UI patterns: MEDIUM - Need to design maintenance dashboard

**Research date:** 2026-01-23
**Valid until:** 90 days (stable patterns, extends existing infrastructure)
