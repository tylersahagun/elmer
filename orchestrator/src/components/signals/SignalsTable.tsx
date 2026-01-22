"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, ChevronUp, ChevronDown, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SignalFilters } from "./SignalFilters";
import { SignalRow } from "./SignalRow";

interface Signal {
  id: string;
  verbatim: string;
  interpretation?: string | null;
  status: "new" | "reviewed" | "linked" | "archived";
  source: string;
  severity?: string | null;
  createdAt: string;
}

interface SignalsResponse {
  signals: Signal[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface SignalsTableProps {
  workspaceId: string;
  onViewSignal: (signal: Signal) => void;
  onCreateSignal: () => void;
}

type SortField = "createdAt" | "status" | "source" | "severity" | "verbatim";
type SortOrder = "asc" | "desc";

export function SignalsTable({
  workspaceId,
  onViewSignal,
  onCreateSignal,
}: SignalsTableProps) {
  const queryClient = useQueryClient();

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

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, source, dateFrom, dateTo]);

  // Fetch signals
  const { data, isLoading, isError } = useQuery<SignalsResponse>({
    queryKey: [
      "signals",
      workspaceId,
      debouncedSearch,
      status,
      source,
      dateFrom,
      dateTo,
      page,
      pageSize,
      sortBy,
      sortOrder,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({ workspaceId });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (status && status !== "all") params.set("status", status);
      if (source && source !== "all") params.set("source", source);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);

      const res = await fetch(`/api/signals?${params}`);
      if (!res.ok) throw new Error("Failed to load signals");
      return res.json();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/signals/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["signals", workspaceId] });
    },
  });

  // Handle column sort
  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // Sort indicator component
  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? (
      <ChevronUp className="inline w-4 h-4 ml-1" />
    ) : (
      <ChevronDown className="inline w-4 h-4 ml-1" />
    );
  };

  const signals = data?.signals || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
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
        <Button
          onClick={onCreateSignal}
          size="sm"
          className="gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Signal
        </Button>
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

      {/* Table */}
      {!isLoading && !isError && signals.length > 0 && (
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th
                    className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("verbatim")}
                  >
                    Verbatim
                    <SortIndicator field="verbatim" />
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("status")}
                  >
                    Status
                    <SortIndicator field="status" />
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("source")}
                  >
                    Source
                    <SortIndicator field="source" />
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("severity")}
                  >
                    Severity
                    <SortIndicator field="severity" />
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("createdAt")}
                  >
                    Created
                    <SortIndicator field="createdAt" />
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
                    onDelete={(id) => deleteMutation.mutate(id)}
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
    </div>
  );
}
