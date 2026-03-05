import { InboxPageClient } from "./InboxPageClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function InboxPage({ params }: Props) {
  const { id: workspaceId } = await params;
  return <InboxPageClient workspaceId={workspaceId} />;
}
