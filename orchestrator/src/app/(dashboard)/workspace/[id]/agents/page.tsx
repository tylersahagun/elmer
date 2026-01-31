import { SimpleNavbar } from "@/components/chrome";
import { AgentsList } from "@/components/agents";

interface AgentsPageProps {
  params: Promise<{ id: string }>;
}

export default async function AgentsPage({ params }: AgentsPageProps) {
  const { id: workspaceId } = await params;

  return (
    <div className="min-h-screen bg-background">
      <SimpleNavbar path="~/agents" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <AgentsList workspaceId={workspaceId} />
      </main>
    </div>
  );
}
