"use client";

import { useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { QuestionInbox } from "@/components/jobs/QuestionInbox";
import type { PendingQuestionView } from "@/components/jobs/QuestionModal";

export function PendingQuestionsInbox({ workspaceId }: { workspaceId: string }) {
  const { data, refetch } = useQuery<{ questions: PendingQuestionView[] }>({
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

  const respondMutation = useMutation({
    mutationFn: async ({
      question,
      response,
    }: {
      question: PendingQuestionView;
      response: string;
    }) => {
      const res = await fetch(
        `/api/jobs/${question.jobId}/questions/${question.id}/respond`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workspaceId, response }),
        },
      );
      if (!res.ok) throw new Error("Failed to submit response");
      return res.json();
    },
    onSuccess: () => {
      refetch();
    },
  });

  const skipMutation = useMutation({
    mutationFn: async (question: PendingQuestionView) => {
      const res = await fetch(
        `/api/jobs/${question.jobId}/questions/${question.id}/skip`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workspaceId }),
        },
      );
      if (!res.ok) throw new Error("Failed to skip question");
      return res.json();
    },
    onSuccess: () => {
      refetch();
    },
  });

  return (
    <QuestionInbox
      questions={questions}
      onSubmit={(question, response) =>
        respondMutation.mutateAsync({ question, response })
      }
      onSkip={(question) => skipMutation.mutateAsync(question)}
      isSubmitting={respondMutation.isPending || skipMutation.isPending}
      title="Pending Questions"
      description="Agents are waiting for your input."
    />
  );
}
