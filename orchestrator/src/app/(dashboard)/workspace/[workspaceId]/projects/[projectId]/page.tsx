import { ProjectDetailPage } from "@/app/(dashboard)/projects/[id]/ProjectDetailPage";

interface WorkspaceProjectPageProps {
  params: Promise<{ workspaceId: string; projectId: string }>;
}

export default async function WorkspaceProjectPage({
  params,
}: WorkspaceProjectPageProps) {
  const { projectId } = await params;
  return <ProjectDetailPage projectId={projectId} />;
}
