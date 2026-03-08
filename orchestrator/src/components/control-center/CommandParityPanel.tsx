"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

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
  const { data } = useQuery<{ agents: AgentDefinition[]; degraded?: boolean }>({
    queryKey: ["control-center-command-parity", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/agents?workspaceId=${workspaceId}`);
      if (!res.ok) {
        return { agents: [], degraded: true };
      }
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
        {data?.degraded && (
          <div className="flex items-start gap-2 rounded-md border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-muted-foreground">
            <AlertCircle className="mt-0.5 h-4 w-4 text-amber-500" />
            <p>
              Command parity is temporarily unavailable. Missing commands here should not block the
              workspace shell.
            </p>
          </div>
        )}
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
