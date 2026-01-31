"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { SimpleNavbar } from "@/components/chrome/Navbar";
import { Window } from "@/components/chrome/Window";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RecipeEditorChat } from "@/components/commands/RecipeEditorChat";
import {
  Terminal,
  ChevronRight,
  Loader2,
  AlertCircle,
  Settings,
  Play,
  CheckCircle,
  Lock,
  Unlock,
  FileText,
  Layers,
  Users,
  Code,
  Palette,
  Megaphone,
  FlaskConical,
  GitBranch,
  Sparkles,
  ArrowRight,
} from "lucide-react";

// Job type icon mapping
const JOB_ICONS: Record<string, React.ElementType> = {
  analyze_transcript: FlaskConical,
  generate_prd: FileText,
  generate_design_brief: Palette,
  generate_engineering_spec: Code,
  generate_gtm_brief: Megaphone,
  build_prototype: Layers,
  iterate_prototype: Sparkles,
  run_jury_evaluation: Users,
  generate_tickets: Terminal,
  validate_tickets: CheckCircle,
  score_stage_alignment: CheckCircle,
  deploy_chromatic: Layers,
  create_feature_branch: GitBranch,
};

// Job type display names
const JOB_LABELS: Record<string, string> = {
  analyze_transcript: "Analyze Research",
  generate_prd: "Generate PRD",
  generate_design_brief: "Generate Design Brief",
  generate_engineering_spec: "Generate Engineering Spec",
  generate_gtm_brief: "Generate GTM Brief",
  build_prototype: "Build Prototype",
  iterate_prototype: "Iterate Prototype",
  run_jury_evaluation: "Run Jury Evaluation",
  generate_tickets: "Generate Tickets",
  validate_tickets: "Validate Tickets",
  score_stage_alignment: "Score Alignment",
  deploy_chromatic: "Deploy to Chromatic",
  create_feature_branch: "Create Feature Branch",
};

// Stage colors for consistency
const STAGE_COLORS: Record<string, string> = {
  inbox: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  discovery: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  prd: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  design: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  prototype: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  validate: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  tickets: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  build: "bg-green-500/20 text-green-300 border-green-500/30",
  alpha: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  beta: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  ga: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

interface ColumnConfig {
  id: string;
  workspaceId: string;
  stage: string;
  displayName: string;
  order: number;
  enabled: boolean;
  color: string;
  autoTriggerJobs?: string[];
  agentTriggers?: Array<{
    agentDefinitionId: string;
    priority: number;
    conditions?: Record<string, unknown>;
  }>;
  humanInLoop?: boolean;
  requiredDocuments?: string[];
  requiredApprovals?: number;
  contextPaths?: string[];
  contextNotes?: string;
}

interface RecipeStep {
  skillId: string;
  order: number;
  name?: string;
  params?: Record<string, unknown>;
  timeout?: number;
  retryCount?: number;
  verificationCriteria?: string[];
}

interface GateDefinition {
  type: string;
  condition?: string;
  description?: string;
}

interface StageRecipe {
  id: string;
  workspaceId: string;
  stage: string;
  automationLevel: "full_auto" | "human_approval" | "human_trigger" | "manual";
  recipeSteps: RecipeStep[];
  gates: GateDefinition[];
  onFailBehavior: string;
  provider: string;
  enabled: boolean;
}

interface Workspace {
  id: string;
  name: string;
}

interface CommandsDocumentationProps {
  workspaceId: string;
}

export function CommandsDocumentation({
  workspaceId,
}: CommandsDocumentationProps) {
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());
  const [isChatOpen, setIsChatOpen] = useState(false);

  const { data: workspace } = useQuery<Workspace>({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}`);
      if (!res.ok) throw new Error("Failed to load workspace");
      return res.json();
    },
    enabled: !!workspaceId,
  });

  // Fetch column configs
  const { data: columns, isLoading: columnsLoading } = useQuery<ColumnConfig[]>(
    {
      queryKey: ["columns", workspaceId],
      queryFn: async () => {
        const res = await fetch(`/api/columns?workspaceId=${workspaceId}`);
        if (!res.ok) throw new Error("Failed to load columns");
        return res.json();
      },
    },
  );

  // Fetch stage recipes
  const { data: recipes, isLoading: recipesLoading } = useQuery<StageRecipe[]>({
    queryKey: ["stage-recipes", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/stage-recipes?workspaceId=${workspaceId}`);
      if (!res.ok) throw new Error("Failed to load recipes");
      return res.json();
    },
  });

  // Collect all unique skill IDs
  const allSkillIds = [
    ...(columns || []).flatMap((c) => c.autoTriggerJobs || []),
    ...((recipes || []) as StageRecipe[]).flatMap((r) =>
      (r.recipeSteps || []).map((s) => s.skillId),
    ),
  ].filter((id, i, arr) => arr.indexOf(id) === i);

  // Fetch skill summaries
  const { data: summariesData } = useQuery<{
    summaries: Record<string, string>;
  }>({
    queryKey: ["skill-summaries", allSkillIds.join(",")],
    queryFn: async () => {
      if (allSkillIds.length === 0) return { summaries: {} };
      const res = await fetch("/api/skills/summaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillIds: allSkillIds }),
      });
      if (!res.ok) throw new Error("Failed to load summaries");
      return res.json();
    },
    enabled: allSkillIds.length > 0,
  });

  const skillSummaries = summariesData?.summaries || {};

  const isLoading = columnsLoading || recipesLoading;

  const toggleStage = (stage: string) => {
    setExpandedStages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stage)) {
        newSet.delete(stage);
      } else {
        newSet.add(stage);
      }
      return newSet;
    });
  };

  // Combine columns with their recipes
  const stagesWithRecipes = (columns || [])
    .filter((c) => c.enabled)
    .sort((a, b) => a.order - b.order)
    .map((column) => {
      const recipe = recipes?.find((r) => r.stage === column.stage);
      return { column, recipe };
    });

  return (
    <div className="min-h-screen">
      <SimpleNavbar
        path={`~/workspace/${workspace?.name ?? workspaceId}/commands`}
      />

      <main className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Window title="cat commands/README.md">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <Terminal className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-heading">
                    Commands & Automation
                  </h1>
                  <p className="text-sm text-muted-foreground font-mono">
                    {"// Stage recipes and column automations"}
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                This page shows what happens automatically when projects move
                through stages. Each stage can have auto-triggered jobs,
                required documents, and approval gates.
              </p>
            </div>
          </Window>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Stage List */}
        {!isLoading && stagesWithRecipes.length === 0 && (
          <Window title="error">
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">No stages configured</p>
            </div>
          </Window>
        )}

        {!isLoading && stagesWithRecipes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {stagesWithRecipes.map(({ column, recipe }, index) => (
              <StageCard
                key={column.id}
                column={column}
                recipe={recipe}
                skillSummaries={skillSummaries}
                isExpanded={expandedStages.has(column.stage)}
                onToggle={() => toggleStage(column.stage)}
                index={index}
              />
            ))}
          </motion.div>
        )}

        {/* Legend */}
        {!isLoading && stagesWithRecipes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Window title="cat legend.txt">
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Automation Levels
                  </h3>
                  <ul className="space-y-1.5 text-muted-foreground font-mono text-xs">
                    <li className="flex items-center gap-2">
                      <Play className="w-3 h-3 text-green-400" />
                      <code>full_auto</code> - Runs automatically
                    </li>
                    <li className="flex items-center gap-2">
                      <Lock className="w-3 h-3 text-amber-400" />
                      <code>human_approval</code> - Requires approval to proceed
                    </li>
                    <li className="flex items-center gap-2">
                      <Unlock className="w-3 h-3 text-blue-400" />
                      <code>human_trigger</code> - Manual trigger, auto
                      execution
                    </li>
                    <li className="flex items-center gap-2">
                      <Terminal className="w-3 h-3 text-slate-400" />
                      <code>manual</code> - Fully manual process
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Gate Types
                  </h3>
                  <ul className="space-y-1.5 text-muted-foreground font-mono text-xs">
                    <li className="flex items-center gap-2">
                      <FileText className="w-3 h-3" />
                      <code>document_exists</code> - Required documents present
                    </li>
                    <li className="flex items-center gap-2">
                      <Users className="w-3 h-3" />
                      <code>approval_count</code> - N approvals required
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      <code>validation_passed</code> - Jury verdict positive
                    </li>
                  </ul>
                </div>
              </div>
            </Window>
          </motion.div>
        )}
      </main>

      {/* Recipe Editor Chat */}
      <RecipeEditorChat
        workspaceId={workspaceId}
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
      />
    </div>
  );
}

// Stage Card Component
function StageCard({
  column,
  recipe,
  skillSummaries,
  isExpanded,
  onToggle,
  index,
}: {
  column: ColumnConfig;
  recipe?: StageRecipe;
  skillSummaries: Record<string, string>;
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
}) {
  const stageColor = STAGE_COLORS[column.stage] || STAGE_COLORS.inbox;
  const autoJobs = column.autoTriggerJobs || [];
  const recipeSteps = recipe?.recipeSteps || [];
  const gates = recipe?.gates || [];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Window title={`stage/${column.stage}`}>
        {/* Header */}
        <button
          onClick={onToggle}
          className="w-full flex items-start sm:items-center gap-3 sm:gap-4 text-left group"
        >
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="mt-1 sm:mt-0"
          >
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Badge className={cn("font-mono", stageColor)}>
                {column.displayName}
              </Badge>

              {recipe?.automationLevel && (
                <Badge variant="outline" className="font-mono text-[10px]">
                  {recipe.automationLevel === "full_auto" && (
                    <Play className="w-3 h-3 mr-1 text-green-400" />
                  )}
                  {recipe.automationLevel === "human_approval" && (
                    <Lock className="w-3 h-3 mr-1 text-amber-400" />
                  )}
                  {recipe.automationLevel === "human_trigger" && (
                    <Unlock className="w-3 h-3 mr-1 text-blue-400" />
                  )}
                  <span className="hidden sm:inline">
                    {recipe.automationLevel}
                  </span>
                  <span className="sm:hidden">
                    {recipe.automationLevel.split("_")[0]}
                  </span>
                </Badge>
              )}

              {column.humanInLoop && (
                <Badge variant="outline" className="text-[10px] font-mono">
                  <Users className="w-3 h-3 sm:mr-1" />
                  <span className="hidden sm:inline">Human-in-loop</span>
                </Badge>
              )}
            </div>

            <p className="text-xs text-muted-foreground mt-1 font-mono">
              {autoJobs.length > 0
                ? `// ${autoJobs.length} auto-triggered job${autoJobs.length > 1 ? "s" : ""}`
                : "// No auto-triggered jobs"}
              {gates.length > 0 &&
                ` • ${gates.length} gate${gates.length > 1 ? "s" : ""}`}
            </p>
          </div>
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 pt-4 border-t border-border dark:border-[rgba(255,255,255,0.08)] space-y-4"
          >
            {/* Auto-Triggered Jobs */}
            {autoJobs.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Play className="w-3 h-3" />
                  Auto-Triggered Jobs
                </h4>
                <div className="space-y-2">
                  {autoJobs.map((jobType, i) => {
                    const Icon = JOB_ICONS[jobType] || Terminal;
                    const label = JOB_LABELS[jobType] || jobType;
                    const summary = skillSummaries[jobType];
                    return (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-muted/30 space-y-2"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-purple-400 flex-shrink-0" />
                            <span className="text-sm font-medium">{label}</span>
                          </div>
                          <code className="text-[10px] text-muted-foreground sm:ml-auto font-mono break-all">
                            {jobType}
                          </code>
                        </div>
                        {summary && (
                          <p className="text-xs text-muted-foreground pl-6">
                            {summary}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recipe Steps */}
            {recipeSteps.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <ArrowRight className="w-3 h-3" />
                  Recipe Steps
                </h4>
                <div className="space-y-2">
                  {recipeSteps
                    .sort((a, b) => a.order - b.order)
                    .map((step, i) => {
                      const Icon = JOB_ICONS[step.skillId] || Terminal;
                      const label =
                        step.name || JOB_LABELS[step.skillId] || step.skillId;
                      const summary = skillSummaries[step.skillId];
                      return (
                        <div key={i} className="p-3 rounded-lg bg-muted/30">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px] font-mono text-purple-400 flex-shrink-0">
                              {step.order}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                  {label}
                                </span>
                              </div>
                              {summary && (
                                <p className="text-xs text-muted-foreground">
                                  {summary}
                                </p>
                              )}
                              {step.verificationCriteria &&
                                step.verificationCriteria.length > 0 && (
                                  <p className="text-[10px] text-muted-foreground font-mono">
                                    Verify:{" "}
                                    {step.verificationCriteria.join(", ")}
                                  </p>
                                )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Gates */}
            {gates.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Lock className="w-3 h-3" />
                  Gates (Required to Proceed)
                </h4>
                <div className="space-y-2">
                  {gates.map((gate, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20"
                    >
                      <CheckCircle className="w-4 h-4 text-amber-400" />
                      <div className="flex-1">
                        <span className="text-sm">
                          {gate.description || gate.type}
                        </span>
                        {gate.condition && (
                          <code className="text-[10px] text-muted-foreground ml-2 font-mono">
                            {gate.condition}
                          </code>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Required Documents */}
            {column.requiredDocuments &&
              column.requiredDocuments.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <FileText className="w-3 h-3" />
                    Required Documents
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {column.requiredDocuments.map((doc, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="font-mono text-[10px]"
                      >
                        {doc}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

            {/* Context Notes */}
            {column.contextNotes && (
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-xs text-blue-300 font-mono">
                  {"// "}
                  {column.contextNotes}
                </p>
              </div>
            )}

            {/* No Config Message */}
            {autoJobs.length === 0 &&
              recipeSteps.length === 0 &&
              gates.length === 0 &&
              !column.requiredDocuments?.length && (
                <p className="text-sm text-muted-foreground font-mono">
                  {"// No automation configured for this stage"}
                </p>
              )}
          </motion.div>
        )}
      </Window>
    </motion.div>
  );
}
