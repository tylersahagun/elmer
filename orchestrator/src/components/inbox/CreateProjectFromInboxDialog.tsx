"use client";

import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CreateProjectFromInboxDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  initialName: string;
  initialDescription?: string;
  onCreated: (project: { id: string; name: string }) => void;
}

export function CreateProjectFromInboxDialog({
  open,
  onOpenChange,
  workspaceId,
  initialName,
  initialDescription,
  onCreated,
}: CreateProjectFromInboxDialogProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription || "");

  useEffect(() => {
    if (open) {
      setName(initialName);
      setDescription(initialDescription || "");
    }
  }, [initialDescription, initialName, open]);

  const createMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          name: name.trim(),
          description: description.trim() || undefined,
          stage: "inbox",
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to create project");
      }
      return response.json();
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ["projects", workspaceId] });
      onCreated(project);
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create project from inbox item</DialogTitle>
          <DialogDescription>
            Turn this incoming document or transcript into a tracked initiative.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project name</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="New project name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              placeholder="What should this initiative focus on?"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={!name.trim() || createMutation.isPending}
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create project"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
