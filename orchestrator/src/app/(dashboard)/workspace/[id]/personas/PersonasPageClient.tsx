"use client";

import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  KnowledgeBaseFilesView,
  type KnowledgeBaseFile,
} from "@/components/files";
import { SimpleNavbar } from "@/components/chrome/Navbar";
import { Users, Loader2 } from "lucide-react";
import type { PersonaArchetype } from "@/app/api/personas/route";
import { toast } from "sonner";

interface PersonasPageClientProps {
  workspaceId: string;
}

/**
 * Transform API persona data into the KnowledgeBaseFile format for display
 */
function transformPersonasToFileTree(
  personas: PersonaArchetype[],
): KnowledgeBaseFile[] {
  if (!personas || personas.length === 0) {
    return [];
  }

  const personaFiles: KnowledgeBaseFile[] = personas.map((persona) => ({
    name: `${persona.archetype_id}.md`,
    path: `personas/${persona.archetype_id}.md`,
    type: "file" as const,
    content: generatePersonaMarkdown(persona),
    category: "Archetype",
    lastModified: new Date().toISOString(),
  }));

  return [
    {
      name: "personas",
      path: "personas",
      type: "directory",
      children: personaFiles,
    },
  ];
}

/**
 * Generate markdown content from a PersonaArchetype
 */
function generatePersonaMarkdown(persona: PersonaArchetype): string {
  return `# ${persona.name}

${persona.description}

## Role
- **Title**: ${persona.role.title}
- **Decision Authority**: ${persona.role.decision_authority}

### Responsibilities
${persona.role.responsibilities.map((r) => `- ${r}`).join("\n")}

## Pain Points
${persona.pains.map((p) => `- ${p}`).join("\n")}

## Success Criteria
${persona.success_criteria.map((s) => `- ${s}`).join("\n")}

## Evaluation Heuristics
${persona.evaluation_heuristics.map((h) => `- ${h}`).join("\n")}

## Typical Tools
${persona.typical_tools.map((t) => `- ${t}`).join("\n")}

## Fears
${persona.fears.map((f) => `- ${f}`).join("\n")}

## Psychographic Ranges
- **Tech Literacy**: ${persona.psychographic_ranges.tech_literacy.join(", ")}
- **AI Adoption Stage**: ${persona.psychographic_ranges.ai_adoption_stage.join(", ")}
- **Tool Fatigue**: ${persona.psychographic_ranges.tool_fatigue.join("-")}
- **Patience for Learning**: ${persona.psychographic_ranges.patience_for_learning.join("-")}
- **Trust in AI**: ${persona.psychographic_ranges.trust_in_ai.join("-")}
`;
}

export function PersonasPageClient({ workspaceId }: PersonasPageClientProps) {
  const queryClient = useQueryClient();

  // Fetch persona files from the API
  const {
    data: personaFiles,
    isLoading: filesLoading,
    refetch: refetchFiles,
  } = useQuery({
    queryKey: ["persona-files", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/personas?workspaceId=${workspaceId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch personas");
      }
      const data = await res.json();
      return transformPersonasToFileTree(data.personas || []);
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
      const res = await fetch("/api/personas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, content }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save persona");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["persona-files", workspaceId],
      });
      toast.success("Persona saved");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to save persona",
      );
    },
  });

  // Create file mutation
  const createFileMutation = useMutation({
    mutationFn: async ({
      path,
      content,
    }: {
      path: string;
      content: string;
    }) => {
      const res = await fetch("/api/personas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, content }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create persona");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["persona-files", workspaceId],
      });
      toast.success("Persona created");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to create persona",
      );
    },
  });

  const handleFileSave = useCallback(
    async (path: string, content: string) => {
      await saveFileMutation.mutateAsync({ path, content });
    },
    [saveFileMutation],
  );

  const handleFileCreate = useCallback(
    async (path: string, content: string) => {
      await createFileMutation.mutateAsync({
        path: `personas/${path}`,
        content,
      });
    },
    [createFileMutation],
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
            Loading personas...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <SimpleNavbar path={`~/workspace/${workspaceId}/personas`} />

      {/* Main Content - Fill remaining height below header with nice spacing */}
      <main className="flex-1 min-h-0 overflow-hidden p-4 sm:p-6">
        <KnowledgeBaseFilesView
          workspaceId={workspaceId}
          files={personaFiles || []}
          title="Synthetic Personas"
          description="For jury validation of prototypes and PRDs"
          headerIcon={Users}
          onFileSave={handleFileSave}
          onFileCreate={handleFileCreate}
          onRefresh={handleRefresh}
          isLoading={filesLoading}
          className="h-full"
        />
      </main>
    </div>
  );
}
