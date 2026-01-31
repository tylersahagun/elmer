"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plug, CheckCircle2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const SERVICES = [
  { id: "slack", label: "Slack" },
  { id: "linear", label: "Linear" },
  { id: "jira", label: "Jira" },
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

export function IntegrationsSettingsCard({
  workspaceId,
}: IntegrationsSettingsCardProps) {
  const queryClient = useQueryClient();
  const [apiKey, setApiKey] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<Record<string, string>>({});
  const [ingesting, setIngesting] = useState<string | null>(null);

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
    [data?.connectedServices],
  );
  useEffect(() => {
    if (data) {
      queueMicrotask(() => setEnabled(data.enabled ?? true));
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
      queryClient.invalidateQueries({
        queryKey: ["workspace-integrations", workspaceId],
      });
      setApiKey("");
    },
  });

  const connectService = async (service: string) => {
    const res = await fetch(
      `/api/workspaces/${workspaceId}/integrations/connect`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service, callbackUrl: window.location.href }),
      },
    );
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to connect service");
    }
    const data = await res.json();
    window.location.assign(data.redirectUrl);
  };

  const disconnectService = async (service: string) => {
    const res = await fetch(
      `/api/workspaces/${workspaceId}/integrations/${service}`,
      {
        method: "DELETE",
      },
    );
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to disconnect");
    }
    queryClient.invalidateQueries({
      queryKey: ["workspace-integrations", workspaceId],
    });
  };

  const handleSync = async (sourceType: "signals" | "knowledgebase") => {
    setSyncing(sourceType);
    try {
      const res = await fetch("/api/integrations/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, sourceType }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to sync");
      }
      const data = await res.json();
      setSyncResult((prev) => ({
        ...prev,
        [sourceType]: data.status || "completed",
      }));
      toast.success(`${sourceType} sync ${data.status || "completed"}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sync failed";
      setSyncResult((prev) => ({ ...prev, [sourceType]: "failed" }));
      toast.error(message);
    } finally {
      setSyncing(null);
    }
  };

  const handleIngest = async (source: "slack" | "hubspot") => {
    setIngesting(source);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/signals/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to ingest signals");
      }
      const data = await res.json();
      toast.success(`Ingested ${data.created ?? 0} ${source} signals`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to ingest signals";
      toast.error(message);
    } finally {
      setIngesting(null);
    }
  };

  const { data: statusData } = useQuery<{ statuses: Record<string, string> }>({
    queryKey: ["workspace-integrations-status", workspaceId],
    queryFn: async () => {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/integrations/status`,
      );
      if (!res.ok) throw new Error("Failed to load integration status");
      return res.json();
    },
    enabled: !!workspaceId && !!data?.apiKeySet,
    refetchInterval: 30000,
  });

  const { data: toolsData, refetch: refetchTools } = useQuery<{
    toolkits: Array<{ toolkit: string; count: number; tools: string[] }>;
  }>({
    queryKey: ["workspace-integrations-tools", workspaceId],
    queryFn: async () => {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/integrations/tools`,
      );
      if (!res.ok) throw new Error("Failed to load tools");
      return res.json();
    },
    enabled: !!workspaceId && !!data?.apiKeySet,
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
              placeholder={
                data?.apiKeySet ? "••••••••••••••••" : "Enter API key"
              }
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
            <div className="text-sm text-muted-foreground">
              Loading integrations...
            </div>
          ) : (
            <div className="space-y-2">
              {SERVICES.map((service) => {
                const isConnected = connected.has(service.id);
                const status = statusData?.statuses?.[service.id];
                return (
                  <div
                    key={service.id}
                    className="flex items-center justify-between rounded-md border p-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {service.label}
                      </span>
                      {isConnected && (
                        <Badge variant="secondary">Connected</Badge>
                      )}
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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Composio Toolkits</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => refetchTools()}
            >
              Refresh
            </Button>
          </div>
          <div className="space-y-2">
            {toolsData?.toolkits?.length ? (
              toolsData.toolkits.map((kit) => (
                <div
                  key={kit.toolkit}
                  className="rounded-md border px-3 py-2 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium capitalize">
                      {kit.toolkit}
                    </span>
                    <Badge variant="secondary">{kit.count} tools</Badge>
                  </div>
                  {kit.tools.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {kit.tools.join(", ")}
                      {kit.count > kit.tools.length ? "…" : ""}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">
                Connect a service to list available tools.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Sync Workflows</Label>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSync("signals")}
              disabled={syncing === "signals"}
            >
              {syncing === "signals" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Sync Signals"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSync("knowledgebase")}
              disabled={syncing === "knowledgebase"}
            >
              {syncing === "knowledgebase" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Sync Knowledgebase"
              )}
            </Button>
            {(syncResult.signals || syncResult.knowledgebase) && (
              <div className="text-xs text-muted-foreground">
                {syncResult.signals && `Signals: ${syncResult.signals}`}
                {syncResult.signals && syncResult.knowledgebase && " · "}
                {syncResult.knowledgebase &&
                  `Knowledge: ${syncResult.knowledgebase}`}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Signal Ingestion</Label>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleIngest("slack")}
              disabled={ingesting === "slack"}
            >
              {ingesting === "slack" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Ingest Slack"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleIngest("hubspot")}
              disabled={ingesting === "hubspot"}
            >
              {ingesting === "hubspot" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Ingest HubSpot"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
