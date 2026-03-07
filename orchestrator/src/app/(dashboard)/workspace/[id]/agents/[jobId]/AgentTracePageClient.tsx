"use client";

import { ExecutionPanel } from "@/components/jobs";
import { useJobLogs } from "@/hooks/useJobLogs";

interface AgentTracePageClientProps {
  jobId: string;
}

export function AgentTracePageClient({
  jobId,
}: AgentTracePageClientProps) {
  const { job } = useJobLogs(jobId);

  return (
    <div className="space-y-4" data-testid="agent-trace-page">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Agent trace</h1>
        <p className="text-sm text-muted-foreground">
          Deterministic execution state for seeded release-gate validation.
        </p>
      </div>

      <ExecutionPanel
        jobId={jobId}
        jobType={job?.type ?? "execute_agent_definition"}
      />
    </div>
  );
}
