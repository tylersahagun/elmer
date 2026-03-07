import { notFound, redirect } from "next/navigation";
import { getConvexWorkspace } from "@/lib/convex/server";
import { requireWorkspaceAccess } from "@/lib/permissions";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { SimpleNavbar } from "@/components/chrome/Navbar";

interface OnboardingPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Workspace Setup | Elmer",
  description: "Set up your workspace by connecting to GitHub",
};

/**
 * Onboarding page for setting up a new workspace.
 *
 * Accessed at: /workspace/[id]/onboarding
 *
 * This page:
 * - Requires admin access to the workspace
 * - Redirects to workspace if onboarding already completed
 * - Renders the OnboardingWizard component
 */
export default async function OnboardingPage({ params }: OnboardingPageProps) {
  const { id } = await params;

  // Verify user has admin access to this workspace
  try {
    await requireWorkspaceAccess(id, "admin");
  } catch {
    // Clerk already guards this route; permission failures should return home.
    redirect("/");
  }

  // Get workspace details
  const workspace = await getConvexWorkspace(id) as {
    _id: string;
    name: string;
    onboardingCompletedAt?: number;
  } | null;

  if (!workspace) {
    notFound();
  }

  // If onboarding already completed, redirect to workspace
  if (workspace.onboardingCompletedAt) {
    redirect(`/workspace/${id}`);
  }

  return (
    <div className="min-h-screen bg-background">
      <SimpleNavbar path={`~/workspace/${id}/onboarding`} />
      <OnboardingWizard workspaceId={id} workspaceName={workspace.name} />
    </div>
  );
}
