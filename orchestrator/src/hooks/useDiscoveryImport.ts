/**
 * useDiscoveryImport - Hook for importing discovered items into a workspace
 *
 * This hook provides:
 * 1. Import mutation for population engine
 * 2. Loading state during import
 * 3. Error handling with network timeout recovery
 * 4. Result tracking with verification
 *
 * Usage:
 * ```tsx
 * const { importDiscovery, isImporting, importResult, importError } = useDiscoveryImport();
 *
 * const handleImport = async () => {
 *   const result = await importDiscovery(workspaceId, discoveryResult, selection);
 *   if (result.success) {
 *     console.log(`Created ${result.projectsCreated} projects`);
 *   }
 * };
 * ```
 */

import { useState, useCallback } from "react";
import type {
  DiscoveryResult,
  ImportSelection,
  ImportResult,
} from "@/lib/discovery/types";

// =============================================================================
// TYPES
// =============================================================================

interface ImportStatusResponse {
  hasData: boolean;
  projectCount: number;
  recentlyCreated: number;
  agentCount: number;
  knowledgeCount: number;
  lastProjectCreatedAt: string | null;
}

interface UseDiscoveryImportReturn {
  /**
   * Import discovered items into the workspace.
   */
  importDiscovery: (
    workspaceId: string,
    discoveryResult: DiscoveryResult,
    selection: ImportSelection,
  ) => Promise<ImportResult>;

  /**
   * Whether an import is currently in progress.
   */
  isImporting: boolean;

  /**
   * Result of the last import (null if no import yet).
   */
  importResult: ImportResult | null;

  /**
   * Error message from the last import (null if successful or no import yet).
   */
  importError: string | null;

  /**
   * Reset the import state (clears result and error).
   */
  reset: () => void;

  /**
   * Verify import status by checking workspace data.
   */
  verifyImportStatus: (
    workspaceId: string,
  ) => Promise<ImportStatusResponse | null>;
}

// =============================================================================
// DEFAULT RESULT
// =============================================================================

const defaultErrorResult: ImportResult = {
  success: false,
  projectsCreated: 0,
  projectsUpdated: 0,
  columnsCreated: [],
  knowledgeSynced: 0,
  personasSynced: 0,
  signalsSynced: 0,
  agentsImported: 0,
  documentsImported: 0,
  prototypesImported: 0,
  errors: [],
};

// =============================================================================
// HELPER: Check if error is a JSON parse error (usually from HTML response)
// =============================================================================

function isJsonParseError(error: unknown): boolean {
  if (error instanceof SyntaxError) {
    const message = error.message.toLowerCase();
    return (
      message.includes("unexpected token") ||
      message.includes("json") ||
      message.includes("<!doctype")
    );
  }
  return false;
}

// =============================================================================
// HOOK
// =============================================================================

export function useDiscoveryImport(): UseDiscoveryImportReturn {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  /**
   * Verify import status by checking what data exists in the workspace.
   * Useful for recovering from network timeouts.
   */
  const verifyImportStatus = useCallback(
    async (workspaceId: string): Promise<ImportStatusResponse | null> => {
      try {
        const response = await fetch(
          `/api/workspaces/${workspaceId}/import/status`,
        );
        if (!response.ok) return null;
        return await response.json();
      } catch {
        return null;
      }
    },
    [],
  );

  const importDiscovery = useCallback(
    async (
      workspaceId: string,
      discoveryResult: DiscoveryResult,
      selection: ImportSelection,
    ): Promise<ImportResult> => {
      // Reset state
      setIsImporting(true);
      setImportError(null);
      setImportResult(null);

      // Track start time for timeout detection
      const startTime = Date.now();

      try {
        const response = await fetch(`/api/workspaces/${workspaceId}/import`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            discoveryResult,
            selection,
          }),
        });

        // Try to parse response
        let result: ImportResult;
        try {
          result = await response.json();
        } catch (parseError) {
          // JSON parse failed - likely got HTML error page from proxy/tunnel
          // This often means the request timed out but the server may have completed
          if (isJsonParseError(parseError)) {
            const elapsed = Date.now() - startTime;
            console.warn(
              `Import response parse failed after ${elapsed}ms - verifying status...`,
            );

            // Give the server a moment to finish if it was mid-write
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Verify if import actually succeeded
            const status = await verifyImportStatus(workspaceId);

            if (status && status.recentlyCreated > 0) {
              // Import actually succeeded! Build a success result from status
              const verifiedResult: ImportResult = {
                success: true,
                projectsCreated: status.recentlyCreated,
                projectsUpdated: 0,
                columnsCreated: [],
                knowledgeSynced: status.knowledgeCount,
                personasSynced: 0,
                signalsSynced: 0,
                agentsImported: status.agentCount,
                documentsImported: 0,
                prototypesImported: 0,
                errors: [],
              };
              setImportResult(verifiedResult);
              setImportError(null);
              return verifiedResult;
            }

            // Couldn't verify success - check if workspace has ANY data
            if (status && status.hasData) {
              // Workspace has data but we're not sure if it's from this import
              const uncertainResult: ImportResult = {
                success: true,
                projectsCreated: status.projectCount,
                projectsUpdated: 0,
                columnsCreated: [],
                knowledgeSynced: status.knowledgeCount,
                personasSynced: 0,
                signalsSynced: 0,
                agentsImported: status.agentCount,
                documentsImported: 0,
                prototypesImported: 0,
                errors: [
                  "Network timeout occurred, but workspace data exists. Import may have succeeded.",
                ],
              };
              setImportResult(uncertainResult);
              setImportError(null);
              return uncertainResult;
            }

            // No data found - import likely failed
            throw new Error(
              "Network timeout - the server did not respond in time. Please try again.",
            );
          }

          // Some other parse error
          throw parseError;
        }

        // Check for HTTP errors
        if (!response.ok && response.status !== 207) {
          // 207 Multi-Status is partial success
          const errorMessage =
            (result as { error?: string }).error ||
            `Import failed with status ${response.status}`;
          setImportError(errorMessage);
          setImportResult({
            ...defaultErrorResult,
            errors: [errorMessage],
          });
          return {
            ...defaultErrorResult,
            errors: [errorMessage],
          };
        }

        // Store result
        setImportResult(result);

        // Check for partial failure
        if (!result.success && result.errors.length > 0) {
          setImportError(result.errors[0]);
        }

        return result;
      } catch (error) {
        // For network errors, also try to verify status
        if (error instanceof TypeError && error.message.includes("fetch")) {
          const status = await verifyImportStatus(workspaceId);
          if (status && status.recentlyCreated > 0) {
            const verifiedResult: ImportResult = {
              success: true,
              projectsCreated: status.recentlyCreated,
              projectsUpdated: 0,
              columnsCreated: [],
              knowledgeSynced: status.knowledgeCount,
              personasSynced: 0,
              signalsSynced: 0,
              agentsImported: status.agentCount,
              documentsImported: 0,
              prototypesImported: 0,
              errors: [],
            };
            setImportResult(verifiedResult);
            setImportError(null);
            return verifiedResult;
          }
        }

        const message =
          error instanceof Error ? error.message : "Import failed";
        setImportError(message);
        const errorResult = {
          ...defaultErrorResult,
          errors: [message],
        };
        setImportResult(errorResult);
        return errorResult;
      } finally {
        setIsImporting(false);
      }
    },
    [verifyImportStatus],
  );

  const reset = useCallback(() => {
    setImportResult(null);
    setImportError(null);
  }, []);

  return {
    importDiscovery,
    isImporting,
    importResult,
    importError,
    reset,
    verifyImportStatus,
  };
}
