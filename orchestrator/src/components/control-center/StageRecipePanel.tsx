"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface StageRecipePanelProps {
  workspaceId: string;
}

interface AgentDefinition {
  id: string;
  name: string;
  type: string;
}

interface ColumnConfig {
  id: string;
  stage: string;
  displayName: string;
  humanInLoop?: boolean | null;
  autoTriggerJobs?: string[] | null;
  agentTriggers?: Array<{ agentDefinitionId: string; priority: number }> | null;
}

interface StageRecipe {
  stage: string;
  automationLevel: string;
  recipeSteps?: Array<{ skillId: string; name?: string; verificationCriteria?: string[] }>;
  gates?: Array<{ id?: string; type?: string; description?: string }>;
}

const JOB_LABELS: Record<string, string> = {
  analyze_transcript: "Analyze transcript",
  process_signal: "Process signal",
  synthesize_signals: "Synthesize signals",
  generate_prd: "Generate PRD",
  generate_design_brief: "Generate design brief",
  generate_engineering_spec: "Generate engineering spec",
  generate_gtm_brief: "Generate GTM brief",
  build_prototype: "Build prototype",
  iterate_prototype: "Iterate prototype",
  run_jury_evaluation: "Run jury evaluation",
  generate_tickets: "Generate tickets",
  validate_tickets: "Validate tickets",
  score_stage_alignment: "Score alignment",
  deploy_chromatic: "Deploy Chromatic",
  create_feature_branch: "Create feature branch",
  execute_agent_definition: "Execute imported command",
};

function formatJobLabel(jobType: string) {
  return JOB_LABELS[jobType] || jobType.replaceAll("_", " ");
}

export function StageRecipePanel({ workspaceId }: StageRecipePanelProps) {
  const { data: columnsData } = useQuery<{
    items: ColumnConfig[];
    degraded?: boolean;
  }>({
    queryKey: ["control-center-columns", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/columns?workspaceId=${workspaceId}`);
      if (!res.ok) {
        return { items: [], degraded: true };
      }
      return { items: await res.json(), degraded: false };
    },
    enabled: !!workspaceId,
  });

  const { data: recipesData } = useQuery<{
    recipes: StageRecipe[];
    degraded?: boolean;
  }>({
    queryKey: ["control-center-stage-recipes", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/stage-recipes?workspaceId=${workspaceId}`);
      if (!res.ok) {
        return { recipes: [], degraded: true };
      }
      return res.json();
    },
    enabled: !!workspaceId,
  });

  const { data: agentsData } = useQuery<{
    agents: AgentDefinition[];
    degraded?: boolean;
  }>({
    queryKey: ["control-center-stage-agents", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/agents?workspaceId=${workspaceId}`);
      if (!res.ok) {
        return { agents: [], degraded: true };
      }
      return res.json();
    },
    enabled: !!workspaceId,
  });

  const rows = useMemo(() => {
    const columns = columnsData?.items ?? [];
    const recipes = recipesData?.recipes ?? [];
    const agentMap = new Map(
      (agentsData?.agents ?? []).map((agent) => [agent.id, agent]),
    );

    return columns
      .sort((left, right) => left.stage.localeCompare(right.stage))
      .map((column) => {
        const recipe = recipes.find((item) => item.stage === column.stage);
        const recipeSteps = recipe?.recipeSteps ?? [];
        const autoJobs = column.autoTriggerJobs ?? [];
        const agentTriggers = (column.agentTriggers ?? [])
          .slice()
          .sort((left, right) => left.priority - right.priority)
          .map((trigger) => ({
            id: trigger.agentDefinitionId,
            priority: trigger.priority,
            name:
              agentMap.get(trigger.agentDefinitionId)?.name ||
              trigger.agentDefinitionId,
            type:
              agentMap.get(trigger.agentDefinitionId)?.type || "agent",
          }));

        return {
          id: column.id,
          displayName: column.displayName,
          stage: column.stage,
          automationLevel: recipe?.automationLevel ?? "manual",
          recipeSteps,
          gates: recipe?.gates ?? [],
          autoJobs,
          agentTriggers,
          humanInLoop: column.humanInLoop ?? false,
        };
      });
  }, [agentsData, columnsData, recipesData]);
  const isDegraded =
    Boolean(columnsData?.degraded) ||
    Boolean(recipesData?.degraded) ||
    Boolean(agentsData?.degraded);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stage recipes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isDegraded && (
          <div className="flex items-start gap-2 rounded-md border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-muted-foreground">
            <AlertCircle className="mt-0.5 h-4 w-4 text-amber-500" />
            <p>
              Stage recipes are partially unavailable right now. This view is best-effort and does
              not block project work.
            </p>
          </div>
        )}
        {rows.map((row) => (
          <div key={row.id} className="rounded-md border p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="font-medium">{row.displayName}</div>
                <div className="text-xs text-muted-foreground uppercase">
                  {row.stage}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 justify-end">
                <Badge variant="secondary">{row.automationLevel}</Badge>
                {row.humanInLoop && <Badge variant="outline">HITL</Badge>}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-sm">
              <div>
                <div className="text-muted-foreground text-xs">Recipe steps</div>
                <div className="font-medium">{row.recipeSteps.length}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Gates</div>
                <div className="font-medium">{row.gates.length}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Auto jobs</div>
                <div className="font-medium">{row.autoJobs.length}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Agent triggers</div>
                <div className="font-medium">{row.agentTriggers.length}</div>
              </div>
            </div>

            {(row.recipeSteps.length > 0 ||
              row.autoJobs.length > 0 ||
              row.agentTriggers.length > 0 ||
              row.gates.length > 0) && (
              <div className="mt-4 space-y-3 text-sm">
                {row.recipeSteps.length > 0 && (
                  <div>
                    <div className="text-muted-foreground text-xs mb-2">
                      Recipe step details
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {row.recipeSteps.map((step, index) => (
                        <Badge key={`${step.skillId}-${index}`} variant="outline">
                          {step.name || step.skillId}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {row.autoJobs.length > 0 && (
                  <div>
                    <div className="text-muted-foreground text-xs mb-2">
                      Auto-triggered jobs
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {row.autoJobs.map((jobType) => (
                        <Badge key={jobType} variant="secondary">
                          {formatJobLabel(jobType)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {row.agentTriggers.length > 0 && (
                  <div>
                    <div className="text-muted-foreground text-xs mb-2">
                      Imported command triggers
                    </div>
                    <div className="space-y-2">
                      {row.agentTriggers.map((trigger) => (
                        <div
                          key={`${trigger.id}-${trigger.priority}`}
                          className="flex items-center justify-between gap-2 rounded-md border p-2"
                        >
                          <div className="min-w-0">
                            <div className="font-medium truncate">
                              {trigger.name}
                            </div>
                            <div className="text-xs text-muted-foreground uppercase">
                              {trigger.type}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              "shrink-0",
                              trigger.priority === 1 && "border-purple-400/40",
                            )}
                          >
                            Priority {trigger.priority}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {row.gates.length > 0 && (
                  <div>
                    <div className="text-muted-foreground text-xs mb-2">
                      Gates
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {row.gates.map((gate, index) => (
                        <Badge key={`${gate.id || gate.type}-${index}`} variant="outline">
                          {gate.description || gate.type || gate.id || "Gate"}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
