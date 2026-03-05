import { StandaloneDocumentPage } from "./StandaloneDocumentPage";

interface Props {
  params: Promise<{ id: string; docId: string }>;
}

export default async function DocumentPage({ params }: Props) {
  const { id: projectId, docId } = await params;
  return <StandaloneDocumentPage projectId={projectId} docId={docId} />;
}
