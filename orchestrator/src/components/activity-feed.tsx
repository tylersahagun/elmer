"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2,
  Activity,
  FolderPlus,
  ArrowRight,
  UserPlus,
  UserCheck,
  XCircle,
  Play,
  Bot,
  Sparkles,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Plug,
  Send,
  FileUp,
  Ticket,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityLog {
  id: string;
  workspaceId: string;
  userId: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  } | null;
}

interface ActivityFeedProps {
  workspaceId: string;
}

export function ActivityFeed({ workspaceId }: ActivityFeedProps) {
  const { data: activities, isLoading } = useQuery<ActivityLog[]>({
    queryKey: ["workspace-activity", workspaceId],
    queryFn: async () => {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/activity?limit=20`,
      );
      if (!res.ok) {
        if (res.status === 403) return [];
        throw new Error("Failed to fetch activity logs");
      }
      return res.json();
    },
    enabled: !!workspaceId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getActivityIcon = (action: string) => {
    switch (action) {
      case "project.created":
        return <FolderPlus className="w-4 h-4 text-green-500" />;
      case "project.stage_changed":
        return <ArrowRight className="w-4 h-4 text-blue-500" />;
      case "member.invited":
        return <UserPlus className="w-4 h-4 text-purple-500" />;
      case "member.joined":
        return <UserCheck className="w-4 h-4 text-green-500" />;
      case "invitation.revoked":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "job.triggered":
        return <Play className="w-4 h-4 text-amber-500" />;
      // Agent actions
      case "agent.enabled":
        return <ToggleRight className="w-4 h-4 text-green-500" />;
      case "agent.disabled":
        return <ToggleLeft className="w-4 h-4 text-orange-500" />;
      case "agent.deleted":
        return <Trash2 className="w-4 h-4 text-red-500" />;
      case "agent.synced":
        return <Bot className="w-4 h-4 text-purple-500" />;
      // Skill actions
      case "skill.created":
        return <Sparkles className="w-4 h-4 text-green-500" />;
      case "skill.imported":
        return <Sparkles className="w-4 h-4 text-blue-500" />;
      case "skill.synced":
        return <RefreshCw className="w-4 h-4 text-purple-500" />;
      // Automation actions
      case "automation.column_updated":
        return <Bot className="w-4 h-4 text-blue-500" />;
      // Sync actions
      case "sync.started":
        return <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />;
      case "sync.completed":
        return <RefreshCw className="w-4 h-4 text-green-500" />;
      case "sync.failed":
        return <RefreshCw className="w-4 h-4 text-red-500" />;
      // Integration actions
      case "integration.connected":
        return <Plug className="w-4 h-4 text-green-500" />;
      case "signals.ingested":
        return <FileUp className="w-4 h-4 text-teal-500" />;
      case "document.published":
        return <Send className="w-4 h-4 text-blue-500" />;
      case "tickets.synced":
        return <Ticket className="w-4 h-4 text-purple-500" />;
      default:
        return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getActivityDescription = (activity: ActivityLog) => {
    const metadata = activity.metadata || {};
    const userName = activity.user?.name || activity.user?.email || "Someone";

    switch (activity.action) {
      case "project.created":
        return (
          <>
            <strong>{userName}</strong> created project{" "}
            <Badge variant="secondary" className="text-xs">
              {metadata.projectName as string}
            </Badge>
          </>
        );
      case "project.stage_changed":
        return (
          <>
            <strong>{userName}</strong> moved{" "}
            <Badge variant="secondary" className="text-xs">
              {metadata.projectName as string}
            </Badge>{" "}
            from{" "}
            <Badge variant="outline" className="text-xs">
              {metadata.fromStage as string}
            </Badge>{" "}
            to{" "}
            <Badge variant="outline" className="text-xs">
              {metadata.toStage as string}
            </Badge>
          </>
        );
      case "member.invited":
        return (
          <>
            <strong>{userName}</strong> invited{" "}
            <span className="font-medium">{metadata.email as string}</span> as{" "}
            <Badge variant="outline" className="text-xs">
              {metadata.role as string}
            </Badge>
          </>
        );
      case "member.joined":
        return (
          <>
            <strong>{userName}</strong> joined as{" "}
            <Badge variant="outline" className="text-xs">
              {metadata.role as string}
            </Badge>
          </>
        );
      case "invitation.revoked":
        return (
          <>
            <strong>{userName}</strong> revoked invitation for{" "}
            <span className="font-medium">{metadata.email as string}</span>
          </>
        );
      case "job.triggered":
        return (
          <>
            <strong>{userName}</strong> triggered{" "}
            <Badge variant="secondary" className="text-xs">
              {formatJobType(metadata.jobType as string)}
            </Badge>
            {metadata.projectName && (
              <>
                {" "}
                for{" "}
                <span className="font-medium">
                  {metadata.projectName as string}
                </span>
              </>
            )}
          </>
        );
      // Agent actions
      case "agent.enabled":
        return (
          <>
            <strong>{userName}</strong> enabled agent{" "}
            <Badge variant="secondary" className="text-xs">
              {metadata.agentName as string}
            </Badge>
          </>
        );
      case "agent.disabled":
        return (
          <>
            <strong>{userName}</strong> disabled agent{" "}
            <Badge variant="secondary" className="text-xs">
              {metadata.agentName as string}
            </Badge>
          </>
        );
      case "agent.deleted":
        return (
          <>
            <strong>{userName}</strong> deleted agent{" "}
            <Badge variant="destructive" className="text-xs">
              {metadata.agentName as string}
            </Badge>
          </>
        );
      case "agent.synced":
        return (
          <>
            <strong>{userName}</strong> synced{" "}
            <Badge variant="secondary" className="text-xs">
              {metadata.count as number} agents
            </Badge>{" "}
            from{" "}
            <span className="font-medium">{metadata.source as string}</span>
          </>
        );
      // Skill actions
      case "skill.created":
        return (
          <>
            <strong>{userName}</strong> created skill{" "}
            <Badge variant="secondary" className="text-xs">
              {metadata.skillName as string}
            </Badge>
          </>
        );
      case "skill.imported":
        return (
          <>
            <strong>{userName}</strong> imported skill{" "}
            <Badge variant="secondary" className="text-xs">
              {metadata.skillName as string}
            </Badge>
          </>
        );
      case "skill.synced":
        return (
          <>
            <strong>{userName}</strong> synced{" "}
            <Badge variant="secondary" className="text-xs">
              {metadata.count as number} skills
            </Badge>
          </>
        );
      // Automation actions
      case "automation.column_updated":
        return (
          <>
            <strong>{userName}</strong> updated automation for{" "}
            <Badge variant="outline" className="text-xs">
              {metadata.stage as string}
            </Badge>{" "}
            column
          </>
        );
      // Sync actions
      case "sync.started":
        return (
          <>
            <strong>{userName}</strong> started{" "}
            <Badge variant="secondary" className="text-xs">
              {metadata.syncType as string}
            </Badge>{" "}
            sync
          </>
        );
      case "sync.completed":
        return (
          <>
            <strong>{userName}</strong> completed{" "}
            <Badge variant="secondary" className="text-xs">
              {metadata.syncType as string}
            </Badge>{" "}
            sync
            {metadata.itemsProcessed && (
              <span className="text-muted-foreground">
                {" "}
                ({metadata.itemsProcessed as number} items)
              </span>
            )}
          </>
        );
      case "sync.failed":
        return (
          <>
            <strong>{userName}</strong>{" "}
            <Badge variant="destructive" className="text-xs">
              {metadata.syncType as string}
            </Badge>{" "}
            sync failed
          </>
        );
      // Integration actions
      case "integration.connected":
        return (
          <>
            <strong>{userName}</strong> connected{" "}
            <Badge variant="secondary" className="text-xs">
              {metadata.service as string}
            </Badge>
          </>
        );
      case "signals.ingested":
        return (
          <>
            <strong>{userName}</strong> ingested signals from{" "}
            <Badge variant="secondary" className="text-xs">
              {metadata.source as string}
            </Badge>
            {metadata.count && (
              <span className="text-muted-foreground">
                {" "}
                ({metadata.count as number} items)
              </span>
            )}
          </>
        );
      case "document.published":
        return (
          <>
            <strong>{userName}</strong> published document to{" "}
            <Badge variant="secondary" className="text-xs">
              {(metadata.destination as string) || "Notion"}
            </Badge>
          </>
        );
      case "tickets.synced":
        return (
          <>
            <strong>{userName}</strong> synced tickets to{" "}
            <Badge variant="secondary" className="text-xs">
              {metadata.toolkit as string}
            </Badge>
          </>
        );
      default:
        return (
          <>
            <strong>{userName}</strong> performed {activity.action}
          </>
        );
    }
  };

  const formatJobType = (jobType: string) => {
    return jobType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email[0].toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          A log of recent actions in this workspace
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : activities && activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={activity.user?.image || undefined} />
                  <AvatarFallback className="text-xs">
                    {activity.user
                      ? getInitials(activity.user.name, activity.user.email)
                      : "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getActivityIcon(activity.action)}
                    <span className="text-sm">
                      {getActivityDescription(activity)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No activity yet</p>
            <p className="text-sm">
              Actions in this workspace will appear here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
