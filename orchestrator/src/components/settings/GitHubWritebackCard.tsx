"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface GitHubWritebackCardProps {
  owner?: string | null;
  repo?: string | null;
  baseBranch?: string;
}

interface PlannedChange {
  path: string;
  content: string;
}

interface AnalyzeResponse {
  hasAgentsMd: boolean;
  cursor: {
    present: boolean;
    hasSkills: boolean;
    hasCommands: boolean;
    hasAgents: boolean;
    hasRules: boolean;
  };
  knowledgePaths: string[];
  personaPaths: string[];
}

export function GitHubWritebackCard({
  owner,
  repo,
  baseBranch,
}: GitHubWritebackCardProps) {
  const [prTitle, setPrTitle] = useState("Create suggested directories");
  const [prBody, setPrBody] = useState(
    "Adds directories required for agent architecture.",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prUrl, setPrUrl] = useState<string | null>(null);
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);

  const { data, isLoading } = useQuery<AnalyzeResponse>({
    queryKey: ["github-analyze", owner, repo, baseBranch],
    queryFn: async () => {
      const res = await fetch(`/api/github/${owner}/${repo}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref: baseBranch }),
      });
      if (!res.ok) throw new Error("Failed to analyze repo");
      return res.json();
    },
    enabled: !!owner && !!repo,
  });

  const suggestedPaths = useMemo(() => {
    if (!data) return [];
    const suggestions = new Set<string>();

    if (!data.cursor.present || !data.cursor.hasSkills) {
      suggestions.add(".cursor/skills/");
    }
    if (!data.cursor.present || !data.cursor.hasCommands) {
      suggestions.add(".cursor/commands/");
    }
    if (!data.cursor.present || !data.cursor.hasAgents) {
      suggestions.add(".cursor/agents/");
    }
    if (!data.cursor.present || !data.cursor.hasRules) {
      suggestions.add(".cursor/rules/");
    }

    if (data.knowledgePaths.length === 0) {
      suggestions.add("elmer-docs/");
      suggestions.add("elmer-docs/personas/");
    } else if (data.personaPaths.length === 0) {
      const primaryKnowledge = data.knowledgePaths[0];
      suggestions.add(`${primaryKnowledge}personas/`);
    }

    return Array.from(suggestions).sort();
  }, [data]);

  useEffect(() => {
    if (selectedPaths.length === 0 && suggestedPaths.length > 0) {
      setSelectedPaths(suggestedPaths);
    } else if (selectedPaths.length > 0 && suggestedPaths.length === 0) {
      setSelectedPaths([]);
    } else if (selectedPaths.length > 0 && suggestedPaths.length > 0) {
      setSelectedPaths((prev) =>
        prev.filter((path) => suggestedPaths.includes(path)),
      );
    }
  }, [suggestedPaths, selectedPaths.length]);

  const plannedChanges = useMemo<PlannedChange[]>(() => {
    return selectedPaths.map((path) => {
      const normalized = path.replace(/^\/+/, "").replace(/\/+$/, "");
      return {
        path: `${normalized}/.gitkeep`,
        content: "",
      };
    });
  }, [selectedPaths]);

  const canWrite =
    !!owner && !!repo && plannedChanges.length > 0 && !!baseBranch;

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
      if (!prepareRes.ok)
        throw new Error(prepareData.error || "Failed to prepare branch");

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
      if (!commitRes.ok)
        throw new Error(commitData.error || "Failed to commit changes");

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
        {!owner || !repo ? (
          <div className="text-sm text-muted-foreground">
            Select a GitHub repository to generate suggested directories.
          </div>
        ) : (
          <div className="space-y-2">
            <Label>Suggested directories</Label>
            {isLoading && (
              <div className="text-xs text-muted-foreground">
                Analyzing repository...
              </div>
            )}
            {!isLoading && suggestedPaths.length === 0 && (
              <div className="text-xs text-muted-foreground">
                No suggested directories found for this repository.
              </div>
            )}
            {!isLoading && suggestedPaths.length > 0 && (
              <div className="space-y-2 rounded-md border p-3">
                {suggestedPaths.map((path) => (
                  <div key={path} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      id={`writeback-${path}`}
                      checked={selectedPaths.includes(path)}
                      onCheckedChange={(checked) =>
                        setSelectedPaths((prev) =>
                          checked
                            ? [...prev, path]
                            : prev.filter((item) => item !== path),
                        )
                      }
                    />
                    <Label
                      htmlFor={`writeback-${path}`}
                      className="font-mono text-xs"
                    >
                      {path}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="space-y-2">
          <Label>PR Title</Label>
          <Input value={prTitle} onChange={(e) => setPrTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>PR Body</Label>
          <Textarea
            value={prBody}
            onChange={(e) => setPrBody(e.target.value)}
          />
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
          <a
            href={prUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm underline"
          >
            View PR
          </a>
        )}
      </CardContent>
    </Card>
  );
}
