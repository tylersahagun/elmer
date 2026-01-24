"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GitMerge, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Signal {
  id: string;
  verbatim: string;
  source: string;
  createdAt: string;
}

interface DuplicateSuggestionCardProps {
  workspaceId: string;
  pairId: string;
  signal1: Signal;
  signal2: Signal;
  similarity: number;
  className?: string;
  onMerged?: () => void;
  onDismissed?: () => void;
}

export function DuplicateSuggestionCard({
  workspaceId,
  pairId,
  signal1,
  signal2,
  similarity,
  className,
  onMerged,
  onDismissed,
}: DuplicateSuggestionCardProps) {
  const queryClient = useQueryClient();

  const mergeMutation = useMutation({
    mutationFn: async () => {
      // Keep older signal as primary
      const [primary, secondary] =
        new Date(signal1.createdAt) < new Date(signal2.createdAt)
          ? [signal1, signal2]
          : [signal2, signal1];

      const res = await fetch("/api/signals/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          primarySignalId: primary.id,
          secondarySignalId: secondary.id,
        }),
      });
      if (!res.ok) throw new Error("Failed to merge signals");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["duplicate-signals"] });
      queryClient.invalidateQueries({ queryKey: ["signals"] });
      onMerged?.();
    },
  });

  const dismissMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/signals/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          primarySignalId: signal1.id,
          secondarySignalId: signal2.id,
          action: "dismiss",
        }),
      });
      if (!res.ok) throw new Error("Failed to dismiss pair");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["duplicate-signals"] });
      onDismissed?.();
    },
  });

  const similarityPercent = Math.round(similarity * 100);
  const similarityColor =
    similarityPercent >= 95
      ? "text-red-400"
      : similarityPercent >= 90
        ? "text-amber-400"
        : "text-yellow-400";

  return (
    <Card className={cn("bg-white/5 border-white/10", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-white/90">
            Potential Duplicate
          </CardTitle>
          <Badge variant="outline" className={cn("border-white/20", similarityColor)}>
            {similarityPercent}% similar
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Signal 1 */}
        <div className="rounded-md bg-white/5 p-3">
          <div className="flex items-center gap-2 text-xs text-white/50 mb-1">
            <span>{signal1.source}</span>
            <span>-</span>
            <span>{new Date(signal1.createdAt).toLocaleDateString()}</span>
          </div>
          <p className="text-sm text-white/80 line-clamp-2">
            &ldquo;{signal1.verbatim}&rdquo;
          </p>
        </div>

        {/* Signal 2 */}
        <div className="rounded-md bg-white/5 p-3">
          <div className="flex items-center gap-2 text-xs text-white/50 mb-1">
            <span>{signal2.source}</span>
            <span>-</span>
            <span>{new Date(signal2.createdAt).toLocaleDateString()}</span>
          </div>
          <p className="text-sm text-white/80 line-clamp-2">
            &ldquo;{signal2.verbatim}&rdquo;
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            size="sm"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            onClick={() => mergeMutation.mutate()}
            disabled={mergeMutation.isPending}
          >
            {mergeMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <GitMerge className="mr-2 h-4 w-4" />
            )}
            {mergeMutation.isPending ? "Merging..." : "Merge"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-white/60 hover:text-white/80"
            onClick={() => dismissMutation.mutate()}
            disabled={dismissMutation.isPending}
          >
            {dismissMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <X className="mr-2 h-4 w-4" />
            )}
            Ignore
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
