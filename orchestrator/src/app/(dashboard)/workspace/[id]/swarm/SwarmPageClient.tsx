"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { SimpleNavbar } from "@/components/chrome/Navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import type { SwarmPreset, SwarmReport } from "@/lib/swarm/types";
import { SwarmStatusArtifactCard } from "@/components/swarm/SwarmStatusArtifactCard";
import { SwarmLauncher } from "@/components/swarm/SwarmLauncher";
import { SwarmLaneBoard } from "@/components/swarm/SwarmLaneBoard";

interface SwarmPageClientProps {
  workspaceId: string;
}

export function SwarmPageClient({ workspaceId }: SwarmPageClientProps) {
  const searchParams = useSearchParams();
  const requestedPreset = (searchParams.get("preset") || "flagship") as SwarmPreset;
  const [preset, setPreset] = useState<SwarmPreset>(requestedPreset);

  useEffect(() => {
    setPreset(requestedPreset);
  }, [requestedPreset]);
  const { data, isLoading, refetch } = useQuery<SwarmReport>({
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
        body: JSON.stringify(report),
      });
      if (!res.ok) throw new Error("Failed to save swarm artifact");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Swarm artifact saved");
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
        {isLoading || !report ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="rounded-lg border p-4 space-y-4">
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
