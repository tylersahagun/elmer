import { SignalsPageClient } from "./SignalsPageClient";

type PageProps = { params: Promise<{ id: string }> };

export default async function SignalsPage({ params }: PageProps) {
  const { id } = await params;
  return <SignalsPageClient workspaceId={id} />;
}
