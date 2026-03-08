"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { SimpleNavbar } from "@/components/chrome/Navbar";
import { StatusOverview } from "@/components/status/StatusOverview";
import { AttentionQueue } from "@/components/status/AttentionQueue";
import { ArtifactGapMatrix } from "@/components/status/ArtifactGapMatrix";
import { ReadinessPanel } from "@/components/status/ReadinessPanel";
import { MeasurementReadinessPanel } from "@/components/status/MeasurementReadinessPanel";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import type { WorkspaceStatusReport } from "@/lib/status/types";

interface StatusPageClientProps {
  workspaceId: string;
}

export function StatusPageClient({ workspaceId }: StatusPageClientProps) {
  const { data, error, isError, isLoading, refetch } = useQuery<WorkspaceStatusReport>({
    queryKey: ["workspace-status-all", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/status-all`);
      if (!res.ok) throw new Error("Failed to load workspace status");
      return res.json();
    },
    enabled: !!workspaceId,
  });

  const saveSnapshot = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/status-all`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error("Failed to save workspace status snapshot");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Workspace status snapshot saved");
      refetch();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save workspace status snapshot",
      );
    },
  });

  return (
    <div className="min-h-screen">
      <SimpleNavbar
        path={`~/workspace/${workspaceId}/status`}
        rightContent={
          <Button
            variant="outline"
            size="sm"
            onClick={() => saveSnapshot.mutate()}
            disabled={saveSnapshot.isPending}
            className="gap-2"
          >
            {saveSnapshot.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save snapshot
          </Button>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Status snapshot unavailable</h2>
                <p className="text-sm text-muted-foreground">
                  The status surface is optional right now. The workspace can still be used while
                  this report is unavailable.
                </p>
                <p className="text-sm text-muted-foreground">
                  {error instanceof Error
                    ? error.message
                    : "Failed to load the workspace status report."}
                </p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Retry
                </Button>
              </div>
            </div>
          </div>
        ) : !data ? (
          <div className="rounded-xl border p-6 text-sm text-muted-foreground">
            No workspace status snapshot is available yet.
          </div>
        ) : (
          <>
            <StatusOverview
              summary={data.summary}
              healthScore={data.healthScore}
            />
            <AttentionQueue
              initiatives={data.attentionRequired}
              actionQueue={data.actionQueue}
            />
            <div className="grid gap-6 lg:grid-cols-2">
              <ReadinessPanel readyToAdvance={data.readyToAdvance} />
              <MeasurementReadinessPanel
                initiatives={data.initiatives}
                coverage={data.measurementCoverage}
              />
            </div>
            <ArtifactGapMatrix initiatives={data.initiatives} />
          </>
        )}
      </main>
    </div>
  );
}
