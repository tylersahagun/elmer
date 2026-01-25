"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { GitBranch, FolderOpen } from "lucide-react";
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
}: RepositorySettingsCardProps) {
  // Handle repo selection and auto-configure branch
  const handleRepoChange = (
    value: string,
    repoDetails?: { defaultBranch?: string; owner?: { login: string }; name?: string }
  ) => {
    setGithubRepo(value);
    // Auto-set branch if repo provides default branch
    if (repoDetails?.defaultBranch) {
      setBaseBranch(repoDetails.defaultBranch);
    }
    if (repoDetails?.owner?.login && repoDetails?.name) {
      onRepoMetaChange?.({ owner: repoDetails.owner.login, repo: repoDetails.name });
    } else {
      onRepoMetaChange?.(null);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="w-5 h-5" />
          Repository & Prototypes
        </CardTitle>
        <CardDescription>
          Configure your GitHub repository and prototype settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Repository Settings */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>GitHub Repository</Label>
            <GithubRepoSelector
              value={githubRepo}
              onChange={handleRepoChange}
              onBranchChange={setBaseBranch}
              onPathsDetected={handlePathsDetected}
              placeholder="Select a repository"
            />
            {resolvedPaths?.repoPath && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                <FolderOpen className="w-3 h-3" />
                <span className="font-mono truncate" title={resolvedPaths.repoPath}>
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

        <div className="space-y-2">
          <Label htmlFor="cursorDeepLinkTemplate">Cursor Deep Link Template</Label>
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
                <span className="font-mono truncate" title={resolvedPaths.prototypesPath}>
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
