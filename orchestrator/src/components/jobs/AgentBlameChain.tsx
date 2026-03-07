"use client";

import { Badge } from "@/components/ui/badge";

export function AgentBlameChain({
  initiatedBy,
  initiatedByName,
  rootInitiator,
  rootInitiatorName,
  parentJobId,
}: {
  initiatedBy?: string | null;
  initiatedByName?: string | null;
  rootInitiator?: string | null;
  rootInitiatorName?: string | null;
  parentJobId?: string | null;
}) {
  if (!initiatedBy && !rootInitiator && !parentJobId) return null;

  const initiatedLabel = initiatedByName ?? initiatedBy ?? "Unknown";
  const rootLabel = rootInitiatorName ?? rootInitiator ?? null;

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <span className="font-medium text-foreground">Initiated by</span>
      <Badge variant="outline" className="text-[10px]">
        {initiatedLabel}
      </Badge>
      {rootLabel && rootLabel !== initiatedLabel && (
        <>
          <span>root</span>
          <Badge variant="outline" className="text-[10px]">
            {rootLabel}
          </Badge>
        </>
      )}
      {parentJobId && (
        <>
          <span>parent</span>
          <code className="rounded bg-muted px-1.5 py-0.5 text-[10px]">
            {parentJobId.slice(0, 8)}…
          </code>
        </>
      )}
    </div>
  );
}
