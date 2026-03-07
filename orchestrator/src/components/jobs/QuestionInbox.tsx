"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestionModal, type PendingQuestionView } from "./QuestionModal";

interface QuestionInboxProps {
  questions: PendingQuestionView[];
  onSubmit: (question: PendingQuestionView, response: string) => Promise<void> | void;
  onSkip?: (question: PendingQuestionView) => Promise<void> | void;
  isSubmitting?: boolean;
  title?: string;
  description?: string;
}

function formatRelativeAge(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMins > 0) return `${diffMins}m ago`;
  return "just now";
}

export function QuestionInbox({
  questions,
  onSubmit,
  onSkip,
  isSubmitting = false,
  title = "Pending Questions",
  description,
}: QuestionInboxProps) {
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

  const activeQuestion = useMemo(
    () => questions.find((question) => question.id === activeQuestionId) ?? null,
    [questions, activeQuestionId],
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {questions.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No pending questions.
            </div>
          ) : (
            questions.map((question) => (
              <div key={question.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{question.questionType}</Badge>
                  {question.project?.name && (
                    <Badge variant="secondary">{question.project.name}</Badge>
                  )}
                  {question.job?.type && (
                    <Badge variant="outline">{question.job.type}</Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeAge(question.createdAt)}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-medium">{question.questionText}</p>
                  {question.project?.stage && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Current stage: {question.project.stage}
                    </p>
                  )}
                </div>

                {question.choices && question.choices.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {question.choices.map((choice) => (
                      <Badge key={choice} variant="secondary">
                        {choice}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => setActiveQuestionId(question.id)}
                  >
                    Review & respond
                  </Button>
                  {question.questionType === "approval" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isSubmitting}
                        onClick={() => void onSubmit(question, "approved")}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isSubmitting}
                        onClick={() => void onSubmit(question, "rejected")}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {onSkip && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={isSubmitting}
                      onClick={() => void onSkip(question)}
                    >
                      Skip
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <QuestionModal
        open={Boolean(activeQuestion)}
        question={activeQuestion}
        onOpenChange={(open) => {
          if (!open) setActiveQuestionId(null);
        }}
        onSubmit={async (response) => {
          if (!activeQuestion) return;
          await onSubmit(activeQuestion, response);
          setActiveQuestionId(null);
        }}
        onSkip={
          onSkip
            ? async () => {
                if (!activeQuestion) return;
                await onSkip(activeQuestion);
                setActiveQuestionId(null);
              }
            : undefined
        }
        isSubmitting={isSubmitting}
      />
    </>
  );
}
