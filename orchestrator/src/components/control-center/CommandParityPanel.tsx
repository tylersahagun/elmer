"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CommandParityPanelProps {
  workspaceId: string;
}

const EXPECTED_COMMANDS = [
  "/status",
  "/status-all",
  "/roadmap",
  "/save",
  "/update",
  "/branch",
  "/share",
  "/measure",
  "/sync",
  "/sync-linear",
  "/sync-notion",
  "/maintain",
  "/admin",
  "/eod",
  "/eow",
  "/figma-sync",
  "/figjam",
  "/swarm",
];

interface AgentDefinition {
  id: string;
  type: string;
  name: string;
  metadata?: { usage?: string } | null;
}

export function CommandParityPanel({ workspaceId }: CommandParityPanelProps) {
  const { data } = useQuery<{ agents: AgentDefinition[] }>({
    queryKey: ["control-center-command-parity", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/agents?workspaceId=${workspaceId}`);
      if (!res.ok) throw new Error("Failed to load agent definitions");
      return res.json();
    },
    enabled: !!workspaceId,
  });

  const { available, missing } = useMemo(() => {
    const importedCommands = new Set(
      (data?.agents ?? [])
        .filter((agent) => agent.type === "command")
        .map((agent) => {
          const usage = agent.metadata?.usage;
          const matched = usage?.match(/\/[a-z0-9-]+/i)?.[0];
          return (matched || `/${agent.name}`).toLowerCase();
        }),
    );

    return {
      available: EXPECTED_COMMANDS.filter((command) =>
        importedCommands.has(command),
      ),
      missing: EXPECTED_COMMANDS.filter((command) => !importedCommands.has(command)),
    };
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Command parity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm font-medium mb-2">Available</div>
          <div className="flex flex-wrap gap-2">
            {available.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No PM-workspace parity commands imported yet.
              </p>
            ) : (
              available.map((command) => (
                <Badge key={command} variant="secondary">
                  {command}
                </Badge>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="text-sm font-medium mb-2">Missing</div>
          <div className="flex flex-wrap gap-2">
            {missing.map((command) => (
              <Badge key={command} variant="outline">
                {command}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
