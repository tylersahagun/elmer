"use client";

import { ArrowRight, SkipForward } from "lucide-react";
import { ValidationSummary } from "./ValidationSummary";
import { useDiscoveryStore } from "@/lib/stores/discovery-store";

interface ConfirmationScreenProps {
  onConfirm: () => void;
  onSkip: () => void;
  isImporting?: boolean;
}

export function ConfirmationScreen({
  onConfirm,
  onSkip,
  isImporting = false
}: ConfirmationScreenProps) {
  const { selectedInitiatives, result } = useDiscoveryStore();

  const hasSelections = selectedInitiatives.size > 0;

  return (
    <div className="space-y-6">
      {/* Summary at top per CONTEXT.md */}
      <ValidationSummary />

      {/* Confirmation message */}
      <div className="text-center space-y-4">
        {hasSelections ? (
          <>
            <h3 className="text-xl font-semibold">
              Ready to populate your workspace
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              The selected items will be imported into your Elmer workspace.
              Projects will be placed in their corresponding Kanban columns based
              on the status mapping.
            </p>
          </>
        ) : (
          <>
            <h3 className="text-xl font-semibold text-muted-foreground">
              No items selected
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Select at least one item to import, or skip to configure manually.
            </p>
          </>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col items-center gap-4">
        {/* Primary action */}
        <button
          onClick={onConfirm}
          disabled={!hasSelections || isImporting}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-lg font-medium
            transition-colors
            ${hasSelections && !isImporting
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
            }
          `}
        >
          {isImporting ? (
            <>
              <span className="animate-spin">⏳</span>
              Importing...
            </>
          ) : (
            <>
              Import Selected
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        {/* Skip link - per CONTEXT.md: "subtle link, not prominent button" */}
        <button
          onClick={onSkip}
          disabled={isImporting}
          className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
        >
          Skip import, configure manually later
        </button>
      </div>

      {/* Re-onboarding warning if applicable */}
      {result?.stats && result.stats.initiativesFound > 0 && (
        <div className="text-center text-xs text-muted-foreground">
          Re-running import will update existing projects, not create duplicates.
        </div>
      )}
    </div>
  );
}
