# Phase 12: Signal Management UI - Research

**Researched:** 2026-01-22
**Domain:** React Data Management UI (Table, Forms, Search, Filters)
**Confidence:** HIGH

## Summary

This phase implements a signal management interface allowing users to view, search, filter, and manually create signals. The research confirms the existing codebase provides all necessary primitives - the project already uses TanStack React Query for data fetching, Radix UI primitives with custom dialog/modal components, and follows established patterns for CRUD operations through Next.js API routes with Drizzle ORM queries.

The primary recommendation is to build upon existing patterns rather than introduce new dependencies. The codebase already has:
- `Dialog` component with animations (used for modals)
- `Input`, `Textarea`, `Select` form primitives
- TanStack Query patterns in InboxPanel, search pages
- API route patterns with permission checking
- Drizzle query patterns with filtering and pagination

**Primary recommendation:** Build a custom table component using existing UI primitives (no TanStack Table needed for this scope), implement debounced search with `useEffect` + `setTimeout`, and follow the InboxPanel pattern for CRUD operations with TanStack Query mutations.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already in Project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tanstack/react-query | ^5.90.18 | Data fetching, caching, mutations | Already used throughout codebase |
| @radix-ui/react-dialog | ^1.1.15 | Modal/dialog primitives | Already integrated with motion animations |
| @radix-ui/react-select | ^2.2.6 | Select dropdowns | Already used for form selects |
| drizzle-orm | ^0.45.1 | Database queries with ILIKE, limit, offset | Already configured |
| framer-motion | ^12.26.2 | Animations | Already integrated with Dialog component |

### Supporting (Already in Project)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | ^0.562.0 | Icons | Table actions, status indicators |
| tailwind-merge | ^3.4.0 | Class merging | Conditional styling |
| class-variance-authority | ^0.7.1 | Variant-based styling | Button variants, badge variants |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom table | TanStack Table | TanStack Table is overkill for this use case - no complex virtualization needed, signals table is simple enough |
| useEffect debounce | use-debounce package | Extra dependency for something achievable with 5 lines of code |
| URL state for filters | useState | Per CONTEXT.md decision: "No URL state - filters reset on page load" |

**Installation:**
No new dependencies needed - all required packages already installed.

## Architecture Patterns

### Recommended Project Structure
```
orchestrator/src/
├── app/
│   ├── (dashboard)/
│   │   └── workspace/[id]/
│   │       └── signals/
│   │           └── page.tsx           # Signals page (table + modals)
│   └── api/
│       └── signals/
│           ├── route.ts               # GET (list with filters), POST (create)
│           └── [id]/
│               └── route.ts           # GET (single), PATCH (update), DELETE
├── components/
│   └── signals/
│       ├── SignalsTable.tsx           # Main table component
│       ├── SignalDetailModal.tsx      # View/edit signal modal
│       ├── CreateSignalModal.tsx      # Manual signal entry modal
│       ├── SignalFilters.tsx          # Filter controls component
│       └── SignalRow.tsx              # Individual table row
└── lib/
    └── db/
        └── queries.ts                 # Add signal query functions
```

### Pattern 1: Data Fetching with TanStack Query (Existing Pattern)
**What:** Use `useQuery` for fetching lists with filters, `useMutation` for CRUD
**When to use:** All data operations
**Example:**
```typescript
// Source: orchestrator/src/components/inbox/InboxPanel.tsx (existing pattern)
const { data: signals, isLoading } = useQuery<Signal[]>({
  queryKey: ["signals", workspaceId, filters],
  queryFn: async () => {
    const params = new URLSearchParams({ workspaceId, ...filters });
    const res = await fetch(`/api/signals?${params}`);
    if (!res.ok) throw new Error("Failed to load signals");
    return res.json();
  },
});

const createMutation = useMutation({
  mutationFn: async (data: NewSignal) => {
    const res = await fetch("/api/signals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create signal");
    return res.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["signals", workspaceId] });
  },
});
```

### Pattern 2: Debounced Search (Standard React Pattern)
**What:** Delay search queries until user stops typing
**When to use:** Real-time search as specified in CONTEXT.md
**Example:**
```typescript
// Source: Standard React pattern from research
const [searchTerm, setSearchTerm] = useState("");
const [debouncedSearch, setDebouncedSearch] = useState("");

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(searchTerm);
  }, 300); // 300ms delay

  return () => clearTimeout(timer);
}, [searchTerm]);

// Use debouncedSearch in query key
const { data } = useQuery({
  queryKey: ["signals", workspaceId, debouncedSearch, filters],
  // ...
});
```

### Pattern 3: Modal Form with "Create & Add Another" (From CONTEXT.md)
**What:** Modal stays open after creation, form clears for batch entry
**When to use:** Manual signal entry
**Example:**
```typescript
// Source: Derived from InboxPanel upload pattern + CONTEXT.md requirements
const [keepOpen, setKeepOpen] = useState(false);

const handleSubmit = async () => {
  await createMutation.mutateAsync(formData);
  if (keepOpen) {
    // Clear form but keep modal open
    setFormData(initialFormState);
  } else {
    setIsOpen(false);
  }
};

// Two buttons pattern
<DialogFooter>
  <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
  <Button onClick={() => { setKeepOpen(true); handleSubmit(); }}>
    Create & Add Another
  </Button>
  <Button onClick={() => { setKeepOpen(false); handleSubmit(); }}>
    Create
  </Button>
</DialogFooter>
```

### Pattern 4: Server-Side Filtering with Drizzle (Existing Pattern)
**What:** Build dynamic WHERE clauses with ILIKE for text search
**When to use:** API route handlers for filtered queries
**Example:**
```typescript
// Source: Drizzle ORM docs + existing queries.ts patterns
import { and, or, ilike, eq, gte, lte, desc, asc } from "drizzle-orm";

export async function getSignals(
  workspaceId: string,
  options: {
    search?: string;
    status?: SignalStatus;
    source?: SignalSource;
    dateFrom?: Date;
    dateTo?: Date;
    sortBy?: "createdAt" | "status" | "source";
    sortOrder?: "asc" | "desc";
    page?: number;
    pageSize?: number;
  }
) {
  const conditions: SQL[] = [eq(signals.workspaceId, workspaceId)];

  if (options.search) {
    conditions.push(
      or(
        ilike(signals.verbatim, `%${options.search}%`),
        ilike(signals.interpretation, `%${options.search}%`)
      )
    );
  }
  if (options.status) conditions.push(eq(signals.status, options.status));
  if (options.source) conditions.push(eq(signals.source, options.source));
  if (options.dateFrom) conditions.push(gte(signals.createdAt, options.dateFrom));
  if (options.dateTo) conditions.push(lte(signals.createdAt, options.dateTo));

  const orderFn = options.sortOrder === "asc" ? asc : desc;
  const orderColumn = signals[options.sortBy || "createdAt"];

  const page = options.page || 1;
  const pageSize = options.pageSize || 20;

  return db.query.signals.findMany({
    where: and(...conditions),
    orderBy: [orderFn(orderColumn)],
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });
}
```

### Anti-Patterns to Avoid
- **Client-side filtering of large datasets:** Always filter on server with ILIKE
- **Creating new state management:** Use TanStack Query - don't add Zustand stores for this
- **Nested modals:** Per UX research, avoid modals within modals
- **Uncontrolled form inputs with value prop:** Use defaultValue or controlled pattern consistently
- **Missing debounce on search:** Will cause excessive API calls and poor UX

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modal animations | Custom CSS transitions | Existing `Dialog` component | Already has framer-motion integration |
| Select dropdowns | Native `<select>` | `@radix-ui/react-select` | Accessibility, styling consistency |
| Data caching | Manual cache | TanStack Query | Handles invalidation, refetch, stale data |
| Permission checks | Custom middleware | `requireWorkspaceAccess()` | Existing pattern in all API routes |
| Form state | useReducer | useState per field | Simple forms don't need complex state |

**Key insight:** The codebase already has all the primitives needed. The work is composition, not creation. Every UI pattern needed exists in InboxPanel, ProjectDetailModal, or the ui/ components.

## Common Pitfalls

### Pitfall 1: Forgetting Query Invalidation After Mutations
**What goes wrong:** Create/update signal but table doesn't refresh
**Why it happens:** Missing `queryClient.invalidateQueries()` in mutation onSuccess
**How to avoid:** Always invalidate related queries after mutations
**Warning signs:** User creates signal, doesn't see it in table

### Pitfall 2: Search Input Re-renders Entire Component
**What goes wrong:** Typing feels laggy, excessive re-renders
**Why it happens:** Search state changes cause full component re-render
**How to avoid:** Isolate search input in its own component with debounce
**Warning signs:** React DevTools shows many re-renders while typing

### Pitfall 3: Missing Loading/Error States
**What goes wrong:** Empty table while loading, silent failures
**Why it happens:** Not handling `isLoading`, `isError` from useQuery
**How to avoid:** Always render loading skeleton and error messages
**Warning signs:** Blank UI during data fetch

### Pitfall 4: Filter State Not Resetting on Page Change
**What goes wrong:** User navigates away and back, old filters still applied
**Why it happens:** Using URL state or persistent storage
**How to avoid:** Per CONTEXT.md - use local useState, filters reset on mount
**Warning signs:** Filters persist unexpectedly

### Pitfall 5: Modal Doesn't Trap Focus
**What goes wrong:** Tab key navigates behind modal
**Why it happens:** Using custom modal without proper focus management
**How to avoid:** Use Radix Dialog which handles focus trapping automatically
**Warning signs:** Accessibility audit failures, keyboard navigation escapes modal

### Pitfall 6: Date Filter Timezone Issues
**What goes wrong:** Filtering by date returns wrong results
**Why it happens:** Date comparisons without timezone normalization
**How to avoid:** Use start-of-day/end-of-day in UTC for date range filters
**Warning signs:** Signals created "today" don't show in "today" filter

## Code Examples

Verified patterns from official sources and existing codebase:

### API Route with Filters (Based on projects/route.ts pattern)
```typescript
// Source: orchestrator/src/app/api/projects/route.ts pattern
import { NextRequest, NextResponse } from "next/server";
import { getSignals, createSignal } from "@/lib/db/queries";
import { requireWorkspaceAccess, handlePermissionError, PermissionError } from "@/lib/permissions";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
    }

    await requireWorkspaceAccess(workspaceId, "viewer");

    const signals = await getSignals(workspaceId, {
      search: searchParams.get("search") || undefined,
      status: searchParams.get("status") as SignalStatus | undefined,
      source: searchParams.get("source") as SignalSource | undefined,
      dateFrom: searchParams.get("dateFrom") ? new Date(searchParams.get("dateFrom")!) : undefined,
      dateTo: searchParams.get("dateTo") ? new Date(searchParams.get("dateTo")!) : undefined,
      page: parseInt(searchParams.get("page") || "1"),
      pageSize: parseInt(searchParams.get("pageSize") || "20"),
      sortBy: searchParams.get("sortBy") as "createdAt" | "status" | "source" | undefined,
      sortOrder: searchParams.get("sortOrder") as "asc" | "desc" | undefined,
    });

    return NextResponse.json(signals);
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to get signals:", error);
    return NextResponse.json({ error: "Failed to get signals" }, { status: 500 });
  }
}
```

### Table Row with Actions (Based on InboxPanel pattern)
```typescript
// Source: Derived from orchestrator/src/components/inbox/InboxPanel.tsx
function SignalRow({ signal, onView, onDelete }: SignalRowProps) {
  return (
    <tr className="border-b border-border hover:bg-muted/30 transition-colors">
      <td className="p-3 max-w-xs truncate">{signal.verbatim}</td>
      <td className="p-3">
        <Badge className={STATUS_COLORS[signal.status]}>{signal.status}</Badge>
      </td>
      <td className="p-3">
        <Badge className={SOURCE_COLORS[signal.source]}>{signal.source}</Badge>
      </td>
      <td className="p-3 text-sm text-muted-foreground">
        {new Date(signal.createdAt).toLocaleDateString()}
      </td>
      <td className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(signal)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(signal.id)} className="text-red-500">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}
```

### Create Signal Form (Based on InboxPanel upload form)
```typescript
// Source: Derived from InboxPanel upload pattern
function CreateSignalForm({ onSuccess, onAddAnother }: CreateSignalFormProps) {
  const [verbatim, setVerbatim] = useState("");
  const [interpretation, setInterpretation] = useState("");
  const [source, setSource] = useState<SignalSource>("paste");

  const isValid = verbatim.trim().length > 0;

  const handleCreate = () => {
    onSuccess({ verbatim, interpretation: interpretation || undefined, source });
  };

  const handleCreateAndAddAnother = () => {
    onAddAnother({ verbatim, interpretation: interpretation || undefined, source });
    // Clear form
    setVerbatim("");
    setInterpretation("");
    setSource("paste");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="verbatim">Feedback (required)</Label>
        <Textarea
          id="verbatim"
          placeholder="Paste or type the user feedback verbatim..."
          value={verbatim}
          onChange={(e) => setVerbatim(e.target.value)}
          rows={4}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="interpretation">Interpretation (optional)</Label>
        <Textarea
          id="interpretation"
          placeholder="What does this feedback really mean?"
          value={interpretation}
          onChange={(e) => setInterpretation(e.target.value)}
          rows={2}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="source">Source</Label>
        <Select value={source} onValueChange={(v) => setSource(v as SignalSource)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="paste">Manual Entry</SelectItem>
            <SelectItem value="interview">Interview</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={handleCreateAndAddAnother} disabled={!isValid}>
          Create & Add Another
        </Button>
        <Button onClick={handleCreate} disabled={!isValid}>
          Create Signal
        </Button>
      </DialogFooter>
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Client-side filtering | Server-side with ILIKE | Standard practice | Better performance at scale |
| Custom fetch hooks | TanStack Query | Widely adopted 2023+ | Built-in caching, refetch, mutations |
| CSS-only modals | Radix primitives | Standard practice | Accessibility, focus management |
| Redux for forms | Local useState | React 18+ | Simpler, no extra dependencies |

**Deprecated/outdated:**
- useEffect for data fetching directly (use TanStack Query instead)
- Lodash debounce in components (use useEffect + setTimeout or useDeferredValue)
- CSS-based modal animations (use framer-motion which is already integrated)

## Open Questions

Things that couldn't be fully resolved:

1. **Total count for pagination display**
   - What we know: Drizzle doesn't return count with findMany
   - What's unclear: Best pattern for "Showing 1-20 of 100"
   - Recommendation: Execute separate count query, or use "Load more" pattern instead of page numbers

2. **Optimistic updates for mutations**
   - What we know: TanStack Query supports optimistic updates
   - What's unclear: Whether the UX benefits justify complexity for this phase
   - Recommendation: Start without optimistic updates; add later if table feels slow

3. **Column visibility customization**
   - What we know: CONTEXT.md says "Claude's discretion" for column selection
   - What's unclear: Whether to persist column preferences
   - Recommendation: Start with sensible defaults (verbatim, status, source, date, actions), defer customization

## Sources

### Primary (HIGH confidence)
- `orchestrator/src/components/inbox/InboxPanel.tsx` - CRUD pattern, mutations, forms
- `orchestrator/src/components/ui/dialog.tsx` - Modal implementation with motion
- `orchestrator/src/app/api/projects/route.ts` - API route pattern with permissions
- `orchestrator/src/lib/db/queries.ts` - Drizzle query patterns
- `orchestrator/src/lib/db/schema.ts` - Signal schema (lines 1129-1290)
- [TanStack Table Sorting Guide](https://tanstack.com/table/latest/docs/guide/sorting)
- [Drizzle ORM Limit/Offset Pagination](https://orm.drizzle.team/docs/guides/limit-offset-pagination)
- [shadcn/ui Data Table](https://ui.shadcn.com/docs/components/data-table)

### Secondary (MEDIUM confidence)
- [Next.js Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route) - Query params pattern
- [Debounce in React](https://www.developerway.com/posts/debouncing-in-react) - useEffect pattern
- [Modal UX Best Practices](https://blog.logrocket.com/ux-design/modal-ux-design-patterns-examples-best-practices/)

### Tertiary (LOW confidence)
- Community patterns for "Save and Add Another" button - limited official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use, patterns verified in codebase
- Architecture: HIGH - Following existing patterns in InboxPanel, API routes
- Pitfalls: HIGH - Based on actual patterns and common React issues

**Research date:** 2026-01-22
**Valid until:** 60 days (stable patterns, mature libraries)
