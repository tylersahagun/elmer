"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  useOnboardingStore,
  type OnboardingError,
} from "@/lib/stores/onboarding-store";

interface OnboardingErrorBoundaryProps {
  children: React.ReactNode;
  /** Fallback to show while auto-retrying */
  retryingFallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  autoRetryAttempted: boolean;
  isExpanded: boolean;
}

/**
 * Error boundary for onboarding steps with friendly messaging and retry capability.
 *
 * Features:
 * - Catches errors in child components
 * - Friendly message with expandable technical details (per CONTEXT.md)
 * - Auto-retry once on first failure
 * - Manual retry button after auto-retry fails
 * - Integrates with onboarding store error state
 */
export class OnboardingErrorBoundary extends React.Component<
  OnboardingErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: OnboardingErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      autoRetryAttempted: false,
      isExpanded: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging
    console.error("[Onboarding Error]", error, errorInfo);

    // If this is the first error and we haven't auto-retried yet, attempt auto-retry
    if (!this.state.autoRetryAttempted) {
      // Schedule auto-retry after a brief delay
      setTimeout(() => {
        this.setState({ autoRetryAttempted: true, hasError: false, error: null });
      }, 1000);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleToggleExpanded = () => {
    this.setState((prev) => ({ isExpanded: !prev.isExpanded }));
  };

  render() {
    const { hasError, error, autoRetryAttempted, isExpanded } = this.state;
    const { children, retryingFallback } = this.props;

    // During auto-retry phase
    if (hasError && !autoRetryAttempted) {
      return (
        retryingFallback ?? (
          <div className="flex items-center justify-center p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 text-muted-foreground"
            >
              <RefreshCw className="size-5 animate-spin" />
              <span>Retrying...</span>
            </motion.div>
          </div>
        )
      );
    }

    // Show error UI after auto-retry has been attempted
    if (hasError && autoRetryAttempted) {
      return (
        <OnboardingErrorDisplay
          error={error}
          isExpanded={isExpanded}
          onRetry={this.handleRetry}
          onToggleExpanded={this.handleToggleExpanded}
        />
      );
    }

    return children;
  }
}

/**
 * Error display component with friendly messaging
 */
interface OnboardingErrorDisplayProps {
  error: Error | null;
  isExpanded: boolean;
  onRetry: () => void;
  onToggleExpanded: () => void;
}

function OnboardingErrorDisplay({
  error,
  isExpanded,
  onRetry,
  onToggleExpanded,
}: OnboardingErrorDisplayProps) {
  const { lastError, setError } = useOnboardingStore();

  // Use store error if available, fallback to caught error
  const displayError = lastError ?? (error ? createOnboardingError(error) : null);

  const handleRetry = () => {
    setError(null);
    onRetry();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-lg border border-destructive/50 bg-destructive/10 p-6"
    >
      {/* Friendly message */}
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="flex size-10 items-center justify-center rounded-full bg-destructive/20">
            <AlertTriangle className="size-5 text-destructive" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground">
            Something went wrong
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {displayError?.message ??
              "We encountered an unexpected error. Please try again."}
          </p>

          {/* Expandable technical details */}
          {displayError?.details && (
            <div className="mt-4">
              <button
                onClick={onToggleExpanded}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {isExpanded ? (
                  <ChevronUp className="size-3.5" />
                ) : (
                  <ChevronDown className="size-3.5" />
                )}
                Technical details
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <pre className="mt-2 p-3 rounded-md bg-muted/50 text-xs font-mono text-muted-foreground overflow-x-auto">
                      {displayError.details}
                      {error?.stack && (
                        <>
                          {"\n\n"}Stack trace:{"\n"}
                          {error.stack}
                        </>
                      )}
                    </pre>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Error code if available */}
          {displayError?.code && (
            <p className="mt-2 text-xs text-muted-foreground">
              Error code: <code className="font-mono">{displayError.code}</code>
            </p>
          )}
        </div>
      </div>

      {/* Retry button */}
      <div className="mt-6 flex items-center justify-end gap-3">
        <Button
          variant="outline"
          onClick={handleRetry}
          className="gap-2"
        >
          <RefreshCw className="size-4" />
          Try again
        </Button>
      </div>
    </motion.div>
  );
}

/**
 * Convert a generic Error to OnboardingError format
 */
function createOnboardingError(error: Error): OnboardingError {
  return {
    code: "UNKNOWN_ERROR",
    message: error.message || "An unexpected error occurred",
    details: error.stack ?? String(error),
    retryable: true,
    timestamp: new Date().toISOString(),
  };
}

export default OnboardingErrorBoundary;
