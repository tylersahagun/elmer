"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronDown,
  Plus,
  Loader2,
  FolderOpen,
  Check,
  Sparkles,
} from "lucide-react";
import type { WorkspaceRole } from "@/lib/db/schema";

interface WorkspaceWithRole {
  id: string;
  name: string;
  description?: string | null;
  role: WorkspaceRole;
  updatedAt: string;
}

interface WorkspaceSwitcherProps {
  currentWorkspaceId?: string;
  onWorkspaceChange?: (workspaceId: string) => void;
}

export function WorkspaceSwitcher({
  currentWorkspaceId,
  onWorkspaceChange,
}: WorkspaceSwitcherProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showNewWorkspace, setShowNewWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState("");

  // Fetch user's workspaces
  const { data: workspaces, isLoading } = useQuery<WorkspaceWithRole[]>({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const res = await fetch("/api/workspaces");
      if (!res.ok) {
        if (res.status === 401) return [];
        throw new Error("Failed to fetch workspaces");
      }
      return res.json();
    },
  });

  // Create workspace mutation
  const createWorkspace = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create workspace");
      return res.json();
    },
    onSuccess: (workspace) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      setShowNewWorkspace(false);
      setNewWorkspaceName("");
      setNewWorkspaceDescription("");
      if (onWorkspaceChange) {
        onWorkspaceChange(workspace.id);
      } else {
        router.push(`/workspace/${workspace.id}`);
      }
    },
  });

  const handleCreateWorkspace = () => {
    if (!newWorkspaceName.trim()) return;
    createWorkspace.mutate({
      name: newWorkspaceName.trim(),
      description: newWorkspaceDescription.trim() || undefined,
    });
  };

  const handleSelectWorkspace = (workspaceId: string) => {
    if (onWorkspaceChange) {
      onWorkspaceChange(workspaceId);
    } else {
      router.push(`/workspace/${workspaceId}`);
    }
  };

  const currentWorkspace = workspaces?.find((w) => w.id === currentWorkspaceId);

  const getRoleBadgeVariant = (role: WorkspaceRole) => {
    switch (role) {
      case "admin":
        return "default";
      case "member":
        return "secondary";
      case "viewer":
        return "outline";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 max-w-[200px]">
            <FolderOpen className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              {currentWorkspace?.name || "Select workspace"}
            </span>
            <ChevronDown className="h-4 w-4 flex-shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[240px]">
          {workspaces && workspaces.length > 0 ? (
            <>
              {workspaces.map((workspace) => (
                <DropdownMenuItem
                  key={workspace.id}
                  onClick={() => handleSelectWorkspace(workspace.id)}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {workspace.id === currentWorkspaceId && (
                      <Check className="h-4 w-4 flex-shrink-0 text-primary" />
                    )}
                    <span className="truncate">{workspace.name}</span>
                  </div>
                  <Badge
                    variant={getRoleBadgeVariant(workspace.role)}
                    className="text-xs flex-shrink-0"
                  >
                    {workspace.role}
                  </Badge>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </>
          ) : (
            <div className="px-2 py-3 text-sm text-muted-foreground text-center">
              No workspaces yet
            </div>
          )}
          <DropdownMenuItem
            onClick={() => setShowNewWorkspace(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create new workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* New Workspace Dialog */}
      <Dialog open={showNewWorkspace} onOpenChange={setShowNewWorkspace}>
        <DialogContent className="rounded-2xl border-[#B8C0CC] dark:border-white/[0.14] bg-white dark:bg-[#0F1620] max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              New Workspace
            </DialogTitle>
            <DialogDescription>
              Create a workspace for your product or project
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="workspace-name">Workspace Name</Label>
              <Input
                id="workspace-name"
                placeholder="e.g., AskElephant"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                className="rounded-xl border-[#B8C0CC] dark:border-white/[0.14]"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workspace-description">
                Description (optional)
              </Label>
              <Input
                id="workspace-description"
                placeholder="Brief description..."
                value={newWorkspaceDescription}
                onChange={(e) => setNewWorkspaceDescription(e.target.value)}
                className="rounded-xl border-[#B8C0CC] dark:border-white/[0.14]"
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              variant="ghost"
              onClick={() => setShowNewWorkspace(false)}
              disabled={createWorkspace.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateWorkspace}
              disabled={!newWorkspaceName.trim() || createWorkspace.isPending}
              className="gap-2"
            >
              {createWorkspace.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Create
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
