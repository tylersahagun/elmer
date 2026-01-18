"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Window, MiniWindow } from "@/components/chrome/Window";
import { SimpleNavbar } from "@/components/chrome/Navbar";
import { CommandChip, CommandText, CommandCaret } from "@/components/chrome/CommandChip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Plus, 
  Sparkles, 
  FolderOpen,
  Loader2,
  ArrowRight,
  GitBranch,
  Zap,
  FileText,
  Users,
} from "lucide-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WaveV4D, ElmerWordmark } from "@/components/brand/ElmerLogo";

function HomeContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showNewWorkspace, setShowNewWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState("");

  // Fetch workspaces
  const { data: workspaces, isLoading } = useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const res = await fetch("/api/workspaces");
      if (!res.ok) throw new Error("Failed to fetch workspaces");
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
      router.push(`/workspace/${workspace.id}`);
    },
  });

  const handleCreateWorkspace = () => {
    if (!newWorkspaceName.trim()) return;
    createWorkspace.mutate({
      name: newWorkspaceName.trim(),
      description: newWorkspaceDescription.trim() || undefined,
    });
  };

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <SimpleNavbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Hero Section */}
        <Window
          title="main.ts"
          className="animate-fade-up"
          contentClassName="py-12 sm:py-16"
        >
          <div className="text-center space-y-6">
            {/* Logo */}
            <div className="flex flex-col items-center justify-center">
              <WaveV4D size={100} palette="aurora" className="drop-shadow-lg" animate={false} />
              <div className="mt-4">
                <ElmerWordmark width={180} height={50} palette="aurora" />
              </div>
            </div>

            {/* Terminal-style heading */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading flex items-center justify-center gap-3">
                <CommandCaret className="text-2xl sm:text-3xl md:text-4xl" />
                <span>PM Orchestrator</span>
              </h1>
              <p className="font-mono text-muted-foreground">
                // AI-powered product management workflow
              </p>
            </div>

            {/* Feature chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              <CommandChip size="sm" variant="outline">
                <CommandText command="research" args="--analyze" />
              </CommandChip>
              <CommandChip size="sm" variant="outline">
                <CommandText command="prd" args="--generate" />
              </CommandChip>
              <CommandChip size="sm" variant="outline">
                <CommandText command="prototype" args="--build" />
              </CommandChip>
              <CommandChip size="sm" variant="outline">
                <CommandText command="validate" args="--jury" />
              </CommandChip>
            </div>
          </div>
        </Window>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-up stagger-1">
          <MiniWindow title="workflows">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-heading text-emerald-500">5</p>
                <p className="text-xs text-muted-foreground font-mono">active</p>
              </div>
            </div>
          </MiniWindow>
          
          <MiniWindow title="documents">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-heading text-blue-500">12</p>
                <p className="text-xs text-muted-foreground font-mono">PRDs</p>
              </div>
            </div>
          </MiniWindow>
          
          <MiniWindow title="prototypes">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <GitBranch className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-heading text-purple-500">8</p>
                <p className="text-xs text-muted-foreground font-mono">built</p>
              </div>
            </div>
          </MiniWindow>
          
          <MiniWindow title="personas">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-heading text-orange-500">24</p>
                <p className="text-xs text-muted-foreground font-mono">synthetic</p>
              </div>
            </div>
          </MiniWindow>
        </div>

        {/* Workspaces Section */}
        <Window
          title="ls ./workspaces/"
          rightMeta={
            <Button
              size="sm"
              className="h-7 gap-1.5"
              onClick={() => setShowNewWorkspace(true)}
            >
              <Plus className="w-3.5 h-3.5" />
              New
            </Button>
          }
          className="animate-fade-up stagger-2"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
              <span className="text-emerald-500">$</span>
              <span>Select a workspace or create a new one</span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : workspaces && workspaces.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workspaces.map((workspace: { id: string; name: string; description?: string; updatedAt: string }) => (
                  <div
                    key={workspace.id}
                    className="group cursor-pointer rounded-2xl border border-[#B8C0CC] dark:border-white/[0.14] bg-[#F5F7FA] dark:bg-[#1A2332]/50 p-4 transition-all duration-200 hover:border-[#A0A8B4] dark:hover:border-white/20 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                    onClick={() => router.push(`/workspace/${workspace.id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                        <FolderOpen className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h3 className="font-semibold mb-1">{workspace.name}</h3>
                    {workspace.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {workspace.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-3 font-mono">
                      Updated {new Date(workspace.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
                  <FolderOpen className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">No workspaces yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first workspace to get started
                </p>
                <Button onClick={() => setShowNewWorkspace(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Workspace
                </Button>
              </div>
            )}
          </div>
        </Window>

        {/* Footer */}
        <footer className="text-center py-8">
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground font-mono">
            <span className="text-emerald-500">$</span>
            <span>Built with Next.js + Claude AI</span>
          </div>
        </footer>
      </main>

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
              <Label htmlFor="workspace-description">Description (optional)</Label>
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
    </div>
  );
}

// Wrap with QueryClientProvider for the home page
export default function Home() {
  const [queryClient] = useState(() => new QueryClient());
  
  return (
    <QueryClientProvider client={queryClient}>
      <HomeContent />
    </QueryClientProvider>
  );
}
