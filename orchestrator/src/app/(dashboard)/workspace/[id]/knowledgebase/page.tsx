import { KnowledgebasePageClient } from "./KnowledgebasePageClient";

type PageProps = { params: Promise<{ id: string }> };

export default async function KnowledgebasePage({ params }: PageProps) {
  const { id } = await params;
  return <KnowledgebasePageClient workspaceId={id} />;
}
