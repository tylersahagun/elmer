"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Unlock, AlertTriangle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useKanbanStore } from "@/lib/store";

interface UnlockProjectDialogProps {
  projectId: string;
  projectName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UnlockProjectDialog({
  projectId,
  projectName,
  open,
  onOpenChange,
}: UnlockProjectDialogProps) {
  const [isUnlocking, setIsUnlocking] = React.useState(false);
  const [result, setResult] = React.useState<{ success: boolean; message: string } | null>(null);
  const updateProject = useKanbanStore((s) => s.updateProject);

  const handleUnlock = async () => {
    setIsUnlocking(true);
    setResult(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (res.ok) {
        setResult({ success: true, message: data.message });
        // Update the local store to reflect the unlocked state
        updateProject(projectId, {
          isLocked: false,
          activeJobStatus: undefined,
          activeJobType: undefined,
          activeJobProgress: undefined,
        });
        // Close dialog after a short delay to show success message
        setTimeout(() => {
          onOpenChange(false);
          setResult(null);
        }, 1500);
      } else {
        setResult({ success: false, message: data.error || "Failed to unlock project" });
      }
    } catch (error) {
      setResult({ success: false, message: "Network error. Please try again." });
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleClose = () => {
    if (!isUnlocking) {
      onOpenChange(false);
      setResult(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent from="bottom" className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20"
            >
              <Unlock className="w-5 h-5 text-amber-500" />
            </motion.div>
            <div>
              <DialogTitle className="text-base">Unlock Project?</DialogTitle>
              <DialogDescription className="text-sm mt-0.5">
                This will cancel any pending agent jobs
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
              {projectName}
            </p>
            <p className="text-xs text-muted-foreground">
              The project is currently waiting for an AI agent to process it.
            </p>
          </div>

          <div className="mt-4 flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="text-xs text-amber-800 dark:text-amber-200">
              <p className="font-medium mb-1">What happens when you unlock:</p>
              <ul className="list-disc list-inside space-y-0.5 text-amber-700 dark:text-amber-300">
                <li>Pending jobs will be cancelled</li>
                <li>You can drag the project to other columns</li>
                <li>You may need to re-trigger AI processing later</li>
              </ul>
            </div>
          </div>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-3 rounded-lg text-sm ${
                result.success
                  ? "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-500/20"
                  : "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/20"
              }`}
            >
              {result.message}
            </motion.div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUnlocking}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUnlock}
            disabled={isUnlocking || result?.success}
            className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-600 text-white border-0"
          >
            {isUnlocking ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Unlocking...
              </>
            ) : result?.success ? (
              "Unlocked!"
            ) : (
              <>
                <Unlock className="w-4 h-4 mr-2" />
                Unlock Project
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
