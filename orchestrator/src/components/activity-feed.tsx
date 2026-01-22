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
      const res = await fetch(`/api/workspaces/${workspaceId}/activity?limit=20`);
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
                <span className="font-medium">{metadata.projectName as string}</span>
              </>
            )}
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
    return jobType
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
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
            <p className="text-sm">Actions in this workspace will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
