"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ProjectLinkCombobox } from "./ProjectLinkCombobox";

interface BulkUnlinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSignalIds: string[];
  workspaceId: string;
  onSuccess?: () => void;
}

export function BulkUnlinkModal({
  isOpen,
  onClose,
  selectedSignalIds,
  workspaceId,
  onSuccess,
}: BulkUnlinkModalProps) {
  const [projectId, setProjectId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const bulkUnlinkMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/signals/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "unlink",
          signalIds: selectedSignalIds,
          projectId,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Bulk unlink failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["signals", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["project-signals"] });
      onSuccess?.();
      onClose();
    },
  });

  const handleClose = () => {
    setProjectId(null);
    bulkUnlinkMutation.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Unlink {selectedSignalIds.length} Signal{selectedSignalIds.length !== 1 ? "s" : ""}
          </DialogTitle>
          <DialogDescription>
            Select a project to unlink the selected signals from.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Select Project</Label>
            <ProjectLinkCombobox
              workspaceId={workspaceId}
              onSelect={setProjectId}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Only signals currently linked to this project will be unlinked.
            Signals not linked to this project will be skipped.
          </p>

          {bulkUnlinkMutation.isError && (
            <p className="text-xs text-red-400">
              {bulkUnlinkMutation.error.message}
            </p>
          )}

          {bulkUnlinkMutation.isSuccess && bulkUnlinkMutation.data && (
            <p className="text-xs text-green-400">
              {bulkUnlinkMutation.data.message}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => bulkUnlinkMutation.mutate()}
            disabled={!projectId || bulkUnlinkMutation.isPending}
          >
            {bulkUnlinkMutation.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Unlink Signals
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
