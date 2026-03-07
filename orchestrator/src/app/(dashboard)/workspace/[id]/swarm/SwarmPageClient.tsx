"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { SimpleNavbar } from "@/components/chrome/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import type { SwarmReport } from "@/lib/swarm/types";
import { SwarmStatusArtifactCard } from "@/components/swarm/SwarmStatusArtifactCard";

interface SwarmPageClientProps {
  workspaceId: string;
}

export function SwarmPageClient({ workspaceId }: SwarmPageClientProps) {
  const { data, isLoading, refetch } = useQuery<SwarmReport>({
    queryKey: ["swarm-report", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/swarm`);
      if (!res.ok) throw new Error("Failed to load swarm report");
      return res.json();
    },
    enabled: !!workspaceId,
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

            <div className="grid gap-6 lg:grid-cols-2">
              {report.lanes.map((lane, index) => (
                <div key={lane.id} className="rounded-lg border p-4 space-y-3">
                  <div className="font-medium">{lane.name}</div>
                  <Input
                    value={lane.owner}
                    onChange={(event) =>
                      setReport((prev) =>
                        prev
                          ? {
                              ...prev,
                              lanes: prev.lanes.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, owner: event.target.value }
                                  : item,
                              ),
                            }
                          : prev,
                      )
                    }
                    placeholder="Lane owner"
                  />
                  <Textarea
                    value={lane.focus}
                    onChange={(event) =>
                      setReport((prev) =>
                        prev
                          ? {
                              ...prev,
                              lanes: prev.lanes.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, focus: event.target.value }
                                  : item,
                              ),
                            }
                          : prev,
                      )
                    }
                    rows={4}
                    placeholder="Lane focus"
                  />
                </div>
              ))}
            </div>

            <SwarmStatusArtifactCard report={report} />
          </>
        )}
      </main>
    </div>
  );
}
