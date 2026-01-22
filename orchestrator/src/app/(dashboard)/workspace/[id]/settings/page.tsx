"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Loader2,
  Save,
  Users,
  Settings,
  Shield,
  Eye,
  UserCircle,
} from "lucide-react";
import Link from "next/link";
import type { WorkspaceRole } from "@/lib/db/schema";

interface WorkspaceMember {
  id: string;
  userId: string;
  role: WorkspaceRole;
  joinedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface Workspace {
  id: string;
  name: string;
  description: string | null;
}

export default function WorkspaceSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: workspaceId } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [workspaceName, setWorkspaceName] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Fetch workspace details
  const { data: workspace, isLoading: isLoadingWorkspace } = useQuery<Workspace>({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}`);
      if (!res.ok) throw new Error("Failed to fetch workspace");
      return res.json();
    },
    enabled: !!workspaceId,
  });

  // Fetch workspace members
  const { data: members, isLoading: isLoadingMembers } = useQuery<WorkspaceMember[]>({
    queryKey: ["workspace-members", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/members`);
      if (!res.ok) {
        if (res.status === 403) return [];
        throw new Error("Failed to fetch members");
      }
      return res.json();
    },
    enabled: !!workspaceId,
  });

  // Update workspace mutation
  const updateWorkspace = useMutation({
    mutationFn: async (data: { name: string }) => {
      const res = await fetch(`/api/workspaces/${workspaceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update workspace");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      setIsEditing(false);
    },
  });

  // Find current user's role
  const currentUserMembership = members?.find(
    (m) => m.userId === session?.user?.id
  );
  const isAdmin = currentUserMembership?.role === "admin";

  const handleSave = () => {
    if (!workspaceName.trim()) return;
    updateWorkspace.mutate({ name: workspaceName.trim() });
  };

  const handleStartEdit = () => {
    setWorkspaceName(workspace?.name || "");
    setIsEditing(true);
  };

  const getRoleIcon = (role: WorkspaceRole) => {
    switch (role) {
      case "admin":
        return <Shield className="w-4 h-4" />;
      case "member":
        return <UserCircle className="w-4 h-4" />;
      case "viewer":
        return <Eye className="w-4 h-4" />;
    }
  };

  const getRoleBadgeVariant = (role: WorkspaceRole) => {
    switch (role) {
      case "admin":
        return "default";
      case "member":
        return "secondary";
      case "viewer":
        return "outline";
    }
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

  if (isLoadingWorkspace) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/workspace/${workspaceId}`}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Workspace Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your workspace settings and members
          </p>
        </div>
      </div>

      {/* Workspace Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Workspace Details</CardTitle>
          <CardDescription>
            Basic information about this workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workspace-name">Workspace Name</Label>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  id="workspace-name"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="max-w-md"
                  autoFocus
                />
                <Button
                  onClick={handleSave}
                  disabled={!workspaceName.trim() || updateWorkspace.isPending}
                  size="sm"
                  className="gap-2"
                >
                  {updateWorkspace.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-lg font-medium">{workspace?.name}</p>
                {isAdmin && (
                  <Button variant="ghost" size="sm" onClick={handleStartEdit}>
                    Edit
                  </Button>
                )}
              </div>
            )}
          </div>

          {workspace?.description && (
            <div className="space-y-2">
              <Label>Description</Label>
              <p className="text-muted-foreground">{workspace.description}</p>
            </div>
          )}

          {currentUserMembership && (
            <div className="space-y-2">
              <Label>Your Role</Label>
              <Badge
                variant={getRoleBadgeVariant(currentUserMembership.role)}
                className="gap-1"
              >
                {getRoleIcon(currentUserMembership.role)}
                {currentUserMembership.role}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Members Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Members
          </CardTitle>
          <CardDescription>
            People who have access to this workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingMembers ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : members && members.length > 0 ? (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.user.image || undefined} />
                      <AvatarFallback>
                        {getInitials(member.user.name, member.user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {member.user.name || member.user.email.split("@")[0]}
                        {member.userId === session?.user?.id && (
                          <span className="text-muted-foreground ml-2">(you)</span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.user.email}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={getRoleBadgeVariant(member.role)}
                    className="gap-1"
                  >
                    {getRoleIcon(member.role)}
                    {member.role}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No members found
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
