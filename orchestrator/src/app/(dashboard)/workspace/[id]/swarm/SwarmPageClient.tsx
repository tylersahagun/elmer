"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { SimpleNavbar } from "@/components/chrome/Navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import type { SwarmPreset, SwarmReport } from "@/lib/swarm/types";
import { SwarmStatusArtifactCard } from "@/components/swarm/SwarmStatusArtifactCard";
import { SwarmLauncher } from "@/components/swarm/SwarmLauncher";
import { SwarmLaneBoard } from "@/components/swarm/SwarmLaneBoard";
import { useKanbanStore } from "@/lib/store";

interface SwarmPageClientProps {
  workspaceId: string;
}

export function SwarmPageClient({ workspaceId }: SwarmPageClientProps) {
  const searchParams = useSearchParams();
  const projects = useKanbanStore((state) => state.projects);
  const requestedPreset = (searchParams.get("preset") || "internal-alpha") as SwarmPreset;
  const [preset, setPreset] = useState<SwarmPreset>(requestedPreset);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  useEffect(() => {
    setPreset(requestedPreset);
  }, [requestedPreset]);
  const { data, error, isError, isLoading, refetch } = useQuery<SwarmReport>({
    queryKey: ["swarm-report", workspaceId, preset],
    queryFn: async () => {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/swarm?preset=${preset}`,
      );
      if (!res.ok) throw new Error("Failed to load swarm report");
      return res.json();
    },
    enabled: !!workspaceId && !!preset,
  });

  const [report, setReport] = useState<SwarmReport | null>(null);

  useEffect(() => {
    if (data) setReport(data);
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/swarm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...report,
          launchJobs: Boolean(selectedProjectId),
          projectId: selectedProjectId || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to save swarm artifact");
      return res.json();
    },
    onSuccess: () => {
      toast.success(
        selectedProjectId
          ? "Swarm launched and artifact saved"
          : "Swarm artifact saved",
      );
      refetch();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to save swarm artifact",
      );
    },
  });

  return (
    <div className="min-h-screen">
      <SimpleNavbar
        path={`~/workspace/${workspaceId}/swarm`}
        rightContent={
          <Button
            variant="outline"
            size="sm"
            onClick={() => saveMutation.mutate()}
            disabled={!report || saveMutation.isPending}
            className="gap-2"
          >
            {saveMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save artifact
          </Button>
        }
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Swarm artifact unavailable</h2>
                <p className="text-sm text-muted-foreground">
                  The workspace can still be used while this planning surface is unavailable.
                </p>
                <p className="text-sm text-muted-foreground">
                  {error instanceof Error
                    ? error.message
                    : "Failed to load the swarm artifact."}
                </p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Retry
                </Button>
              </div>
            </div>
          </div>
        ) : !report ? (
          <div className="rounded-xl border p-6 text-sm text-muted-foreground">
            No swarm artifact is available for this workspace yet.
          </div>
        ) : (
          <>
            <div className="rounded-lg border p-4 space-y-4">
              <div>
                <div className="text-sm font-medium mb-2">Launch target project</div>
                <select
                  value={selectedProjectId}
                  onChange={(event) => setSelectedProjectId(event.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Save artifact only</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-2">
                  Choose a project to launch lane jobs immediately. Leave empty to save the derived artifact only. Lanes without job templates will not launch anything.
                </p>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Sprint objective</div>
                <Textarea
                  value={report.objective}
                  onChange={(event) =>
                    setReport((prev) =>
                      prev ? { ...prev, objective: event.target.value } : prev,
                    )
                  }
                  rows={3}
                />
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Backlog</div>
                <Textarea
                  value={report.backlog.join("\n")}
                  onChange={(event) =>
                    setReport((prev) =>
                      prev
                        ? {
                            ...prev,
                            backlog: event.target.value
                              .split("\n")
                              .map((value) => value.trim())
                              .filter(Boolean),
                          }
                        : prev,
                    )
                  }
                  rows={6}
                />
              </div>
            </div>

            <SwarmLauncher
              activePreset={preset}
              onPresetChange={setPreset}
            />

            <SwarmLaneBoard
              lanes={report.lanes}
              onChange={(lanes) =>
                setReport((prev) => (prev ? { ...prev, lanes } : prev))
              }
            />

            <SwarmStatusArtifactCard report={report} />
          </>
        )}
      </main>
    </div>
  );
}
