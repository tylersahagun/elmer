"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { SimpleNavbar } from "@/components/chrome/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AgentRegistryPanel } from "./AgentRegistryPanel";
import { StageRecipePanel } from "./StageRecipePanel";
import { ApprovalQueuePanel } from "./ApprovalQueuePanel";
import { ExecutionTimelinePanel } from "./ExecutionTimelinePanel";
import { CommandParityPanel } from "./CommandParityPanel";

interface ControlCenterShellProps {
  workspaceId: string;
}

interface Workspace {
  id: string;
  name: string;
}

export function ControlCenterShell({ workspaceId }: ControlCenterShellProps) {
  const { data: workspace } = useQuery<Workspace>({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}`);
      if (!res.ok) throw new Error("Failed to load workspace");
      return res.json();
    },
    enabled: !!workspaceId,
  });

  return (
    <div className="min-h-screen">
      <SimpleNavbar
        path={`~/workspace/${workspace?.name ?? workspaceId}/control-center`}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Agent control center</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Button asChild variant="outline">
              <Link href={`/workspace/${workspaceId}/agents`}>Agents</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/workspace/${workspaceId}/commands`}>Commands</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/workspace/${workspaceId}/settings`}>Settings</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/workspace/${workspaceId}/status`}>Status</Link>
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <AgentRegistryPanel workspaceId={workspaceId} />
          <CommandParityPanel workspaceId={workspaceId} />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <StageRecipePanel workspaceId={workspaceId} />
          <ApprovalQueuePanel workspaceId={workspaceId} />
        </div>

        <ExecutionTimelinePanel workspaceId={workspaceId} />
      </main>
    </div>
  );
}
