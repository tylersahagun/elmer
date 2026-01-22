"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/store";
import {
  Terminal,
  FileText,
  Palette,
  Code,
  Megaphone,
  FlaskConical,
  Users,
  Layers,
  GitBranch,
  Sparkles,
  Play,
  Loader2,
  ChevronRight,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

// Job type definitions with metadata
const JOB_DEFINITIONS: Record<string, {
  label: string;
  icon: React.ElementType;
  description: string;
  color: string;
  stages: string[]; // Stages where this job is available
  requiresInput?: boolean;
}> = {
  analyze_transcript: {
    label: "Analyze Research",
    icon: FlaskConical,
    description: "Extract insights from research transcripts and interviews",
    color: "text-teal-400",
    stages: ["inbox", "discovery"],
    requiresInput: true,
  },
  generate_prd: {
    label: "Generate PRD",
    icon: FileText,
    description: "Create a Product Requirements Document from research",
    color: "text-purple-400",
    stages: ["discovery", "prd"],
  },
  generate_design_brief: {
    label: "Generate Design Brief",
    icon: Palette,
    description: "Create design specifications and guidelines",
    color: "text-blue-400",
    stages: ["prd", "design"],
  },
  generate_engineering_spec: {
    label: "Generate Eng Spec",
    icon: Code,
    description: "Create technical implementation details",
    color: "text-green-400",
    stages: ["prd", "design", "prototype"],
  },
  generate_gtm_brief: {
    label: "Generate GTM Brief",
    icon: Megaphone,
    description: "Create go-to-market strategy document",
    color: "text-orange-400",
    stages: ["prd", "design", "prototype"],
  },
  build_prototype: {
    label: "Build Prototype",
    icon: Layers,
    description: "Generate Storybook components from design",
    color: "text-pink-400",
    stages: ["design", "prototype"],
  },
  iterate_prototype: {
    label: "Iterate Prototype",
    icon: Sparkles,
    description: "Refine prototype based on feedback",
    color: "text-pink-400",
    stages: ["prototype", "validate"],
  },
  run_jury_evaluation: {
    label: "Run Jury Evaluation",
    icon: Users,
    description: "Validate with synthetic user personas",
    color: "text-amber-400",
    stages: ["prototype", "validate"],
  },
  generate_tickets: {
    label: "Generate Tickets",
    icon: Terminal,
    description: "Create implementation tickets from specs",
    color: "text-cyan-400",
    stages: ["prototype", "validate", "tickets"],
  },
  create_feature_branch: {
    label: "Create Branch",
    icon: GitBranch,
    description: "Create a git feature branch for this project",
    color: "text-emerald-400",
    stages: ["prd", "design", "prototype", "build"],
  },
  score_stage_alignment: {
    label: "Score Alignment",
    icon: CheckCircle,
    description: "Evaluate readiness for the next stage",
    color: "text-indigo-400",
    stages: ["prd", "design", "prototype", "validate"],
  },
  deploy_chromatic: {
    label: "Deploy to Chromatic",
    icon: Layers,
    description: "Deploy prototype to Chromatic for visual review",
    color: "text-rose-400",
    stages: ["prototype", "validate"],
  },
};

interface CommandExecutionPanelProps {
  projectId: string;
  projectName: string;
  workspaceId: string;
  currentStage: string;
  className?: string;
}

export function CommandExecutionPanel({
  projectId,
  projectName,
  workspaceId,
  currentStage,
  className,
}: CommandExecutionPanelProps) {
  const queryClient = useQueryClient();
  const openJobLogsDrawer = useUIStore((s) => s.openJobLogsDrawer);
  const [runningJob, setRunningJob] = useState<string | null>(null);

  // Filter available commands based on current stage
  const availableCommands = Object.entries(JOB_DEFINITIONS)
    .filter(([, def]) => def.stages.includes(currentStage))
    .sort((a, b) => a[1].label.localeCompare(b[1].label));

  // All commands (for showing what's available at other stages)
  const allCommands = Object.entries(JOB_DEFINITIONS);
  const otherCommands = allCommands.filter(
    ([, def]) => !def.stages.includes(currentStage)
  );

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: async (jobType: string) => {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          workspaceId,
          type: jobType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create job");
      }

      return response.json();
    },
    onSuccess: (job) => {
      // Refresh project data
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      
      // Open job logs drawer
      openJobLogsDrawer(job.id, projectName);
      
      setRunningJob(null);
    },
    onError: () => {
      setRunningJob(null);
    },
  });

  const handleRunCommand = (jobType: string) => {
    setRunningJob(jobType);
    createJobMutation.mutate(jobType);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Available Commands */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          Available Commands
          <Badge variant="outline" className="ml-auto font-mono text-[10px]">
            {currentStage}
          </Badge>
        </h3>

        {availableCommands.length > 0 ? (
          <div className="grid gap-2">
            {availableCommands.map(([type, def]) => {
              const Icon = def.icon;
              const isRunning = runningJob === type;

              return (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "group flex items-center gap-3 p-3 rounded-lg",
                    "bg-muted/50 border border-border dark:border-[rgba(255,255,255,0.08)]",
                    "hover:bg-muted/80 transition-colors"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      "bg-background/50"
                    )}
                  >
                    <Icon className={cn("w-4 h-4", def.color)} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{def.label}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {def.description}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRunCommand(type)}
                    disabled={isRunning || createJobMutation.isPending}
                    className="gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span className="hidden sm:inline">Running...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Run</span>
                      </>
                    )}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center rounded-lg bg-muted/30 border border-dashed border-border">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No commands available for the current stage
            </p>
          </div>
        )}
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {createJobMutation.isError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-lg bg-red-500/10 border border-red-500/20"
          >
            <p className="text-sm text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {createJobMutation.error instanceof Error
                ? createJobMutation.error.message
                : "Failed to run command"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Other Commands (collapsed) */}
      {otherCommands.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <ChevronRight className="w-3 h-3 group-open:rotate-90 transition-transform" />
            Other commands ({otherCommands.length})
          </summary>
          <div className="mt-2 grid gap-1 pl-4">
            {otherCommands.map(([type, def]) => {
              const Icon = def.icon;
              return (
                <div
                  key={type}
                  className="flex items-center gap-2 p-2 rounded text-muted-foreground text-xs opacity-60"
                >
                  <Icon className="w-3 h-3" />
                  <span>{def.label}</span>
                  <Badge variant="outline" className="ml-auto text-[10px] px-1">
                    {def.stages[0]}
                  </Badge>
                </div>
              );
            })}
          </div>
        </details>
      )}
    </div>
  );
}
