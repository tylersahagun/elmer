"use client";

/**
 * Signal Automation Settings Panel
 *
 * Configuration UI for signal automation (Phase 19).
 * Supports two modes:
 * 1. Controlled mode (settings + onChange) - for modal dialogs
 * 2. Self-contained mode (workspaceId + initialSettings) - for standalone pages
 */

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DEFAULT_SIGNAL_AUTOMATION,
  type SignalAutomationSettings,
  type SignalSeverity,
} from "@/lib/db/schema";
import { Zap, Bell, Shield, Clock, Save, RotateCcw } from "lucide-react";

// Controlled mode props (for modals with external save)
interface ControlledProps {
  settings: SignalAutomationSettings;
  onChange: (settings: SignalAutomationSettings) => void;
  workspaceId?: never;
  initialSettings?: never;
}

// Self-contained mode props (for standalone pages with built-in save)
interface SelfContainedProps {
  workspaceId: string;
  initialSettings?: SignalAutomationSettings;
  settings?: never;
  onChange?: never;
}

type Props = ControlledProps | SelfContainedProps;

export function SignalAutomationSettingsPanel(props: Props) {
  const isControlled = "settings" in props && props.settings !== undefined;

  // For self-contained mode
  const [internalSettings, setInternalSettings] =
    useState<SignalAutomationSettings>(
      isControlled
        ? DEFAULT_SIGNAL_AUTOMATION
        : props.initialSettings || DEFAULT_SIGNAL_AUTOMATION,
    );
  const [isDirty, setIsDirty] = useState(false);
  const queryClient = useQueryClient();

  // Get current settings based on mode
  const settings = isControlled ? props.settings : internalSettings;

  useEffect(() => {
    if (!isControlled && props.initialSettings) {
      const merged = { ...DEFAULT_SIGNAL_AUTOMATION, ...props.initialSettings };
      queueMicrotask(() => setInternalSettings(merged));
    }
  }, [isControlled, props.initialSettings]);

  const updateMutation = useMutation({
    mutationFn: async (newSettings: SignalAutomationSettings) => {
      if (isControlled) return; // Controlled mode doesn't use mutation
      const res = await fetch(`/api/workspaces/${props.workspaceId}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signalAutomation: newSettings }),
      });
      if (!res.ok) throw new Error("Failed to update settings");
      return res.json();
    },
    onSuccess: () => {
      if (!isControlled) {
        queryClient.invalidateQueries({
          queryKey: ["workspace", props.workspaceId],
        });
      }
      setIsDirty(false);
    },
  });

  const update = <K extends keyof SignalAutomationSettings>(
    key: K,
    value: SignalAutomationSettings[K],
  ) => {
    if (isControlled) {
      props.onChange({ ...props.settings, [key]: value });
    } else {
      setInternalSettings((prev) => ({ ...prev, [key]: value }));
      setIsDirty(true);
    }
  };

  // Render the form content (shared between modes)
  const formContent = (
    <>
      {/* Automation Depth */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-500" />
          <Label className="text-sm font-medium text-white/90">
            Automation Depth
          </Label>
        </div>
        <Select
          value={settings.automationDepth}
          onValueChange={(v) =>
            update(
              "automationDepth",
              v as SignalAutomationSettings["automationDepth"],
            )
          }
        >
          <SelectTrigger className="bg-white/5 border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">
              <span className="flex flex-col">
                <span>Manual</span>
                <span className="text-xs text-muted-foreground">
                  No automatic actions
                </span>
              </span>
            </SelectItem>
            <SelectItem value="suggest">
              <span className="flex flex-col">
                <span>Suggest</span>
                <span className="text-xs text-muted-foreground">
                  Show recommendations only
                </span>
              </span>
            </SelectItem>
            <SelectItem value="auto_create">
              <span className="flex flex-col">
                <span>Auto-Create</span>
                <span className="text-xs text-muted-foreground">
                  Create initiatives automatically
                </span>
              </span>
            </SelectItem>
            <SelectItem value="full_auto">
              <span className="flex flex-col">
                <span>Full Auto</span>
                <span className="text-xs text-muted-foreground">
                  Create initiatives + trigger PRD
                </span>
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-white/50">
          Control how aggressively the system acts on signal patterns.
        </p>
      </div>

      {/* Thresholds Section */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-blue-500" />
          <h4 className="text-sm font-medium text-white/90">
            Action Thresholds
          </h4>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-white/70">
              Auto-Initiative (signals)
            </Label>
            <Input
              type="number"
              min={2}
              max={20}
              className="bg-white/5 border-white/10 text-white"
              value={settings.autoInitiativeThreshold}
              onChange={(e) =>
                update("autoInitiativeThreshold", Number(e.target.value))
              }
            />
            <p className="text-xs text-white/50">
              Min signals to create initiative
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-white/70">Auto-PRD (signals)</Label>
            <Input
              type="number"
              min={3}
              max={30}
              className="bg-white/5 border-white/10 text-white"
              value={settings.autoPrdThreshold}
              onChange={(e) =>
                update("autoPrdThreshold", Number(e.target.value))
              }
            />
            <p className="text-xs text-white/50">Min signals to trigger PRD</p>
          </div>
        </div>

        {/* Confidence Threshold */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-white/70">
              Min Cluster Confidence
            </Label>
            <span className="text-xs text-white/50">
              {Math.round(settings.minClusterConfidence * 100)}%
            </span>
          </div>
          <Slider
            value={[settings.minClusterConfidence * 100]}
            onValueChange={([v]) => update("minClusterConfidence", v / 100)}
            min={50}
            max={100}
            step={5}
            className="w-full"
          />
          <p className="text-xs text-white/50">
            {"Clusters below this similarity won't trigger automation"}
          </p>
        </div>

        {/* Severity Filter */}
        <div className="space-y-2">
          <Label className="text-xs text-white/70">
            Min Severity for Auto-Actions
          </Label>
          <Select
            value={settings.minSeverityForAuto ?? "any"}
            onValueChange={(v) =>
              update(
                "minSeverityForAuto",
                v === "any" ? null : (v as SignalSeverity),
              )
            }
          >
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any severity</SelectItem>
              <SelectItem value="low">Low or higher</SelectItem>
              <SelectItem value="medium">Medium or higher</SelectItem>
              <SelectItem value="high">High or higher</SelectItem>
              <SelectItem value="critical">Critical only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-purple-500" />
          <h4 className="text-sm font-medium text-white/90">
            Notification Thresholds
          </h4>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-white/70">
              Notify on Cluster Size
            </Label>
            <Input
              type="number"
              min={1}
              max={20}
              className="bg-white/5 border-white/10 text-white"
              value={settings.notifyOnClusterSize ?? ""}
              placeholder="Any size"
              onChange={(e) =>
                update(
                  "notifyOnClusterSize",
                  e.target.value ? Number(e.target.value) : null,
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-white/70">Notify on Severity</Label>
            <Select
              value={settings.notifyOnSeverity ?? "any"}
              onValueChange={(v) =>
                update(
                  "notifyOnSeverity",
                  v === "any" ? null : (v as SignalSeverity),
                )
              }
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any severity</SelectItem>
                <SelectItem value="low">Low or higher</SelectItem>
                <SelectItem value="medium">Medium or higher</SelectItem>
                <SelectItem value="high">High or higher</SelectItem>
                <SelectItem value="critical">Critical only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <Label className="text-sm text-white/70">
              Suppress Duplicate Notifications
            </Label>
            <p className="text-xs text-white/50">
              {"Don't notify for same cluster within cooldown"}
            </p>
          </div>
          <Switch
            className="shrink-0"
            checked={settings.suppressDuplicateNotifications}
            onCheckedChange={(v) => update("suppressDuplicateNotifications", v)}
          />
        </div>
      </div>

      {/* Rate Limiting */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-green-500" />
          <h4 className="text-sm font-medium text-white/90">Rate Limiting</h4>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-white/70">Max Actions/Day</Label>
            <Input
              type="number"
              min={1}
              max={100}
              className="bg-white/5 border-white/10 text-white"
              value={settings.maxAutoActionsPerDay}
              onChange={(e) =>
                update("maxAutoActionsPerDay", Number(e.target.value))
              }
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-white/70">Cooldown (minutes)</Label>
            <Input
              type="number"
              min={5}
              max={1440}
              className="bg-white/5 border-white/10 text-white"
              value={settings.cooldownMinutes}
              onChange={(e) =>
                update("cooldownMinutes", Number(e.target.value))
              }
            />
          </div>
        </div>
        <p className="text-xs text-white/50">
          Safety limits to prevent runaway automation
        </p>
      </div>
    </>
  );

  // Controlled mode: render just the form content (no card wrapper, no save button)
  if (isControlled) {
    return <div className="space-y-6">{formContent}</div>;
  }

  // Self-contained mode: render with card wrapper and save button
  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Signal Automation</CardTitle>
        <CardDescription className="text-white/60">
          Configure how the system automatically processes and acts on incoming
          signals. Signals are user feedback, feature requests, and issues
          collected from various sources.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {formContent}

        {/* Save Button (only in self-contained mode) */}
        <div className="flex items-center gap-2 pt-4">
          <Button
            onClick={() => updateMutation.mutate(internalSettings)}
            disabled={!isDirty || updateMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Save className="mr-2 h-4 w-4" />
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
          {isDirty && (
            <Button
              variant="ghost"
              onClick={() => {
                setInternalSettings(
                  props.initialSettings || DEFAULT_SIGNAL_AUTOMATION,
                );
                setIsDirty(false);
              }}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Re-export defaults for convenience
export { DEFAULT_SIGNAL_AUTOMATION };
