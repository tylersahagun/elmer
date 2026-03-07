"use client";

import { Badge } from "@/components/ui/badge";
import type { InitiativeStatusSnapshot } from "@/lib/status/types";

interface ReadinessPanelProps {
  readyToAdvance: InitiativeStatusSnapshot[];
}

export function ReadinessPanel({ readyToAdvance }: ReadinessPanelProps) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-medium mb-3">Ready to advance</h3>
      <div className="space-y-3">
        {readyToAdvance.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No initiatives currently meet graduation criteria.
          </p>
        ) : (
          readyToAdvance.map((initiative) => (
            <div key={initiative.id} className="rounded-md border p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium">{initiative.name}</div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {initiative.stage}
                  </Badge>
                  <Badge variant="secondary">
                    {Math.round(initiative.readinessScore * 100)}%
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Next recommended action: <code>{initiative.nextSuggestedCommand}</code>
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
