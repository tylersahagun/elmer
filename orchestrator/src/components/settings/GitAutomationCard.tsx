"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { GitCommit } from "lucide-react";

interface GitAutomationCardProps {
  autoCreateFeatureBranch: boolean;
  setAutoCreateFeatureBranch: (value: boolean) => void;
  autoCommitJobs: boolean;
  setAutoCommitJobs: (value: boolean) => void;
}

export function GitAutomationCard({
  autoCreateFeatureBranch,
  setAutoCreateFeatureBranch,
  autoCommitJobs,
  setAutoCommitJobs,
}: GitAutomationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCommit className="w-5 h-5" />
          Git Automation
        </CardTitle>
        <CardDescription>
          Configure automatic git operations for your workflow
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
          <div className="min-w-0">
            <Label className="text-sm font-medium">Auto-create feature branch</Label>
            <p className="text-xs text-muted-foreground">
              Create a new branch when projects are added.
            </p>
          </div>
          <Switch
            className="shrink-0"
            checked={autoCreateFeatureBranch}
            onCheckedChange={setAutoCreateFeatureBranch}
          />
        </div>
        <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
          <div className="min-w-0">
            <Label className="text-sm font-medium">Auto-commit job output</Label>
            <p className="text-xs text-muted-foreground">
              Commit and push files from automation jobs.
            </p>
          </div>
          <Switch
            className="shrink-0"
            checked={autoCommitJobs}
            onCheckedChange={setAutoCommitJobs}
          />
        </div>
      </CardContent>
    </Card>
  );
}
