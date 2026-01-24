# Phase 17: Smart Association - Research

**Researched:** 2026-01-23
**Domain:** AI-suggested signal linking, bulk operations, accept/reject workflows
**Confidence:** HIGH

## Summary

Phase 17 builds on the manual association infrastructure from Phase 12.5 and the classification system from Phase 16 to provide AI-suggested signal linking and bulk operations. The codebase already has:

1. **Complete manual linking infrastructure** - Junction tables (`signalProjects`, `signalPersonas`), API routes (`/api/signals/[id]/projects`), and UI components (`ProjectLinkCombobox`, `LinkedTag`, `SignalPickerModal`)
2. **Classification results stored** - Each signal has a `classification` field (type `SignalClassificationResult`) containing `projectId`, `projectName`, `confidence`, and `isNewInitiative` from Phase 16
3. **Bulk linking pattern established** - `SignalPickerModal` already implements sequential bulk linking with checkbox multi-select
4. **Clustering infrastructure** - `findSignalClusters()` from Phase 16 discovers semantically similar unlinked signals

The main work is:
1. Surfacing AI suggestions from existing classification results
2. Adding accept/reject/modify workflow for suggestions
3. Extending bulk operations to support unlink and respect existing associations

**Primary recommendation:** Use the existing classification results (stored in `signals.classification`) to power suggestions. Display suggestions as a dismissible panel in the signals list view. Extend `SignalPickerModal` pattern for bulk unlink operations.

## Standard Stack

### Core (Already Available)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| drizzle-orm | ^0.45.1 | ORM with relations | Already installed |
| @tanstack/react-query | ^5.90.18 | Data fetching/caching | Already installed |
| @radix-ui/react-dialog | ^2.1.16 | Modal dialogs | Already installed |
| @radix-ui/react-checkbox | via shadcn | Checkbox component | Already installed |
| @radix-ui/react-select | ^2.2.6 | Select dropdowns | Already installed |

### Supporting (Already Available)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| lucide-react | ^0.562.0 | Icons | Already installed |
| motion/react | ^12.26.2 | Animations | Already installed |

**No new packages required.** All functionality leverages existing infrastructure.

## Architecture Patterns

### Recommended Project Structure
```
orchestrator/src/
├── components/signals/
│   ├── SignalSuggestionsBanner.tsx    # NEW: Dismissible banner showing suggested links
│   ├── SuggestionCard.tsx             # NEW: Individual suggestion with accept/reject
│   ├── BulkOperationsToolbar.tsx      # NEW: Toolbar when multiple signals selected
│   ├── BulkLinkModal.tsx              # NEW: Modal for bulk link to specific project
│   ├── BulkUnlinkModal.tsx            # NEW: Modal for bulk unlink confirmation
│   ├── SignalsTable.tsx               # EXTEND: Add checkbox selection column
│   └── SignalRow.tsx                  # EXTEND: Add checkbox for multi-select
├── app/api/signals/
│   ├── suggestions/
│   │   └── route.ts                   # NEW: Get AI suggestions for workspace
│   ├── bulk/
│   │   └── route.ts                   # NEW: Bulk link/unlink operations
│   └── [id]/
│       └── suggestions/
│           └── dismiss/
│               └── route.ts           # NEW: Dismiss suggestion for a signal
```

### Pattern 1: Suggestion Presentation (Inline Banner)
**What:** Display AI suggestions as a collapsible banner above the signals table
**When to use:** When unlinked signals have classification suggestions
**Example:**
```typescript
// SignalSuggestionsBanner.tsx
interface SuggestionsBannerProps {
  workspaceId: string;
}

export function SignalSuggestionsBanner({ workspaceId }: SuggestionsBannerProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  const { data: suggestions } = useQuery({
    queryKey: ["signal-suggestions", workspaceId],
    queryFn: () => fetchSuggestions(workspaceId),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  if (!suggestions?.length || isDismissed) return null;

  return (
    <div className="border border-blue-500/30 rounded-lg bg-blue-500/5 mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="font-medium text-sm">
            AI Suggestions ({suggestions.length})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              setIsDismissed(true);
            }}
          >
            Dismiss All
          </Button>
          <ChevronDown className={cn(
            "w-4 h-4 transition-transform",
            isExpanded && "rotate-180"
          )} />
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-blue-500/20 p-3 space-y-2">
          {suggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.signalId}
              suggestion={suggestion}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

### Pattern 2: Suggestion Card with Accept/Reject
**What:** Individual suggestion showing signal excerpt, suggested project, and confidence
**When to use:** For each AI suggestion in the banner
**Example:**
```typescript
// SuggestionCard.tsx
interface SuggestionCardProps {
  suggestion: {
    signalId: string;
    verbatim: string;
    projectId: string;
    projectName: string;
    confidence: number;
    reason?: string;
  };
  onAccept: (signalId: string, projectId: string) => void;
  onReject: (signalId: string) => void;
}

export function SuggestionCard({ suggestion, onAccept, onReject }: SuggestionCardProps) {
  const confidenceColor = suggestion.confidence >= 0.8
    ? "text-green-400"
    : suggestion.confidence >= 0.6
      ? "text-amber-400"
      : "text-slate-400";

  return (
    <div className="flex items-start gap-3 p-2 rounded-lg bg-muted/30">
      <div className="flex-1 min-w-0">
        <p className="text-sm line-clamp-2 mb-1">{suggestion.verbatim}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Suggested:</span>
          <Badge className="bg-blue-500/20 text-blue-300">
            {suggestion.projectName}
          </Badge>
          <span className={confidenceColor}>
            {Math.round(suggestion.confidence * 100)}% confident
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-green-400 hover:text-green-300"
          onClick={() => onAccept(suggestion.signalId, suggestion.projectId)}
        >
          <Check className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-red-400 hover:text-red-300"
          onClick={() => onReject(suggestion.signalId)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
```

### Pattern 3: Multi-Select Table with Bulk Toolbar
**What:** Add checkbox column to signals table, show toolbar when signals selected
**When to use:** Bulk link/unlink operations
**Example:**
```typescript
// Extend SignalsTable.tsx
const [selectedSignals, setSelectedSignals] = useState<Set<string>>(new Set());

// Add checkbox column to table header
<th className="py-3 px-2 w-10">
  <Checkbox
    checked={selectedSignals.size === signals.length && signals.length > 0}
    indeterminate={selectedSignals.size > 0 && selectedSignals.size < signals.length}
    onCheckedChange={(checked) => {
      if (checked) {
        setSelectedSignals(new Set(signals.map(s => s.id)));
      } else {
        setSelectedSignals(new Set());
      }
    }}
  />
</th>

// Bulk toolbar appears when selection exists
{selectedSignals.size > 0 && (
  <BulkOperationsToolbar
    selectedCount={selectedSignals.size}
    onBulkLink={() => setShowBulkLinkModal(true)}
    onBulkUnlink={() => setShowBulkUnlinkModal(true)}
    onClearSelection={() => setSelectedSignals(new Set())}
  />
)}
```

### Pattern 4: Bulk Link API (Atomic Operation)
**What:** Single API call to link multiple signals to a project
**When to use:** Bulk link operations from toolbar
**Example:**
```typescript
// POST /api/signals/bulk
// Body: { action: "link", signalIds: string[], projectId: string }

export async function POST(request: NextRequest) {
  const { action, signalIds, projectId } = await request.json();

  if (action === "link") {
    // Validate all signals exist and belong to same workspace
    const signalsToLink = await db.query.signals.findMany({
      where: inArray(signals.id, signalIds),
    });

    const workspaceId = signalsToLink[0]?.workspaceId;
    await requireWorkspaceAccess(workspaceId, "member");

    // Filter out already-linked signals
    const existingLinks = await db.query.signalProjects.findMany({
      where: and(
        inArray(signalProjects.signalId, signalIds),
        eq(signalProjects.projectId, projectId)
      ),
    });
    const alreadyLinked = new Set(existingLinks.map(l => l.signalId));
    const toLink = signalIds.filter(id => !alreadyLinked.has(id));

    // Batch insert
    if (toLink.length > 0) {
      await db.insert(signalProjects).values(
        toLink.map(signalId => ({
          signalId,
          projectId,
          linkedBy: userId,
        }))
      );

      // Update signal statuses to "linked"
      await db.update(signals)
        .set({ status: "linked", updatedAt: new Date() })
        .where(and(
          inArray(signals.id, toLink),
          ne(signals.status, "linked")
        ));
    }

    return NextResponse.json({
      success: true,
      linked: toLink.length,
      skipped: alreadyLinked.size,
    });
  }

  if (action === "unlink") {
    // Similar pattern for bulk unlink
  }
}
```

### Pattern 5: Accept Suggestion with Modification
**What:** Allow user to accept suggestion but change the target project
**When to use:** When AI suggestion is close but user wants different project
**Example:**
```typescript
// Extend SuggestionCard with edit mode
const [isEditing, setIsEditing] = useState(false);
const [selectedProjectId, setSelectedProjectId] = useState(suggestion.projectId);

{isEditing ? (
  <div className="flex items-center gap-2">
    <ProjectLinkCombobox
      workspaceId={workspaceId}
      value={selectedProjectId}
      onSelect={setSelectedProjectId}
    />
    <Button
      size="sm"
      onClick={() => {
        onAccept(suggestion.signalId, selectedProjectId);
        setIsEditing(false);
      }}
    >
      Confirm
    </Button>
  </div>
) : (
  <Button
    size="sm"
    variant="ghost"
    onClick={() => setIsEditing(true)}
  >
    <Edit className="w-3 h-3" />
  </Button>
)}
```

### Anti-Patterns to Avoid
- **Auto-linking without user approval:** Phase 17 is about suggestions, not automation (that's Phase 19)
- **Nested modals for bulk operations:** Use single modal with inline project selection
- **Synchronous bulk operations without progress:** Show loading state for each signal in bulk operations
- **Ignoring existing manual links:** Bulk operations must skip already-linked signals

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Bulk selection state | Custom state management | `Set<string>` with useState | Simple, efficient |
| Suggestion fetching | Custom polling | React Query with staleTime | Built-in caching |
| Bulk API atomicity | Sequential API calls | Single batch API endpoint | Database transaction |
| Confidence display | Custom component | Simple percentage + color | Classification already provides 0-1 score |
| Dismiss state | localStorage | Database column `suggestionDismissedAt` | Persists across devices |

**Key insight:** Classification results are already stored. Suggestions are just a filtered view of signals where `classification.projectId` exists but signal isn't linked to that project.

## Common Pitfalls

### Pitfall 1: Stale Suggestions After Link
**What goes wrong:** User accepts suggestion, but it still appears in list
**Why it happens:** Suggestion query not invalidated after link mutation
**How to avoid:** Invalidate `["signal-suggestions", workspaceId]` on accept/reject
**Warning signs:** Suggestions showing for already-linked signals

### Pitfall 2: Bulk Operation Partial Failure
**What goes wrong:** Some signals link but others fail, inconsistent state
**Why it happens:** Sequential operations without transaction
**How to avoid:** Use single API endpoint with database transaction, return summary of results
**Warning signs:** "Linked 3 of 5 signals" errors

### Pitfall 3: Performance on Large Workspaces
**What goes wrong:** Suggestion query is slow for workspaces with many signals
**Why it happens:** Fetching all unlinked signals with classification
**How to avoid:** Limit suggestions to recent signals (last 30 days), paginate
**Warning signs:** Slow page load on signals list

### Pitfall 4: Multi-Select Interferes with Row Click
**What goes wrong:** Clicking row selects it instead of opening detail
**Why it happens:** Click event bubbles from checkbox
**How to avoid:** Stop propagation on checkbox click, use distinct click zones
**Warning signs:** Can't open signal detail when multi-select enabled

### Pitfall 5: Bulk Unlink Destroys Manual Associations
**What goes wrong:** User bulk unlinks and accidentally removes their manual links
**Why it happens:** No distinction between AI-suggested and manual links
**How to avoid:** Show confirmation with count of manual vs auto links being removed
**Warning signs:** User complaints about lost work

### Pitfall 6: Classification Not Fresh
**What goes wrong:** Suggestions based on old classification, projects have changed
**Why it happens:** Classification runs once at signal ingestion, not updated
**How to avoid:** Add "Refresh suggestions" button that re-runs classification for unlinked signals
**Warning signs:** Suggestions to projects that no longer exist or are archived

## Code Examples

### Suggestions API Query
```typescript
// orchestrator/src/app/api/signals/suggestions/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");

  await requireWorkspaceAccess(workspaceId!, "viewer");

  // Get unlinked signals with classification suggesting a project
  const suggestions = await db.execute(sql`
    SELECT
      s.id as signal_id,
      s.verbatim,
      s.source,
      s.classification->>'projectId' as project_id,
      s.classification->>'projectName' as project_name,
      (s.classification->>'confidence')::float as confidence,
      s.classification->>'reason' as reason
    FROM signals s
    LEFT JOIN signal_projects sp ON s.id = sp.signal_id
      AND sp.project_id = s.classification->>'projectId'
    WHERE s.workspace_id = ${workspaceId}
      AND s.classification->>'projectId' IS NOT NULL
      AND s.classification->>'isNewInitiative' != 'true'
      AND sp.id IS NULL
      AND s.suggestion_dismissed_at IS NULL
      AND s.created_at > NOW() - INTERVAL '30 days'
    ORDER BY (s.classification->>'confidence')::float DESC
    LIMIT 20
  `);

  return NextResponse.json({ suggestions: suggestions.rows });
}
```

### Bulk Operations Toolbar
```typescript
// orchestrator/src/components/signals/BulkOperationsToolbar.tsx
interface BulkOperationsToolbarProps {
  selectedCount: number;
  onBulkLink: () => void;
  onBulkUnlink: () => void;
  onClearSelection: () => void;
}

export function BulkOperationsToolbar({
  selectedCount,
  onBulkLink,
  onBulkUnlink,
  onClearSelection,
}: BulkOperationsToolbarProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg mb-4">
      <span className="text-sm font-medium">
        {selectedCount} signal{selectedCount !== 1 ? "s" : ""} selected
      </span>
      <div className="h-4 w-px bg-border" />
      <Button
        size="sm"
        variant="outline"
        onClick={onBulkLink}
        className="gap-1"
      >
        <Link2 className="w-3 h-3" />
        Link to Project
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={onBulkUnlink}
        className="gap-1 text-red-400 hover:text-red-300"
      >
        <Unlink className="w-3 h-3" />
        Unlink
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={onClearSelection}
      >
        Clear Selection
      </Button>
    </div>
  );
}
```

### Bulk Link Modal
```typescript
// orchestrator/src/components/signals/BulkLinkModal.tsx
interface BulkLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSignalIds: string[];
  workspaceId: string;
}

export function BulkLinkModal({
  isOpen,
  onClose,
  selectedSignalIds,
  workspaceId,
}: BulkLinkModalProps) {
  const [projectId, setProjectId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const bulkLinkMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/signals/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "link",
          signalIds: selectedSignalIds,
          projectId,
        }),
      });
      if (!res.ok) throw new Error("Bulk link failed");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["signals"] });
      queryClient.invalidateQueries({ queryKey: ["signal-suggestions"] });
      onClose();
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            Link {selectedSignalIds.length} Signal{selectedSignalIds.length !== 1 ? "s" : ""}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Select Project</Label>
            <ProjectLinkCombobox
              workspaceId={workspaceId}
              onSelect={setProjectId}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Signals already linked to this project will be skipped.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => bulkLinkMutation.mutate()}
            disabled={!projectId || bulkLinkMutation.isPending}
          >
            {bulkLinkMutation.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Link Signals
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Accept Suggestion Mutation
```typescript
// Accept suggestion = link signal to suggested project
const acceptSuggestionMutation = useMutation({
  mutationFn: async ({ signalId, projectId }: { signalId: string; projectId: string }) => {
    const res = await fetch(`/api/signals/${signalId}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        linkReason: "AI-suggested association accepted by user",
      }),
    });
    if (!res.ok) throw new Error("Failed to link");
    return res.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["signal-suggestions", workspaceId] });
    queryClient.invalidateQueries({ queryKey: ["signals"] });
  },
});

// Reject suggestion = dismiss for this signal
const rejectSuggestionMutation = useMutation({
  mutationFn: async (signalId: string) => {
    const res = await fetch(`/api/signals/${signalId}/suggestions/dismiss`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to dismiss");
    return res.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["signal-suggestions", workspaceId] });
  },
});
```

### Schema Addition for Dismiss State
```typescript
// Add to signals table in schema.ts
suggestionDismissedAt: timestamp("suggestion_dismissed_at"),
suggestionDismissedBy: text("suggestion_dismissed_by").references(() => users.id, { onDelete: "set null" }),
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Full refresh after bulk operations | Query invalidation | Current | Instant UI updates |
| Sequential API calls for bulk | Single atomic API | Current best practice | Consistency, performance |
| Auto-accept AI suggestions | User accept/reject flow | User control emphasis | Better trust calibration |
| Always show suggestions | Dismissible with memory | UX best practice | Reduced noise |

**Current in codebase:**
- Classification results already stored (Phase 16)
- Sequential bulk linking in `SignalPickerModal` - works but upgrade to atomic API for Phase 17
- No dismiss state for suggestions - add `suggestionDismissedAt` column

## Open Questions

1. **Suggestion Refresh Policy**
   - What we know: Classification runs at signal ingestion
   - What's unclear: Should suggestions auto-refresh when projects change?
   - Recommendation: **Manual refresh button** for v1, consider background refresh in Phase 19

2. **Bulk Operation Limit**
   - What we know: Sequential linking in SignalPickerModal handles ~10-20 signals
   - What's unclear: What's the practical limit for atomic bulk operations?
   - Recommendation: **Limit to 50 signals per operation**, show warning for larger selections

3. **Confidence Threshold for Suggestions**
   - What we know: Classification has 0.75/0.50 thresholds
   - What's unclear: What confidence level should trigger showing a suggestion?
   - Recommendation: **Show suggestions > 0.50 confidence**, sort by confidence descending

4. **Suggestion UI Placement**
   - What we know: Banner above table is one option
   - What's unclear: Should suggestions be inline per-signal or aggregated?
   - Recommendation: **Aggregated banner** for v1, can add inline badges later

## Codebase Integration Points

### Existing Infrastructure to Leverage

| Component | Location | How to Use |
|-----------|----------|------------|
| Classification results | `signals.classification` | Query for suggestions |
| Manual linking API | `/api/signals/[id]/projects` | Reuse for accept suggestion |
| Checkbox component | `@/components/ui/checkbox` | Multi-select in table |
| ProjectLinkCombobox | `@/components/signals/ProjectLinkCombobox` | Bulk link target selection |
| SignalPickerModal | `@/components/projects/SignalPickerModal` | Pattern for bulk selection UI |
| LinkedTag | `@/components/signals/LinkedTag` | Consistent tag styling |
| SignalsTable | `@/components/signals/SignalsTable` | Extend with selection |

### Required Schema Changes

```sql
-- Migration for Phase 17
ALTER TABLE signals ADD COLUMN suggestion_dismissed_at TIMESTAMP;
ALTER TABLE signals ADD COLUMN suggestion_dismissed_by TEXT REFERENCES users(id) ON DELETE SET NULL;
```

### API Endpoints to Create

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/signals/suggestions` | GET | Get AI suggestions for workspace |
| `/api/signals/bulk` | POST | Bulk link/unlink operations |
| `/api/signals/[id]/suggestions/dismiss` | POST | Dismiss suggestion for signal |

## Sources

### Primary (HIGH confidence)
- `/orchestrator/src/components/signals/SignalDetailModal.tsx` - Current linking UI pattern
- `/orchestrator/src/components/projects/SignalPickerModal.tsx` - Bulk selection pattern
- `/orchestrator/src/lib/classification/classifier.ts` - Classification result structure
- `/orchestrator/src/lib/db/schema.ts` - Junction tables, classification types
- `/orchestrator/src/app/api/signals/[id]/projects/route.ts` - Link/unlink API pattern

### Secondary (MEDIUM confidence)
- Phase 12.5 RESEARCH.md - Manual association patterns
- Phase 16 RESEARCH.md - Classification architecture

### Tertiary (LOW confidence)
- None - all findings verified from codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new dependencies, all existing
- Architecture: HIGH - Patterns directly extend existing code
- API patterns: HIGH - Follow established route conventions
- UI patterns: HIGH - Extend existing components
- Bulk operations: MEDIUM - New pattern, needs validation

**Research date:** 2026-01-23
**Valid until:** 90 days (stable patterns, no external dependencies)

---

## Implementation Readiness

| Requirement | Research Finding | Implementation Gap | Risk |
|-------------|------------------|-------------------|------|
| ASSC-06: Bulk link/unlink signals | Extend SignalPickerModal pattern with atomic API | New bulk API endpoint needed | LOW |
| Suggest relevant projects | Classification already provides suggestions | Need suggestions query + UI | LOW |
| Accept/reject AI suggestions | Reuse existing link API + add dismiss | Add dismiss column + API | LOW |
| Respect existing manual associations | Filter existing links in bulk operations | Logic in bulk API | LOW |

**No blocking gaps identified.** Ready for planning.
