"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface AgentArchitectureImporterProps {
  owner?: string;
  repo?: string;
  ref?: string;
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
  onSelectionChange,
}: AgentArchitectureImporterProps) {
  const [selection, setSelection] = useState<ArchitectureSelection>(DEFAULT_SELECTION);

  const { data, isLoading } = useQuery<AnalyzeResponse>({
    queryKey: ["github-analyze", owner, repo, ref],
    queryFn: async () => {
      const res = await fetch(`/api/github/${owner}/${repo}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref }),
      });
      if (!res.ok) throw new Error("Failed to analyze repo");
      return res.json();
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
      { key: "skills", label: ".cursor/skills", present: data.cursor.hasSkills },
      { key: "commands", label: ".cursor/commands", present: data.cursor.hasCommands },
      { key: "subagents", label: ".cursor/agents", present: data.cursor.hasAgents },
      { key: "rules", label: ".cursor/rules", present: data.cursor.hasRules },
      { key: "knowledge", label: "knowledge base", present: data.knowledgePaths.length > 0 },
      { key: "personas", label: "personas", present: data.personaPaths.length > 0 },
    ] as Array<{ key: keyof ArchitectureSelection; label: string; present: boolean }>;
  }, [data]);

  if (!owner || !repo) {
    return (
      <div className="text-sm text-muted-foreground">
        Select a GitHub repository to detect agent architecture.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {isLoading && (
        <div className="text-xs text-muted-foreground">Analyzing repository...</div>
      )}

      {!isLoading && data && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {detected.map((item) => (
              <Badge key={item.label} variant={item.present ? "secondary" : "outline"}>
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
        </div>
      )}
    </div>
  );
}
