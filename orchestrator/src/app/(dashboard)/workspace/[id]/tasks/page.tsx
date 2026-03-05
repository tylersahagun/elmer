import { TeamTasksPage } from "./TeamTasksPage";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function WorkspaceTasksPage({ params }: Props) {
  const { id: workspaceId } = await params;
  return <TeamTasksPage workspaceId={workspaceId} />;
}
