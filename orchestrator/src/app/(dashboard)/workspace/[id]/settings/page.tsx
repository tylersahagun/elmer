"use client";

import { useState, useEffect, use } from "react";
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
  Workflow,
  Columns3,
  Sparkles,
  Plug,
} from "lucide-react";
import { SimpleNavbar } from "@/components/chrome/Navbar";
import { InviteModal } from "@/components/invite-modal";
import { ActivityFeed } from "@/components/activity-feed";
import {
  RepositorySettingsCard,
  AgentArchitectureImporter,
  ContextPathsCard,
  GitAutomationCard,
  PipelineSettingsCard,
  ColumnsSettingsCard,
  ExecutionSettingsCard,
  SignalAutomationSettingsPanel,
  MaintenanceSettingsPanel,
  IntegrationsSettingsCard,
  PendingQuestionsInbox,
  GitHubWritebackCard,
  type KanbanColumn,
} from "@/components/settings";
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

interface ColumnConfig {
  id: string;
  stage: string;
  displayName: string;
  color: string;
  order: number;
  enabled: boolean;
  autoTriggerJobs?: string[];
  agentTriggers?: Array<{
    agentDefinitionId: string;
    priority: number;
    conditions?: Record<string, unknown>;
  }>;
  humanInLoop?: boolean;
  requiredDocuments?: string[];
  requiredApprovals?: number;
  rules?: {
    contextPaths?: string[];
    contextNotes?: string;
    loopGroupId?: string;
    loopTargets?: string[];
    dependencyNotes?: string;
  };
}

interface Workspace {
  id: string;
  name: string;
  description: string | null;
  githubRepo: string | null;
  contextPath: string | null;
  columnConfigs?: ColumnConfig[];
  settings?: {
    prototypesPath?: string;
    storybookPort?: number;
    contextPaths?: string[];
    baseBranch?: string;
    autoCreateFeatureBranch?: boolean;
    autoCommitJobs?: boolean;
    cursorDeepLinkTemplate?: string;
    knowledgebaseMapping?: Record<string, string>;
    automationMode?: "manual" | "auto_to_stage" | "auto_all";
    automationStopStage?: string;
    automationNotifyStage?: string;
    workerEnabled?: boolean;
    workerMaxConcurrency?: number;
    browserNotificationsEnabled?: boolean;
    notifyOnJobComplete?: boolean;
    notifyOnJobFailed?: boolean;
    notifyOnApprovalRequired?: boolean;
    atomicCommitsEnabled?: boolean;
    verificationStrictness?: "strict" | "lenient" | "disabled";
    stateTrackingEnabled?: boolean;
    composio?: {
      apiKey?: string;
      enabled?: boolean;
      connectedServices?: string[];
    };
    maintenance?: MaintenanceSettings;
    signalAutomation?: SignalAutomationSettings;
  };
  resolvedPaths?: {
    contextPath: string | null;
    prototypesPath: string | null;
    repoPath: string | null;
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
  
  // UI state
  const [isEditingName, setIsEditingName] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Form state - General
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const [repoOwner, setRepoOwner] = useState<string | null>(null);
  const [repoName, setRepoName] = useState<string | null>(null);
  const [baseBranch, setBaseBranch] = useState("main");
  const [cursorDeepLinkTemplate, setCursorDeepLinkTemplate] = useState("");
  const [prototypesPath, setPrototypesPath] = useState("");
  const [storybookPort, setStorybookPort] = useState("6006");
  const [contextPaths, setContextPaths] = useState<string[]>(["elmer-docs/"]);
  const [autoCreateFeatureBranch, setAutoCreateFeatureBranch] = useState(true);
  const [autoCommitJobs, setAutoCommitJobs] = useState(false);
  
  // Form state - Pipeline
  const [automationMode, setAutomationMode] = useState<"manual" | "auto_to_stage" | "auto_all">("manual");
  const [automationStopStage, setAutomationStopStage] = useState("");
  const [automationNotifyStage, setAutomationNotifyStage] = useState("");
  const [knowledgebaseMapping, setKnowledgebaseMapping] = useState<Record<string, string>>({});
  
  // Form state - Execution
  const [workerEnabled, setWorkerEnabled] = useState(true);
  const [workerMaxConcurrency, setWorkerMaxConcurrency] = useState("10");
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState(true);
  const [notifyOnJobComplete, setNotifyOnJobComplete] = useState(true);
  const [notifyOnJobFailed, setNotifyOnJobFailed] = useState(true);
  const [notifyOnApprovalRequired, setNotifyOnApprovalRequired] = useState(true);
  const [atomicCommitsEnabled, setAtomicCommitsEnabled] = useState(false);
  const [stateTrackingEnabled, setStateTrackingEnabled] = useState(false);
  const [verificationStrictness, setVerificationStrictness] = useState<"strict" | "lenient" | "disabled">("lenient");
  
  // Columns state
  const [columns, setColumns] = useState<KanbanColumn[]>([]);

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


  // Initialize form state from workspace data
  useEffect(() => {
    if (workspace) {
      setWorkspaceName(workspace.name || "");
      setWorkspaceDescription(workspace.description || "");
      setGithubRepo(workspace.githubRepo || "");
      setBaseBranch(workspace.settings?.baseBranch || "main");
      setCursorDeepLinkTemplate(workspace.settings?.cursorDeepLinkTemplate || "");
      setPrototypesPath(workspace.settings?.prototypesPath || "");
      setStorybookPort(workspace.settings?.storybookPort ? String(workspace.settings.storybookPort) : "6006");
      
      const workspaceContextPaths =
        workspace.settings?.contextPaths?.length
          ? workspace.settings.contextPaths
          : workspace.contextPath
            ? [workspace.contextPath]
            : ["elmer-docs/"];
      setContextPaths(workspaceContextPaths);
      
      setAutoCreateFeatureBranch(workspace.settings?.autoCreateFeatureBranch ?? true);
      setAutoCommitJobs(workspace.settings?.autoCommitJobs ?? false);
      setAutomationMode(workspace.settings?.automationMode || "manual");
      setAutomationStopStage(workspace.settings?.automationStopStage || "");
      setAutomationNotifyStage(workspace.settings?.automationNotifyStage || "");
      setKnowledgebaseMapping(workspace.settings?.knowledgebaseMapping || {});
      setWorkerEnabled(workspace.settings?.workerEnabled ?? true);
      setWorkerMaxConcurrency(workspace.settings?.workerMaxConcurrency ? String(workspace.settings.workerMaxConcurrency) : "10");
      setBrowserNotificationsEnabled(workspace.settings?.browserNotificationsEnabled ?? true);
      setNotifyOnJobComplete(workspace.settings?.notifyOnJobComplete ?? true);
      setNotifyOnJobFailed(workspace.settings?.notifyOnJobFailed ?? true);
      setNotifyOnApprovalRequired(workspace.settings?.notifyOnApprovalRequired ?? true);
      setAtomicCommitsEnabled(workspace.settings?.atomicCommitsEnabled ?? false);
      setStateTrackingEnabled(workspace.settings?.stateTrackingEnabled ?? false);
      setVerificationStrictness(workspace.settings?.verificationStrictness ?? "lenient");
    }
  }, [workspace]);

  // Initialize columns from workspace data
  useEffect(() => {
    if (workspace?.columnConfigs) {
      const mappedColumns: KanbanColumn[] = workspace.columnConfigs.map((col) => ({
        id: col.stage,
        configId: col.id,
        displayName: col.displayName,
        color: col.color,
        order: col.order,
        enabled: col.enabled,
        autoTriggerJobs: col.autoTriggerJobs,
        agentTriggers: col.agentTriggers,
        humanInLoop: col.humanInLoop,
        requiredDocuments: col.requiredDocuments,
        requiredApprovals: col.requiredApprovals,
        contextPaths: col.rules?.contextPaths,
        contextNotes: col.rules?.contextNotes,
        loopGroupId: col.rules?.loopGroupId,
        loopTargets: col.rules?.loopTargets,
        dependencyNotes: col.rules?.dependencyNotes,
      }));
      setColumns(mappedColumns);
    }
  }, [workspace?.columnConfigs]);

  // Update workspace mutation
  const updateWorkspace = useMutation({
    mutationFn: async (data: { name?: string; description?: string }) => {
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
      setIsEditingName(false);
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

  // Normalize paths
  const normalizePath = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "";
    return trimmed.endsWith("/") ? trimmed : `${trimmed}/`;
  };

  const normalizePaths = (paths: string[]) => {
    const normalized = paths.map(normalizePath).filter(Boolean);
    return normalized.length ? normalized : ["elmer-docs/"];
  };

  // Save all settings
  const handleSaveSettings = async () => {
    if (!workspaceId) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const normalizedContextPaths = normalizePaths(contextPaths);
      const sanitizedMapping = Object.fromEntries(
        Object.entries(knowledgebaseMapping).filter(([, value]) => value)
      );
      const res = await fetch(`/api/workspaces/${workspaceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workspaceName.trim() || undefined,
          description: workspaceDescription.trim() || undefined,
          githubRepo: githubRepo.trim() || null,
          contextPath: normalizedContextPaths[0],
          settings: {
            prototypesPath: prototypesPath.trim() || undefined,
            storybookPort: storybookPort ? Number(storybookPort) : undefined,
            contextPaths: normalizedContextPaths,
            baseBranch: baseBranch.trim() || "main",
            autoCreateFeatureBranch,
            autoCommitJobs,
            cursorDeepLinkTemplate: cursorDeepLinkTemplate.trim() || undefined,
            aiExecutionMode: "server",
            aiValidationMode: "schema",
            knowledgebaseMapping: sanitizedMapping,
            automationMode,
            automationStopStage: automationStopStage || undefined,
            automationNotifyStage: automationNotifyStage || undefined,
            workerEnabled,
            workerMaxConcurrency: workerMaxConcurrency ? Number(workerMaxConcurrency) : undefined,
            browserNotificationsEnabled,
            notifyOnJobComplete,
            notifyOnJobFailed,
            notifyOnApprovalRequired,
            atomicCommitsEnabled,
            verificationStrictness,
            stateTrackingEnabled,
          },
        }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update workspace (${res.status})`);
      }
      queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save settings";
      console.error("Failed to save settings:", errorMessage);
      setSaveError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveName = () => {
    if (!workspaceName.trim()) return;
    updateWorkspace.mutate({
      name: workspaceName.trim(),
      description: workspaceDescription.trim() || undefined,
    });
  };

  const handleStartEdit = () => {
    setWorkspaceName(workspace?.name || "");
    setWorkspaceDescription(workspace?.description || "");
    setIsEditingName(true);
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
                Manage workspace configuration, pipeline, and team
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
            <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:inline-grid">
              <TabsTrigger value="general" className="gap-2">
                <Info className="w-4 h-4" />
                <span className="hidden sm:inline">General</span>
              </TabsTrigger>
              <TabsTrigger value="pipeline" className="gap-2">
                <Columns3 className="w-4 h-4" />
                <span className="hidden sm:inline">Pipeline</span>
              </TabsTrigger>
              <TabsTrigger value="execution" className="gap-2">
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Execution</span>
              </TabsTrigger>
              <TabsTrigger value="automation" className="gap-2">
                <Bot className="w-4 h-4" />
                <span className="hidden sm:inline">Automation</span>
              </TabsTrigger>
              <TabsTrigger value="integrations" className="gap-2">
                <Plug className="w-4 h-4" />
                <span className="hidden sm:inline">Integrations</span>
              </TabsTrigger>
              <TabsTrigger value="team" className="gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Team</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-2">
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Activity</span>
              </TabsTrigger>
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general" className="space-y-6">
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
                    {isEditingName ? (
                      <div className="flex items-center gap-2">
                        <Input
                          id="workspace-name"
                          value={workspaceName}
                          onChange={(e) => setWorkspaceName(e.target.value)}
                          className="max-w-md"
                          autoFocus
                        />
                        <Button
                          onClick={handleSaveName}
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
                          onClick={() => setIsEditingName(false)}
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

                  {isEditingName && (
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

                  {!isEditingName && workspace?.description && (
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

                  <div className="space-y-2">
                    <Label>Workspace ID</Label>
                    <p className="text-xs font-mono text-muted-foreground">{workspace?.id}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Repository & Prototypes */}
              <RepositorySettingsCard
                githubRepo={githubRepo}
                setGithubRepo={setGithubRepo}
                baseBranch={baseBranch}
                setBaseBranch={setBaseBranch}
                repoOwner={repoOwner}
                repoName={repoName}
                onRepoMetaChange={(meta) => {
                  setRepoOwner(meta?.owner ?? null);
                  setRepoName(meta?.repo ?? null);
                }}
                cursorDeepLinkTemplate={cursorDeepLinkTemplate}
                setCursorDeepLinkTemplate={setCursorDeepLinkTemplate}
                prototypesPath={prototypesPath}
                setPrototypesPath={setPrototypesPath}
                storybookPort={storybookPort}
                setStorybookPort={setStorybookPort}
                resolvedPaths={workspace?.resolvedPaths}
                onContextPathDetected={(path) => {
                  setContextPaths((prev) => {
                    if (prev.includes(path)) return prev;
                    return [path, ...prev];
                  });
                }}
              />

              {/* Context Paths */}
              <ContextPathsCard
                contextPaths={contextPaths}
                setContextPaths={setContextPaths}
                resolvedContextPath={workspace?.resolvedPaths?.contextPath}
                workspaceId={workspaceId}
                repoOwner={repoOwner}
                repoName={repoName}
                baseBranch={baseBranch}
              />

              <GitHubWritebackCard
                owner={repoOwner}
                repo={repoName}
                baseBranch={baseBranch}
              />

              {/* Agent Architecture Import */}
              <Card>
                <CardHeader>
                  <CardTitle>Agent Architecture</CardTitle>
                  <CardDescription>
                    Detect and select agent definitions to import from GitHub.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AgentArchitectureImporter
                    owner={repoOwner || undefined}
                    repo={repoName || undefined}
                    ref={baseBranch || undefined}
                  />
                </CardContent>
              </Card>

              {/* Git Automation */}
              <GitAutomationCard
                autoCreateFeatureBranch={autoCreateFeatureBranch}
                setAutoCreateFeatureBranch={setAutoCreateFeatureBranch}
                autoCommitJobs={autoCommitJobs}
                setAutoCommitJobs={setAutoCommitJobs}
              />

              {/* Save Button */}
              <div className="flex items-center justify-end gap-3">
                {saveError && (
                  <p className="text-sm text-destructive">{saveError}</p>
                )}
                <Button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </TabsContent>

            {/* Pipeline Tab */}
            <TabsContent value="pipeline" className="space-y-6">
              {/* Pipeline Configuration */}
              <PipelineSettingsCard
                automationMode={automationMode}
                setAutomationMode={setAutomationMode}
                automationStopStage={automationStopStage}
                setAutomationStopStage={setAutomationStopStage}
                automationNotifyStage={automationNotifyStage}
                setAutomationNotifyStage={setAutomationNotifyStage}
                knowledgebaseMapping={knowledgebaseMapping}
                setKnowledgebaseMapping={setKnowledgebaseMapping}
                columns={columns}
              />

              {/* Columns Configuration */}
              <ColumnsSettingsCard
                columns={columns}
                setColumns={setColumns}
                workspaceId={workspaceId}
                onColumnChange={() => {
                  queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] });
                }}
              />

              {/* Save Button */}
              <div className="flex items-center justify-end gap-3">
                {saveError && (
                  <p className="text-sm text-destructive">{saveError}</p>
                )}
                <Button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </TabsContent>

            {/* Execution Tab */}
            <TabsContent value="execution" className="space-y-6">
              <ExecutionSettingsCard
                workerEnabled={workerEnabled}
                setWorkerEnabled={setWorkerEnabled}
                workerMaxConcurrency={workerMaxConcurrency}
                setWorkerMaxConcurrency={setWorkerMaxConcurrency}
                browserNotificationsEnabled={browserNotificationsEnabled}
                setBrowserNotificationsEnabled={setBrowserNotificationsEnabled}
                notifyOnJobComplete={notifyOnJobComplete}
                setNotifyOnJobComplete={setNotifyOnJobComplete}
                notifyOnJobFailed={notifyOnJobFailed}
                setNotifyOnJobFailed={setNotifyOnJobFailed}
                notifyOnApprovalRequired={notifyOnApprovalRequired}
                setNotifyOnApprovalRequired={setNotifyOnApprovalRequired}
                atomicCommitsEnabled={atomicCommitsEnabled}
                setAtomicCommitsEnabled={setAtomicCommitsEnabled}
                stateTrackingEnabled={stateTrackingEnabled}
                setStateTrackingEnabled={setStateTrackingEnabled}
                verificationStrictness={verificationStrictness}
                setVerificationStrictness={setVerificationStrictness}
              />
              <PendingQuestionsInbox workspaceId={workspaceId} />

              {/* Save Button */}
              <div className="flex items-center justify-end gap-3">
                {saveError && (
                  <p className="text-sm text-destructive">{saveError}</p>
                )}
                <Button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "Saving..." : "Save Settings"}
                </Button>
              </div>
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

            {/* Integrations Tab */}
            <TabsContent value="integrations" className="space-y-6">
              <IntegrationsSettingsCard workspaceId={workspaceId} />
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
