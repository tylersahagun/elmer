"use client";

/**
 * Signal Automation Settings Panel
 *
 * Configuration UI for signal automation (Phase 19).
 * Renders in WorkspaceSettingsModal as a new tab.
 */

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
import { DEFAULT_SIGNAL_AUTOMATION, type SignalAutomationSettings, type SignalSeverity } from "@/lib/db/schema";
import { Zap, Bell, Shield, Clock } from "lucide-react";

interface Props {
  settings: SignalAutomationSettings;
  onChange: (settings: SignalAutomationSettings) => void;
}

export function SignalAutomationSettingsPanel({ settings, onChange }: Props) {
  const update = <K extends keyof SignalAutomationSettings>(
    key: K,
    value: SignalAutomationSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Automation Depth */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-500" />
          <Label className="text-sm font-medium">Automation Depth</Label>
        </div>
        <Select
          value={settings.automationDepth}
          onValueChange={(v) =>
            update("automationDepth", v as SignalAutomationSettings["automationDepth"])
          }
        >
          <SelectTrigger className="bg-white/5 border-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">
              <span className="flex flex-col">
                <span>Manual</span>
                <span className="text-xs text-muted-foreground">No automatic actions</span>
              </span>
            </SelectItem>
            <SelectItem value="suggest">
              <span className="flex flex-col">
                <span>Suggest</span>
                <span className="text-xs text-muted-foreground">Show recommendations only</span>
              </span>
            </SelectItem>
            <SelectItem value="auto_create">
              <span className="flex flex-col">
                <span>Auto-Create</span>
                <span className="text-xs text-muted-foreground">Create initiatives automatically</span>
              </span>
            </SelectItem>
            <SelectItem value="full_auto">
              <span className="flex flex-col">
                <span>Full Auto</span>
                <span className="text-xs text-muted-foreground">Create initiatives + trigger PRD</span>
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Control how aggressively the system acts on signal patterns.
        </p>
      </div>

      {/* Thresholds Section */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-blue-500" />
          <h4 className="text-sm font-medium">Action Thresholds</h4>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs">Auto-Initiative (signals)</Label>
            <Input
              type="number"
              min={2}
              max={20}
              className="bg-white/5 border-white/10"
              value={settings.autoInitiativeThreshold}
              onChange={(e) => update("autoInitiativeThreshold", Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Min signals to create initiative
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Auto-PRD (signals)</Label>
            <Input
              type="number"
              min={3}
              max={30}
              className="bg-white/5 border-white/10"
              value={settings.autoPrdThreshold}
              onChange={(e) => update("autoPrdThreshold", Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Min signals to trigger PRD
            </p>
          </div>
        </div>

        {/* Confidence Threshold */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Min Cluster Confidence</Label>
            <span className="text-xs text-muted-foreground">
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
          <p className="text-xs text-muted-foreground">
            Clusters below this similarity won't trigger automation
          </p>
        </div>

        {/* Severity Filter */}
        <div className="space-y-2">
          <Label className="text-xs">Min Severity for Auto-Actions</Label>
          <Select
            value={settings.minSeverityForAuto ?? "any"}
            onValueChange={(v) =>
              update("minSeverityForAuto", v === "any" ? null : (v as SignalSeverity))
            }
          >
            <SelectTrigger className="bg-white/5 border-white/10">
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
          <h4 className="text-sm font-medium">Notification Thresholds</h4>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs">Notify on Cluster Size</Label>
            <Input
              type="number"
              min={1}
              max={20}
              className="bg-white/5 border-white/10"
              value={settings.notifyOnClusterSize ?? ""}
              placeholder="Any size"
              onChange={(e) =>
                update("notifyOnClusterSize", e.target.value ? Number(e.target.value) : null)
              }
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Notify on Severity</Label>
            <Select
              value={settings.notifyOnSeverity ?? "any"}
              onValueChange={(v) =>
                update("notifyOnSeverity", v === "any" ? null : (v as SignalSeverity))
              }
            >
              <SelectTrigger className="bg-white/5 border-white/10">
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

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm">Suppress Duplicate Notifications</Label>
            <p className="text-xs text-muted-foreground">
              Don't notify for same cluster within cooldown
            </p>
          </div>
          <Switch
            checked={settings.suppressDuplicateNotifications}
            onCheckedChange={(v) => update("suppressDuplicateNotifications", v)}
          />
        </div>
      </div>

      {/* Rate Limiting */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-green-500" />
          <h4 className="text-sm font-medium">Rate Limiting</h4>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs">Max Actions/Day</Label>
            <Input
              type="number"
              min={1}
              max={100}
              className="bg-white/5 border-white/10"
              value={settings.maxAutoActionsPerDay}
              onChange={(e) => update("maxAutoActionsPerDay", Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Cooldown (minutes)</Label>
            <Input
              type="number"
              min={5}
              max={1440}
              className="bg-white/5 border-white/10"
              value={settings.cooldownMinutes}
              onChange={(e) => update("cooldownMinutes", Number(e.target.value))}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Safety limits to prevent runaway automation
        </p>
      </div>
    </div>
  );
}

// Re-export defaults for convenience
export { DEFAULT_SIGNAL_AUTOMATION };
