"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { CheckCircle2, RefreshCw, Loader2, FolderGit2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface OnboardingStatusCardProps {
  workspaceId: string;
  onboardedAt?: string;
  projectsImported?: number;
  personasImported?: number;
  knowledgeDocsImported?: number;
  className?: string;
}

export function OnboardingStatusCard({
  workspaceId,
  onboardedAt,
  projectsImported,
  personasImported,
  knowledgeDocsImported,
  className,
}: OnboardingStatusCardProps) {
  const [isResyncing, setIsResyncing] = useState(false);
  const [resyncError, setResyncError] = useState<string | null>(null);
  const [resyncSuccess, setResyncSuccess] = useState(false);

  const handleResync = async () => {
    setIsResyncing(true);
    setResyncError(null);
    setResyncSuccess(false);

    try {
      // Stub for future /api/onboarding/re-discover endpoint
      const res = await fetch(`/api/onboarding/re-discover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to re-sync from GitHub");
      }

      setResyncSuccess(true);
    } catch (error) {
      setResyncError(
        error instanceof Error ? error.message : "Re-sync failed"
      );
    } finally {
      setIsResyncing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Build import stats string
  const importStats: string[] = [];
  if (projectsImported !== undefined && projectsImported > 0) {
    importStats.push(`${projectsImported} project${projectsImported !== 1 ? "s" : ""}`);
  }
  if (personasImported !== undefined && personasImported > 0) {
    importStats.push(`${personasImported} persona${personasImported !== 1 ? "s" : ""}`);
  }
  if (knowledgeDocsImported !== undefined && knowledgeDocsImported > 0) {
    importStats.push(`${knowledgeDocsImported} knowledge doc${knowledgeDocsImported !== 1 ? "s" : ""}`);
  }

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderGit2 className="w-5 h-5" />
          Onboarding Status
        </CardTitle>
        <CardDescription>
          Your workspace setup and GitHub sync status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Completion Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/10">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="font-medium text-emerald-600 dark:text-emerald-400">
              Completed
              {onboardedAt && (
                <span className="text-muted-foreground font-normal">
                  {" "}on {formatDate(onboardedAt)}
                </span>
              )}
            </p>
            {importStats.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Imported: {importStats.join(", ")}
              </p>
            )}
          </div>
        </div>

        {/* Resync feedback */}
        {resyncError && (
          <div className="p-2 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
            {resyncError}
          </div>
        )}
        {resyncSuccess && (
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm">
            Re-sync completed successfully!
          </div>
        )}

        {/* Re-sync Button with Confirmation Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary" className="gap-2" disabled={isResyncing}>
              <RefreshCw className={cn("w-4 h-4", isResyncing && "animate-spin")} />
              {isResyncing ? "Re-syncing..." : "Re-sync from GitHub"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Re-sync from GitHub?</DialogTitle>
              <DialogDescription>
                This will scan your repository for new initiatives. Existing projects will not be affected.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button onClick={handleResync} disabled={isResyncing}>
                  {isResyncing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Confirm Re-sync
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
