"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SwarmPreset } from "@/lib/swarm/types";

const PRESETS: Array<{
  preset: SwarmPreset;
  label: string;
  description: string;
}> = [
  {
    preset: "internal-alpha",
    label: "Internal Alpha",
    description: "Full control room for source-of-truth, reliability, tests, memory, migration, runtime collaboration, and alpha UX.",
  },
  {
    preset: "stability-gates",
    label: "Stability Gates",
    description: "Release-gate lanes only: reliability, deterministic tests, memory cutover, and migration.",
  },
  {
    preset: "runtime-collaboration",
    label: "Runtime Collaboration",
    description: "Attribution, presence, orchestrator visibility, and team access once the core gates are holding.",
  },
  {
    preset: "chat-readiness",
    label: "Chat Readiness",
    description: "Keep alpha UX and Chat/Agent Hub planning visible without opening premature implementation.",
  },
];

interface SwarmLauncherProps {
  activePreset: SwarmPreset;
  onPresetChange: (preset: SwarmPreset) => void;
}

export function SwarmLauncher({
  activePreset,
  onPresetChange,
}: SwarmLauncherProps) {
  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div>
        <h3 className="font-medium">Swarm presets</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Save a derived control-room artifact that groups Elmer work by the current internal-alpha lanes. Linear remains the canonical tracker.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.preset}
            onClick={() => onPresetChange(preset.preset)}
            className={`rounded-lg border p-4 text-left transition-colors ${
              activePreset === preset.preset
                ? "border-purple-400/40 bg-purple-500/5"
                : "hover:bg-muted/40"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="font-medium">{preset.label}</div>
              {activePreset === preset.preset && (
                <Badge variant="secondary">Active</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {preset.description}
            </p>
          </button>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {PRESETS.map((preset) => (
          <Button
            key={`quick-${preset.preset}`}
            variant={activePreset === preset.preset ? "default" : "outline"}
            size="sm"
            onClick={() => onPresetChange(preset.preset)}
          >
            {preset.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
