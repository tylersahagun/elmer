"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import { KnowledgeBaseFilesView, type KnowledgeBaseFile } from "@/components/files";
import { Button } from "@/components/ui/button";
import { Window } from "@/components/chrome/Window";
import { SimpleNavbar } from "@/components/chrome/Navbar";
// Window is only used for error states now
import {
  BookOpen,
  Loader2,
  AlertCircle,
} from "lucide-react";

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
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground font-mono text-sm">Loading knowledge base...</p>
        </motion.div>
      </div>
    );
  }

  if (!workspaces || workspaces.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <Window title="error" className="max-w-md">
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Workspaces Found</h2>
            <p className="text-muted-foreground mb-4 font-mono text-sm">
              Create a workspace first to access the knowledge base.
            </p>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </div>
        </Window>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <SimpleNavbar path="~/knowledgebase" />

      {/* Main Content - Fill remaining height below header with nice spacing */}
      <main className="flex-1 min-h-0 overflow-hidden p-4 sm:p-6">
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
    </div>
  );
}
