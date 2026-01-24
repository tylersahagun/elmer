"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles, ChevronDown, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SuggestionCard } from "./SuggestionCard";

interface Suggestion {
  signalId: string;
  verbatim: string;
  source: string;
  projectId: string;
  projectName: string;
  confidence: number;
  reason?: string;
}

interface SignalSuggestionsBannerProps {
  workspaceId: string;
}

export function SignalSuggestionsBanner({ workspaceId }: SignalSuggestionsBannerProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDismissedAll, setIsDismissedAll] = useState(false);
  const [pendingAccept, setPendingAccept] = useState<string | null>(null);
  const [pendingReject, setPendingReject] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch suggestions
  const { data, isLoading } = useQuery({
    queryKey: ["signal-suggestions", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/signals/suggestions?workspaceId=${workspaceId}`);
      if (!res.ok) throw new Error("Failed to fetch suggestions");
      return res.json() as Promise<{ suggestions: Suggestion[] }>;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Accept suggestion = link signal to project
  const acceptMutation = useMutation({
    mutationFn: async ({ signalId, projectId }: { signalId: string; projectId: string }) => {
      const res = await fetch(`/api/signals/${signalId}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          linkReason: "AI-suggested association accepted by user",
        }),
      });
      if (!res.ok) throw new Error("Failed to link signal");
      return res.json();
    },
    onMutate: ({ signalId }) => {
      setPendingAccept(signalId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["signal-suggestions", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["signals", workspaceId] });
    },
    onSettled: () => {
      setPendingAccept(null);
    },
  });

  // Reject suggestion = dismiss
  const rejectMutation = useMutation({
    mutationFn: async (signalId: string) => {
      const res = await fetch(`/api/signals/${signalId}/suggestions/dismiss`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to dismiss suggestion");
      return res.json();
    },
    onMutate: (signalId) => {
      setPendingReject(signalId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["signal-suggestions", workspaceId] });
    },
    onSettled: () => {
      setPendingReject(null);
    },
  });

  const suggestions = data?.suggestions || [];

  // Don't render if no suggestions, dismissed all, or loading
  if (isDismissedAll || (suggestions.length === 0 && !isLoading)) {
    return null;
  }

  const handleAccept = (signalId: string, projectId: string) => {
    acceptMutation.mutate({ signalId, projectId });
  };

  const handleReject = (signalId: string) => {
    rejectMutation.mutate(signalId);
  };

  return (
    <div className="border border-blue-500/30 rounded-lg bg-blue-500/5 mb-4">
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-label="Toggle AI suggestions"
        className="w-full flex items-center justify-between p-3 text-left cursor-pointer hover:bg-blue-500/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="font-medium text-sm">
            AI Suggestions
            {!isLoading && suggestions.length > 0 && (
              <span className="ml-1 text-muted-foreground">
                ({suggestions.length})
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              setIsDismissedAll(true);
            }}
          >
            <X className="w-3 h-3 mr-1" />
            Dismiss All
          </Button>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-muted-foreground transition-transform",
              isExpanded && "rotate-180"
            )}
          />
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-blue-500/20 p-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : suggestions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">
              No suggestions available
            </p>
          ) : (
            <div className="space-y-2">
              {suggestions.map((suggestion) => (
                <SuggestionCard
                  key={suggestion.signalId}
                  suggestion={suggestion}
                  workspaceId={workspaceId}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  isAccepting={pendingAccept === suggestion.signalId}
                  isRejecting={pendingReject === suggestion.signalId}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
