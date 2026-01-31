"use client";

/**
 * ImportProgressModal - Shows import progress and results
 *
 * Displays:
 * - Loading spinner during import
 * - Summary counts after completion
 * - Error messages if any
 * - Continue button on success
 *
 * Per POPUL-07 requirements for progress feedback during population.
 */

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  FolderKanban,
  Columns3,
  BookOpen,
  Bot,
  RefreshCw,
  FileText,
} from "lucide-react";
import type { ImportResult } from "@/lib/discovery/types";

// =============================================================================
// TYPES
// =============================================================================

interface ImportProgressModalProps {
  /**
   * Whether the modal is open.
   */
  open: boolean;

  /**
   * Callback when the modal should close.
   */
  onOpenChange: (open: boolean) => void;

  /**
   * Whether the import is currently in progress.
   */
  isImporting: boolean;

  /**
   * The import result (null if import hasn't completed).
   */
  result: ImportResult | null;

  /**
   * Error message from the import (null if no error).
   */
  error: string | null;

  /**
   * Callback when the user clicks continue after successful import.
   */
  onContinue?: () => void;

  /**
   * Callback when the user clicks retry after failed import.
   */
  onRetry?: () => void;

  /**
   * Callback to verify import status (for recovering from network errors).
   */
  onVerifyStatus?: () => Promise<void>;

  /**
   * Whether status verification is in progress.
   */
  isVerifying?: boolean;
}

// =============================================================================
// STAT ITEM COMPONENT
// =============================================================================

interface StatItemProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color?: string;
}

function StatItem({
  icon: Icon,
  label,
  value,
  color = "text-slate-600",
}: StatItemProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-900 dark:text-white">
          {label}
        </p>
      </div>
      <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
        {value}
      </div>
    </div>
  );
}

// =============================================================================
// LOADING STATE
// =============================================================================

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="h-12 w-12 text-blue-500" />
      </motion.div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Importing...
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Creating projects and syncing knowledge
        </p>
      </div>
      <Progress value={undefined} className="w-full max-w-xs h-2" />
    </div>
  );
}

// =============================================================================
// SUCCESS STATE
// =============================================================================

interface SuccessStateProps {
  result: ImportResult;
  onContinue?: () => void;
}

function SuccessState({ result, onContinue }: SuccessStateProps) {
  const totalProjects = result.projectsCreated + result.projectsUpdated;
  const hasPartialErrors = result.errors.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-full ${hasPartialErrors ? "bg-amber-100 dark:bg-amber-900/30" : "bg-emerald-100 dark:bg-emerald-900/30"}`}
        >
          {hasPartialErrors ? (
            <AlertCircle className="h-6 w-6 text-amber-500" />
          ) : (
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {hasPartialErrors
              ? "Import Completed with Warnings"
              : "Import Successful"}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Your workspace has been populated
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="border rounded-lg divide-y dark:border-slate-700 dark:divide-slate-700">
        <StatItem
          icon={FolderKanban}
          label="Projects"
          value={`${result.projectsCreated} created, ${result.projectsUpdated} updated`}
          color="text-blue-500"
        />
        {result.columnsCreated.length > 0 && (
          <StatItem
            icon={Columns3}
            label="Dynamic Columns"
            value={result.columnsCreated.length}
            color="text-purple-500"
          />
        )}
        {result.knowledgeSynced > 0 && (
          <StatItem
            icon={BookOpen}
            label="Knowledge Entries"
            value={result.knowledgeSynced}
            color="text-emerald-500"
          />
        )}
        {result.agentsImported > 0 && (
          <StatItem
            icon={Bot}
            label="Agent Definitions"
            value={result.agentsImported}
            color="text-amber-500"
          />
        )}
        {result.documentsImported > 0 && (
          <StatItem
            icon={FileText}
            label="Documents Imported"
            value={result.documentsImported}
            color="text-cyan-500"
          />
        )}
      </div>

      {/* Dynamic columns list */}
      {result.columnsCreated.length > 0 && (
        <div className="text-sm text-slate-500 dark:text-slate-400">
          <span className="font-medium">New columns: </span>
          {result.columnsCreated.join(", ")}
        </div>
      )}

      {/* Partial errors */}
      {hasPartialErrors && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
            Some items could not be imported:
          </p>
          <ul className="text-sm text-amber-700 dark:text-amber-300 list-disc list-inside">
            {result.errors.slice(0, 3).map((err, i) => (
              <li key={i}>{err}</li>
            ))}
            {result.errors.length > 3 && (
              <li>...and {result.errors.length - 3} more</li>
            )}
          </ul>
        </div>
      )}

      {/* Continue button */}
      {onContinue && (
        <Button onClick={onContinue} className="w-full">
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Continue to Workspace
        </Button>
      )}
    </div>
  );
}

// =============================================================================
// ERROR STATE
// =============================================================================

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
  onVerifyStatus?: () => Promise<void>;
  isVerifying?: boolean;
}

function ErrorState({
  error,
  onRetry,
  onVerifyStatus,
  isVerifying,
}: ErrorStateProps) {
  // Check if this looks like a network/timeout error
  const isNetworkError =
    error.includes("Unexpected token") ||
    error.includes("<!DOCTYPE") ||
    error.includes("timeout") ||
    error.includes("Network") ||
    error.includes("fetch");

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-full ${isNetworkError ? "bg-amber-100 dark:bg-amber-900/30" : "bg-red-100 dark:bg-red-900/30"}`}
        >
          <AlertCircle
            className={`h-6 w-6 ${isNetworkError ? "text-amber-500" : "text-red-500"}`}
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {isNetworkError ? "Connection Issue" : "Import Failed"}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isNetworkError
              ? "The response was interrupted, but the import may have succeeded"
              : "There was a problem importing your data"}
          </p>
        </div>
      </div>

      {/* Error message */}
      <div
        className={`border rounded-lg p-3 ${
          isNetworkError
            ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
            : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
        }`}
      >
        <p
          className={`text-sm ${
            isNetworkError
              ? "text-amber-700 dark:text-amber-300"
              : "text-red-700 dark:text-red-300"
          }`}
        >
          {isNetworkError
            ? "The server took too long to respond. This often happens with large imports. Click 'Check Status' to see if your data was imported successfully."
            : error}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        {isNetworkError && onVerifyStatus && (
          <Button
            onClick={onVerifyStatus}
            className="flex-1"
            disabled={isVerifying}
          >
            {isVerifying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Check Status
              </>
            )}
          </Button>
        )}
        {onRetry && (
          <Button
            onClick={onRetry}
            variant={isNetworkError ? "outline" : "default"}
            className={isNetworkError ? "flex-1" : "w-full"}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Import
          </Button>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ImportProgressModal({
  open,
  onOpenChange,
  isImporting,
  result,
  error,
  onContinue,
  onRetry,
  onVerifyStatus,
  isVerifying,
}: ImportProgressModalProps) {
  // Prevent closing while importing or verifying
  const handleOpenChange = (newOpen: boolean) => {
    if ((isImporting || isVerifying) && !newOpen) {
      return; // Don't allow closing while importing/verifying
    }
    onOpenChange(newOpen);
  };

  // Determine content based on state
  const renderContent = () => {
    if (isImporting) {
      return <LoadingState />;
    }

    // Show success if we have a successful result
    if (result?.success) {
      return <SuccessState result={result} onContinue={onContinue} />;
    }

    // Show error state if we have an error
    if (error) {
      return (
        <ErrorState
          error={error}
          onRetry={onRetry}
          onVerifyStatus={onVerifyStatus}
          isVerifying={isVerifying}
        />
      );
    }

    // Fallback: show result if we have one (even partial)
    if (result) {
      return <SuccessState result={result} onContinue={onContinue} />;
    }

    return null;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        showCloseButton={!isImporting}
        onInteractOutside={(e) => {
          if (isImporting) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (isImporting) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {isImporting
              ? "Importing Data"
              : result?.success
                ? "Import Complete"
                : "Import Status"}
          </DialogTitle>
          <DialogDescription>
            {isImporting
              ? "Please wait while we set up your workspace..."
              : "Review what was imported"}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          <motion.div
            key={isImporting ? "loading" : result ? "result" : "error"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
