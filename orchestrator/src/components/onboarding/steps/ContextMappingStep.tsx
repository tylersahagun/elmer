"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ContextMappingStepProps {
  initialContextPaths: string[];
  initialPrototypesPath: string;
  initialAutomationMode: "manual" | "auto_to_stage" | "auto_all";
  initialAutomationStopStage?: string | null;
  onChange: (data: {
    contextPaths: string[];
    prototypesPath: string;
    automationMode: "manual" | "auto_to_stage" | "auto_all";
    automationStopStage?: string | null;
  }) => void;
}

const STOP_STAGES = [
  "discovery",
  "prd",
  "design",
  "prototype",
  "validate",
  "tickets",
  "build",
  "alpha",
  "beta",
  "ga",
];

export function ContextMappingStep({
  initialContextPaths,
  initialPrototypesPath,
  initialAutomationMode,
  initialAutomationStopStage,
  onChange,
}: ContextMappingStepProps) {
  const [contextPaths, setContextPaths] = useState(
    initialContextPaths.join(", "),
  );
  const [prototypesPath, setPrototypesPath] = useState(initialPrototypesPath);
  const [automationMode, setAutomationMode] = useState(initialAutomationMode);
  const [automationStopStage, setAutomationStopStage] = useState(
    initialAutomationStopStage || "",
  );

  const normalized = useMemo(() => {
    const paths = contextPaths
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
      .map((value) => (value.endsWith("/") ? value : `${value}/`));
    return {
      contextPaths: paths.length > 0 ? paths : ["elmer-docs/"],
      prototypesPath: prototypesPath.trim() || "prototypes/",
      automationMode,
      automationStopStage:
        automationMode === "auto_to_stage" && automationStopStage
          ? automationStopStage
          : null,
    };
  }, [automationMode, automationStopStage, contextPaths, prototypesPath]);

  useEffect(() => {
    onChange(normalized);
  }, [normalized, onChange]);

  return (
    <div className="space-y-6 py-2">
      <div className="space-y-2">
        <Label htmlFor="context-paths">Context paths</Label>
        <Input
          id="context-paths"
          value={contextPaths}
          onChange={(event) => setContextPaths(event.target.value)}
          placeholder="elmer-docs/, pm-workspace-docs/"
        />
        <p className="text-xs text-muted-foreground">
          Comma-separated repo paths for company context, initiatives, signals,
          and personas.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="prototype-path">Prototype output path</Label>
        <Input
          id="prototype-path"
          value={prototypesPath}
          onChange={(event) => setPrototypesPath(event.target.value)}
          placeholder="prototypes/ or product-repos/app/src/components/prototypes/"
        />
        <p className="text-xs text-muted-foreground">
          Where Elmer should write generated prototypes and linked Storybook
          assets.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Automation mode</Label>
          <Select
            value={automationMode}
            onValueChange={(value) =>
              setAutomationMode(value as "manual" | "auto_to_stage" | "auto_all")
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="auto_to_stage">Auto until stage</SelectItem>
              <SelectItem value="auto_all">Auto all stages</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Automation stop stage</Label>
          <Select
            value={automationStopStage || "none"}
            onValueChange={(value) =>
              setAutomationStopStage(value === "none" ? "" : value)
            }
            disabled={automationMode !== "auto_to_stage"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No stop stage</SelectItem>
              {STOP_STAGES.map((stage) => (
                <SelectItem key={stage} value={stage}>
                  {stage}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        These mappings become the initial workspace defaults. You can refine
        them later in Settings, but getting them right here makes project and
        agent automation much more reliable.
      </div>
    </div>
  );
}
