import { SimpleNavbar } from "@/components/chrome";
import { AgentTracePageClient } from "./AgentTracePageClient";

interface AgentTracePageProps {
  params: Promise<{
    id: string;
    jobId: string;
  }>;
}

export default async function AgentTracePage({
  params,
}: AgentTracePageProps) {
  const { id: workspaceId, jobId } = await params;

  return (
    <div className="min-h-screen bg-background">
      <SimpleNavbar path={`~/workspace/${workspaceId}/agents/${jobId}`} />
      <main className="mx-auto flex max-w-5xl px-4 py-8 sm:px-6">
        <AgentTracePageClient jobId={jobId} />
      </main>
    </div>
  );
}
