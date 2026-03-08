import { WorkspaceIntelligencePageClient } from "./WorkspaceIntelligencePageClient";

type PageProps = { params: Promise<{ id: string }> };

export default async function WorkspaceIntelligencePage({ params }: PageProps) {
  const { id } = await params;
  return <WorkspaceIntelligencePageClient workspaceId={id} />;
}
