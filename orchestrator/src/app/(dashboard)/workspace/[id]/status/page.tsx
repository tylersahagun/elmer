import { StatusPageClient } from "./StatusPageClient";

type PageProps = { params: Promise<{ id: string }> };

export default async function WorkspaceStatusPage({ params }: PageProps) {
  const { id } = await params;
  return <StatusPageClient workspaceId={id} />;
}
