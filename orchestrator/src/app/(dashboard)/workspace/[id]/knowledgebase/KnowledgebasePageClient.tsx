"use client";

import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  KnowledgeBaseFilesView,
  type KnowledgeBaseFile,
} from "@/components/files";
import { SimpleNavbar } from "@/components/chrome/Navbar";
import { BookOpen, Loader2 } from "lucide-react";

// Knowledge base file categories
const KNOWLEDGE_CATEGORIES = [
  { id: "company_context", label: "Company Context", path: "company-context" },
  { id: "personas", label: "Personas", path: "personas" },
  { id: "roadmap", label: "Roadmap", path: "roadmap" },
  { id: "hypotheses", label: "Hypotheses", path: "hypotheses" },
  { id: "rules", label: "Rules", path: "rules" },
];

interface KnowledgebasePageClientProps {
  workspaceId: string;
}

export function KnowledgebasePageClient({
  workspaceId,
}: KnowledgebasePageClientProps) {
  const queryClient = useQueryClient();

  // Fetch knowledge base files
  const {
    data: knowledgeFiles,
    isLoading: filesLoading,
    refetch: refetchFiles,
  } = useQuery({
    queryKey: ["knowledgebase-files", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];

      // Fetch all knowledge base categories and build file tree
      const fileTree: KnowledgeBaseFile[] = [];

      for (const category of KNOWLEDGE_CATEGORIES) {
        try {
          const res = await fetch(
            `/api/knowledgebase/${category.id}?workspaceId=${workspaceId}`,
          );
          if (res.ok) {
            const data = await res.json();
            if (data.content || data.filePath) {
              // Add as a file under the category folder
              const existingFolder = fileTree.find(
                (f) => f.name === category.path,
              );
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
    mutationFn: async ({
      path,
      content,
    }: {
      path: string;
      content: string;
    }) => {
      // Extract category from path (e.g., "company-context/company_context.md" -> "company_context")
      const categoryId = path.split("/").pop()?.replace(".md", "") || "";

      const res = await fetch(`/api/knowledgebase/${categoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          title:
            KNOWLEDGE_CATEGORIES.find((c) => c.id === categoryId)?.label ||
            "Knowledgebase",
          content,
        }),
      });

      if (!res.ok) throw new Error("Failed to save file");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["knowledgebase-files", workspaceId],
      });
    },
  });

  const handleFileSave = useCallback(
    async (path: string, content: string) => {
      await saveFileMutation.mutateAsync({ path, content });
    },
    [saveFileMutation],
  );

  const handleRefresh = useCallback(() => {
    refetchFiles();
  }, [refetchFiles]);

  if (filesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground font-mono text-sm">
            Loading knowledge base...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <SimpleNavbar path={`~/workspace/${workspaceId}/knowledgebase`} />

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
          isLoading={filesLoading}
          className="h-full"
        />
      </main>
    </div>
  );
}
