"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { GitBranch, FolderOpen, RefreshCw, AlertTriangle } from "lucide-react";
import { GithubRepoSelector } from "./GithubRepoSelector";
import { BranchSelector } from "./BranchSelector";
import { PathBrowser } from "./PathBrowser";

interface DetectedPath {
  type: "context" | "prototypes";
  path: string;
}

interface RepositorySettingsCardProps {
  githubRepo: string;
  setGithubRepo: (value: string) => void;
  baseBranch: string;
  setBaseBranch: (value: string) => void;
  repoOwner?: string | null;
  repoName?: string | null;
  onRepoMetaChange?: (meta: { owner: string; repo: string } | null) => void;
  cursorDeepLinkTemplate: string;
  setCursorDeepLinkTemplate: (value: string) => void;
  prototypesPath: string;
  setPrototypesPath: (value: string) => void;
  storybookPort: string;
  setStorybookPort: (value: string) => void;
  resolvedPaths?: {
    repoPath: string | null;
    prototypesPath: string | null;
  } | null;
  // Optional callbacks for auto-configuration
  onContextPathDetected?: (path: string) => void;
  onPrototypesPathDetected?: (path: string) => void;
  // Mode: 'setup' for initial configuration (legacy), 'edit' for post-onboarding adjustments
  mode?: "setup" | "edit";
  // Last synced timestamp for edit mode display
  lastSyncedAt?: string;
  // Callback for sync action
  onSync?: () => void;
}

export function RepositorySettingsCard({
  githubRepo,
  setGithubRepo,
  baseBranch,
  setBaseBranch,
  cursorDeepLinkTemplate,
  setCursorDeepLinkTemplate,
  prototypesPath,
  setPrototypesPath,
  storybookPort,
  setStorybookPort,
  resolvedPaths,
  onContextPathDetected,
  onPrototypesPathDetected,
  repoOwner,
  repoName,
  onRepoMetaChange,
  mode = "edit",
  lastSyncedAt,
  onSync,
}: RepositorySettingsCardProps) {
  const [isChangeDialogOpen, setIsChangeDialogOpen] = useState(false);
  const [tempGithubRepo, setTempGithubRepo] = useState(githubRepo);
  const [tempBaseBranch, setTempBaseBranch] = useState(baseBranch);
  const [tempRepoOwner, setTempRepoOwner] = useState(repoOwner);
  const [tempRepoName, setTempRepoName] = useState(repoName);

  // Handle repo selection and auto-configure branch
  const handleRepoChange = (
    value: string,
    repoDetails?: {
      defaultBranch?: string;
      owner?: { login: string };
      name?: string;
    },
  ) => {
    if (mode === "edit") {
      setTempGithubRepo(value);
      if (repoDetails?.defaultBranch) {
        setTempBaseBranch(repoDetails.defaultBranch);
      }
      if (repoDetails?.owner?.login && repoDetails?.name) {
        setTempRepoOwner(repoDetails.owner.login);
        setTempRepoName(repoDetails.name);
      } else {
        setTempRepoOwner(null);
        setTempRepoName(null);
      }
    } else {
      setGithubRepo(value);
      // Auto-set branch if repo provides default branch
      if (repoDetails?.defaultBranch) {
        setBaseBranch(repoDetails.defaultBranch);
      }
      if (repoDetails?.owner?.login && repoDetails?.name) {
        onRepoMetaChange?.({
          owner: repoDetails.owner.login,
          repo: repoDetails.name,
        });
      } else {
        onRepoMetaChange?.(null);
      }
    }
  };

  // Handle detected paths from GitHub repo scan
  const handlePathsDetected = (paths: DetectedPath[]) => {
    for (const detected of paths) {
      if (detected.type === "context" && onContextPathDetected) {
        onContextPathDetected(detected.path);
      } else if (detected.type === "prototypes") {
        // Auto-fill prototypes path
        setPrototypesPath(detected.path);
        if (onPrototypesPathDetected) {
          onPrototypesPathDetected(detected.path);
        }
      }
    }
  };

  // Apply changes from edit dialog
  const handleApplyChanges = () => {
    setGithubRepo(tempGithubRepo);
    setBaseBranch(tempBaseBranch);
    if (tempRepoOwner && tempRepoName) {
      onRepoMetaChange?.({ owner: tempRepoOwner, repo: tempRepoName });
    } else {
      onRepoMetaChange?.(null);
    }
    setIsChangeDialogOpen(false);
  };

  // Reset temp state when opening dialog
  const handleOpenChangeDialog = (open: boolean) => {
    if (open) {
      setTempGithubRepo(githubRepo);
      setTempBaseBranch(baseBranch);
      setTempRepoOwner(repoOwner ?? null);
      setTempRepoName(repoName ?? null);
    }
    setIsChangeDialogOpen(open);
  };

  // Format last synced time
  const formatLastSynced = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) {
      return "just now";
    } else if (diffHours === 1) {
      return "1 hour ago";
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  // Determine display repo name
  const displayRepoName = repoOwner && repoName
    ? `${repoOwner}/${repoName}`
    : githubRepo || "No repository connected";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="w-5 h-5" />
          Repository & Prototypes
        </CardTitle>
        <CardDescription>
          {mode === "edit"
            ? "Your connected GitHub repository and prototype settings"
            : "Configure your GitHub repository and prototype settings"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Edit Mode: Read-only display with change option */}
        {mode === "edit" && (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                  Connected Repository
                </Label>
                <p className="font-medium">{displayRepoName}</p>
                <p className="text-sm text-muted-foreground">
                  {baseBranch || "main"} branch
                  {lastSyncedAt && (
                    <> &middot; Last synced {formatLastSynced(lastSyncedAt)}</>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Dialog open={isChangeDialogOpen} onOpenChange={handleOpenChangeDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Change Repository
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Change Repository</DialogTitle>
                      <DialogDescription className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Changing repository will affect future syncs. Existing projects will not be modified.
                        </span>
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>GitHub Repository</Label>
                        <GithubRepoSelector
                          value={tempGithubRepo}
                          onChange={handleRepoChange}
                          onBranchChange={setTempBaseBranch}
                          onPathsDetected={handlePathsDetected}
                          onRepoResolved={(repo) => {
                            setTempRepoOwner(repo.owner.login);
                            setTempRepoName(repo.name);
                          }}
                          placeholder="Select a repository"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Base Branch</Label>
                        {tempRepoOwner && tempRepoName ? (
                          <BranchSelector
                            owner={tempRepoOwner}
                            repo={tempRepoName}
                            value={tempBaseBranch}
                            onChange={setTempBaseBranch}
                          />
                        ) : (
                          <Input
                            placeholder="main"
                            value={tempBaseBranch}
                            onChange={(e) => setTempBaseBranch(e.target.value)}
                          />
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button onClick={handleApplyChanges}>
                        Apply Changes
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                {onSync && (
                  <Button variant="outline" size="sm" onClick={onSync} className="gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" />
                    Sync Now
                  </Button>
                )}
              </div>
            </div>
            {resolvedPaths?.repoPath && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <FolderOpen className="w-3 h-3" />
                <span
                  className="font-mono truncate"
                  title={resolvedPaths.repoPath}
                >
                  Resolved: {resolvedPaths.repoPath}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Setup Mode: Inline editing (legacy behavior) */}
        {mode === "setup" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>GitHub Repository</Label>
              <GithubRepoSelector
                value={githubRepo}
                onChange={handleRepoChange}
                onBranchChange={setBaseBranch}
                onPathsDetected={handlePathsDetected}
                onRepoResolved={(repo) => {
                  onRepoMetaChange?.({
                    owner: repo.owner.login,
                    repo: repo.name,
                  });
                }}
                placeholder="Select a repository"
              />
              {resolvedPaths?.repoPath && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                  <FolderOpen className="w-3 h-3" />
                  <span
                    className="font-mono truncate"
                    title={resolvedPaths.repoPath}
                  >
                    Resolved: {resolvedPaths.repoPath}
                  </span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseBranch">Base Branch</Label>
              {repoOwner && repoName ? (
                <BranchSelector
                  owner={repoOwner}
                  repo={repoName}
                  value={baseBranch}
                  onChange={setBaseBranch}
                />
              ) : (
                <Input
                  id="baseBranch"
                  placeholder="main"
                  value={baseBranch}
                  onChange={(e) => setBaseBranch(e.target.value)}
                />
              )}
              <p className="text-xs text-muted-foreground">
                Auto-filled when selecting a repository from GitHub.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="cursorDeepLinkTemplate">
            Cursor Deep Link Template
          </Label>
          <Input
            id="cursorDeepLinkTemplate"
            placeholder="cursor://open?repo={repo}&branch={branch}"
            value={cursorDeepLinkTemplate}
            onChange={(e) => setCursorDeepLinkTemplate(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Supports {"{repo}"} and {"{branch}"} placeholders.
          </p>
        </div>

        {/* Prototypes & Storybook */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="prototypesPath">Prototypes Path</Label>
            <div className="flex items-center gap-2">
              <Input
                id="prototypesPath"
                placeholder="src/components/prototypes/"
                value={prototypesPath}
                onChange={(e) => setPrototypesPath(e.target.value)}
              />
              <PathBrowser
                owner={repoOwner || undefined}
                repo={repoName || undefined}
                ref={baseBranch || undefined}
                value={prototypesPath}
                onSelect={setPrototypesPath}
                label="Browse"
              />
            </div>
            {resolvedPaths?.prototypesPath && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <FolderOpen className="w-3 h-3" />
                <span
                  className="font-mono truncate"
                  title={resolvedPaths.prototypesPath}
                >
                  {resolvedPaths.prototypesPath}
                </span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="storybookPort">Storybook Port</Label>
            <Input
              id="storybookPort"
              type="number"
              min="1"
              max="65535"
              value={storybookPort}
              onChange={(e) => setStorybookPort(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
