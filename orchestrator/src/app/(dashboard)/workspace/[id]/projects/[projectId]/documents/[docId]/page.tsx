import { StandaloneDocumentPage } from "@/app/(dashboard)/projects/[id]/documents/[docId]/StandaloneDocumentPage";

interface WorkspaceProjectDocumentPageProps {
  params: Promise<{
    id: string;
    projectId: string;
    docId: string;
  }>;
}

export default async function WorkspaceProjectDocumentPage({
  params,
}: WorkspaceProjectDocumentPageProps) {
  const { projectId, docId } = await params;
  return <StandaloneDocumentPage projectId={projectId} docId={docId} />;
}
