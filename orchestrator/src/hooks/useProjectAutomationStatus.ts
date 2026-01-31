"use client";

import { useQuery } from "@tanstack/react-query";

interface AutomationJob {
  id: string;
  status: "queued" | "running" | "succeeded" | "failed";
  agentName: string;
  createdAt: string;
}

interface AutomationStatus {
  hasActiveAutomation: boolean;
  recentJobs: AutomationJob[];
  runningCount: number;
  lastRun: AutomationJob | null;
}

export function useProjectAutomationStatus(
  workspaceId: string,
  projectId: string | null,
  enabled: boolean = true
) {
  return useQuery<AutomationStatus>({
    queryKey: ["project-automation-status", projectId],
    queryFn: async () => {
      if (!projectId) throw new Error("No project ID");
      const res = await fetch(
        `/api/projects/${projectId}/automation-status?workspaceId=${workspaceId}`
      );
      if (!res.ok) throw new Error("Failed to fetch automation status");
      return res.json();
    },
    enabled: enabled && !!projectId,
    refetchInterval: 5000, // Poll every 5 seconds for active automations
    staleTime: 2000,
  });
}
