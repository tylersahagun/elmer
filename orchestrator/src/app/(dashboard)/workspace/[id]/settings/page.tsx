"use client";

import { useState, useEffect, use, useRef } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from "convex/react";
import Link from "next/link";
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
  Bot,
  Workflow,
  Plug,
  Terminal,
  ArrowRight,
} from "lucide-react";
import { SimpleNavbar } from "@/components/chrome/Navbar";
import { InviteModal } from "@/components/invite-modal";
import {
  RepositorySettingsCard,
  AgentArchitectureImporter,
  ContextPathsCard,
  GitAutomationCard,
  PipelineSettingsCard,
  PipelineWizard,
  ColumnsSettingsCard,
  ExecutionSettingsCard,
  SignalAutomationSettingsPanel,
  MaintenanceSettingsPanel,
  IntegrationsSettingsCard,
  GitHubWritebackCard,
  OnboardingStatusCard,
  SourceRepoTransformationsCard,
  ColumnAutomationCard,
  SkillsManagerCard,
  GraduationCriteriaCard,
  type KanbanColumn,
} from "@/components/settings";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import type {
  WorkspaceRole,
  MaintenanceSettings,
  SignalAutomationSettings,
  SourceRepoTransformation,
} from "@/lib/db/schema";

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
  // Onboarding status fields (will be populated by future schema additions)
  onboardingComplete?: boolean;
  onboardedAt?: string;
  onboardingStats?: {
    projectsImported?: number;
    personasImported?: number;
    knowledgeDocsImported?: number;
  };
  settings?: {
    prototypesPath?: string;
    storybookPort?: number;
    contextPaths?: string[];
    baseBranch?: string;
    githubRepoOwner?: string;
    githubRepoName?: string;
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
    sourceRepoTransformations?: SourceRepoTransformation[];
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
  const { user } = useCurrentUser();

  // UI state
  const [isEditingName, setIsEditingName] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState("setup");
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
  const [automationMode, setAutomationMode] = useState<
    "manual" | "auto_to_stage" | "auto_all"
  >("manual");
  const [automationStopStage, setAutomationStopStage] = useState("");
  const [automationNotifyStage, setAutomationNotifyStage] = useState("");
  const [knowledgebaseMapping, setKnowledgebaseMapping] = useState<
    Record<string, string>
  >({});

  // Form state - Execution
  const [workerEnabled, setWorkerEnabled] = useState(true);
  const [workerMaxConcurrency, setWorkerMaxConcurrency] = useState("10");
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] =
    useState(true);
  const [notifyOnJobComplete, setNotifyOnJobComplete] = useState(true);
  const [notifyOnJobFailed, setNotifyOnJobFailed] = useState(true);
  const [notifyOnApprovalRequired, setNotifyOnApprovalRequired] =
    useState(true);
  const [atomicCommitsEnabled, setAtomicCommitsEnabled] = useState(false);
  const [stateTrackingEnabled, setStateTrackingEnabled] = useState(false);
  const [verificationStrictness, setVerificationStrictness] = useState<
    "strict" | "lenient" | "disabled"
  >("lenient");

  // Columns state
  const [columns, setColumns] = useState<KanbanColumn[]>([]);

  // Source repo transformations state
  const [sourceRepoTransformations, setSourceRepoTransformations] = useState<
    SourceRepoTransformation[]
  >([]);

  // Fetch workspace details
  const { data: workspace, isLoading: isLoadingWorkspace } =
    useQuery<Workspace>({
      queryKey: ["workspace", workspaceId],
      queryFn: async () => {
        const res = await fetch(`/api/workspaces/${workspaceId}`);
        if (!res.ok) throw new Error("Failed to fetch workspace");
        return res.json();
      },
      enabled: !!workspaceId,
    });

  const rawMembers = useConvexQuery(api.memberships.listByWorkspace, {
    workspaceId: workspaceId as Id<"workspaces">,
  }) as
    | Array<{
        _id: string;
        userId?: string;
        clerkUserId: string;
        role: WorkspaceRole;
        joinedAt: number;
        displayName?: string;
        email?: string;
        image?: string;
      }>
    | undefined;
  const isLoadingMembers = rawMembers === undefined;
  const members: WorkspaceMember[] =
    rawMembers?.map((member) => ({
      id: member._id,
      userId: member.userId ?? member.clerkUserId,
      role: member.role,
      joinedAt: new Date(member.joinedAt).toISOString(),
      user: {
        id: member.userId ?? member.clerkUserId,
        name: member.displayName ?? null,
        email: member.email ?? "",
        image: member.image ?? null,
      },
    })) ?? [];

  // Fetch workspace invitations (admin only)
  const rawInvitations = useConvexQuery(api.invitations.listByWorkspace, {
    workspaceId: workspaceId as Id<"workspaces">,
  }) as
    | Array<{
        _id: string;
        email: string;
        role: WorkspaceRole;
        expiresAt: number;
        acceptedAt?: number;
        _creationTime: number;
        inviterName?: string;
        inviterEmail?: string;
      }>
    | undefined;
  const isLoadingInvitations = rawInvitations === undefined;
  const invitations: Invitation[] =
    rawInvitations?.map((inv) => ({
      id: inv._id,
      email: inv.email,
      role: inv.role,
      expiresAt: new Date(inv.expiresAt).toISOString(),
      acceptedAt: inv.acceptedAt ? new Date(inv.acceptedAt).toISOString() : null,
      createdAt: new Date(inv._creationTime).toISOString(),
      status: inv.acceptedAt
        ? "accepted"
        : inv.expiresAt < Date.now()
          ? "expired"
          : "pending",
      inviter: {
        id: inv.inviterEmail ?? "unknown",
        name: inv.inviterName ?? null,
        email: inv.inviterEmail ?? "",
      },
    })) ?? [];

  const { data: workspaceColumns, isLoading: isLoadingColumns } = useQuery<
    ColumnConfig[]
  >({
    queryKey: ["workspace-columns", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/columns`);
      if (!res.ok) throw new Error("Failed to fetch workspace columns");
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
      if (
        workspace.settings?.githubRepoOwner &&
        workspace.settings?.githubRepoName
      ) {
        setRepoOwner(workspace.settings.githubRepoOwner);
        setRepoName(workspace.settings.githubRepoName);
      } else {
        const parsedRepo = parseRepoSlug(workspace.githubRepo);
        setRepoOwner(parsedRepo?.owner ?? null);
        setRepoName(parsedRepo?.repo ?? null);
      }
      setCursorDeepLinkTemplate(
        workspace.settings?.cursorDeepLinkTemplate || "",
      );
      setPrototypesPath(workspace.settings?.prototypesPath || "");
      setStorybookPort(
        workspace.settings?.storybookPort
          ? String(workspace.settings.storybookPort)
          : "6006",
      );

      const workspaceContextPaths = workspace.settings?.contextPaths?.length
        ? workspace.settings.contextPaths
        : workspace.contextPath
          ? [workspace.contextPath]
          : ["elmer-docs/"];
      setContextPaths(workspaceContextPaths);

      setAutoCreateFeatureBranch(
        workspace.settings?.autoCreateFeatureBranch ?? true,
      );
      setAutoCommitJobs(workspace.settings?.autoCommitJobs ?? false);
      setAutomationMode(workspace.settings?.automationMode || "manual");
      setAutomationStopStage(workspace.settings?.automationStopStage || "");
      setAutomationNotifyStage(workspace.settings?.automationNotifyStage || "");
      setKnowledgebaseMapping(workspace.settings?.knowledgebaseMapping || {});
      setWorkerEnabled(workspace.settings?.workerEnabled ?? true);
      setWorkerMaxConcurrency(
        workspace.settings?.workerMaxConcurrency
          ? String(workspace.settings.workerMaxConcurrency)
          : "10",
      );
      setBrowserNotificationsEnabled(
        workspace.settings?.browserNotificationsEnabled ?? true,
      );
      setNotifyOnJobComplete(workspace.settings?.notifyOnJobComplete ?? true);
      setNotifyOnJobFailed(workspace.settings?.notifyOnJobFailed ?? true);
      setNotifyOnApprovalRequired(
        workspace.settings?.notifyOnApprovalRequired ?? true,
      );
      setAtomicCommitsEnabled(
        workspace.settings?.atomicCommitsEnabled ?? false,
      );
      setStateTrackingEnabled(
        workspace.settings?.stateTrackingEnabled ?? false,
      );
      setVerificationStrictness(
        workspace.settings?.verificationStrictness ?? "lenient",
      );
      setSourceRepoTransformations(
        workspace.settings?.sourceRepoTransformations ?? [],
      );
    }
  }, [workspace]);

  // Initialize columns from the workspace columns route
  useEffect(() => {
    if (workspaceColumns) {
      const mappedColumns: KanbanColumn[] = workspaceColumns.map(
        (col) => ({
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
        }),
      );
      setColumns(mappedColumns);
    }
  }, [workspaceColumns]);

  // Update workspace mutation
  const updateWorkspaceMutation = useConvexMutation(api.workspaces.update);
  const [isUpdatingWorkspace, setIsUpdatingWorkspace] = useState(false);

  // Revoke invitation mutation
  const revokeInvitation = useConvexMutation(api.invitations.revoke);
  const [revokingInvitationId, setRevokingInvitationId] = useState<string | null>(null);

  // Find current user's role
  const currentUserMembership = members?.find(
    (m) => m.userId === user?.id,
  );
  const isAdmin = currentUserMembership?.role === "admin";

  // Filter invitations by status
  const pendingInvitations =
    invitations?.filter((i) => i.status === "pending") || [];

  useEffect(() => {
    if (!showAdvanced && activeTab === "advanced") {
      setActiveTab("setup");
    }
  }, [activeTab, showAdvanced]);

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

  const parseRepoSlug = (value?: string | null) => {
    if (!value) return null;
    if (value.startsWith("product-repos/")) return null;
    const normalized = value
      .replace(/^https?:\/\/github\.com\//, "")
      .replace(/\.git$/, "")
      .trim();
    const [owner, repo, ...rest] = normalized.split("/");
    if (!owner || !repo || rest.length > 0) return null;
    return { owner, repo };
  };

  const resolvedRepoMeta =
    repoOwner && repoName
      ? { owner: repoOwner, repo: repoName }
      : parseRepoSlug(githubRepo);

  const repoResolutionAttemptedRef = useRef<string | null>(null);

  useEffect(() => {
    const repoPath = githubRepo.trim();
    if (!repoPath || repoOwner || repoName) return;
    if (!repoPath.startsWith("product-repos/")) return;
    if (repoResolutionAttemptedRef.current === repoPath) return;
    repoResolutionAttemptedRef.current = repoPath;

    const repoNameFromPath = repoPath
      .replace("product-repos/", "")
      .split("/")[0];
    if (!repoNameFromPath) return;

    const params = new URLSearchParams();
    params.set("search", repoNameFromPath);
    params.set("per_page", "100");
    params.set("sort", "updated");

    fetch(`/api/github/repos?${params}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const match = data?.repos?.find(
          (repo: { name: string; owner?: { login: string } }) => {
            return repo.name === repoNameFromPath && repo.owner?.login;
          },
        );
        if (match?.owner?.login) {
          setRepoOwner(match.owner.login);
          setRepoName(match.name);
        }
      })
      .catch(() => null);
  }, [githubRepo, repoOwner, repoName]);

  // Save all settings
  const handleSaveSettings = async () => {
    if (!workspaceId) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const normalizedContextPaths = normalizePaths(contextPaths);
      const sanitizedMapping = Object.fromEntries(
        Object.entries(knowledgebaseMapping).filter(([, value]) => value),
      );
      await updateWorkspaceMutation({
        workspaceId: workspaceId as Id<"workspaces">,
        name: workspaceName.trim() || undefined,
        description: workspaceDescription.trim() || undefined,
        githubRepo: githubRepo.trim() || undefined,
        contextPath: normalizedContextPaths[0],
        settings: {
          prototypesPath: prototypesPath.trim() || undefined,
          storybookPort: storybookPort ? Number(storybookPort) : undefined,
          contextPaths: normalizedContextPaths,
          baseBranch: baseBranch.trim() || "main",
          githubRepoOwner: resolvedRepoMeta?.owner || undefined,
          githubRepoName: resolvedRepoMeta?.repo || undefined,
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
          workerMaxConcurrency: workerMaxConcurrency
            ? Number(workerMaxConcurrency)
            : undefined,
          browserNotificationsEnabled,
          notifyOnJobComplete,
          notifyOnJobFailed,
          notifyOnApprovalRequired,
          atomicCommitsEnabled,
          verificationStrictness,
          stateTrackingEnabled,
          sourceRepoTransformations:
            sourceRepoTransformations.length > 0
              ? sourceRepoTransformations
              : undefined,
        },
      });
      queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save settings";
      console.error("Failed to save settings:", errorMessage);
      setSaveError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveName = () => {
    if (!workspaceName.trim()) return;
    setIsUpdatingWorkspace(true);
    void updateWorkspaceMutation({
      workspaceId: workspaceId as Id<"workspaces">,
      name: workspaceName.trim(),
      description: workspaceDescription.trim() || undefined,
    }).then(() => {
      queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      setIsEditingName(false);
    }).finally(() => {
      setIsUpdatingWorkspace(false);
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

  const getInitials = (name?: string | null, email?: string | null) => {
    const trimmedName = name?.trim();
    const trimmedEmail = email?.trim();

    if (trimmedName) {
      return trimmedName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (trimmedEmail) {
      return trimmedEmail[0].toUpperCase();
    }
    return "?";
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

  const renderSaveButton = () => (
    <div className="flex items-center justify-end gap-3">
      {saveError && <p className="text-sm text-destructive">{saveError}</p>}
      <Button onClick={handleSaveSettings} disabled={isSaving} className="gap-2">
        <Save className="w-4 h-4" />
        {isSaving ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <SimpleNavbar
        path={`~/workspace/${workspace?.name ?? workspaceId}/settings`}
      />

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
                Choose defaults for setup, lifecycle, connections, and access.
              </p>
            </div>
            {isAdmin && (
              <Button
                onClick={() => setShowInviteModal(true)}
                className="gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Invite Member
              </Button>
            )}
          </div>

          <Card className="mb-6 border-dashed">
            <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Settings now focus on setup, lifecycle defaults, and access.
                </p>
                <p className="text-sm text-muted-foreground">
                  Live diagnostics, runtime history, and operator views stay in
                  dedicated workspace surfaces so configuration remains simple.
                </p>
              </div>
              <Button
                variant={showAdvanced ? "secondary" : "outline"}
                onClick={() => setShowAdvanced((current) => !current)}
              >
                {showAdvanced ? "Hide Advanced" : "Show Advanced"}
              </Button>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <TabsList
                className={`grid h-auto w-full gap-2 bg-transparent p-0 ${
                  showAdvanced
                    ? "grid-cols-2 lg:grid-cols-6"
                    : "grid-cols-2 lg:grid-cols-5"
                }`}
              >
                <TabsTrigger
                  value="setup"
                  className="h-auto justify-start gap-2 rounded-md border bg-background px-3 py-2 text-left"
                >
                  <SettingsIcon className="w-4 h-4" />
                  <span>Setup</span>
                </TabsTrigger>
                <TabsTrigger
                  value="lifecycle"
                  className="h-auto justify-start gap-2 rounded-md border bg-background px-3 py-2 text-left"
                >
                  <Workflow className="w-4 h-4" />
                  <span>Lifecycle</span>
                </TabsTrigger>
                <TabsTrigger
                  value="automation"
                  className="h-auto justify-start gap-2 rounded-md border bg-background px-3 py-2 text-left"
                >
                  <Bot className="w-4 h-4" />
                  <span className="hidden sm:inline">Agents & Automation</span>
                  <span className="sm:hidden">Agents</span>
                </TabsTrigger>
                <TabsTrigger
                  value="connections"
                  className="h-auto justify-start gap-2 rounded-md border bg-background px-3 py-2 text-left"
                >
                  <Plug className="w-4 h-4" />
                  <span>Connections</span>
                </TabsTrigger>
                <TabsTrigger
                  value="access"
                  className="h-auto justify-start gap-2 rounded-md border bg-background px-3 py-2 text-left"
                >
                  <Users className="w-4 h-4" />
                  <span>Access</span>
                </TabsTrigger>
                {showAdvanced && (
                  <TabsTrigger
                    value="advanced"
                    className="h-auto justify-start gap-2 rounded-md border bg-background px-3 py-2 text-left"
                  >
                    <Terminal className="w-4 h-4" />
                    <span>Advanced</span>
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            {/* Setup Tab */}
            <TabsContent value="setup" className="space-y-6">
              {workspace?.onboardingComplete && (
                <OnboardingStatusCard
                  workspaceId={workspaceId}
                  onboardedAt={workspace.onboardedAt}
                  projectsImported={workspace.onboardingStats?.projectsImported}
                  personasImported={workspace.onboardingStats?.personasImported}
                  knowledgeDocsImported={
                    workspace.onboardingStats?.knowledgeDocsImported
                  }
                />
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Workspace Details</CardTitle>
                  <CardDescription>
                    Basic workspace identity and the role you hold here.
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
                          disabled={
                            !workspaceName.trim() || isUpdatingWorkspace
                          }
                          size="sm"
                          className="gap-2"
                        >
                          {isUpdatingWorkspace ? (
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleStartEdit}
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {isEditingName && (
                    <div className="space-y-2">
                      <Label htmlFor="workspace-description">
                        Description (optional)
                      </Label>
                      <Input
                        id="workspace-description"
                        value={workspaceDescription}
                        onChange={(e) =>
                          setWorkspaceDescription(e.target.value)
                        }
                        placeholder="A brief description of this workspace"
                        className="max-w-md"
                      />
                    </div>
                  )}

                  {!isEditingName && workspace?.description && (
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <p className="text-muted-foreground">
                        {workspace.description}
                      </p>
                    </div>
                  )}

                  {currentUserMembership && (
                    <div className="space-y-2">
                      <Label>Your Role</Label>
                      <Badge
                        variant={getRoleBadgeVariant(
                          currentUserMembership.role,
                        )}
                        className="gap-1"
                      >
                        {getRoleIcon(currentUserMembership.role)}
                        {currentUserMembership.role}
                      </Badge>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Workspace ID</Label>
                    <p className="text-xs font-mono text-muted-foreground">
                      {workspace?.id}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <RepositorySettingsCard
                githubRepo={githubRepo}
                setGithubRepo={setGithubRepo}
                baseBranch={baseBranch}
                setBaseBranch={setBaseBranch}
                repoOwner={resolvedRepoMeta?.owner ?? null}
                repoName={resolvedRepoMeta?.repo ?? null}
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
                mode={workspace?.onboardingComplete ? "edit" : "setup"}
              />

              <ContextPathsCard
                contextPaths={contextPaths}
                setContextPaths={setContextPaths}
                resolvedContextPath={workspace?.resolvedPaths?.contextPath}
                workspaceId={workspaceId}
                githubRepo={githubRepo}
                setGithubRepo={setGithubRepo}
                baseBranch={baseBranch}
                setBaseBranch={setBaseBranch}
                repoOwner={resolvedRepoMeta?.owner ?? null}
                repoName={resolvedRepoMeta?.repo ?? null}
                onRepoMetaChange={(meta) => {
                  setRepoOwner(meta?.owner ?? null);
                  setRepoName(meta?.repo ?? null);
                }}
                onContextPathDetected={(path) => {
                  setContextPaths((prev) => {
                    if (prev.includes(path)) return prev;
                    return [path, ...prev];
                  });
                }}
              />

              {renderSaveButton()}
            </TabsContent>

            {/* Lifecycle Tab */}
            <TabsContent value="lifecycle" className="space-y-6">
              {!showAdvanced && (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        Lifecycle settings stay focused on defaults and stage
                        progression.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Runtime tuning, raw stage editing, and operator controls
                        are tucked under Advanced.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowAdvanced(true)}
                    >
                      Show Advanced
                    </Button>
                  </CardContent>
                </Card>
              )}

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

              <GitAutomationCard
                autoCreateFeatureBranch={autoCreateFeatureBranch}
                setAutoCreateFeatureBranch={setAutoCreateFeatureBranch}
                autoCommitJobs={autoCommitJobs}
                setAutoCommitJobs={setAutoCommitJobs}
              />

              {renderSaveButton()}
            </TabsContent>

            {/* Agents & Automation Tab */}
            <TabsContent value="automation" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Guided Automation</CardTitle>
                  <CardDescription>
                    Use templates and guided flows here. Raw architecture import
                    and operator tooling now live under Advanced.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Button asChild variant="outline" className="gap-2">
                    <Link href={`/workspace/${workspaceId}/agents`}>
                      Open agents
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="gap-2">
                    <Link href={`/workspace/${workspaceId}/inbox`}>
                      Review inbox
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="gap-2">
                    <Link href={`/workspace/${workspaceId}/commands`}>
                      Command reference
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <PipelineWizard workspaceId={workspaceId} />

              <SignalAutomationSettingsPanel
                workspaceId={workspaceId}
                initialSettings={workspace?.settings?.signalAutomation}
              />
            </TabsContent>

            {/* Connections Tab */}
            <TabsContent value="connections" className="space-y-6">
              <IntegrationsSettingsCard workspaceId={workspaceId} />

              <GitHubWritebackCard
                owner={resolvedRepoMeta?.owner ?? null}
                repo={resolvedRepoMeta?.repo ?? null}
                baseBranch={baseBranch}
              />
            </TabsContent>

            {/* Access Tab */}
            <TabsContent value="access" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Members
                  </CardTitle>
                  <CardDescription>
                    People who can access this workspace.
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
                          className="flex items-center justify-between rounded-lg border bg-muted/30 p-3"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={member.user.image || undefined}
                              />
                              <AvatarFallback>
                                {getInitials(
                                  member.user.name,
                                  member.user.email,
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {member.user.name ||
                                  member.user.email.split("@")[0]}
                                {member.userId === user?.id && (
                                  <span className="ml-2 text-muted-foreground">
                                    (you)
                                  </span>
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
                    <p className="py-8 text-center text-muted-foreground">
                      No members found
                    </p>
                  )}
                </CardContent>
              </Card>

              {isAdmin && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      Pending Invitations
                    </CardTitle>
                    <CardDescription>
                      Invitations waiting to be accepted.
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
                            className="flex items-center justify-between rounded-lg border bg-muted/30 p-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                <Mail className="w-5 h-5 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  {invitation.email}
                                </p>
                                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                                  {getStatusIcon(invitation.status)}
                                  Expires{" "}
                                  {new Date(
                                    invitation.expiresAt,
                                  ).toLocaleDateString()}
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
                                onClick={() =>
                                  void (async () => {
                                    setRevokingInvitationId(invitation.id);
                                    try {
                                      await revokeInvitation({
                                        invitationId: invitation.id as Id<"invitations">,
                                      });
                                    } finally {
                                      setRevokingInvitationId(null);
                                    }
                                  })()
                                }
                                disabled={revokingInvitationId === invitation.id}
                                className="text-destructive hover:text-destructive"
                              >
                                {revokingInvitationId === invitation.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="py-8 text-center text-muted-foreground">
                        No pending invitations
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Advanced Tab */}
            {showAdvanced && (
              <TabsContent value="advanced" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Terminal className="w-5 h-5" />
                      Operator Surfaces
                    </CardTitle>
                    <CardDescription>
                      Live diagnostics and runtime views stay outside settings
                      so the default path remains focused.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-3">
                    <Button asChild variant="outline" className="gap-2">
                      <Link href={`/workspace/${workspaceId}`}>
                        Open board
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="gap-2">
                      <Link href={`/workspace/${workspaceId}/status`}>
                        Open status
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="gap-2">
                      <Link href={`/workspace/${workspaceId}/swarm`}>
                        Open swarm
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="gap-2">
                      <Link href={`/workspace/${workspaceId}/agents`}>
                        Open agents
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="gap-2">
                      <Link href={`/workspace/${workspaceId}/commands`}>
                        Open commands
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="gap-2">
                      <Link href={`/workspace/${workspaceId}/inbox`}>
                        Open inbox
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

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

                <ColumnsSettingsCard
                  columns={columns}
                  setColumns={setColumns}
                  workspaceId={workspaceId}
                  onColumnChange={() => {
                    queryClient.invalidateQueries({
                      queryKey: ["workspace", workspaceId],
                    });
                  }}
                />

                <ColumnAutomationCard workspaceId={workspaceId} />

                <GraduationCriteriaCard workspaceId={workspaceId} />

                <SourceRepoTransformationsCard
                  transformations={sourceRepoTransformations}
                  onChange={setSourceRepoTransformations}
                  onSync={async (sourceRepo) => {
                    const [owner, repo] = sourceRepo.split("/");
                    if (!owner || !repo) return;
                    await fetch("/api/agents/sync", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        workspaceId,
                        owner,
                        repo,
                        ref: baseBranch,
                        createPipeline: false,
                      }),
                    });
                    queryClient.invalidateQueries({
                      queryKey: ["agents", workspaceId],
                    });
                  }}
                />

                <Card>
                  <CardHeader>
                    <CardTitle>Agent Architecture</CardTitle>
                    <CardDescription>
                      Detect and select agent definitions to import from GitHub.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AgentArchitectureImporter
                      owner={resolvedRepoMeta?.owner ?? undefined}
                      repo={resolvedRepoMeta?.repo ?? undefined}
                      ref={baseBranch || undefined}
                      workspaceId={workspaceId}
                    />
                  </CardContent>
                </Card>

                <SkillsManagerCard workspaceId={workspaceId} />

                <MaintenanceSettingsPanel
                  workspaceId={workspaceId}
                  initialSettings={workspace?.settings?.maintenance}
                />

                {renderSaveButton()}
              </TabsContent>
            )}
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
