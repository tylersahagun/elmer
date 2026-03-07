"use client";

import { useState, useEffect } from "react";
import { useConvexAuth, useMutation, useQuery as useConvexQuery } from "convex/react";
import {
  Plus,
  ChevronUp,
  ChevronDown,
  Loader2,
  AlertCircle,
  FolderSync,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { SignalFilters } from "./SignalFilters";
import { SignalRow } from "./SignalRow";
import { BulkOperationsToolbar } from "./BulkOperationsToolbar";
import { BulkLinkModal } from "./BulkLinkModal";
import { BulkUnlinkModal } from "./BulkUnlinkModal";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { canRunConvexQuery } from "@/lib/auth/convex";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

interface Signal {
  id: string;
  verbatim: string;
  interpretation?: string | null;
  status: "new" | "reviewed" | "linked" | "archived";
  source: string;
  severity?: string | null;
  createdAt: string;
  linkedProjects?: Array<{ id: string; name: string }>;
  linkedPersonas?: Array<{ personaId: string }>;
}

interface SyncResult {
  synced: number;
  skipped: number;
  errors: string[];
}

interface SignalsTableProps {
  workspaceId: string;
  onViewSignal: (signal: Signal) => void;
  onCreateSignal: () => void;
}

type SortField = "createdAt" | "status" | "source" | "severity" | "verbatim";
type SortOrder = "asc" | "desc";

function SortIndicator({
  field,
  sortBy,
  sortOrder,
}: {
  field: SortField;
  sortBy: SortField;
  sortOrder: SortOrder;
}) {
  if (sortBy !== field) return null;
  return sortOrder === "asc" ? (
    <ChevronUp className="inline w-4 h-4 ml-1" />
  ) : (
    <ChevronDown className="inline w-4 h-4 ml-1" />
  );
}

export function SignalsTable({
  workspaceId,
  onViewSignal,
  onCreateSignal,
}: SignalsTableProps) {
  const { isLoaded, isSignedIn } = useCurrentUser();
  const { isAuthenticated: isConvexAuthenticated } = useConvexAuth();
  const canLoadConvexData = canRunConvexQuery({
    isClerkLoaded: isLoaded,
    isSignedIn,
    isConvexAuthenticated,
  });
  // Filter state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // Sort state
  const [sortBy, setSortBy] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Selection state
  const [selectedSignals, setSelectedSignals] = useState<Set<string>>(
    new Set(),
  );
  const [showBulkLinkModal, setShowBulkLinkModal] = useState(false);
  const [showBulkUnlinkModal, setShowBulkUnlinkModal] = useState(false);
  const [syncingSignals, setSyncingSignals] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when filters change
  useEffect(() => {
    if (page === 1) return;
    queueMicrotask(() => setPage(1));
  }, [page, debouncedSearch, status, source, dateFrom, dateTo]);

  const rawSignals = useConvexQuery(
    api.signals.list,
    canLoadConvexData
      ? { workspaceId: workspaceId as Id<"workspaces"> }
      : "skip",
  );
  const isLoading = isSignedIn && (!canLoadConvexData || rawSignals === undefined);
  const isError = false;

  const mappedSignals: Signal[] = (rawSignals ?? []).map((signal: {
    _id: string;
    verbatim: string;
    interpretation?: string | null;
    status: string;
    source: string;
    severity?: string | null;
    _creationTime: number;
  }) => ({
    id: signal._id,
    workspaceId,
    verbatim: signal.verbatim,
    interpretation: signal.interpretation ?? null,
    status:
      signal.status === "pending"
        ? "new"
        : signal.status === "assigned"
          ? "linked"
          : (signal.status as Signal["status"]),
    source: signal.source,
    severity: signal.severity ?? null,
    createdAt: new Date(signal._creationTime).toISOString(),
    linkedProjects: [],
    linkedPersonas: [],
  }));

  const filteredSignals = mappedSignals
    .filter((signal) =>
      debouncedSearch
        ? signal.verbatim.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          (signal.interpretation ?? "").toLowerCase().includes(debouncedSearch.toLowerCase())
        : true,
    )
    .filter((signal) => (status && status !== "all" ? signal.status === status : true))
    .filter((signal) => (source && source !== "all" ? signal.source === source : true))
    .filter((signal) => {
      if (!dateFrom && !dateTo) return true;
      const createdAt = new Date(signal.createdAt).getTime();
      if (dateFrom && createdAt < new Date(dateFrom).getTime()) return false;
      if (dateTo && createdAt > new Date(dateTo).getTime() + 24 * 60 * 60 * 1000) return false;
      return true;
    });

  filteredSignals.sort((a, b) => {
    const direction = sortOrder === "asc" ? 1 : -1;
    const getValue = (signal: Signal) => {
      switch (sortBy) {
        case "status":
          return signal.status;
        case "source":
          return signal.source;
        case "severity":
          return signal.severity ?? "";
        case "verbatim":
          return signal.verbatim;
        case "createdAt":
        default:
          return signal.createdAt;
      }
    };
    return String(getValue(a)).localeCompare(String(getValue(b))) * direction;
  });

  const total = filteredSignals.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (page - 1) * pageSize;
  const signals = filteredSignals.slice(startIndex, startIndex + pageSize);

  // Reset selection when signals change (page change, filter change, etc.)
  useEffect(() => {
    queueMicrotask(() => setSelectedSignals(new Set()));
  }, [signals.length, page, debouncedSearch, status, source, dateFrom, dateTo]);

  // Delete mutation
  const deleteSignal = useMutation(api.signals.remove);

  // Sync signals mutation
  const handleSyncSignals = async () => {
    setSyncingSignals(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/syncSignals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = (await res.json()) as SyncResult | { error?: string };
      if (!res.ok) {
        throw new Error((data as { error?: string }).error || "Failed to sync signals");
      }
      const result = data as SyncResult;
      if (result.synced > 0) {
        toast.success(`Synced ${result.synced} signals from workspace`, {
          description:
            result.skipped > 0 ? `${result.skipped} already existed` : undefined,
        });
      } else if (result.skipped > 0) {
        toast.info("All signals already synced", {
          description: `${result.skipped} signals were already in the database`,
        });
      } else {
        toast.info("No signals found to sync", {
          description: "Check that your signals folder contains markdown files",
        });
      }
    } catch (error) {
      toast.error("Failed to sync signals", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setSyncingSignals(false);
    }
  };

  // Handle column sort
  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // Selection handlers
  const toggleSignalSelection = (id: string) => {
    setSelectedSignals((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAllSelection = () => {
    if (selectedSignals.size === signals.length) {
      setSelectedSignals(new Set());
    } else {
      setSelectedSignals(new Set(signals.map((s) => s.id)));
    }
  };

  const clearSelection = () => {
    setSelectedSignals(new Set());
  };

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-blue-400" />
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold">Signals</h2>
            <p className="text-xs text-muted-foreground">
              {total} signal{total !== 1 ? "s" : ""} total
            </p>
          </div>
          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
            {total}
          </Badge>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            onClick={handleSyncSignals}
            size="sm"
            variant="outline"
            className="gap-1.5"
            disabled={syncingSignals}
          >
            {syncingSignals ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FolderSync className="w-3.5 h-3.5" />
            )}
            {syncingSignals ? "Syncing..." : "Sync from Workspace"}
          </Button>
          <Button onClick={onCreateSignal} size="sm" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Add Signal
          </Button>
        </div>
      </div>

      {/* Filters */}
      <SignalFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        source={source}
        onSourceChange={setSource}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
      />

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Failed to load signals</h3>
          <p className="text-sm text-muted-foreground">
            Please try refreshing the page.
          </p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && signals.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border rounded-lg">
          <AlertCircle className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No signals found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">
            {debouncedSearch || status || source || dateFrom || dateTo
              ? "Try adjusting your filters to find what you're looking for."
              : "Get started by adding your first signal."}
          </p>
          {!debouncedSearch && !status && !source && !dateFrom && !dateTo && (
            <Button onClick={onCreateSignal} size="sm" className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Add Signal
            </Button>
          )}
        </div>
      )}

      {/* Bulk Operations Toolbar */}
      {!isLoading &&
        !isError &&
        signals.length > 0 &&
        selectedSignals.size > 0 && (
          <BulkOperationsToolbar
            selectedCount={selectedSignals.size}
            onBulkLink={() => setShowBulkLinkModal(true)}
            onBulkUnlink={() => setShowBulkUnlinkModal(true)}
            onClearSelection={clearSelection}
          />
        )}

      {/* Table */}
      {!isLoading && !isError && signals.length > 0 && (
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="py-3 px-2 w-10">
                    <Checkbox
                      checked={
                        selectedSignals.size === signals.length &&
                        signals.length > 0
                      }
                      onCheckedChange={toggleAllSelection}
                    />
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("verbatim")}
                  >
                    Verbatim
                    <SortIndicator
                      field="verbatim"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                    />
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("status")}
                  >
                    Status
                    <SortIndicator
                      field="status"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                    />
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("source")}
                  >
                    Source
                    <SortIndicator
                      field="source"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Projects
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Personas
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("severity")}
                  >
                    Severity
                    <SortIndicator
                      field="severity"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                    />
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("createdAt")}
                  >
                    Created
                    <SortIndicator
                      field="createdAt"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {signals.map((signal) => (
                  <SignalRow
                    key={signal.id}
                    signal={signal}
                    onView={onViewSignal}
                    onDelete={(id) => deleteSignal({ signalId: id as Id<"signals"> })}
                    isSelected={selectedSignals.has(signal.id)}
                    onToggleSelect={toggleSignalSelection}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
            <p className="text-sm text-muted-foreground">
              Showing {startItem}-{endItem} of {total}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Modals */}
      <BulkLinkModal
        isOpen={showBulkLinkModal}
        onClose={() => setShowBulkLinkModal(false)}
        selectedSignalIds={Array.from(selectedSignals)}
        workspaceId={workspaceId}
        onSuccess={clearSelection}
      />
      <BulkUnlinkModal
        isOpen={showBulkUnlinkModal}
        onClose={() => setShowBulkUnlinkModal(false)}
        selectedSignalIds={Array.from(selectedSignals)}
        workspaceId={workspaceId}
        onSuccess={clearSelection}
      />
    </div>
  );
}
