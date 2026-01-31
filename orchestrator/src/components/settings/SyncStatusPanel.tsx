"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SyncActivity {
  id: string;
  action: string;
  metadata: {
    syncType?: string;
    target?: string;
    itemsProcessed?: number;
    duration?: number;
    error?: string;
    toolkit?: string;
  } | null;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  } | null;
}

interface SyncStatusPanelProps {
  workspaceId: string;
}

const SYNC_TYPES = [
  {
    id: "agents",
    label: "Agents",
    description: "Agent definitions from GitHub",
  },
  {
    id: "knowledge",
    label: "Knowledge Base",
    description: "Files and documents",
  },
  { id: "signals", label: "Signals", description: "External feedback sources" },
  { id: "linear", label: "Linear", description: "Issue tracking sync" },
  { id: "slack", label: "Slack", description: "Channel messages" },
  { id: "hubspot", label: "HubSpot", description: "CRM data" },
];

export function SyncStatusPanel({ workspaceId }: SyncStatusPanelProps) {
  const [expanded, setExpanded] = useState(true);

  // Fetch sync-related activities
  const {
    data: activities,
    isLoading,
    refetch,
  } = useQuery<SyncActivity[]>({
    queryKey: ["sync-activities", workspaceId],
    queryFn: async () => {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/activity?limit=50&filter=sync`,
      );
      if (!res.ok) {
        if (res.status === 403) return [];
        throw new Error("Failed to fetch sync activities");
      }
      const all = await res.json();
      // Filter to sync-related actions
      return all.filter(
        (a: SyncActivity) =>
          a.action.startsWith("sync.") ||
          a.action.includes("synced") ||
          a.action === "agent.synced" ||
          a.action === "skill.synced" ||
          a.action === "knowledge.synced" ||
          a.action === "signals.ingested" ||
          a.action === "tickets.synced",
      );
    },
    enabled: !!workspaceId,
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  // Group activities by sync type
  const getSyncTypeStatus = (syncType: string) => {
    if (!activities) return null;

    const typeActivities = activities.filter((a) => {
      const meta = a.metadata;
      if (meta?.syncType === syncType) return true;
      if (syncType === "agents" && a.action === "agent.synced") return true;
      if (syncType === "knowledge" && a.action === "knowledge.synced")
        return true;
      if (syncType === "signals" && a.action === "signals.ingested")
        return true;
      if (
        syncType === "linear" &&
        a.action === "tickets.synced" &&
        meta?.toolkit === "linear"
      )
        return true;
      return false;
    });

    if (typeActivities.length === 0) return null;

    const latest = typeActivities[0];
    const isRunning = latest.action === "sync.started";
    const hasFailed = latest.action === "sync.failed";
    const isComplete =
      latest.action.includes("completed") ||
      latest.action.includes("synced") ||
      latest.action === "signals.ingested";

    return {
      status: isRunning
        ? "running"
        : hasFailed
          ? "failed"
          : isComplete
            ? "success"
            : "unknown",
      lastSync: latest.createdAt,
      itemsProcessed: latest.metadata?.itemsProcessed,
      error: latest.metadata?.error,
      duration: latest.metadata?.duration,
    };
  };

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case "running":
        return <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string | undefined) => {
    switch (status) {
      case "running":
        return (
          <Badge
            variant="outline"
            className="bg-amber-500/10 text-amber-500 border-amber-500/30"
          >
            Running
          </Badge>
        );
      case "success":
        return (
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-500 border-green-500/30"
          >
            Synced
          </Badge>
        );
      case "failed":
        return (
          <Badge
            variant="outline"
            className="bg-red-500/10 text-red-500 border-red-500/30"
          >
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Never synced
          </Badge>
        );
    }
  };

  // Count active syncs
  const activeSyncs =
    activities?.filter((a) => a.action === "sync.started").length || 0;
  const recentFailures =
    activities?.filter((a) => a.action === "sync.failed").length || 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            <CardTitle className="text-lg">Sync Status</CardTitle>
            {activeSyncs > 0 && (
              <Badge
                variant="outline"
                className="bg-amber-500/10 text-amber-500"
              >
                {activeSyncs} active
              </Badge>
            )}
            {recentFailures > 0 && (
              <Badge variant="destructive" className="text-xs">
                {recentFailures} failed
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          {/* Sync type status grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {SYNC_TYPES.map((syncType) => {
              const status = getSyncTypeStatus(syncType.id);
              return (
                <div
                  key={syncType.id}
                  className="p-3 rounded-lg border bg-muted/30 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {syncType.label}
                    </span>
                    {getStatusIcon(status?.status)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {syncType.description}
                  </div>
                  <div className="flex items-center justify-between">
                    {getStatusBadge(status?.status)}
                    {status?.lastSync && (
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(status.lastSync), {
                          addSuffix: true,
                        })}
                      </span>
                    )}
                  </div>
                  {status?.itemsProcessed !== undefined && (
                    <div className="text-xs text-muted-foreground">
                      {status.itemsProcessed} items processed
                    </div>
                  )}
                  {status?.error && (
                    <div className="flex items-center gap-1 text-xs text-red-400">
                      <AlertCircle className="w-3 h-3" />
                      <span className="truncate">{status.error}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Recent sync history */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Recent Activity
            </h4>
            <ScrollArea className="h-[200px]">
              {activities && activities.length > 0 ? (
                <div className="space-y-2">
                  {activities.slice(0, 15).map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-3 p-2 rounded-lg border bg-background/50 text-sm"
                    >
                      {getStatusIcon(
                        activity.action === "sync.started"
                          ? "running"
                          : activity.action === "sync.failed"
                            ? "failed"
                            : "success",
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {activity.metadata?.syncType ||
                              activity.action.replace(/\./g, " ")}
                          </span>
                          {activity.metadata?.itemsProcessed !== undefined && (
                            <span className="text-muted-foreground">
                              ({activity.metadata.itemsProcessed} items)
                            </span>
                          )}
                        </div>
                        {activity.metadata?.error && (
                          <p className="text-xs text-red-400 truncate">
                            {activity.metadata.error}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatDistanceToNow(new Date(activity.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Activity className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">No sync activity yet</p>
                </div>
              )}
            </ScrollArea>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
