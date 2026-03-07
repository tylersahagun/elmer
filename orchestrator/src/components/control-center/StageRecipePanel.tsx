"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StageRecipePanelProps {
  workspaceId: string;
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
  recipeSteps?: Array<{ skillId: string }>;
  gates?: Array<{ id: string }>;
}

export function StageRecipePanel({ workspaceId }: StageRecipePanelProps) {
  const { data: columnsData } = useQuery<ColumnConfig[]>({
    queryKey: ["control-center-columns", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/columns?workspaceId=${workspaceId}`);
      if (!res.ok) throw new Error("Failed to load columns");
      return res.json();
    },
    enabled: !!workspaceId,
  });

  const { data: recipesData } = useQuery<{ recipes: StageRecipe[] }>({
    queryKey: ["control-center-stage-recipes", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/stage-recipes?workspaceId=${workspaceId}`);
      if (!res.ok) throw new Error("Failed to load stage recipes");
      return res.json();
    },
    enabled: !!workspaceId,
  });

  const rows = useMemo(() => {
    const columns = columnsData ?? [];
    const recipes = recipesData?.recipes ?? [];
    return columns
      .sort((left, right) => left.stage.localeCompare(right.stage))
      .map((column) => {
        const recipe = recipes.find((item) => item.stage === column.stage);
        return {
          id: column.id,
          displayName: column.displayName,
          stage: column.stage,
          automationLevel: recipe?.automationLevel ?? "manual",
          recipeSteps: recipe?.recipeSteps?.length ?? 0,
          gates: recipe?.gates?.length ?? 0,
          autoJobs: column.autoTriggerJobs?.length ?? 0,
          agentTriggers: column.agentTriggers?.length ?? 0,
          humanInLoop: column.humanInLoop ?? false,
        };
      });
  }, [columnsData, recipesData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stage recipes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
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
                <div className="font-medium">{row.recipeSteps}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Gates</div>
                <div className="font-medium">{row.gates}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Auto jobs</div>
                <div className="font-medium">{row.autoJobs}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Agent triggers</div>
                <div className="font-medium">{row.agentTriggers}</div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
