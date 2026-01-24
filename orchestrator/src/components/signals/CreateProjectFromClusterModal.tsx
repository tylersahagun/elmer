"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { ScrollArea } from "@/components/ui/scroll-area";

// SignalCluster type matches what clustering.ts returns
interface ClusterSignal {
  id: string;
  verbatim: string;
  source?: string;
  severity?: string;
}

interface SignalCluster {
  id: string;
  theme: string;
  signals: ClusterSignal[];
  signalCount: number;
}

interface CreateProjectFromClusterModalProps {
  isOpen: boolean;
  onClose: () => void;
  cluster: SignalCluster;
  workspaceId: string;
}

export function CreateProjectFromClusterModal({
  isOpen,
  onClose,
  cluster,
  workspaceId,
}: CreateProjectFromClusterModalProps) {
  const [name, setName] = useState(cluster.theme);
  const [description, setDescription] = useState("");
  const queryClient = useQueryClient();
  const router = useRouter();

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/projects/from-cluster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          signalIds: cluster.signals.map((s) => s.id),
          name,
          description,
          clusterTheme: cluster.theme,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create project");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["signals"] });
      onClose();
      router.push(`/projects/${data.projectId}`);
    },
  });

  // Reset form when modal opens with new cluster
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    } else {
      setName(cluster.theme);
      setDescription("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Project from Cluster</DialogTitle>
          <DialogDescription>
            Create a new project and link {cluster.signalCount} signals as evidence.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-description">Description (optional)</Label>
            <Textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the initiative..."
              rows={3}
            />
          </div>

          {/* Preview of signals being linked */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">
              Signals to link ({cluster.signalCount})
            </Label>
            <ScrollArea className="h-[150px] border rounded-lg p-2">
              {cluster.signals.slice(0, 5).map((signal, i) => (
                <div key={signal.id} className="text-xs text-muted-foreground py-1 border-b last:border-b-0">
                  <span className="font-medium">{i + 1}.</span>{" "}
                  &ldquo;{signal.verbatim.length > 80 ? `${signal.verbatim.slice(0, 80)}...` : signal.verbatim}&rdquo;
                  {signal.source && (
                    <span className="ml-2 text-muted-foreground/60">({signal.source})</span>
                  )}
                </div>
              ))}
              {cluster.signalCount > 5 && (
                <div className="text-xs text-muted-foreground italic pt-2">
                  ...and {cluster.signalCount - 5} more signals
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={!name.trim() || createMutation.isPending}
          >
            {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
