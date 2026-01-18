"use client";

import { useState, useEffect } from "react";
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
  FolderOpen,
  Loader2,
  ArrowRight,
  Sun,
  Moon,
} from "lucide-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StarsBackground } from "@/components/animate-ui/backgrounds";
import { WaveV4D, ElmerWordmark } from "@/components/brand/ElmerLogo";
import { RotatingTextContainer, RotatingText } from "@/components/animate-ui/primitives/texts/rotating";

function HomeContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showNewWorkspace, setShowNewWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState("");
  const [isLightMode, setIsLightMode] = useState(false);

  // Load theme preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("elmer-landing-theme");
    if (savedTheme === "light") {
      setIsLightMode(true);
    }
  }, []);

  // Save theme preference
  const toggleTheme = () => {
    const newMode = !isLightMode;
    setIsLightMode(newMode);
    localStorage.setItem("elmer-landing-theme", newMode ? "light" : "dark");
  };

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
    <StarsBackground 
      className={`min-h-screen h-full transition-colors duration-500 ${isLightMode ? "!bg-[radial-gradient(ellipse_at_bottom,_#f8fafc_0%,_#e2e8f0_100%)]" : ""}`} 
      speed={80} 
      starColor={isLightMode ? "rgba(30,41,59,0.6)" : "rgba(255,255,255,0.8)"}
    >
      <main className={`relative z-10 min-h-screen h-full p-4 sm:p-6 md:p-8 transition-colors duration-500 ${isLightMode ? "text-slate-900" : ""}`}>
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="max-w-7xl mx-auto space-y-8"
        >
          {/* Hero Section with Full Logo */}
          <motion.header variants={staggerItem} className="text-center py-12 sm:py-20">
            {/* Animated Logo */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ ...springPresets.bouncy, delay: 0.1 }}
              className="flex flex-col items-center justify-center mb-8"
            >
              {/* Large Wave Logo */}
              <div>
                <WaveV4D size={120} palette="aurora" className="drop-shadow-2xl" animate={false} />
              </div>
              
              {/* Wordmark with gradient animation */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-4"
              >
                <ElmerWordmark width={200} height={60} palette="aurora" />
              </motion.div>
            </motion.div>

            {/* Rotating Marketing Text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col items-center gap-2"
            >
              <span className={`text-lg sm:text-xl ${isLightMode ? "text-slate-600" : "text-white/70"}`}>Your AI-powered PM copilot for</span>
              <RotatingTextContainer
                text={[
                  "Research & Discovery",
                  "PRD Generation",
                  "Prototype Building",
                  "User Validation",
                  "Sprint Planning",
                ]}
                duration={2500}
                y={-30}
                className="h-12 flex items-center justify-center"
              >
                <RotatingText className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent" />
              </RotatingTextContainer>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className={`text-base sm:text-lg max-w-2xl mx-auto px-4 mt-6 ${isLightMode ? "text-slate-500" : "text-white/60"}`}
            >
              From idea to shipped feature. Orchestrate your product workflow with intelligent AI agents.
            </motion.p>
          </motion.header>

          {/* Workspaces Section */}
          <motion.div variants={staggerItem}>
            <GlassPanel className={`p-8 ${isLightMode ? "bg-white/70 border-slate-200" : "bg-black/40"}`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className={`text-2xl font-semibold mb-1 ${isLightMode ? "text-slate-900" : "text-white"}`}>Your Workspaces</h2>
                  <p className={isLightMode ? "text-slate-500" : "text-white/60"}>Select a workspace or create a new one</p>
                </div>
                <Button liquid className="gap-2" onClick={() => setShowNewWorkspace(true)}>
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
                          className={`p-5 cursor-pointer group ${isLightMode ? "bg-white/80 hover:bg-white/90 border-slate-200" : "bg-black/30 hover:bg-black/40"}`}
                          onClick={() => router.push(`/workspace/${workspace.id}`)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${isLightMode ? "from-purple-500/20 to-pink-500/20" : "from-purple-500/30 to-pink-500/30"} flex items-center justify-center`}>
                              <FolderOpen className={`w-5 h-5 ${isLightMode ? "text-purple-600" : "text-purple-300"}`} />
                            </div>
                            <ArrowRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${isLightMode ? "text-slate-400" : "text-white/50"}`} />
                          </div>
                          <h3 className={`font-semibold mb-1 ${isLightMode ? "text-slate-900" : "text-white"}`}>{workspace.name}</h3>
                          {workspace.description && (
                            <p className={`text-sm line-clamp-2 ${isLightMode ? "text-slate-500" : "text-white/60"}`}>
                              {workspace.description}
                            </p>
                          )}
                          <p className={`text-xs mt-3 ${isLightMode ? "text-slate-400" : "text-white/40"}`}>
                            Updated {new Date(workspace.updatedAt).toLocaleDateString()}
                          </p>
                        </GlassCard>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${isLightMode ? "bg-slate-100" : "bg-white/10"}`}>
                    <FolderOpen className={`w-8 h-8 ${isLightMode ? "text-slate-400" : "text-white/50"}`} />
                  </div>
                  <h3 className={`font-semibold mb-2 ${isLightMode ? "text-slate-900" : "text-white"}`}>No workspaces yet</h3>
                  <p className={`mb-4 ${isLightMode ? "text-slate-500" : "text-white/60"}`}>
                    Create your first workspace to get started
                  </p>
                  <Button liquid onClick={() => setShowNewWorkspace(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Workspace
                  </Button>
                </div>
              )}
            </GlassPanel>
          </motion.div>

          {/* Footer with Theme Toggle */}
          <motion.footer variants={staggerItem} className="text-center py-8 space-y-4">
            {/* Theme Toggle Button */}
            <motion.button
              onClick={toggleTheme}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`mx-auto flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${
                isLightMode 
                  ? "bg-slate-900/10 border-slate-300 text-slate-700 hover:bg-slate-900/20" 
                  : "bg-white/10 border-white/20 text-white/70 hover:bg-white/20"
              }`}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isLightMode ? "sun" : "moon"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isLightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </motion.div>
              </AnimatePresence>
              <span className="text-sm">{isLightMode ? "Dark Mode" : "Light Mode"}</span>
            </motion.button>
            
            <p className={`text-sm ${isLightMode ? "text-slate-500" : "text-white/40"}`}>
              Built with Next.js, Motion, and Claude AI
            </p>
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
                      liquid
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
    </StarsBackground>
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
