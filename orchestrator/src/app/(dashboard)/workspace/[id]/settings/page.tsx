"use client";

import { useState, use } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Loader2,
  Save,
  Users,
  Settings as SettingsIcon,
  Shield,
  Eye,
  UserCircle,
  UserPlus,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  Activity,
  Bot,
  Info,
} from "lucide-react";
import { SimpleNavbar } from "@/components/chrome/Navbar";
import { InviteModal } from "@/components/invite-modal";
import { ActivityFeed } from "@/components/activity-feed";
import { MaintenanceSettingsPanel } from "@/components/settings/MaintenanceSettingsPanel";
import { SignalAutomationSettingsPanel } from "@/components/settings/SignalAutomationSettings";
import type { WorkspaceRole, MaintenanceSettings, SignalAutomationSettings } from "@/lib/db/schema";

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

interface Invitation {
  id: string;
  email: string;
  role: WorkspaceRole;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
  status: "pending" | "expired" | "accepted";
  inviter: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface Workspace {
  id: string;
  name: string;
  description: string | null;
  settings?: {
    maintenance?: MaintenanceSettings;
    signalAutomation?: SignalAutomationSettings;
  };
}

export default function WorkspaceSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: workspaceId } = use(params);
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

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

  // Fetch workspace invitations (admin only)
  const { data: invitations, isLoading: isLoadingInvitations } = useQuery<Invitation[]>({
    queryKey: ["workspace-invitations", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/invitations`);
      if (!res.ok) {
        if (res.status === 403) return [];
        throw new Error("Failed to fetch invitations");
      }
      return res.json();
    },
    enabled: !!workspaceId,
  });

  // Update workspace mutation
  const updateWorkspace = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
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

  // Revoke invitation mutation
  const revokeInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/invitations?invitationId=${invitationId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to revoke invitation");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspace-invitations", workspaceId],
      });
    },
  });

  // Find current user's role
  const currentUserMembership = members?.find(
    (m) => m.userId === session?.user?.id
  );
  const isAdmin = currentUserMembership?.role === "admin";

  // Filter invitations by status
  const pendingInvitations = invitations?.filter((i) => i.status === "pending") || [];

  const handleSave = () => {
    if (!workspaceName.trim()) return;
    updateWorkspace.mutate({
      name: workspaceName.trim(),
      description: workspaceDescription.trim() || undefined,
    });
  };

  const handleStartEdit = () => {
    setWorkspaceName(workspace?.name || "");
    setWorkspaceDescription(workspace?.description || "");
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-amber-500" />;
      case "accepted":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "expired":
        return <XCircle className="w-4 h-4 text-red-500" />;
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
      <>
        <SimpleNavbar path={`~/workspace/${workspaceId}/settings`} />
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <SimpleNavbar path={`~/workspace/${workspaceId}/settings`} />

      <main className="flex-1 min-h-0 overflow-auto">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <SettingsIcon className="w-7 h-7" />
                Workspace Settings
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage workspace configuration and team
              </p>
            </div>
            {isAdmin && (
              <Button onClick={() => setShowInviteModal(true)} className="gap-2">
                <UserPlus className="w-4 h-4" />
                Invite Member
              </Button>
            )}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
              <TabsTrigger value="general" className="gap-2">
                <Info className="w-4 h-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="team" className="gap-2">
                <Users className="w-4 h-4" />
                Team
              </TabsTrigger>
              <TabsTrigger value="automation" className="gap-2">
                <Bot className="w-4 h-4" />
                Automation
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-2">
                <Activity className="w-4 h-4" />
                Activity
              </TabsTrigger>
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general" className="space-y-6">
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

                  {isEditing && (
                    <div className="space-y-2">
                      <Label htmlFor="workspace-description">Description (optional)</Label>
                      <Input
                        id="workspace-description"
                        value={workspaceDescription}
                        onChange={(e) => setWorkspaceDescription(e.target.value)}
                        placeholder="A brief description of this workspace"
                        className="max-w-md"
                      />
                    </div>
                  )}

                  {!isEditing && workspace?.description && (
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
            </TabsContent>

            {/* Team Tab */}
            <TabsContent value="team" className="space-y-6">
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

              {/* Pending Invitations Card (Admin Only) */}
              {isAdmin && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      Pending Invitations
                    </CardTitle>
                    <CardDescription>
                      Invitations waiting to be accepted
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingInvitations ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : pendingInvitations.length > 0 ? (
                      <div className="space-y-3">
                        {pendingInvitations.map((invitation) => (
                          <div
                            key={invitation.id}
                            className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                <Mail className="w-5 h-5 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium">{invitation.email}</p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  {getStatusIcon(invitation.status)}
                                  Expires{" "}
                                  {new Date(invitation.expiresAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={getRoleBadgeVariant(invitation.role)}
                                className="gap-1"
                              >
                                {getRoleIcon(invitation.role)}
                                {invitation.role}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => revokeInvitation.mutate(invitation.id)}
                                disabled={revokeInvitation.isPending}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No pending invitations
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Automation Tab */}
            <TabsContent value="automation" className="space-y-6">
              <SignalAutomationSettingsPanel
                workspaceId={workspaceId}
                initialSettings={workspace?.settings?.signalAutomation}
              />

              <MaintenanceSettingsPanel
                workspaceId={workspaceId}
                initialSettings={workspace?.settings?.maintenance}
              />
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity">
              <ActivityFeed workspaceId={workspaceId} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Invite Modal */}
      <InviteModal
        workspaceId={workspaceId}
        open={showInviteModal}
        onOpenChange={setShowInviteModal}
      />
    </div>
  );
}
