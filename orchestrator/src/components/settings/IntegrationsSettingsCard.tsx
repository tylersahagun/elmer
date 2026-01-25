"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plug, CheckCircle2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const SERVICES = [
  { id: "slack", label: "Slack" },
  { id: "linear", label: "Linear" },
  { id: "notion", label: "Notion" },
  { id: "hubspot", label: "HubSpot" },
  { id: "posthog", label: "PostHog" },
];

interface IntegrationsResponse {
  enabled: boolean;
  apiKeySet: boolean;
  connectedServices: string[];
}

interface IntegrationsSettingsCardProps {
  workspaceId: string;
}

export function IntegrationsSettingsCard({ workspaceId }: IntegrationsSettingsCardProps) {
  const queryClient = useQueryClient();
  const [apiKey, setApiKey] = useState("");
  const [enabled, setEnabled] = useState(true);

  const { data, isLoading } = useQuery<IntegrationsResponse>({
    queryKey: ["workspace-integrations", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/integrations`);
      if (!res.ok) throw new Error("Failed to load integrations");
      return res.json();
    },
    enabled: !!workspaceId,
  });

  const connected = useMemo(
    () => new Set(data?.connectedServices || []),
    [data?.connectedServices]
  );
  useEffect(() => {
    if (data) {
      setEnabled(data.enabled ?? true);
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/integrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey || undefined, enabled }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save integrations");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-integrations", workspaceId] });
      setApiKey("");
    },
  });

  const connectService = async (service: string) => {
    const res = await fetch(`/api/workspaces/${workspaceId}/integrations/connect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service, callbackUrl: window.location.href }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to connect service");
    }
    const data = await res.json();
    window.location.href = data.redirectUrl;
  };

  const disconnectService = async (service: string) => {
    const res = await fetch(`/api/workspaces/${workspaceId}/integrations/${service}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to disconnect");
    }
    queryClient.invalidateQueries({ queryKey: ["workspace-integrations", workspaceId] });
  };

  const { data: statusData } = useQuery<{ statuses: Record<string, string> }>({
    queryKey: ["workspace-integrations-status", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/integrations/status`);
      if (!res.ok) throw new Error("Failed to load integration status");
      return res.json();
    },
    enabled: !!workspaceId && !!data?.apiKeySet,
    refetchInterval: 30000,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plug className="w-5 h-5" />
          Integrations
        </CardTitle>
        <CardDescription>
          Connect external services via Composio for agent tool access.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Composio API Key</Label>
          <div className="flex items-center gap-2">
            <Input
              placeholder={data?.apiKeySet ? "••••••••••••••••" : "Enter API key"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {data?.apiKeySet && (
              <Badge variant="secondary" className="gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Key set
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border p-3">
          <div>
            <p className="text-sm font-medium">Enable Composio</p>
            <p className="text-xs text-muted-foreground">
              Allow agents to call external tools through Composio.
            </p>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>

        <div className="space-y-2">
          <Label>Connected Services</Label>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading integrations...</div>
          ) : (
            <div className="space-y-2">
              {SERVICES.map((service) => {
                const isConnected = connected.has(service.id);
                const status = statusData?.statuses?.[service.id];
                return (
                  <div key={service.id} className="flex items-center justify-between rounded-md border p-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{service.label}</span>
                      {isConnected && <Badge variant="secondary">Connected</Badge>}
                      {status && (
                        <Badge variant="outline" className="text-xs">
                          {status}
                        </Badge>
                      )}
                    </div>
                    {isConnected ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => disconnectService(service.id)}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => connectService(service.id)}
                        disabled={!data?.apiKeySet}
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
