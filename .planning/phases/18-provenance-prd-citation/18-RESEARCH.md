# Phase 18: Provenance & PRD Citation - Research

**Researched:** 2026-01-23
**Domain:** Signal-to-project provenance, PRD citation, evidence display, project creation from clusters
**Confidence:** HIGH

## Summary

Phase 18 completes the signal-to-project integration by making linked signals visible as evidence throughout the product. The codebase already has:

1. **Complete junction table infrastructure** - `signalProjects` and `signalPersonas` tables with `linkReason`, `confidence`, and `linkedBy` fields (Phase 11, 12.5)
2. **Working project detail page with LinkedSignalsSection** - Collapsible section showing linked signals with verbatim, source badges, and unlink capability (Phase 12.5)
3. **PRD generation via prd-executor.ts** - Uses research documents and company context to generate PRDs (existing)
4. **Signal clustering via /synthesize** - Discovers semantically similar unlinked signals with themes and suggested actions (Phase 16)
5. **Project cards with document/prototype counts** - Footer already shows icon+count badges (existing)

The main work is:
1. **Enhancing LinkedSignalsSection** - Rename to "Signals that informed this project", improve provenance display
2. **Modifying PRD generator** - Inject signal citations as evidence into PRD content
3. **Create project from cluster** - New flow from /synthesize results to project creation with bulk signal linking
4. **Add signal count badge to ProjectCard** - Mirror existing document/prototype count pattern

**Primary recommendation:** Extend existing patterns rather than building new. The infrastructure is complete - this phase is primarily UI enhancements and wiring.

## Standard Stack

### Core (Already Available)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| drizzle-orm | ^0.45.1 | ORM with relations | Already installed |
| @tanstack/react-query | ^5.90.18 | Data fetching/caching | Already installed |
| @anthropic-ai/sdk | ^0.71.2 | LLM for PRD generation | Already installed |
| lucide-react | ^0.562.0 | Icons (including MessageSquare for signals) | Already installed |
| motion/react | ^12.26.2 | Animations | Already installed |

### Supporting (Already Available)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| @radix-ui/react-dialog | ^2.1.16 | Modal dialogs | Already installed |
| @radix-ui/react-scroll-area | ^1.2.10 | Scrollable containers | Already installed |

**No new packages required.** All functionality leverages existing infrastructure.

## Architecture Patterns

### Recommended Project Structure
```
orchestrator/src/
├── components/
│   ├── projects/
│   │   ├── LinkedSignalsSection.tsx   # ENHANCE: Rename, improve provenance display
│   │   ├── SignalPickerModal.tsx      # EXISTING: Used for linking
│   │   └── CreateProjectFromClusterModal.tsx  # NEW: Create project from cluster
│   ├── signals/
│   │   └── ClusterCard.tsx            # ENHANCE: Add "Create Project" action
│   └── kanban/
│       └── ProjectCard.tsx            # ENHANCE: Add signal count badge
├── app/api/
│   ├── projects/
│   │   ├── [id]/
│   │   │   └── signals/
│   │   │       └── route.ts           # EXISTING: GET linked signals
│   │   └── from-cluster/
│   │       └── route.ts               # NEW: Create project from cluster
│   └── signals/
│       └── synthesize/
│           └── route.ts               # EXISTING: Find clusters
└── lib/
    └── execution/
        └── stage-executors/
            └── prd-executor.ts        # ENHANCE: Inject signal citations
```

### Pattern 1: Enhanced Provenance Display
**What:** Show "Signals that informed this project" with immutable provenance chain
**When to use:** Project detail page evidence section
**Example:**
```typescript
// LinkedSignalsSection.tsx - enhanced version
interface LinkedSignal {
  id: string;
  verbatim: string;
  source: string;
  severity?: string | null;
  linkedAt: string;
  linkedBy?: {
    id: string;
    name: string | null;
  } | null;
  linkReason?: string | null;
  confidence?: number | null; // AI confidence if auto-linked
}

export function LinkedSignalsSection({
  projectId,
  workspaceId,
  onOpenPicker,
}: LinkedSignalsSectionProps) {
  // ... existing state ...

  return (
    <div className="border border-border rounded-lg bg-card/50">
      {/* Header with descriptive title */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors rounded-t-lg"
      >
        <div className="flex items-center gap-2">
          <ChevronRight className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-90")} />
          <span className="font-medium text-sm">
            Signals that informed this project ({isLoading ? "..." : count})
          </span>
        </div>
        {/* ... Link Signals button ... */}
      </button>

      {/* Expanded content with provenance details */}
      {isExpanded && (
        <div className="border-t border-border p-3 space-y-2">
          {signals.map((signal) => (
            <div key={signal.id} className="group flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30">
              <div className="flex-1 min-w-0">
                {/* Verbatim quote */}
                <p className="text-sm line-clamp-2 italic">&ldquo;{signal.verbatim}&rdquo;</p>

                {/* Provenance metadata */}
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge className={cn("text-[10px]", SOURCE_COLORS[signal.source])}>
                    {signal.source}
                  </Badge>
                  {signal.severity && (
                    <Badge className={cn("text-[10px]", SEVERITY_COLORS[signal.severity])}>
                      {signal.severity}
                    </Badge>
                  )}

                  {/* Link provenance */}
                  <span className="text-[10px] text-muted-foreground">
                    Linked {new Date(signal.linkedAt).toLocaleDateString()}
                    {signal.linkedBy?.name && ` by ${signal.linkedBy.name}`}
                    {signal.confidence && ` (${Math.round(signal.confidence * 100)}% AI confidence)`}
                  </span>

                  {/* Link reason if provided */}
                  {signal.linkReason && (
                    <span className="text-[10px] text-muted-foreground italic">
                      - {signal.linkReason}
                    </span>
                  )}
                </div>
              </div>
              {/* ... actions ... */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Pattern 2: PRD Citation Injection
**What:** Automatically cite linked signals as evidence in generated PRDs
**When to use:** PRD stage executor
**Example:**
```typescript
// prd-executor.ts - enhanced with signal citations
import { db } from "@/lib/db";
import { signalProjects, signals } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function executePRD(
  context: StageContext,
  callbacks: StreamCallback
): Promise<StageExecutionResult> {
  const { run, project, documents: existingDocs } = context;

  // ... existing context loading ...

  // NEW: Fetch linked signals for evidence section
  callbacks.onProgress(0.15, "Loading signal evidence...");
  const linkedSignals = await db
    .select({
      verbatim: signals.verbatim,
      source: signals.source,
      severity: signals.severity,
      frequency: signals.frequency,
      interpretation: signals.interpretation,
    })
    .from(signalProjects)
    .innerJoin(signals, eq(signalProjects.signalId, signals.id))
    .where(eq(signalProjects.projectId, project.id))
    .limit(10); // Top 10 signals for PRD context

  // Build evidence section for PRD prompt
  const evidenceSection = linkedSignals.length > 0
    ? `## User Evidence (${linkedSignals.length} signals)

The following user feedback signals informed this PRD:

${linkedSignals.map((s, i) => `${i + 1}. **[${s.source}${s.severity ? `, ${s.severity}` : ''}]** "${s.verbatim.slice(0, 200)}${s.verbatim.length > 200 ? '...' : ''}"${s.interpretation ? `\n   _Interpretation: ${s.interpretation}_` : ''}`).join('\n\n')}

These signals should be referenced as evidence for problem statements and requirements.
`
    : '';

  // Enhanced PRD system prompt with citation instructions
  const enhancedSystemPrompt = `${PRD_SYSTEM_PROMPT}

## Citation Requirements
When writing the PRD, cite the provided user evidence:
- Reference specific signals in the Problem Statement section
- Use signal quotes to support requirements
- Include a "User Evidence" or "Supporting Signals" section that lists the signals that informed key decisions
`;

  // Build base prompt with evidence
  const basePrompt = `Project: ${project.name}
${project.description ? `Description: ${project.description}` : ""}

${companyContext ? `## Company Context\n${companyContext}\n` : ""}

${evidenceSection}

## Research
${researchDoc.content}`;

  // ... rest of PRD generation ...
}
```

### Pattern 3: Signal Count Badge on Project Cards
**What:** Display linked signal count alongside document/prototype counts
**When to use:** Kanban project cards
**Example:**
```typescript
// ProjectCard.tsx footer enhancement
import { MessageSquare, FileText, Layers } from "lucide-react";

// Add to ProjectCardType interface in store.ts
interface ProjectCardType {
  // ... existing fields ...
  signalCount?: number; // NEW: linked signal count
}

// In ProjectCard component footer
<div className="flex items-center gap-2 text-xs text-muted-foreground">
  {/* Existing document count */}
  {project.documentCount !== undefined && project.documentCount > 0 && (
    <span className="flex items-center gap-1">
      <FileText className="w-3 h-3" />
      {project.documentCount}
    </span>
  )}

  {/* Existing prototype count */}
  {project.prototypeCount !== undefined && project.prototypeCount > 0 && (
    <span className="flex items-center gap-1">
      <Layers className="w-3 h-3" />
      {project.prototypeCount}
    </span>
  )}

  {/* NEW: Signal count badge */}
  {project.signalCount !== undefined && project.signalCount > 0 && (
    <span className="flex items-center gap-1" title="Linked signals">
      <MessageSquare className="w-3 h-3" />
      {project.signalCount}
    </span>
  )}
</div>
```

### Pattern 4: Create Project from Cluster
**What:** Create new project and bulk-link all signals in a cluster
**When to use:** /synthesize results, when cluster suggests "new_project" action
**Example:**
```typescript
// POST /api/projects/from-cluster
export async function POST(request: NextRequest) {
  const { workspaceId, clusterId, signalIds, name, description } = await request.json();

  await requireWorkspaceAccess(workspaceId, "member");

  // Create project
  const projectId = `proj_${nanoid()}`;
  const now = new Date();

  await db.insert(projects).values({
    id: projectId,
    workspaceId,
    name,
    description,
    stage: "inbox",
    status: "active",
    createdAt: now,
    updatedAt: now,
  });

  // Bulk link all signals from cluster
  if (signalIds && signalIds.length > 0) {
    await db.insert(signalProjects).values(
      signalIds.map((signalId: string) => ({
        signalId,
        projectId,
        linkedBy: userId,
        linkReason: `Created from signal cluster: ${clusterId}`,
        confidence: null, // User-initiated, not AI
      }))
    );

    // Update signal statuses to "linked"
    await db.update(signals)
      .set({ status: "linked", updatedAt: now })
      .where(inArray(signals.id, signalIds));
  }

  return NextResponse.json({
    success: true,
    projectId,
    linkedSignals: signalIds?.length || 0,
  });
}

// CreateProjectFromClusterModal.tsx
interface CreateProjectFromClusterModalProps {
  isOpen: boolean;
  onClose: () => void;
  cluster: SignalCluster;
  workspaceId: string;
}

export function CreateProjectFromClusterModal({
  isOpen,
  onClose,
  cluster,
  workspaceId,
}: CreateProjectFromClusterModalProps) {
  const [name, setName] = useState(cluster.theme);
  const [description, setDescription] = useState("");
  const queryClient = useQueryClient();
  const router = useRouter();

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/projects/from-cluster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          clusterId: cluster.id,
          signalIds: cluster.signals.map(s => s.id),
          name,
          description,
        }),
      });
      if (!res.ok) throw new Error("Failed to create project");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["signals"] });
      onClose();
      router.push(`/projects/${data.projectId}`);
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Project from Cluster</DialogTitle>
          <DialogDescription>
            Create a new project and link {cluster.signalCount} signals as evidence.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Project Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
            />
          </div>

          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the initiative..."
              rows={3}
            />
          </div>

          {/* Preview of signals being linked */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">
              Signals to link ({cluster.signalCount})
            </Label>
            <ScrollArea className="h-[150px] border rounded-lg p-2">
              {cluster.signals.slice(0, 5).map((signal, i) => (
                <div key={signal.id} className="text-xs text-muted-foreground py-1">
                  {i + 1}. &ldquo;{signal.verbatim.slice(0, 80)}...&rdquo;
                </div>
              ))}
              {cluster.signalCount > 5 && (
                <div className="text-xs text-muted-foreground italic">
                  ...and {cluster.signalCount - 5} more signals
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={!name.trim() || createMutation.isPending}
          >
            {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Pattern 5: Query for Signal Count in Project List
**What:** Include signal count when fetching projects for kanban
**When to use:** API endpoint that returns projects
**Example:**
```typescript
// Enhanced getProjectsForWorkspace query
export async function getProjectsWithCounts(workspaceId: string) {
  const projectsWithCounts = await db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      stage: projects.stage,
      status: projects.status,
      metadata: projects.metadata,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
      // Count aggregations
      documentCount: sql<number>`(
        SELECT COUNT(*) FROM documents WHERE project_id = ${projects.id}
      )::int`,
      prototypeCount: sql<number>`(
        SELECT COUNT(*) FROM prototypes WHERE project_id = ${projects.id}
      )::int`,
      signalCount: sql<number>`(
        SELECT COUNT(*) FROM signal_projects WHERE project_id = ${projects.id}
      )::int`,
    })
    .from(projects)
    .where(eq(projects.workspaceId, workspaceId))
    .orderBy(desc(projects.updatedAt));

  return projectsWithCounts;
}
```

### Anti-Patterns to Avoid
- **Modifying junction table after creation:** Provenance chain should be immutable - add new links, don't modify existing `linkReason` or `linkedBy`
- **Loading all signals in PRD generation:** Limit to 10-15 most relevant signals to avoid prompt bloat
- **Blocking project creation on signal link:** Create project first, then link signals - partial success is acceptable
- **Calculating counts on every render:** Use SQL COUNT in query, not client-side array.length

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Provenance display | Custom timeline component | Enhanced LinkedSignalsSection | Already has structure |
| Signal citation format | Complex formatting logic | Template literals in prompt | LLM handles formatting |
| Count badges | Custom aggregation | SQL COUNT subqueries | Database handles efficiently |
| Cluster → Project flow | Multi-step wizard | Single modal with preview | Simpler, faster |
| Immutable history | Soft-delete/versioning | Append-only junction table | linkReason/linkedAt preserved |

**Key insight:** The junction table (`signalProjects`) already stores provenance data. This phase is about surfacing it in the UI and PRD generation, not building new data structures.

## Common Pitfalls

### Pitfall 1: Provenance Data Not Populated
**What goes wrong:** Junction table exists but `linkReason`, `linkedBy`, `confidence` are null
**Why it happens:** Phase 12.5 API endpoints don't populate these fields
**How to avoid:** Update link API to accept and store `linkReason`, ensure `linkedBy` comes from session
**Warning signs:** Provenance UI shows "Unknown" for linker

### Pitfall 2: PRD Too Long with Signal Citations
**What goes wrong:** PRD generation fails or is truncated due to context length
**Why it happens:** Too many signals or verbose quotes included
**How to avoid:** Limit to 10 signals, truncate verbatim to 200 chars, summarize if needed
**Warning signs:** Anthropic API errors, truncated PRDs

### Pitfall 3: Signal Count N+1 Queries
**What goes wrong:** Kanban loads slowly with many projects
**Why it happens:** Fetching signal count per-project in loop
**How to avoid:** Use single query with COUNT subquery or JOIN aggregation
**Warning signs:** Slow kanban load, many database connections

### Pitfall 4: Stale Signal Counts After Link/Unlink
**What goes wrong:** Badge shows wrong count until page refresh
**Why it happens:** Missing query invalidation for project queries after signal operations
**How to avoid:** Invalidate `["projects"]` and `["project", projectId]` after link/unlink
**Warning signs:** Count doesn't update after linking

### Pitfall 5: Cluster Project Creation Race Condition
**What goes wrong:** Multiple signals fail to link, or duplicate projects created
**Why it happens:** Concurrent requests or no idempotency
**How to avoid:** Use database transaction for project + signal links, add idempotency key
**Warning signs:** Partial signal linkage, duplicate projects with same cluster theme

### Pitfall 6: Junction Table Modification
**What goes wrong:** Provenance chain becomes unreliable
**Why it happens:** Updating `linkReason` or `linkedAt` on existing records
**How to avoid:** Treat junction table as append-only; to "change" a link, unlink then re-link
**Warning signs:** Historical provenance doesn't match when signal was actually linked

## Code Examples

### API: Get Linked Signals with Provenance
```typescript
// GET /api/projects/[id]/signals - enhanced response
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id: projectId } = await params;

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  await requireWorkspaceAccess(project.workspaceId, "viewer");

  // Fetch signals with full provenance data
  const linkedSignals = await db
    .select({
      id: signals.id,
      verbatim: signals.verbatim,
      source: signals.source,
      severity: signals.severity,
      frequency: signals.frequency,
      interpretation: signals.interpretation,
      linkedAt: signalProjects.linkedAt,
      linkReason: signalProjects.linkReason,
      confidence: signalProjects.confidence,
      linkedBy: {
        id: users.id,
        name: users.name,
      },
    })
    .from(signalProjects)
    .innerJoin(signals, eq(signalProjects.signalId, signals.id))
    .leftJoin(users, eq(signalProjects.linkedBy, users.id))
    .where(eq(signalProjects.projectId, projectId))
    .orderBy(desc(signalProjects.linkedAt));

  return NextResponse.json({ signals: linkedSignals });
}
```

### Store Type Enhancement
```typescript
// lib/store.ts - add signalCount to ProjectCard type
export interface ProjectCard {
  id: string;
  name: string;
  description?: string;
  stage: ProjectStage;
  status: string;
  metadata?: ProjectMetadata;
  createdAt: Date;
  updatedAt: Date;
  // Counts
  documentCount?: number;
  prototypeCount?: number;
  signalCount?: number;  // NEW
  // Job state
  isLocked?: boolean;
  activeJobId?: string;
  activeJobType?: string;
  activeJobStatus?: string;
  activeJobProgress?: number;
  lastJobError?: string;
}
```

### PRD Evidence Section Template
```typescript
// Template for signal citations in PRD
const formatSignalsForPRD = (signals: LinkedSignal[]): string => {
  if (signals.length === 0) return '';

  const citations = signals.map((s, i) => {
    const source = s.source.charAt(0).toUpperCase() + s.source.slice(1);
    const severity = s.severity ? ` (${s.severity})` : '';
    const quote = s.verbatim.length > 200
      ? s.verbatim.slice(0, 197) + '...'
      : s.verbatim;

    return `[Signal ${i + 1}] **${source}${severity}**: "${quote}"`;
  });

  return `
## Supporting User Evidence

This PRD is informed by ${signals.length} user feedback signal${signals.length === 1 ? '' : 's'}:

${citations.join('\n\n')}

---
`;
};
```

### Synthesize UI Enhancement for Create Project
```typescript
// ClusterCard.tsx - add Create Project action
interface ClusterCardProps {
  cluster: SignalCluster;
  workspaceId: string;
}

export function ClusterCard({ cluster, workspaceId }: ClusterCardProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium">{cluster.theme}</h3>
        <Badge variant="outline">
          {cluster.signalCount} signal{cluster.signalCount !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
        <Badge className={SEVERITY_COLORS[cluster.severity]}>{cluster.severity}</Badge>
        <Badge className={FREQUENCY_COLORS[cluster.frequency]}>{cluster.frequency}</Badge>
        <span>{Math.round(cluster.confidence * 100)}% similarity</span>
      </div>

      {/* Signal preview */}
      <div className="space-y-1 mb-3">
        {cluster.signals.slice(0, 3).map((signal) => (
          <p key={signal.id} className="text-xs text-muted-foreground line-clamp-1">
            &ldquo;{signal.verbatim}&rdquo;
          </p>
        ))}
      </div>

      {/* Actions based on suggested action */}
      <div className="flex items-center gap-2">
        {cluster.suggestedAction === "new_project" && (
          <Button
            size="sm"
            onClick={() => setShowCreateModal(true)}
            className="gap-1"
          >
            <Plus className="w-3 h-3" />
            Create Project
          </Button>
        )}
        <Button size="sm" variant="outline">
          View Signals
        </Button>
      </div>

      {/* Create Project Modal */}
      <CreateProjectFromClusterModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        cluster={cluster}
        workspaceId={workspaceId}
      />
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual evidence tracking | Junction table with provenance | Phase 12.5 | Automated, auditable |
| PRD without user evidence | PRD with signal citations | Phase 18 | Evidence-based decisions |
| Ad-hoc project creation | Cluster-to-project workflow | Phase 18 | Pattern discovery → action |
| Document-only counts | Document + prototype + signal counts | Phase 18 | Full project health view |

**Current in codebase:**
- LinkedSignalsSection exists but shows minimal provenance
- prd-executor.ts generates PRD but doesn't use linked signals
- /synthesize finds clusters but doesn't have "create project" action
- ProjectCard shows document/prototype counts but not signals

## Open Questions

1. **Citation Format in PRD**
   - What we know: Signals should be cited as evidence
   - What's unclear: Inline citations vs appendix section vs both?
   - Recommendation: **Appendix section** for v1, with inline references to signal numbers

2. **Signal Selection for PRD**
   - What we know: Can't include all signals (context limit)
   - What's unclear: How to select most relevant signals?
   - Recommendation: **Most recent 10 signals**, prioritize high severity; consider semantic relevance in v2

3. **Provenance Immutability Enforcement**
   - What we know: Junction table should be append-only
   - What's unclear: Should we add database constraints?
   - Recommendation: **API-level enforcement** for v1, consider trigger-based protection in v2

4. **Signal Count Freshness**
   - What we know: React Query handles caching
   - What's unclear: How fresh should counts be on kanban?
   - Recommendation: **Include in project fetch**, invalidate on link/unlink operations

## Sources

### Primary (HIGH confidence)
- `/orchestrator/src/components/projects/LinkedSignalsSection.tsx` - Current implementation pattern
- `/orchestrator/src/components/kanban/ProjectCard.tsx` - Badge count pattern
- `/orchestrator/src/lib/execution/stage-executors/prd-executor.ts` - PRD generation pattern
- `/orchestrator/src/lib/classification/clustering.ts` - Cluster structure and actions
- `/orchestrator/src/lib/db/schema.ts` - signalProjects junction table schema
- `/orchestrator/src/app/api/signals/synthesize/route.ts` - Synthesize API pattern

### Secondary (MEDIUM confidence)
- Phase 12.5 RESEARCH.md - Junction table patterns
- Phase 16 RESEARCH.md - Clustering architecture
- Phase 17 RESEARCH.md - Bulk operations patterns

### Tertiary (LOW confidence)
- None - all findings verified from codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new dependencies, all existing
- Provenance display: HIGH - Extend existing LinkedSignalsSection
- PRD citation: MEDIUM - New prompt enhancement, may need tuning
- Create from cluster: HIGH - Follows established patterns
- Signal count badge: HIGH - Mirrors existing document/prototype pattern

**Research date:** 2026-01-23
**Valid until:** 90 days (stable patterns, no external dependencies)

---

## Implementation Readiness

| Requirement | Research Finding | Implementation Gap | Risk |
|-------------|------------------|-------------------|------|
| PROV-01: Signals visible on project page | LinkedSignalsSection exists | Enhance with provenance details | LOW |
| PROV-02: "Signals that informed" section | Same component, rename header | Minor text change | LOW |
| PROV-03: Immutable provenance chain | Junction table has linkReason, linkedAt | Ensure API populates these fields | LOW |
| PROV-04: PRD auto-cite signals | prd-executor.ts exists | Add signal fetch and prompt injection | MEDIUM |
| PROV-05: Create project from cluster | /synthesize exists | Add create-from-cluster API + modal | LOW |
| PROV-06: Signal count badge | ProjectCard has count badges | Add signalCount to query and display | LOW |

**PRD citation is MEDIUM risk** - may need prompt tuning to get good citation format.

**No blocking gaps identified.** Ready for planning.
