"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface GitHubWritebackCardProps {
  owner?: string | null;
  repo?: string | null;
  baseBranch?: string;
}

interface PlannedChange {
  path: string;
  content: string;
}

export function GitHubWritebackCard({
  owner,
  repo,
  baseBranch,
}: GitHubWritebackCardProps) {
  const [pathsInput, setPathsInput] = useState("");
  const [prTitle, setPrTitle] = useState("Create suggested directories");
  const [prBody, setPrBody] = useState("Adds directories required for agent architecture.");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prUrl, setPrUrl] = useState<string | null>(null);

  const plannedChanges = useMemo<PlannedChange[]>(() => {
    const paths = pathsInput
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    return paths.map((path) => {
      const normalized = path.replace(/^\/+/, "").replace(/\/+$/, "");
      return {
        path: `${normalized}/.gitkeep`,
        content: "",
      };
    });
  }, [pathsInput]);

  const canWrite = !!owner && !!repo && plannedChanges.length > 0 && !!baseBranch;

  const handleCreatePr = async () => {
    if (!owner || !repo || !baseBranch) return;
    setIsSubmitting(true);
    setPrUrl(null);
    try {
      const prepareRes = await fetch("/api/github/write/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner, repo, baseBranch }),
      });
      const prepareData = await prepareRes.json();
      if (!prepareRes.ok) throw new Error(prepareData.error || "Failed to prepare branch");

      const commitRes = await fetch("/api/github/write/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner,
          repo,
          branch: prepareData.branch,
          message: prTitle,
          files: plannedChanges,
        }),
      });
      const commitData = await commitRes.json();
      if (!commitRes.ok) throw new Error(commitData.error || "Failed to commit changes");

      const prRes = await fetch("/api/github/write/pr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner,
          repo,
          baseBranch,
          branch: prepareData.branch,
          title: prTitle,
          body: prBody,
        }),
      });
      const prData = await prRes.json();
      if (!prRes.ok) throw new Error(prData.error || "Failed to create PR");
      setPrUrl(prData.url);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>GitHub Write-back</CardTitle>
        <CardDescription>
          Create directories via a PR (adds `.gitkeep` files).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Directories to create</Label>
          <Textarea
            placeholder="elmer-docs/\npm-workspace-docs/personas/\n.cursor/skills/"
            value={pathsInput}
            onChange={(e) => setPathsInput(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>PR Title</Label>
          <Input value={prTitle} onChange={(e) => setPrTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>PR Body</Label>
          <Textarea value={prBody} onChange={(e) => setPrBody(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Diff Preview</Label>
          <div className="rounded-md border p-2 text-xs text-muted-foreground space-y-1">
            {plannedChanges.length === 0 && <div>No changes yet</div>}
            {plannedChanges.map((change) => (
              <div key={change.path} className="flex items-center gap-2">
                <Badge variant="outline">create</Badge>
                <span className="font-mono">{change.path}</span>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={handleCreatePr} disabled={!canWrite || isSubmitting}>
          {isSubmitting ? "Creating PR..." : "Create PR"}
        </Button>
        {prUrl && (
          <a href={prUrl} target="_blank" rel="noopener noreferrer" className="text-sm underline">
            View PR
          </a>
        )}
      </CardContent>
    </Card>
  );
}
