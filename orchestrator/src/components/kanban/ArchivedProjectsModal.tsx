"use client";

import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/lib/store";
import { Loader2, RotateCcw, Trash2 } from "lucide-react";

interface ArchivedProjectsModalProps {
  workspaceId: string;
}

export function ArchivedProjectsModal({ workspaceId }: ArchivedProjectsModalProps) {
  const isOpen = useUIStore((s) => s.archivedProjectsModalOpen);
  const closeModal = useUIStore((s) => s.closeArchivedProjectsModal);
  const queryClient = useQueryClient();

  const { data: archivedProjects, isLoading } = useQuery({
    queryKey: ["projects", workspaceId, "archived"],
    queryFn: async () => {
      const res = await fetch(`/api/projects?workspaceId=${workspaceId}&includeArchived=true`);
      if (!res.ok) throw new Error("Failed to fetch archived projects");
      return res.json();
    },
    enabled: isOpen,
  });

  const archivedList = useMemo(() => {
    if (!archivedProjects) return [];
    return archivedProjects.filter((p: { status: string }) => p.status === "archived");
  }, [archivedProjects]);

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const handleRestore = async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active" }),
      });
      if (!res.ok) throw new Error("Failed to restore project");
      await queryClient.invalidateQueries({ queryKey: ["projects", workspaceId] });
      await queryClient.invalidateQueries({ queryKey: ["projects", workspaceId, "archived"] });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (projectId: string) => {
    const confirmed = window.confirm("Permanently delete this project? This cannot be undone.");
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete project");
      await queryClient.invalidateQueries({ queryKey: ["projects", workspaceId] });
      await queryClient.invalidateQueries({ queryKey: ["projects", workspaceId, "archived"] });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="glass-panel border-white/20 max-w-2xl !p-0 !gap-0 max-h-[80vh] overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-slate-200/50 dark:border-slate-700/50">
          <DialogTitle className="text-xl">Archived Projects</DialogTitle>
          <DialogDescription>
            Restore projects to make them active again, or permanently delete them.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 pt-4 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
              Loading archived projects...
            </div>
          ) : archivedList.length === 0 ? (
            <p className="text-sm text-muted-foreground">No archived projects.</p>
          ) : (
            <div className="space-y-3">
              {archivedList.map((project: {
                id: string;
                name: string;
                description?: string;
                updatedAt: string;
              }) => (
                <div
                  key={project.id}
                  className="flex items-start justify-between gap-4 rounded-lg border border-white/10 p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{project.name}</p>
                    {project.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Archived {formatDate(project.updatedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(project.id)}
                      className="gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Restore
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(project.id)}
                      className="gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
