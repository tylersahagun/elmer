"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AgentRegistryPanelProps {
  workspaceId: string;
}

interface AgentDefinition {
  id: string;
  type: string;
  enabled?: boolean | null;
}

export function AgentRegistryPanel({ workspaceId }: AgentRegistryPanelProps) {
  const { data } = useQuery<{ agents: AgentDefinition[] }>({
    queryKey: ["control-center-agents", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/agents?workspaceId=${workspaceId}`);
      if (!res.ok) throw new Error("Failed to load agents");
      return res.json();
    },
    enabled: !!workspaceId,
  });

  const summary = useMemo(() => {
    const agents = data?.agents ?? [];
    const counts = agents.reduce<Record<string, number>>((acc, agent) => {
      acc[agent.type] = (acc[agent.type] ?? 0) + 1;
      return acc;
    }, {});
    const enabled = agents.filter((agent) => agent.enabled !== false).length;
    return {
      total: agents.length,
      enabled,
      counts,
    };
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent registry</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Total: {summary.total}</Badge>
          <Badge variant="outline">Enabled: {summary.enabled}</Badge>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.entries(summary.counts).map(([type, count]) => (
            <div key={type} className="rounded-md border p-3">
              <div className="text-sm font-medium capitalize">{type}</div>
              <div className="text-2xl font-semibold">{count}</div>
            </div>
          ))}
          {summary.total === 0 && (
            <p className="text-sm text-muted-foreground">No agents imported yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
