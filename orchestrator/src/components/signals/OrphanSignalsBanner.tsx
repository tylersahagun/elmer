"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Eye, X, Lightbulb, Link as LinkIcon, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface OrphanSignal {
  id: string;
  verbatim: string;
  source: string;
  createdAt: string;
  daysOrphaned: number;
}

interface ProjectSuggestion {
  projectId: string;
  projectName: string;
  projectDescription: string | null;
  projectStage: string;
  confidence: number;
  reason: string;
}

interface OrphanSignalsBannerProps {
  workspaceId: string;
  className?: string;
}

export function OrphanSignalsBanner({
  workspaceId,
  className,
}: OrphanSignalsBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [expandedSignal, setExpandedSignal] = useState<string | null>(null);
  const [linkingSignalId, setLinkingSignalId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch orphan signals
  const { data: orphanData, isLoading } = useQuery({
    queryKey: ["orphan-signals", workspaceId],
    queryFn: async () => {
      const res = await fetch(
        `/api/signals/orphans?workspaceId=${workspaceId}&limit=5`
      );
      if (!res.ok) throw new Error("Failed to fetch orphan count");
      return res.json() as Promise<{
        signals: OrphanSignal[];
        total: number;
        oldestDays: number;
      }>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch suggestions for expanded signal (MAINT-01)
  const { data: suggestionsData, isLoading: isLoadingSuggestions } = useQuery({
    queryKey: ["signal-suggestions", expandedSignal, workspaceId],
    queryFn: async () => {
      if (!expandedSignal) return null;
      const res = await fetch(
        `/api/signals/${expandedSignal}/suggestions?workspaceId=${workspaceId}`
      );
      if (!res.ok) throw new Error("Failed to fetch suggestions");
      return res.json() as Promise<{
        signalId: string;
        suggestions: ProjectSuggestion[];
        minConfidence: number;
        filteredCount: number;
      }>;
    },
    enabled: !!expandedSignal,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Handle linking signal to project
  const handleLinkSignal = async (signalId: string, projectId: string) => {
    setLinkingSignalId(signalId);
    try {
      const res = await fetch(`/api/signals/${signalId}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          linkReason: "Linked via orphan signal suggestion",
        }),
      });
      if (res.ok) {
        // Refresh orphan data and signals
        queryClient.invalidateQueries({ queryKey: ["orphan-signals", workspaceId] });
        queryClient.invalidateQueries({ queryKey: ["signals", workspaceId] });
        setExpandedSignal(null);
      }
    } finally {
      setLinkingSignalId(null);
    }
  };

  // Don't show if dismissed, loading, or no orphans
  if (dismissed || isLoading || !orphanData || orphanData.total === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 mb-4",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <div>
            <p className="font-medium text-amber-200">
              {orphanData.total} orphan signal{orphanData.total !== 1 ? "s" : ""} need attention
            </p>
            <p className="text-sm text-amber-200/70">
              Signals unlinked for {orphanData.oldestDays}+ days - review or link to projects
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-amber-200 hover:bg-amber-500/20"
            onClick={() => {
              window.location.href = `/workspace/${workspaceId}/signals?status=new&orphans=true`;
            }}
          >
            <Eye className="mr-2 h-4 w-4" />
            Review All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-amber-200/70 hover:bg-amber-500/20"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Orphan signals with suggestions (MAINT-01) */}
      <div className="space-y-2">
        {orphanData.signals.slice(0, 3).map((signal) => (
          <div key={signal.id} className="rounded-md bg-amber-900/20 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-amber-100 line-clamp-2">
                  &ldquo;{signal.verbatim}&rdquo;
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-amber-200/60">
                  <span>{signal.source}</span>
                  <span>-</span>
                  <span>{signal.daysOrphaned} days orphaned</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-amber-200/70 hover:text-amber-200 hover:bg-amber-500/20 shrink-0"
                onClick={() => setExpandedSignal(expandedSignal === signal.id ? null : signal.id)}
              >
                <Lightbulb className="h-4 w-4 mr-1" />
                Suggestions
                {expandedSignal === signal.id ? (
                  <ChevronUp className="h-3 w-3 ml-1" />
                ) : (
                  <ChevronDown className="h-3 w-3 ml-1" />
                )}
              </Button>
            </div>

            {/* Project suggestions dropdown (MAINT-01) */}
            {expandedSignal === signal.id && (
              <div className="mt-3 pt-3 border-t border-amber-500/20">
                {isLoadingSuggestions ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-amber-200/60" />
                    <span className="ml-2 text-xs text-amber-200/60">Loading suggestions...</span>
                  </div>
                ) : suggestionsData?.suggestions && suggestionsData.suggestions.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs text-amber-200/70 font-medium">
                      Suggested projects to link:
                    </p>
                    {suggestionsData.suggestions.map((suggestion) => (
                      <div
                        key={suggestion.projectId}
                        className="flex items-center justify-between gap-2 p-2 rounded bg-amber-900/30"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-amber-100 font-medium truncate">
                            {suggestion.projectName}
                          </p>
                          <p className="text-xs text-amber-200/60">
                            {suggestion.reason}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs border-amber-500/30",
                              suggestion.confidence >= 0.8
                                ? "text-green-400"
                                : suggestion.confidence >= 0.7
                                  ? "text-amber-400"
                                  : "text-yellow-400"
                            )}
                          >
                            {Math.round(suggestion.confidence * 100)}%
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-amber-200 hover:bg-amber-500/20"
                            disabled={linkingSignalId === signal.id}
                            onClick={() => handleLinkSignal(signal.id, suggestion.projectId)}
                          >
                            {linkingSignalId === signal.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                <LinkIcon className="h-3 w-3 mr-1" />
                                Link
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-amber-200/60 italic">
                    No project suggestions found - signal may need manual review
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
        {orphanData.total > 3 && (
          <p className="text-xs text-amber-200/60 text-center">
            + {orphanData.total - 3} more orphan signals
          </p>
        )}
      </div>
    </div>
  );
}
