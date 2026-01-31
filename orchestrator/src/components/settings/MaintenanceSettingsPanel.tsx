"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, RotateCcw } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import type { MaintenanceSettings } from "@/lib/db/schema";

const DEFAULT_SETTINGS: MaintenanceSettings = {
  orphanThresholdDays: 14,
  flagOrphansEnabled: true,
  duplicateDetectionEnabled: true,
  duplicateSimilarityThreshold: 0.9,
  autoArchiveEnabled: false,
  autoArchiveLinkedAfterDays: 90,
  autoArchiveReviewedAfterDays: 30,
  suggestAssociationsEnabled: true,
  minSuggestionConfidence: 0.6,
  notifyOnOrphanThreshold: 10,
  notifyOnDuplicates: false,
};

interface MaintenanceSettingsPanelProps {
  workspaceId: string;
  initialSettings?: MaintenanceSettings;
}

export function MaintenanceSettingsPanel({
  workspaceId,
  initialSettings,
}: MaintenanceSettingsPanelProps) {
  const [settings, setSettings] = useState<MaintenanceSettings>(
    initialSettings || DEFAULT_SETTINGS,
  );
  const [isDirty, setIsDirty] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (initialSettings) {
      const merged = { ...DEFAULT_SETTINGS, ...initialSettings };
      queueMicrotask(() => setSettings(merged));
    }
  }, [initialSettings]);

  const updateMutation = useMutation({
    mutationFn: async (newSettings: MaintenanceSettings) => {
      const res = await fetch(`/api/workspaces/${workspaceId}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maintenance: newSettings }),
      });
      if (!res.ok) throw new Error("Failed to update settings");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] });
      setIsDirty(false);
    },
  });

  const updateField = <K extends keyof MaintenanceSettings>(
    field: K,
    value: MaintenanceSettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Maintenance Settings</CardTitle>
        <CardDescription className="text-white/60">
          Configure signal hygiene automation and thresholds
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Orphan Detection */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-white/90">
            Orphan Detection
          </h3>
          <div className="flex items-center justify-between">
            <Label htmlFor="flagOrphans" className="text-white/70">
              Flag orphan signals
            </Label>
            <Switch
              id="flagOrphans"
              checked={settings.flagOrphansEnabled}
              onCheckedChange={(v) => updateField("flagOrphansEnabled", v)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-white/70">
              Orphan threshold: {settings.orphanThresholdDays} days
            </Label>
            <Slider
              value={[settings.orphanThresholdDays]}
              min={7}
              max={90}
              step={1}
              onValueChange={([v]) => updateField("orphanThresholdDays", v)}
              disabled={!settings.flagOrphansEnabled}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-white/70">
              Notify when orphan count reaches
            </Label>
            <Input
              type="number"
              value={settings.notifyOnOrphanThreshold ?? ""}
              onChange={(e) =>
                updateField(
                  "notifyOnOrphanThreshold",
                  e.target.value ? parseInt(e.target.value) : null,
                )
              }
              placeholder="10"
              className="bg-white/5 border-white/10 text-white w-24"
              disabled={!settings.flagOrphansEnabled}
            />
          </div>
        </div>

        {/* Association Suggestions (MAINT-01) */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-white/90">
            Association Suggestions
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="suggestAssociations" className="text-white/70">
                Suggest project associations
              </Label>
              <p className="text-xs text-white/50">
                Show project suggestions for orphan signals
              </p>
            </div>
            <Switch
              id="suggestAssociations"
              checked={settings.suggestAssociationsEnabled}
              onCheckedChange={(v) =>
                updateField("suggestAssociationsEnabled", v)
              }
            />
          </div>
          <div className="space-y-2">
            <Label className="text-white/70">
              Minimum confidence:{" "}
              {Math.round(settings.minSuggestionConfidence * 100)}%
            </Label>
            <Slider
              value={[settings.minSuggestionConfidence * 100]}
              min={50}
              max={90}
              step={5}
              onValueChange={([v]) =>
                updateField("minSuggestionConfidence", v / 100)
              }
              disabled={!settings.suggestAssociationsEnabled}
            />
          </div>
        </div>

        {/* Duplicate Detection */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-white/90">
            Duplicate Detection
          </h3>
          <div className="flex items-center justify-between">
            <Label htmlFor="duplicates" className="text-white/70">
              Detect duplicate signals
            </Label>
            <Switch
              id="duplicates"
              checked={settings.duplicateDetectionEnabled}
              onCheckedChange={(v) =>
                updateField("duplicateDetectionEnabled", v)
              }
            />
          </div>
          <div className="space-y-2">
            <Label className="text-white/70">
              Similarity threshold:{" "}
              {Math.round(settings.duplicateSimilarityThreshold * 100)}%
            </Label>
            <Slider
              value={[settings.duplicateSimilarityThreshold * 100]}
              min={80}
              max={99}
              step={1}
              onValueChange={([v]) =>
                updateField("duplicateSimilarityThreshold", v / 100)
              }
              disabled={!settings.duplicateDetectionEnabled}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="notifyDuplicates" className="text-white/70">
              Notify on duplicates found
            </Label>
            <Switch
              id="notifyDuplicates"
              checked={settings.notifyOnDuplicates}
              onCheckedChange={(v) => updateField("notifyOnDuplicates", v)}
              disabled={!settings.duplicateDetectionEnabled}
            />
          </div>
        </div>

        {/* Auto-Archival */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-white/90">Auto-Archival</h3>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoArchive" className="text-white/70">
                Auto-archive old signals
              </Label>
              <p className="text-xs text-white/50">
                Automatically archive signals based on age
              </p>
            </div>
            <Switch
              id="autoArchive"
              checked={settings.autoArchiveEnabled}
              onCheckedChange={(v) => updateField("autoArchiveEnabled", v)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white/70 text-xs">
                Archive linked after (days)
              </Label>
              <Input
                type="number"
                value={settings.autoArchiveLinkedAfterDays}
                onChange={(e) =>
                  updateField(
                    "autoArchiveLinkedAfterDays",
                    parseInt(e.target.value) || 90,
                  )
                }
                className="bg-white/5 border-white/10 text-white"
                disabled={!settings.autoArchiveEnabled}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70 text-xs">
                Archive reviewed after (days)
              </Label>
              <Input
                type="number"
                value={settings.autoArchiveReviewedAfterDays}
                onChange={(e) =>
                  updateField(
                    "autoArchiveReviewedAfterDays",
                    parseInt(e.target.value) || 30,
                  )
                }
                className="bg-white/5 border-white/10 text-white"
                disabled={!settings.autoArchiveEnabled}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-2 pt-4">
          <Button
            onClick={() => updateMutation.mutate(settings)}
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
                setSettings(initialSettings || DEFAULT_SETTINGS);
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
