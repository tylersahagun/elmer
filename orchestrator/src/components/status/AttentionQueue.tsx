"use client";

import { Badge } from "@/components/ui/badge";
import type { InitiativeStatusSnapshot, PrioritizedAction } from "@/lib/status/types";

interface AttentionQueueProps {
  initiatives: InitiativeStatusSnapshot[];
  actionQueue: PrioritizedAction[];
}

export function AttentionQueue({
  initiatives,
  actionQueue,
}: AttentionQueueProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-lg border p-4">
        <h3 className="font-medium mb-3">Attention required</h3>
        <div className="space-y-3">
          {initiatives.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No immediate blockers.
            </p>
          ) : (
            initiatives.map((initiative) => (
              <div key={initiative.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium">{initiative.name}</div>
                  <Badge variant="outline" className="capitalize">
                    {initiative.stage}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {initiative.blockers[0] ||
                    `Stale for ${initiative.daysSinceUpdate} days`}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <h3 className="font-medium mb-3">Prioritized action queue</h3>
        <div className="space-y-3">
          {actionQueue.length === 0 ? (
            <p className="text-sm text-muted-foreground">No actions queued.</p>
          ) : (
            actionQueue.map((action, index) => (
              <div key={`${action.projectId}-${action.command}`} className="rounded-md border p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium">
                    {index + 1}. {action.projectName}
                  </div>
                  <Badge variant="secondary">{action.command}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {action.reason}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
