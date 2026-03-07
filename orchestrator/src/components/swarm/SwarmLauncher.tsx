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
    preset: "flagship",
    label: "Flagship",
    description: "Full four-lane swarm across memory, integrations, runtime, and desktop UX.",
  },
  {
    preset: "phase-1",
    label: "Phase 1",
    description: "Memory backend, context integrity, and live integrations.",
  },
  {
    preset: "phase-2",
    label: "Phase 2",
    description: "Runtime APIs, HITL controls, and execution observability.",
  },
  {
    preset: "phase-3",
    label: "Phase 3",
    description: "Desktop flagship UX, onboarding, and workspace productivity.",
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
          Launch a named swarm preset to organize work by lane and save a corresponding artifact.
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
