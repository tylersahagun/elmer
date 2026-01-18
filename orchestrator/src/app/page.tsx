"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GlassCard, GlassPanel } from "@/components/glass";
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
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, staggerItem, springPresets, popInVariants } from "@/lib/animations";
import { 
  Plus, 
  Sparkles, 
  Layers, 
  Workflow, 
  BarChart3, 
  FolderOpen,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
    <main className="min-h-screen p-4 sm:p-6 md:p-8">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header */}
        <motion.header variants={staggerItem} className="text-center py-8 sm:py-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={springPresets.bouncy}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4 sm:mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
            <span className="text-xs sm:text-sm font-medium">AI-Powered PM Workflows</span>
          </motion.div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3 sm:mb-4 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 dark:from-white dark:via-purple-200 dark:to-white bg-clip-text text-transparent">
            PM Orchestrator
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            From idea to shipped feature. Automate research, documentation, prototyping, and validation with AI agents.
          </p>
        </motion.header>

        {/* Feature Cards */}
        <motion.div 
          variants={staggerItem}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            { icon: Layers, title: "Research", desc: "Analyze transcripts & feedback", color: "text-teal-500" },
            { icon: Workflow, title: "Document", desc: "Generate PRDs & specs", color: "text-purple-500" },
            { icon: Sparkles, title: "Prototype", desc: "Build UI in Storybook", color: "text-pink-500" },
            { icon: BarChart3, title: "Validate", desc: "Test with AI jury", color: "text-amber-500" },
          ].map((feature, i) => (
            <GlassCard key={i} interactive className="p-6">
              <feature.icon className={`w-8 h-8 ${feature.color} mb-4`} />
              <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </GlassCard>
          ))}
        </motion.div>

        {/* Workspaces Section */}
        <motion.div variants={staggerItem}>
          <GlassPanel className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold mb-1">Your Workspaces</h2>
                <p className="text-muted-foreground">Select a workspace or create a new one</p>
              </div>
              <Button className="gap-2" onClick={() => setShowNewWorkspace(true)}>
                <Plus className="w-4 h-4" />
                New Workspace
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              </div>
            ) : workspaces && workspaces.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {workspaces.map((workspace: { id: string; name: string; description?: string; updatedAt: string }) => (
                    <motion.div
                      key={workspace.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <GlassCard 
                        interactive 
                        className="p-5 cursor-pointer group"
                        onClick={() => router.push(`/workspace/${workspace.id}`)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                            <FolderOpen className="w-5 h-5 text-purple-400" />
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <h3 className="font-semibold mb-1">{workspace.name}</h3>
                        {workspace.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {workspace.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-3">
                          Updated {new Date(workspace.updatedAt).toLocaleDateString()}
                        </p>
                      </GlassCard>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 flex items-center justify-center">
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
          </GlassPanel>
        </motion.div>

        {/* Footer */}
        <motion.footer variants={staggerItem} className="text-center py-8 text-sm text-muted-foreground">
          <p>Built with Next.js, Framer Motion, and Claude AI</p>
        </motion.footer>
      </motion.div>

      {/* New Workspace Dialog */}
      <Dialog open={showNewWorkspace} onOpenChange={setShowNewWorkspace}>
        <DialogContent className="glass-panel border-white/20 max-w-md">
          <AnimatePresence>
            {showNewWorkspace && (
              <motion.div
                variants={popInVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
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
                      className="glass-card border-white/20"
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
                      className="glass-card border-white/20"
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
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </main>
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
