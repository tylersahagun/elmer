"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExecutionTimelinePanelProps {
  workspaceId: string;
}

interface Job {
  id: string;
  type: string;
  status: string;
  projectId?: string | null;
  createdAt: string;
  completedAt?: string | null;
  error?: string | null;
}

export function ExecutionTimelinePanel({
  workspaceId,
}: ExecutionTimelinePanelProps) {
  const { data } = useQuery<Job[]>({
    queryKey: ["control-center-jobs", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/jobs?workspaceId=${workspaceId}`);
      if (!res.ok) throw new Error("Failed to load jobs");
      return res.json();
    },
    enabled: !!workspaceId,
    refetchInterval: 10000,
  });

  const jobs = useMemo(() => (data ?? []).slice(0, 10), [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent executions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {jobs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No recent job executions.
          </p>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="rounded-md border p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium">{job.type.replaceAll("_", " ")}</div>
                <Badge variant="outline">{job.status}</Badge>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Created {new Date(job.createdAt).toLocaleString()}
              </div>
              {job.error && (
                <div className="text-xs text-red-500 mt-1">{job.error}</div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
