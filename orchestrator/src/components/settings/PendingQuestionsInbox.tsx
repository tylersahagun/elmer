"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface PendingQuestion {
  id: string;
  jobId: string;
  workspaceId: string;
  projectId?: string;
  questionType: string;
  questionText: string;
  choices?: string[];
  createdAt: string;
}

export function PendingQuestionsInbox({ workspaceId }: { workspaceId: string }) {
  const [responses, setResponses] = useState<Record<string, string>>({});

  const { data, refetch } = useQuery<{ questions: PendingQuestion[] }>({
    queryKey: ["pending-questions", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/pending-questions`);
      if (!res.ok) throw new Error("Failed to load pending questions");
      return res.json();
    },
    enabled: !!workspaceId,
    refetchInterval: 10000,
  });

  const questions = useMemo(() => data?.questions || [], [data]);

  const submitResponse = async (question: PendingQuestion, response: string) => {
    await fetch(`/api/jobs/${question.jobId}/questions/${question.id}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId, response }),
    });
    setResponses((prev) => {
      const next = { ...prev };
      delete next[question.id];
      return next;
    });
    refetch();
  };

  const skipQuestion = async (question: PendingQuestion) => {
    await fetch(`/api/jobs/${question.jobId}/questions/${question.id}/skip`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId }),
    });
    refetch();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Questions</CardTitle>
        <CardDescription>Agents are waiting for your input.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {questions.length === 0 && (
          <div className="text-sm text-muted-foreground">No pending questions.</div>
        )}
        {questions.map((q) => (
          <div key={q.id} className="rounded-md border p-3 space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{q.questionType}</Badge>
              <span className="text-xs text-muted-foreground">Job {q.jobId}</span>
            </div>
            <p className="text-sm">{q.questionText}</p>

            {q.questionType === "approval" ? (
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => submitResponse(q, "approved")}>
                  Approve
                </Button>
                <Button size="sm" variant="outline" onClick={() => submitResponse(q, "rejected")}>
                  Reject
                </Button>
              </div>
            ) : q.choices && q.choices.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {q.choices.map((choice) => (
                  <Button
                    key={choice}
                    size="sm"
                    variant="outline"
                    onClick={() => submitResponse(q, choice)}
                  >
                    {choice}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Response</Label>
                <Input
                  value={responses[q.id] || ""}
                  onChange={(e) =>
                    setResponses((prev) => ({ ...prev, [q.id]: e.target.value }))
                  }
                  placeholder="Type your response..."
                />
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => submitResponse(q, responses[q.id] || "")}>
                    Submit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => skipQuestion(q)}>
                    Skip
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
