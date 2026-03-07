"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ApprovalQueuePanelProps {
  workspaceId: string;
}

interface PendingQuestion {
  id: string;
  jobId: string;
  questionType: string;
  questionText: string;
  createdAt: string;
}

export function ApprovalQueuePanel({ workspaceId }: ApprovalQueuePanelProps) {
  const { data } = useQuery<{ questions: PendingQuestion[] }>({
    queryKey: ["control-center-pending-questions", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/pending-questions`);
      if (!res.ok) throw new Error("Failed to load pending questions");
      return res.json();
    },
    enabled: !!workspaceId,
    refetchInterval: 10000,
  });

  const questions = data?.questions ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Approval & question queue</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {questions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No pending approvals or agent questions.
          </p>
        ) : (
          questions.map((question) => (
            <div key={question.id} className="rounded-md border p-3">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="outline">{question.questionType}</Badge>
                <div className="text-xs text-muted-foreground">
                  {new Date(question.createdAt).toLocaleString()}
                </div>
              </div>
              <p className="text-sm mt-2">{question.questionText}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Job {question.jobId}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
