"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import { KnowledgeBaseFilesView, type KnowledgeBaseFile } from "@/components/files";
import { BackgroundWrapper, type BackgroundType } from "@/components/animate-ui/backgrounds";
import { WaveV4D, ElmerWordmark } from "@/components/brand/ElmerLogo";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/glass";
import { springPresets } from "@/lib/animations";
import {
  Users,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";

// Mock persona files - in production, these would come from the API
const MOCK_PERSONA_FILES: KnowledgeBaseFile[] = [
  {
    name: "personas",
    path: "personas",
    type: "directory",
    children: [
      {
        name: "enterprise-pm.md",
        path: "personas/enterprise-pm.md",
        type: "file",
        content: `# Enterprise Product Manager

## Demographics
- **Role**: Senior Product Manager at Fortune 500 company
- **Experience**: 8-12 years in product management
- **Industry**: Enterprise SaaS, B2B

## Goals
- Ship features that drive measurable business outcomes
- Reduce time from idea to validated prototype
- Maintain alignment between engineering, design, and business

## Pain Points
- Too many meetings, not enough building time
- Difficulty getting quick feedback on early concepts
- Stakeholder alignment takes weeks

## Behaviors
- Uses Linear, Notion, and Figma daily
- Prefers async communication
- Values data-driven decision making

## Quotes
> "I spend 60% of my time in meetings just trying to get alignment."
> "By the time we validate an idea, the market has moved on."
`,
        category: "Primary",
        lastModified: new Date().toISOString(),
      },
      {
        name: "startup-founder.md",
        path: "personas/startup-founder.md",
        type: "file",
        content: `# Startup Founder

## Demographics
- **Role**: Technical Co-founder / CEO
- **Experience**: 3-5 years building products
- **Company Stage**: Seed to Series A

## Goals
- Move fast and validate ideas quickly
- Build MVP with minimal resources
- Find product-market fit

## Pain Points
- Wearing too many hats
- No dedicated PM or design resources
- Need to ship fast but maintain quality

## Behaviors
- Codes and designs themselves
- Uses AI tools extensively
- Ships weekly or faster

## Quotes
> "I don't have time for a 6-week PRD process."
> "I need to test 10 ideas to find 1 that works."
`,
        category: "Secondary",
        lastModified: new Date().toISOString(),
      },
      {
        name: "design-lead.md",
        path: "personas/design-lead.md",
        type: "file",
        content: `# Design Lead

## Demographics
- **Role**: Head of Product Design
- **Experience**: 6-10 years in UX/Product Design
- **Team Size**: Managing 3-8 designers

## Goals
- Ensure design quality and consistency
- Reduce design-to-development handoff friction
- Build and maintain design system

## Pain Points
- Designs get lost in translation to code
- No time for proper user research
- Stakeholders request changes late in the process

## Behaviors
- Lives in Figma
- Values user research and testing
- Advocates for accessibility

## Quotes
> "The prototype never looks like the final product."
> "We need to test with real users, not just stakeholders."
`,
        category: "Secondary",
        lastModified: new Date().toISOString(),
      },
    ],
  },
  {
    name: "jury-config",
    path: "jury-config",
    type: "directory",
    children: [
      {
        name: "jury-settings.json",
        path: "jury-config/jury-settings.json",
        type: "file",
        content: JSON.stringify({
          minJurySize: 3,
          maxJurySize: 7,
          approvalThreshold: 70,
          requiredPersonaTypes: ["Primary", "Secondary"],
          evaluationCriteria: [
            "usability",
            "value_proposition",
            "trust",
            "accessibility"
          ]
        }, null, 2),
        category: "Config",
        lastModified: new Date().toISOString(),
      },
    ],
  },
];

export default function PersonasPage() {
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

  // Fetch persona files (using mock data for now)
  const { data: personaFiles, isLoading: filesLoading, refetch: refetchFiles } = useQuery({
    queryKey: ["persona-files", workspaceId],
    queryFn: async () => {
      // In production, this would fetch from the API
      // For now, return mock data
      return MOCK_PERSONA_FILES;
    },
    enabled: !!workspaceId,
  });

  // Save file mutation
  const saveFileMutation = useMutation({
    mutationFn: async ({ path, content }: { path: string; content: string }) => {
      // In production, this would save to the API
      console.log("Saving persona file:", path, content);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["persona-files", workspaceId] });
    },
  });

  // Create file mutation
  const createFileMutation = useMutation({
    mutationFn: async ({ path, content }: { path: string; content: string }) => {
      // In production, this would create via the API
      console.log("Creating persona file:", path, content);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["persona-files", workspaceId] });
    },
  });

  const handleFileSave = useCallback(async (path: string, content: string) => {
    await saveFileMutation.mutateAsync({ path, content });
  }, [saveFileMutation]);

  const handleFileCreate = useCallback(async (path: string, content: string) => {
    await createFileMutation.mutateAsync({ path: `personas/${path}`, content });
  }, [createFileMutation]);

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
          <p className="text-muted-foreground">Loading personas...</p>
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
            Create a workspace first to manage personas.
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
          workspaceId={workspaceId}
          files={personaFiles || []}
          title="Synthetic Personas"
          description="For jury validation of prototypes and PRDs"
          headerIcon={Users}
          onFileSave={handleFileSave}
          onFileCreate={handleFileCreate}
          onRefresh={handleRefresh}
          isLoading={isLoading}
          className="h-full"
        />
      </main>
    </BackgroundWrapper>
  );
}
