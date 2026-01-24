"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Sparkles, ChevronDown, ChevronUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreateProjectFromClusterModal } from "./CreateProjectFromClusterModal";
import type { SignalCluster } from "@/lib/classification";

interface SignalClustersPanelProps {
  workspaceId: string;
}

/**
 * Panel for discovering signal patterns via /synthesize API.
 * Displays clusters with themes, counts, and "Create Project" actions.
 */
export function SignalClustersPanel({ workspaceId }: SignalClustersPanelProps) {
  const [clusters, setClusters] = useState<SignalCluster[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<SignalCluster | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const synthesizeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/signals/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to synthesize signals");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setClusters(data.clusters || []);
      setSummary(data.summary || null);
    },
  });

  const handleDiscoverPatterns = () => {
    setClusters([]);
    setSummary(null);
    synthesizeMutation.mutate();
  };

  return (
    <div className="mb-6 border rounded-lg bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-left hover:text-primary transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Signal Patterns</h3>
          {clusters.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {clusters.length} cluster{clusters.length !== 1 ? "s" : ""}
            </Badge>
          )}
        </button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDiscoverPatterns}
          disabled={synthesizeMutation.isPending}
        >
          {synthesizeMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Discover Patterns
            </>
          )}
        </Button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4">
          {/* Summary */}
          {summary && (
            <p className="text-sm text-muted-foreground mb-4">{summary}</p>
          )}

          {/* Empty state */}
          {!synthesizeMutation.isPending && clusters.length === 0 && !summary && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Click &ldquo;Discover Patterns&rdquo; to find clusters of similar signals
              that could become new projects.
            </p>
          )}

          {/* Cluster cards grid */}
          {clusters.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {clusters.map((cluster) => (
                <ClusterCard
                  key={cluster.id}
                  cluster={cluster}
                  onCreateProject={() => setSelectedCluster(cluster)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Project Modal */}
      {selectedCluster && (
        <CreateProjectFromClusterModal
          isOpen={!!selectedCluster}
          onClose={() => setSelectedCluster(null)}
          cluster={selectedCluster}
          workspaceId={workspaceId}
        />
      )}
    </div>
  );
}

/**
 * Individual cluster card displaying theme, signals, and actions.
 */
interface ClusterCardProps {
  cluster: SignalCluster;
  onCreateProject: () => void;
}

function ClusterCard({ cluster, onCreateProject }: ClusterCardProps) {
  // Severity color mapping
  const severityColors: Record<string, string> = {
    critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  };

  // Action label mapping
  const actionLabels: Record<string, string> = {
    new_project: "Create Project",
    link_to_existing: "Link to Project",
    review: "Review",
  };

  return (
    <div className="border rounded-lg p-4 bg-background hover:border-primary/50 transition-colors">
      {/* Theme */}
      <h4 className="font-medium text-sm mb-2 line-clamp-2">{cluster.theme}</h4>

      {/* Badges row */}
      <div className="flex flex-wrap gap-2 mb-3">
        {/* Signal count */}
        <Badge variant="secondary" className="text-xs">
          <Users className="w-3 h-3 mr-1" />
          {cluster.signalCount} signal{cluster.signalCount !== 1 ? "s" : ""}
        </Badge>

        {/* Severity */}
        <Badge
          className={`text-xs ${severityColors[cluster.severity] || severityColors.medium}`}
        >
          {cluster.severity}
        </Badge>

        {/* Confidence */}
        {cluster.confidence > 0 && (
          <Badge variant="outline" className="text-xs">
            {Math.round(cluster.confidence * 100)}% similar
          </Badge>
        )}
      </div>

      {/* Signal previews */}
      <div className="space-y-1 mb-3">
        {cluster.signals.slice(0, 3).map((signal, idx) => (
          <p
            key={signal.id}
            className="text-xs text-muted-foreground line-clamp-1"
          >
            <span className="font-medium">{idx + 1}.</span>{" "}
            &ldquo;{signal.verbatim.length > 60
              ? `${signal.verbatim.slice(0, 60)}...`
              : signal.verbatim}&rdquo;
          </p>
        ))}
        {cluster.signalCount > 3 && (
          <p className="text-xs text-muted-foreground italic">
            +{cluster.signalCount - 3} more
          </p>
        )}
      </div>

      {/* Action button */}
      {cluster.suggestedAction === "new_project" && (
        <Button
          variant="default"
          size="sm"
          className="w-full"
          onClick={onCreateProject}
        >
          {actionLabels[cluster.suggestedAction]}
        </Button>
      )}
      {cluster.suggestedAction !== "new_project" && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onCreateProject}
        >
          {actionLabels[cluster.suggestedAction]}
        </Button>
      )}
    </div>
  );
}
