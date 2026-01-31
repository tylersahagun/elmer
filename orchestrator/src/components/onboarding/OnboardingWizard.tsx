"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Github, FolderSearch, CheckCircle2 } from "lucide-react";
import {
  useOnboardingStore,
  type OnboardingStep,
  type GitHubRepo as StoreGitHubRepo,
} from "@/lib/stores/onboarding-store";
import { useTourStore } from "@/lib/stores/tour-store";
import { OnboardingProgress, type StepConfig } from "./OnboardingProgress";
import { OnboardingStepWrapper } from "./OnboardingStepWrapper";
import { OnboardingErrorBoundary } from "./OnboardingErrorBoundary";
import { ConnectGitHubStep } from "./steps/ConnectGitHubStep";
import { SelectRepoStep } from "./steps/SelectRepoStep";
import { DiscoveryStep } from "./steps/DiscoveryStep";

/**
 * GitHub repo type from SelectRepoStep (different from store's GitHubRepo)
 */
interface SelectRepoStepGitHubRepo {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  private: boolean;
  url: string;
  cloneUrl: string;
  defaultBranch: string;
  pushedAt: string | null;
  owner: {
    login: string;
    avatarUrl: string;
  };
}

/**
 * Step configurations for the progress indicator
 */
const STEP_CONFIGS: StepConfig[] = [
  { id: "welcome", label: "Welcome" },
  { id: "connect-github", label: "Connect GitHub" },
  { id: "select-repo", label: "Select Repository" },
  { id: "discover", label: "Populate Workspace" },
  { id: "complete", label: "Complete" },
];

interface OnboardingWizardProps {
  workspaceId: string;
  workspaceName: string;
}

/**
 * OnboardingWizard - Main container orchestrating all onboarding steps.
 *
 * Features:
 * - Progress indicator at bottom
 * - Error boundary wrapping content
 * - Step-based navigation with manual Continue clicks
 * - API integration to finalize onboarding
 * - Tour prompt trigger on completion
 */
export function OnboardingWizard({
  workspaceId,
  workspaceName,
}: OnboardingWizardProps) {
  const router = useRouter();
  const {
    currentStep,
    selectedRepo,
    selectedBranch,
    useTemplate,
    completeStep,
    skipStep,
    setRepo,
    setTemplate,
    initForWorkspace,
  } = useOnboardingStore();

  const { showPrompt, hasSeenTour, hasDeclinedTour } = useTourStore();

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isGitHubReady, setIsGitHubReady] = React.useState(false);

  /**
   * Initialize onboarding for this specific workspace.
   * If the store contains state for a different workspace, it will be reset.
   * This ensures each workspace gets a fresh onboarding experience.
   */
  React.useEffect(() => {
    initForWorkspace(workspaceId);
  }, [workspaceId, initForWorkspace]);

  /**
   * Handle GitHub connection completion
   */
  const handleGitHubConnected = React.useCallback(() => {
    completeStep("connect-github");
  }, [completeStep]);

  /**
   * Handle repository selection - saves to both store AND database
   */
  const handleRepoSelected = React.useCallback(
    async (repo: SelectRepoStepGitHubRepo, branch: string) => {
      // Convert SelectRepoStep's repo type to our store's GitHubRepo type
      const storeRepo: StoreGitHubRepo = {
        id: repo.id,
        name: repo.name,
        fullName: repo.fullName,
        description: repo.description,
        owner: repo.owner.login,
        private: repo.private,
        defaultBranch: repo.defaultBranch,
        topics: [],
        htmlUrl: repo.url,
      };
      setRepo(storeRepo, branch);

      // Save repo to database immediately so discovery can access it
      // This is a partial save - onboarding isn't complete yet
      try {
        const response = await fetch(`/api/workspaces/${workspaceId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            githubRepo: repo.fullName,
            settings: {
              baseBranch: branch,
            },
          }),
        });

        if (!response.ok) {
          console.error(
            "Failed to save repo selection:",
            await response.text(),
          );
          // Continue anyway - the discovery step will show an error if needed
        }
      } catch (error) {
        console.error("Failed to save repo selection:", error);
        // Continue anyway - the discovery step will show an error if needed
      }

      // Complete select-repo which automatically advances to discover step
      completeStep("select-repo");
    },
    [setRepo, completeStep, workspaceId],
  );

  /**
   * Finalize onboarding - call API and trigger tour
   */
  const handleComplete = React.useCallback(async () => {
    if (!useTemplate && (!selectedRepo || !selectedBranch)) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/workspaces/${workspaceId}/onboarding`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            repo: selectedRepo?.fullName,
            branch: selectedBranch,
            template: useTemplate,
            repoDetails: selectedRepo
              ? {
                  id: selectedRepo.id,
                  fullName: selectedRepo.fullName,
                  defaultBranch: selectedRepo.defaultBranch,
                  description: selectedRepo.description,
                  private: selectedRepo.private,
                  owner: selectedRepo.owner,
                }
              : undefined,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to complete onboarding");
      }

      // Mark complete step as done
      completeStep("complete");

      // Trigger tour prompt if user hasn't seen or declined
      if (!hasSeenTour && !hasDeclinedTour) {
        showPrompt();
      }

      // Navigate to workspace
      router.push(`/workspace/${workspaceId}`);
    } catch (error) {
      console.error("Onboarding completion error:", error);
      throw error; // Let error boundary handle it
    } finally {
      setIsSubmitting(false);
    }
  }, [
    selectedRepo,
    selectedBranch,
    useTemplate,
    workspaceId,
    completeStep,
    hasSeenTour,
    hasDeclinedTour,
    showPrompt,
    router,
  ]);

  /**
   * Render the appropriate step content
   */
  const renderStepContent = () => {
    switch (currentStep) {
      case "welcome":
        return (
          <OnboardingStepWrapper
            step="welcome"
            title="Let's set up your workspace"
            description="Connect your GitHub repository to import existing projects, knowledge, and personas."
            onNext={() => completeStep("welcome")}
          >
            <WelcomeStepContent workspaceName={workspaceName} />
          </OnboardingStepWrapper>
        );

      case "connect-github":
        return (
          <OnboardingStepWrapper
            step="connect-github"
            title="Connect GitHub"
            description="We need access to your GitHub account to discover your workspace structure."
            onNext={handleGitHubConnected}
            onValidate={() => isGitHubReady}
          >
            <ConnectGitHubStep
              onComplete={handleGitHubConnected}
              onReadyChange={setIsGitHubReady}
            />
          </OnboardingStepWrapper>
        );

      case "select-repo":
        return (
          <OnboardingStepWrapper
            step="select-repo"
            title="Select Repository"
            description="Choose the repository that contains your workspace documentation."
            onNext={() => {}} // Handled by SelectRepoStep
            onValidate={() => false} // Disable default next button
          >
            <SelectRepoStep
              onComplete={handleRepoSelected}
              onUseTemplate={() => {
                setTemplate(true);
                completeStep("select-repo");
                skipStep("discover");
              }}
            />
          </OnboardingStepWrapper>
        );

      case "discover":
        return (
          <OnboardingStepWrapper
            step="discover"
            title="Populate Workspace"
            description="Import your projects from GitHub."
            onNext={() => {}} // Handled by DiscoveryStep
            onValidate={() => false} // Disable default next button
          >
            <DiscoveryStep
              onComplete={() => completeStep("discover")}
              onSkip={() => skipStep("discover")}
            />
          </OnboardingStepWrapper>
        );

      case "complete":
        return (
          <OnboardingStepWrapper
            step="complete"
            title="You're all set!"
            description="Your workspace is connected and ready to use."
            onNext={handleComplete}
            isLoading={isSubmitting}
            nextButtonText="Go to Workspace"
          >
            <CompleteStepContent
              repoName={
                useTemplate ? "Elmer Template" : selectedRepo?.fullName || ""
              }
              branchName={selectedBranch || "main"}
            />
          </OnboardingStepWrapper>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Step content - main area */}
      <div className="flex-1 flex items-start justify-center">
        <div className="w-full max-w-5xl px-4 sm:px-6 py-10 lg:py-12">
          <OnboardingErrorBoundary>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </OnboardingErrorBoundary>
        </div>
      </div>

      {/* Progress indicator - at bottom */}
      <div className="border-t bg-card/80 backdrop-blur supports-backdrop-filter:bg-card/60">
        <div className="w-full max-w-5xl px-4 sm:px-6 py-4 mx-auto">
          <OnboardingProgress steps={STEP_CONFIGS} />
        </div>
      </div>
    </div>
  );
}

/**
 * Welcome step content
 */
function WelcomeStepContent({ workspaceName }: { workspaceName: string }) {
  return (
    <div className="flex flex-col items-center text-center py-8 space-y-6">
      <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center">
        <Sparkles className="size-10 text-primary" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Welcome to {workspaceName}!</h2>
        <p className="text-muted-foreground max-w-md">
          Let's connect your GitHub repository to discover and import your
          existing workspace structure.
        </p>
      </div>

      <div className="grid gap-4 max-w-sm w-full text-left">
        <div className="flex items-start gap-3">
          <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
            <Github className="size-4" />
          </div>
          <div>
            <p className="font-medium text-sm">Connect GitHub</p>
            <p className="text-xs text-muted-foreground">
              Authorize access to your repositories
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
            <FolderSearch className="size-4" />
          </div>
          <div>
            <p className="font-medium text-sm">Select Repository</p>
            <p className="text-xs text-muted-foreground">
              Choose which repository to sync with
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
            <CheckCircle2 className="size-4" />
          </div>
          <div>
            <p className="font-medium text-sm">Start Working</p>
            <p className="text-xs text-muted-foreground">
              Your workspace will be ready to use
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Complete step content
 */
function CompleteStepContent({
  repoName,
  branchName,
}: {
  repoName: string;
  branchName: string;
}) {
  return (
    <div className="flex flex-col items-center text-center py-8 space-y-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="size-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
      >
        <CheckCircle2 className="size-10 text-green-600 dark:text-green-400" />
      </motion.div>

      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">You're all set!</h2>
        <p className="text-muted-foreground max-w-md">
          Your workspace is now connected to GitHub. In the next step, we'll
          discover your existing work and import it automatically.
        </p>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 max-w-sm w-full">
        <h3 className="font-medium mb-2">Configuration Summary</h3>
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Repository:</dt>
            <dd className="font-mono">{repoName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Branch:</dt>
            <dd className="font-mono">{branchName}</dd>
          </div>
        </dl>
      </div>

      <p className="text-sm text-muted-foreground">
        Click "Go to Workspace" to complete setup and start using Elmer.
      </p>
    </div>
  );
}

export default OnboardingWizard;
