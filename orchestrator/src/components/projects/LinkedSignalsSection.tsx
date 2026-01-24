"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Plus, X, ExternalLink, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LinkedSignal {
  id: string;
  verbatim: string;
  source: string;
  severity?: string | null;
  linkedAt: string;
  linkReason?: string | null;
  confidence?: number | null;
  linkedBy?: {
    id: string;
    name: string | null;
  } | null;
}

interface LinkedSignalsSectionProps {
  projectId: string;
  workspaceId: string;
  onOpenPicker: () => void;
}

const SOURCE_COLORS: Record<string, string> = {
  paste: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  webhook: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  upload: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  video: "bg-red-500/20 text-red-300 border-red-500/30",
  slack: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  pylon: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  email: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  interview: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  other: "bg-gray-500/20 text-gray-300 border-gray-500/30",
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-500/20 text-red-300 border-red-500/30",
  high: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  medium: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  low: "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

export function LinkedSignalsSection({
  projectId,
  workspaceId,
  onOpenPicker,
}: LinkedSignalsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const queryClient = useQueryClient();

  // Fetch linked signals
  const { data: signalsData, isLoading } = useQuery({
    queryKey: ["project-signals", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/signals`);
      if (!res.ok) throw new Error("Failed to load signals");
      return res.json();
    },
  });

  // Unlink mutation
  const unlinkMutation = useMutation({
    mutationFn: async (signalId: string) => {
      const res = await fetch(`/api/signals/${signalId}/projects`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      if (!res.ok) throw new Error("Failed to unlink signal");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-signals", projectId] });
      queryClient.invalidateQueries({ queryKey: ["signals"] });
    },
  });

  const signals: LinkedSignal[] = signalsData?.signals || [];
  const count = signals.length;

  return (
    <div className="border border-border rounded-lg bg-card/50">
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors rounded-t-lg"
      >
        <div className="flex items-center gap-2">
          <ChevronRight
            className={cn(
              "w-4 h-4 transition-transform",
              isExpanded && "rotate-90"
            )}
          />
          <span className="font-medium text-sm">
            Signals that informed this project ({isLoading ? "..." : count})
          </span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onOpenPicker();
          }}
          className="h-7 text-xs gap-1"
        >
          <Plus className="w-3 h-3" />
          Link Signals
        </Button>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-border p-3 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-4 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Loading signals...
            </div>
          ) : signals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No signals linked yet. Click &quot;Link Signals&quot; to add evidence.
            </p>
          ) : (
            signals.map((signal) => (
              <div
                key={signal.id}
                className="group flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
              >
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm line-clamp-2">{signal.verbatim}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      className={cn(
                        "text-[10px]",
                        SOURCE_COLORS[signal.source] || SOURCE_COLORS.other
                      )}
                    >
                      {signal.source}
                    </Badge>
                    {signal.severity && (
                      <Badge
                        className={cn(
                          "text-[10px]",
                          SEVERITY_COLORS[signal.severity] || SEVERITY_COLORS.medium
                        )}
                      >
                        {signal.severity}
                      </Badge>
                    )}
                    <span className="text-[10px] text-muted-foreground">
                      Linked {new Date(signal.linkedAt).toLocaleDateString()}
                      {signal.linkedBy?.name && ` by ${signal.linkedBy.name}`}
                      {signal.confidence != null && (
                        <span className="ml-1">
                          ({Math.round(signal.confidence * 100)}% AI confidence)
                        </span>
                      )}
                    </span>
                  </div>
                  {signal.linkReason && (
                    <p className="text-[10px] text-muted-foreground italic mt-1">
                      Reason: {signal.linkReason}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => {
                      window.open(`/workspace/${workspaceId}/signals?id=${signal.id}`, "_blank");
                    }}
                    title="View signal"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    onClick={() => unlinkMutation.mutate(signal.id)}
                    disabled={unlinkMutation.isPending}
                    title="Unlink signal"
                  >
                    {unlinkMutation.isPending ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <X className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
