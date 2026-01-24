"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { GitBranch, FolderOpen } from "lucide-react";

interface RepositorySettingsCardProps {
  githubRepo: string;
  setGithubRepo: (value: string) => void;
  baseBranch: string;
  setBaseBranch: (value: string) => void;
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
}: RepositorySettingsCardProps) {
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="githubRepo">GitHub Repo Path</Label>
            <Input
              id="githubRepo"
              placeholder="product-repos/ask-elephant"
              value={githubRepo}
              onChange={(e) => setGithubRepo(e.target.value)}
            />
            {resolvedPaths?.repoPath && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <FolderOpen className="w-3 h-3" />
                <span className="font-mono truncate" title={resolvedPaths.repoPath}>
                  {resolvedPaths.repoPath}
                </span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="baseBranch">Base Branch</Label>
            <Input
              id="baseBranch"
              placeholder="main"
              value={baseBranch}
              onChange={(e) => setBaseBranch(e.target.value)}
            />
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
            <Input
              id="prototypesPath"
              placeholder="src/components/prototypes/"
              value={prototypesPath}
              onChange={(e) => setPrototypesPath(e.target.value)}
            />
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
