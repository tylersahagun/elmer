import { WorkspacePageClient } from "./WorkspacePageClient";

interface WorkspacePageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { id: workspaceId } = await params;
  
  return <WorkspacePageClient workspaceId={workspaceId} />;
}
