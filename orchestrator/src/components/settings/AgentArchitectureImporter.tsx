"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface AgentArchitectureImporterProps {
  owner?: string;
  repo?: string;
  ref?: string;
  workspaceId?: string;
  onSelectionChange?: (selection: ArchitectureSelection) => void;
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

export interface ArchitectureSelection {
  agentsMd: boolean;
  skills: boolean;
  commands: boolean;
  subagents: boolean;
  rules: boolean;
  knowledge: boolean;
  personas: boolean;
}

const DEFAULT_SELECTION: ArchitectureSelection = {
  agentsMd: true,
  skills: true,
  commands: true,
  subagents: true,
  rules: true,
  knowledge: true,
  personas: true,
};

export function AgentArchitectureImporter({
  owner,
  repo,
  ref,
  workspaceId,
  onSelectionChange,
}: AgentArchitectureImporterProps) {
  const [selection, setSelection] =
    useState<ArchitectureSelection>(DEFAULT_SELECTION);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{
    definitions: number;
    pipelineCreated: number;
    pipelineExisting: number;
  } | null>(null);

  const { data, isLoading, error, refetch, isError } =
    useQuery<AnalyzeResponse>({
      queryKey: ["github-analyze", owner, repo, ref],
      queryFn: async () => {
        const res = await fetch(`/api/github/${owner}/${repo}/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ref }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Failed to analyze repo");
        return data;
      },
      enabled: !!owner && !!repo,
    });

  useEffect(() => {
    onSelectionChange?.(selection);
  }, [selection, onSelectionChange]);

  const detected = useMemo(() => {
    if (!data) return [];
    return [
      { key: "agentsMd", label: "AGENTS.md", present: data.hasAgentsMd },
      {
        key: "skills",
        label: ".cursor/skills",
        present: data.cursor.hasSkills,
      },
      {
        key: "commands",
        label: ".cursor/commands",
        present: data.cursor.hasCommands,
      },
      {
        key: "subagents",
        label: ".cursor/agents",
        present: data.cursor.hasAgents,
      },
      { key: "rules", label: ".cursor/rules", present: data.cursor.hasRules },
      {
        key: "knowledge",
        label: "knowledge base",
        present: data.knowledgePaths.length > 0,
      },
      {
        key: "personas",
        label: "personas",
        present: data.personaPaths.length > 0,
      },
    ] as Array<{
      key: keyof ArchitectureSelection;
      label: string;
      present: boolean;
    }>;
  }, [data]);

  if (!owner || !repo) {
    return (
      <div className="text-sm text-muted-foreground">
        Select a GitHub repository to detect agent architecture.
      </div>
    );
  }

  const handleImport = async () => {
    if (!workspaceId) {
      setImportError("Workspace ID is required to import.");
      return;
    }
    setIsImporting(true);
    setImportError(null);
    setImportResult(null);
    try {
      const res = await fetch("/api/agents/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          owner,
          repo,
          ref,
          createPipeline: true,
          selection,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to import agent architecture");
      }
      setImportResult({
        definitions: data.count || 0,
        pipelineCreated: data.pipeline?.created || 0,
        pipelineExisting: data.pipeline?.existing || 0,
      });
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Import failed");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-3">
      {isLoading && (
        <div className="text-xs text-muted-foreground">
          Analyzing repository...
        </div>
      )}

      {isError && (
        <div className="space-y-2 text-xs text-red-500">
          <div>
            Failed to analyze repository:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
          >
            Retry analysis
          </Button>
        </div>
      )}

      {!isLoading && !isError && data && (
        <div className="space-y-3">
          <div className="text-xs text-muted-foreground">
            Import agent definitions and create default pipeline columns for
            this workspace.
          </div>
          <div className="flex flex-wrap gap-2">
            {detected.map((item) => (
              <Badge
                key={item.label}
                variant={item.present ? "secondary" : "outline"}
              >
                {item.label}
              </Badge>
            ))}
          </div>

          <div className="space-y-2">
            {detected.map((item) => (
              <div key={item.key} className="flex items-center gap-2">
                <Checkbox
                  id={`import-${item.key}`}
                  checked={selection[item.key]}
                  disabled={!item.present}
                  onCheckedChange={(checked) =>
                    setSelection((prev) => ({
                      ...prev,
                      [item.key]: Boolean(checked),
                    }))
                  }
                />
                <Label htmlFor={`import-${item.key}`} className="text-sm">
                  Import {item.label}
                </Label>
              </div>
            ))}
          </div>

          {data.knowledgePaths.length > 0 && (
            <div className="text-xs text-muted-foreground">
              Detected knowledge paths: {data.knowledgePaths.join(", ")}
            </div>
          )}

          {importError && (
            <div className="text-xs text-red-500">{importError}</div>
          )}
          {importResult && (
            <div className="text-xs text-emerald-500">
              Imported {importResult.definitions} definitions.{" "}
              {importResult.pipelineCreated > 0
                ? `Created ${importResult.pipelineCreated} pipeline columns.`
                : `Pipeline columns already exist (${importResult.pipelineExisting}).`}
            </div>
          )}

          <Button
            type="button"
            onClick={handleImport}
            disabled={isImporting}
            className="w-full"
          >
            {isImporting
              ? "Importing..."
              : "Import Architecture + Create Pipeline"}
          </Button>
        </div>
      )}
    </div>
  );
}
