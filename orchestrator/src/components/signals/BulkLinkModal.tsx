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

interface BulkLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSignalIds: string[];
  workspaceId: string;
  onSuccess?: () => void;
}

export function BulkLinkModal({
  isOpen,
  onClose,
  selectedSignalIds,
  workspaceId,
  onSuccess,
}: BulkLinkModalProps) {
  const [projectId, setProjectId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const bulkLinkMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/signals/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "link",
          signalIds: selectedSignalIds,
          projectId,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Bulk link failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["signals", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["signal-suggestions", workspaceId] });
      onSuccess?.();
      onClose();
    },
  });

  const handleClose = () => {
    setProjectId(null);
    bulkLinkMutation.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Link {selectedSignalIds.length} Signal{selectedSignalIds.length !== 1 ? "s" : ""}
          </DialogTitle>
          <DialogDescription>
            Select a project to link the selected signals to.
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
            Signals already linked to this project will be skipped.
          </p>

          {bulkLinkMutation.isError && (
            <p className="text-xs text-red-400">
              {bulkLinkMutation.error.message}
            </p>
          )}

          {bulkLinkMutation.isSuccess && bulkLinkMutation.data && (
            <p className="text-xs text-green-400">
              {bulkLinkMutation.data.message}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={() => bulkLinkMutation.mutate()}
            disabled={!projectId || bulkLinkMutation.isPending}
          >
            {bulkLinkMutation.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Link Signals
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
