import { SwarmPageClient } from "./SwarmPageClient";

type PageProps = { params: Promise<{ id: string }> };

export default async function SwarmPage({ params }: PageProps) {
  const { id } = await params;
  return <SwarmPageClient workspaceId={id} />;
}
