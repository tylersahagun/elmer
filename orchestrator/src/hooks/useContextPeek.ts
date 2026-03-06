import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useState, useCallback } from "react";

export function useContextPeek(
  workspaceId: string,
  entityType: "project" | "document" | "signal",
  entityId: string,
) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const generateSummary = useAction(api.chat.generatePeekSummary);

  const trigger = useCallback(async () => {
    if (summary || isLoading || !workspaceId || !entityId) return;
    setIsLoading(true);
    try {
      const result = await generateSummary({
        workspaceId: workspaceId as Id<"workspaces">,
        entityType,
        entityId,
      });
      setSummary(result ?? null);
    } catch {
      // fail silently
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, entityType, entityId, summary, isLoading, generateSummary]);

  return { summary, isLoading, trigger };
}
