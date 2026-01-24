"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Bell, Workflow, Users } from "lucide-react";

interface ExecutionSettingsCardProps {
  // Background Worker
  workerEnabled: boolean;
  setWorkerEnabled: (value: boolean) => void;
  workerMaxConcurrency: string;
  setWorkerMaxConcurrency: (value: string) => void;
  // Browser Notifications
  browserNotificationsEnabled: boolean;
  setBrowserNotificationsEnabled: (value: boolean) => void;
  notifyOnJobComplete: boolean;
  setNotifyOnJobComplete: (value: boolean) => void;
  notifyOnJobFailed: boolean;
  setNotifyOnJobFailed: (value: boolean) => void;
  notifyOnApprovalRequired: boolean;
  setNotifyOnApprovalRequired: (value: boolean) => void;
  // GSD-inspired settings
  atomicCommitsEnabled: boolean;
  setAtomicCommitsEnabled: (value: boolean) => void;
  stateTrackingEnabled: boolean;
  setStateTrackingEnabled: (value: boolean) => void;
  verificationStrictness: "strict" | "lenient" | "disabled";
  setVerificationStrictness: (value: "strict" | "lenient" | "disabled") => void;
  // Jury Config
  juryMinSize?: number;
  setJuryMinSize?: (value: number) => void;
  juryApprovalThreshold?: number;
  setJuryApprovalThreshold?: (value: number) => void;
}

export function ExecutionSettingsCard({
  workerEnabled,
  setWorkerEnabled,
  workerMaxConcurrency,
  setWorkerMaxConcurrency,
  browserNotificationsEnabled,
  setBrowserNotificationsEnabled,
  notifyOnJobComplete,
  setNotifyOnJobComplete,
  notifyOnJobFailed,
  setNotifyOnJobFailed,
  notifyOnApprovalRequired,
  setNotifyOnApprovalRequired,
  atomicCommitsEnabled,
  setAtomicCommitsEnabled,
  stateTrackingEnabled,
  setStateTrackingEnabled,
  verificationStrictness,
  setVerificationStrictness,
  juryMinSize,
  setJuryMinSize,
  juryApprovalThreshold,
  setJuryApprovalThreshold,
}: ExecutionSettingsCardProps) {
  return (
    <div className="space-y-6">
      {/* Background Worker */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Background Worker
          </CardTitle>
          <CardDescription>
            Configure the background agent that automatically processes jobs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div className="min-w-0">
              <Label className="text-sm font-medium">Enable Auto-Execution</Label>
              <p className="text-xs text-muted-foreground">
                Automatically process jobs when projects move stages.
              </p>
            </div>
            <Switch
              className="shrink-0"
              checked={workerEnabled}
              onCheckedChange={setWorkerEnabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="workerMaxConcurrency">Max Concurrent Jobs</Label>
            <Input
              id="workerMaxConcurrency"
              type="number"
              min="1"
              max="50"
              value={workerMaxConcurrency}
              onChange={(e) => setWorkerMaxConcurrency(e.target.value)}
              disabled={!workerEnabled}
              className="max-w-[200px]"
            />
            <p className="text-xs text-muted-foreground">
              Maximum number of jobs to run simultaneously.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Browser Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-500" />
            Browser Notifications
          </CardTitle>
          <CardDescription>
            Configure when to receive browser notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div className="min-w-0">
              <Label className="text-sm font-medium">Enable Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Show browser notifications for job events.
              </p>
            </div>
            <Switch
              className="shrink-0"
              checked={browserNotificationsEnabled}
              onCheckedChange={setBrowserNotificationsEnabled}
            />
          </div>
          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div className="min-w-0">
              <Label className="text-sm font-medium">Job Completed</Label>
              <p className="text-xs text-muted-foreground">
                Notify when a job finishes successfully.
              </p>
            </div>
            <Switch
              className="shrink-0"
              checked={notifyOnJobComplete}
              onCheckedChange={setNotifyOnJobComplete}
              disabled={!browserNotificationsEnabled}
            />
          </div>
          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div className="min-w-0">
              <Label className="text-sm font-medium">Job Failed</Label>
              <p className="text-xs text-muted-foreground">
                Notify when a job fails or errors out.
              </p>
            </div>
            <Switch
              className="shrink-0"
              checked={notifyOnJobFailed}
              onCheckedChange={setNotifyOnJobFailed}
              disabled={!browserNotificationsEnabled}
            />
          </div>
          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div className="min-w-0">
              <Label className="text-sm font-medium">Approval Required</Label>
              <p className="text-xs text-muted-foreground">
                Notify when human input is needed.
              </p>
            </div>
            <Switch
              className="shrink-0"
              checked={notifyOnApprovalRequired}
              onCheckedChange={setNotifyOnApprovalRequired}
              disabled={!browserNotificationsEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Task Execution (GSD-inspired) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="w-5 h-5 text-purple-500" />
            Task Execution
          </CardTitle>
          <CardDescription>
            Configure how tasks are executed and verified
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div className="min-w-0">
              <Label className="text-sm font-medium">Atomic Commits</Label>
              <p className="text-xs text-muted-foreground">
                Create a git commit after each task completes
              </p>
            </div>
            <Switch
              className="shrink-0"
              checked={atomicCommitsEnabled}
              onCheckedChange={setAtomicCommitsEnabled}
            />
          </div>
          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div className="min-w-0">
              <Label className="text-sm font-medium">State Tracking</Label>
              <p className="text-xs text-muted-foreground">
                Auto-generate state.md documents for progress
              </p>
            </div>
            <Switch
              className="shrink-0"
              checked={stateTrackingEnabled}
              onCheckedChange={setStateTrackingEnabled}
            />
          </div>
          <div className="space-y-2">
            <Label>Verification Strictness</Label>
            <Select
              value={verificationStrictness}
              onValueChange={(value) => setVerificationStrictness(value as "strict" | "lenient" | "disabled")}
            >
              <SelectTrigger className="max-w-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strict">Strict - Stop on any failure</SelectItem>
                <SelectItem value="lenient">Lenient - Log warnings, continue</SelectItem>
                <SelectItem value="disabled">Disabled - Skip verification</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              How to handle task verification failures
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Jury Configuration */}
      {setJuryMinSize && setJuryApprovalThreshold && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              Jury Configuration
            </CardTitle>
            <CardDescription>
              Configure synthetic user jury for validation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Minimum Jury Size</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={juryMinSize ?? 3}
                  onChange={(e) => setJuryMinSize(Number(e.target.value))}
                  className="max-w-[200px]"
                />
                <p className="text-xs text-muted-foreground">
                  Number of personas to include in each validation jury.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Approval Threshold (%)</Label>
                <Input
                  type="number"
                  min="50"
                  max="100"
                  value={juryApprovalThreshold ?? 70}
                  onChange={(e) => setJuryApprovalThreshold(Number(e.target.value))}
                  className="max-w-[200px]"
                />
                <p className="text-xs text-muted-foreground">
                  Percentage of positive votes required to pass validation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
