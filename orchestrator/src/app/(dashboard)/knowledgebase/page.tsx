"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import { KnowledgeBaseFilesView, type KnowledgeBaseFile } from "@/components/files";
import { BackgroundWrapper, type BackgroundType } from "@/components/animate-ui/backgrounds";
import { WaveV4D, ElmerWordmark } from "@/components/brand/ElmerLogo";
import { Button } from "@/components/ui/button";
import { springPresets } from "@/lib/animations";
import {
  BookOpen,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { GlassPanel } from "@/components/glass";

// Knowledge base file categories
const KNOWLEDGE_CATEGORIES = [
  { id: "company_context", label: "Company Context", path: "company-context" },
  { id: "personas", label: "Personas", path: "personas" },
  { id: "roadmap", label: "Roadmap", path: "roadmap" },
  { id: "hypotheses", label: "Hypotheses", path: "hypotheses" },
  { id: "rules", label: "Rules", path: "rules" },
];

export default function KnowledgebasePage() {
  const queryClient = useQueryClient();
  const [workspaceId, setWorkspaceId] = useState("");

  // Fetch workspaces
  const { data: workspaces, isLoading: workspacesLoading } = useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const res = await fetch("/api/workspaces");
      if (!res.ok) throw new Error("Failed to fetch workspaces");
      return res.json();
    },
  });

  // Set initial workspace when workspaces load
  useEffect(() => {
    if (!workspaceId && Array.isArray(workspaces) && workspaces.length > 0) {
      setWorkspaceId(workspaces[0].id);
    }
  }, [workspaces, workspaceId]);

  // Get workspace settings for background
  const currentWorkspace = workspaces?.find((w: { id: string; settings?: { background?: { type: BackgroundType; primaryColor?: string; secondaryColor?: string; speed?: number; interactive?: boolean } } }) => w.id === workspaceId);
  const backgroundSettings = currentWorkspace?.settings?.background || { type: "aurora" as BackgroundType };

  // Fetch knowledge base files
  const { data: knowledgeFiles, isLoading: filesLoading, refetch: refetchFiles } = useQuery({
    queryKey: ["knowledgebase-files", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      
      // Fetch all knowledge base categories and build file tree
      const fileTree: KnowledgeBaseFile[] = [];
      
      for (const category of KNOWLEDGE_CATEGORIES) {
        try {
          const res = await fetch(`/api/knowledgebase/${category.id}?workspaceId=${workspaceId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.content || data.filePath) {
              // Add as a file under the category folder
              const existingFolder = fileTree.find(f => f.name === category.path);
              const file: KnowledgeBaseFile = {
                name: `${category.id}.md`,
                path: `${category.path}/${category.id}.md`,
                type: "file",
                content: data.content || "",
                category: category.label,
                lastModified: data.entry?.updatedAt,
              };
              
              if (existingFolder && existingFolder.children) {
                existingFolder.children.push(file);
              } else {
                fileTree.push({
                  name: category.path,
                  path: category.path,
                  type: "directory",
                  children: [file],
                });
              }
            }
          }
        } catch (error) {
          console.error(`Failed to fetch ${category.id}:`, error);
        }
      }
      
      return fileTree;
    },
    enabled: !!workspaceId,
  });

  // Save file mutation
  const saveFileMutation = useMutation({
    mutationFn: async ({ path, content }: { path: string; content: string }) => {
      // Extract category from path (e.g., "company-context/company_context.md" -> "company_context")
      const categoryId = path.split("/").pop()?.replace(".md", "") || "";
      
      const res = await fetch(`/api/knowledgebase/${categoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          workspaceId, 
          title: KNOWLEDGE_CATEGORIES.find(c => c.id === categoryId)?.label || "Knowledgebase",
          content 
        }),
      });
      
      if (!res.ok) throw new Error("Failed to save file");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledgebase-files", workspaceId] });
    },
  });

  const handleFileSave = useCallback(async (path: string, content: string) => {
    await saveFileMutation.mutateAsync({ path, content });
  }, [saveFileMutation]);

  const handleRefresh = useCallback(() => {
    refetchFiles();
  }, [refetchFiles]);

  const isLoading = workspacesLoading || filesLoading;

  if (workspacesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          <p className="text-muted-foreground">Loading knowledge base...</p>
        </motion.div>
      </div>
    );
  }

  if (!workspaces || workspaces.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <GlassPanel className="max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Workspaces Found</h2>
          <p className="text-muted-foreground mb-4">
            Create a workspace first to access the knowledge base.
          </p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </GlassPanel>
      </div>
    );
  }

  return (
    <BackgroundWrapper
      type={backgroundSettings.type as BackgroundType}
      primaryColor={backgroundSettings.primaryColor}
      secondaryColor={backgroundSettings.secondaryColor}
      speed={backgroundSettings.speed}
      interactive={backgroundSettings.interactive}
      className="h-screen flex flex-col overflow-hidden"
    >
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springPresets.gentle}
        className="flex-shrink-0 z-50 backdrop-blur-2xl bg-slate-900/90 border-b border-slate-700/50 shadow-xl shadow-black/20"
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href={workspaceId ? `/workspace/${workspaceId}` : "/"}>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-300 hover:text-white hover:bg-slate-700/50"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={springPresets.bouncy}
                className="flex items-center gap-0.5 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <WaveV4D size={36} palette="forest" className="sm:w-11 sm:h-11" />
                <ElmerWordmark width={80} height={26} palette="forest" className="hidden sm:block sm:w-[100px] sm:h-8" />
              </motion.div>
            </Link>
          </div>

          {/* Workspace Selector */}
          <div className="flex items-center gap-3">
            <select
              value={workspaceId}
              onChange={(e) => setWorkspaceId(e.target.value)}
              className="h-9 rounded-lg border border-slate-600 bg-slate-800/80 px-3 text-sm text-slate-100 shadow-xs focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              {(workspaces || []).map((workspace: { id: string; name: string }) => (
                <option key={workspace.id} value={workspace.id} className="bg-slate-900">
                  {workspace.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.header>

      {/* Main Content - Fill remaining height below header */}
      <main className="flex-1 min-h-0 overflow-hidden">
        <KnowledgeBaseFilesView
          key={`kb-${workspaceId}`}
          workspaceId={workspaceId}
          files={knowledgeFiles || []}
          title="Knowledge Base"
          description="Company context, personas, roadmap & more"
          headerIcon={BookOpen}
          onFileSave={handleFileSave}
          onRefresh={handleRefresh}
          isLoading={isLoading}
          className="h-full"
        />
      </main>
    </BackgroundWrapper>
  );
}
