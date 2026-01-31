import { PersonasPageClient } from "./PersonasPageClient";

type PageProps = { params: Promise<{ id: string }> };

export default async function PersonasPage({ params }: PageProps) {
  const { id } = await params;
  return <PersonasPageClient workspaceId={id} />;
}
