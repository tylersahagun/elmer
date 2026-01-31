"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import {
  DiscoveryPreview,
  SelectionControls,
  FilterBar,
  ValidationSummary,
  AgentPreview,
  AgentSelectionControls,
  DiscoveryProgress,
  ConversationPanel,
  SubmodulePreview,
} from "@/components/discovery";
import { ImportProgressModal } from "@/components/onboarding/ImportProgressModal";
import { useDiscoveryStore } from "@/lib/stores/discovery-store";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { useConversationStore } from "@/lib/stores/conversation-store";
import { useDiscoveryImport, useStreamingDiscovery } from "@/hooks";
import { detectAmbiguities } from "@/lib/discovery/ambiguity-detector";
import type { DiscoveredSubmodule } from "@/lib/discovery/types";

interface DiscoveryStepProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function DiscoveryStep({ onComplete, onSkip }: DiscoveryStepProps) {
  const params = useParams();
  const workspaceId = params.id as string;

  const { selectedRepo } = useOnboardingStore();
  const {
    result,
    error,
    setResult,
    setError,
    selectedInitiatives,
    toggleInitiative,
    selectedAgents,
    toggleAgent,
    getImportSelection,
    reset: resetDiscovery,
    ambiguities,
    setAmbiguities,
  } = useDiscoveryStore();

  // Conversation store for Q&A flow
  const { isComplete: conversationComplete, reset: resetConversation } =
    useConversationStore();

  // Import hook for population engine
  const {
    importDiscovery,
    isImporting,
    importResult,
    importError,
    reset: resetImport,
    verifyImportStatus,
  } = useDiscoveryImport();

  // State for status verification
  const [isVerifying, setIsVerifying] = useState(false);

  // Streaming discovery hook
  const {
    isScanning,
    progress,
    result: streamingResult,
    error: streamingError,
    initiatives: liveInitiatives,
    submodules,
    scanningSubmodules,
    cancelDiscovery,
    startDiscovery,
  } = useStreamingDiscovery({
    workspaceId,
    enabled: true,
    onComplete: (discoveryResult) => {
      setResult(discoveryResult);
      // Detect ambiguities for conversational flow
      const detected = detectAmbiguities(discoveryResult);
      setAmbiguities(detected);
    },
    onError: (errorMsg) => {
      setError(errorMsg);
    },
  });

  // Track whether we've started discovery
  const hasStartedRef = useRef(false);

  // Modal state
  const [showImportModal, setShowImportModal] = useState(false);

  // Start discovery on mount
  useEffect(() => {
    if (!workspaceId || hasStartedRef.current) return;

    hasStartedRef.current = true;
    startDiscovery();

    // Cleanup on unmount - reset the ref so discovery can start again if remounted
    return () => {
      hasStartedRef.current = false;
      resetDiscovery();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  // Sync streaming error to store
  useEffect(() => {
    if (streamingError) {
      setError(streamingError);
    }
  }, [streamingError, setError]);

  // Calculate total selection count for import button
  const totalSelectedCount = selectedInitiatives.size + selectedAgents.size;

  // Handle import confirmation - opens modal and triggers import
  const handleImport = async () => {
    if (!result || totalSelectedCount === 0) return;

    // Reset import state and show modal
    resetImport();
    setShowImportModal(true);

    // Get selection and trigger import via the new endpoint
    const selection = getImportSelection();
    await importDiscovery(workspaceId, result, selection);
  };

  // Handle continue after successful import
  const handleImportContinue = () => {
    setShowImportModal(false);
    onComplete();
  };

  // Handle retry after failed import
  const handleImportRetry = () => {
    if (!result) return;
    resetImport();
    const selection = getImportSelection();
    importDiscovery(workspaceId, result, selection);
  };

  // Handle verify status (for recovering from network errors)
  const handleVerifyStatus = async () => {
    setIsVerifying(true);
    try {
      const status = await verifyImportStatus(workspaceId);
      if (status && status.recentlyCreated > 0) {
        // Import succeeded! Navigate to workspace
        setShowImportModal(false);
        onComplete();
      } else if (status && status.hasData) {
        // Workspace has data - assume success
        setShowImportModal(false);
        onComplete();
      }
      // If no data, the error state will remain visible for retry
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle skip
  const handleSkip = () => {
    cancelDiscovery();
    resetDiscovery();
    resetConversation();
    resetImport();
    onSkip();
  };

  // Handle retry - restart streaming discovery
  const handleRetry = () => {
    if (!workspaceId) return;
    setError(null);
    hasStartedRef.current = false;
    startDiscovery();
  };

  // Handle cancel during scanning
  const handleCancel = () => {
    cancelDiscovery();
    // Show partial results if we have any
    if (liveInitiatives.length > 0) {
      // Build partial result from live data
      setResult({
        repoOwner: selectedRepo?.owner || "",
        repoName: selectedRepo?.name || "",
        branch: "main",
        scannedAt: new Date().toISOString(),
        initiatives: liveInitiatives,
        contextPaths: [],
        agents: [],
        stats: {
          foldersScanned: progress?.foldersScanned ?? 0,
          initiativesFound: liveInitiatives.length,
          contextPathsFound: 0,
          agentsFound: 0,
          prototypesFound: 0,
          metaJsonParsed: 0,
          metaJsonErrors: 0,
        },
        warnings: [],
      });
    }
  };

  // Scanning state - show progress
  if (isScanning && progress) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Scanning repository</h2>
          <p className="text-muted-foreground mt-1">
            Looking for initiatives, knowledge, and agents in{" "}
            {selectedRepo?.name || "your repository"}
          </p>
        </div>

        <DiscoveryProgress
          progress={progress}
          onCancel={handleCancel}
          canCancel={true}
        />

        {/* Show items as they're found */}
        {liveInitiatives.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Found so far:{" "}
            {liveInitiatives
              .map((i) => i.name)
              .slice(0, 5)
              .join(", ")}
            {liveInitiatives.length > 5 &&
              ` +${liveInitiatives.length - 5} more`}
          </div>
        )}
      </div>
    );
  }

  // Initial scanning state (before progress starts)
  if (isScanning && !progress) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="text-center">
          <h3 className="font-medium">Connecting to repository...</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Preparing to scan for initiatives, knowledge, and agents
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <div className="text-center">
          <h3 className="font-medium">Discovery failed</h3>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
          <button
            onClick={handleSkip}
            className="px-4 py-2 rounded-md border hover:bg-accent"
          >
            Skip
          </button>
        </div>
      </div>
    );
  }

  // No result yet (shouldn't happen normally)
  if (!result) {
    return null;
  }

  // Empty state - no initiatives found
  if (result.initiatives.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-center">
          <h3 className="font-medium">No initiatives found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            We couldn&apos;t find any initiative folders (initiatives/,
            features/, projects/, etc.) in this repository. You can skip this
            step and configure manually later.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSkip}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Continue to workspace
          </button>
        </div>
      </div>
    );
  }

  // Main discovery preview
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">Populate your workspace</h2>
        <p className="text-muted-foreground mt-1">
          We found {result.initiatives.length} initiative
          {result.initiatives.length === 1 ? "" : "s"} in{" "}
          {selectedRepo?.name || "your repository"}. Select what you&apos;d like
          to import.
        </p>
      </div>

      {/* Conversational Q&A for ambiguities - shows before main preview */}
      {result && ambiguities.length > 0 && !conversationComplete && (
        <ConversationPanel
          onComplete={() => {
            // Conversation complete - ambiguities resolved
          }}
          className="mb-6"
        />
      )}

      {/* Summary at top per CONTEXT.md */}
      <ValidationSummary />

      {/* Filter bar */}
      <FilterBar />

      {/* Selection controls */}
      <SelectionControls />

      {/* Preview with checkboxes */}
      <DiscoveryPreview
        result={result}
        selectedIds={selectedInitiatives}
        onToggleInitiative={toggleInitiative}
        showCheckboxes={true}
      />

      {/* Agent Architecture Section */}
      {result.agents.length > 0 && (
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Agent Architecture</h3>
            <AgentSelectionControls />
          </div>
          <AgentPreview
            agents={result.agents}
            selectedPaths={selectedAgents}
            onToggleAgent={toggleAgent}
            showCheckboxes={true}
          />
        </div>
      )}

      {/* Submodule Section */}
      {(() => {
        // Result may include submodules if extended type (DiscoveryResultWithSubmodules)
        const resultSubmodules = (
          result as { submodules?: DiscoveredSubmodule[] }
        ).submodules;
        const displaySubmodules =
          resultSubmodules && resultSubmodules.length > 0
            ? resultSubmodules
            : submodules;

        if (displaySubmodules.length === 0) return null;

        // Handler for retry - re-run full discovery to check for newly granted access
        const handleSubmoduleRetry = () => {
          startDiscovery();
        };

        return (
          <div className="space-y-4 pt-4 border-t">
            <SubmodulePreview
              submodules={displaySubmodules}
              scanningSubmodulePaths={scanningSubmodules}
              onRetry={handleSubmoduleRetry}
            />
          </div>
        );
      })()}

      {/* Import Progress Modal */}
      <ImportProgressModal
        open={showImportModal}
        onOpenChange={setShowImportModal}
        isImporting={isImporting}
        result={importResult}
        error={importError}
        onContinue={handleImportContinue}
        onRetry={handleImportRetry}
        onVerifyStatus={handleVerifyStatus}
        isVerifying={isVerifying}
      />

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex flex-col gap-1">
          <button
            onClick={handleSkip}
            disabled={isImporting}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Skip, I&apos;ll configure manually
          </button>

          {/* Show message if waiting for conversation */}
          {ambiguities.length > 0 && !conversationComplete && (
            <p className="text-xs text-muted-foreground">
              Please answer the questions above before importing.
            </p>
          )}
        </div>

        <button
          onClick={handleImport}
          disabled={
            totalSelectedCount === 0 ||
            isImporting ||
            (ambiguities.length > 0 && !conversationComplete)
          }
          className={`
            flex items-center gap-2 px-6 py-2 rounded-md font-medium
            ${
              totalSelectedCount > 0 &&
              !isImporting &&
              (ambiguities.length === 0 || conversationComplete)
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }
          `}
        >
          {isImporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : (
            `Import ${totalSelectedCount} item${totalSelectedCount === 1 ? "" : "s"}`
          )}
        </button>
      </div>
    </div>
  );
}
