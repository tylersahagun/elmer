"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface PendingQuestionView {
  id: string;
  jobId: string;
  workspaceId: string;
  projectId?: string | null;
  questionType: string;
  questionText: string;
  choices?: string[] | null;
  context?: Record<string, unknown> | null;
  toolName?: string | null;
  timeoutAt?: string | Date | null;
  createdAt: string | Date;
  project?: {
    id: string;
    name: string;
    stage?: string;
  } | null;
  job?: {
    id: string;
    type: string;
    status: string;
    progress?: number | null;
  } | null;
}

interface QuestionModalProps {
  open: boolean;
  question: PendingQuestionView | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (response: string) => Promise<void> | void;
  onSkip?: () => Promise<void> | void;
  isSubmitting?: boolean;
}

export function QuestionModal({
  open,
  question,
  onOpenChange,
  onSubmit,
  onSkip,
  isSubmitting = false,
}: QuestionModalProps) {
  const [response, setResponse] = useState("");

  const quickChoices = useMemo(() => question?.choices ?? [], [question]);

  if (!question) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Agent needs input</DialogTitle>
          <DialogDescription>
            Review the context, answer the question, and resume the workflow.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{question.questionType}</Badge>
            {question.project?.name && (
              <Badge variant="secondary">{question.project.name}</Badge>
            )}
            {question.job?.type && (
              <Badge variant="outline">{question.job.type}</Badge>
            )}
          </div>

          <div className="rounded-lg border p-4 bg-muted/30">
            <div className="text-sm font-medium mb-2">Question</div>
            <p className="text-sm whitespace-pre-wrap">{question.questionText}</p>
          </div>

          {(question.toolName || question.timeoutAt || question.context) && (
            <div className="rounded-lg border p-4 space-y-3">
              <div className="text-sm font-medium">Context</div>
              {question.toolName && (
                <div className="text-sm text-muted-foreground">
                  Tool: <code>{question.toolName}</code>
                </div>
              )}
              {question.timeoutAt && (
                <div className="text-sm text-muted-foreground">
                  Timeout: {new Date(question.timeoutAt).toLocaleString()}
                </div>
              )}
              {question.context && Object.keys(question.context).length > 0 && (
                <pre className="overflow-x-auto rounded-md bg-background p-3 text-xs text-muted-foreground">
                  {JSON.stringify(question.context, null, 2)}
                </pre>
              )}
            </div>
          )}

          {quickChoices.length > 0 && (
            <div className="space-y-2">
              <Label>Suggested choices</Label>
              <div className="flex flex-wrap gap-2">
                {quickChoices.map((choice) => (
                  <Button
                    key={choice}
                    type="button"
                    variant={response === choice ? "default" : "outline"}
                    onClick={() => setResponse(choice)}
                  >
                    {choice}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {question.questionType === "approval" ? (
            <div className="space-y-2">
              <Label htmlFor="approval-response">Optional rationale</Label>
              <Textarea
                id="approval-response"
                value={response}
                onChange={(event) => setResponse(event.target.value)}
                placeholder="Add context for the approval decision…"
                rows={4}
              />
            </div>
          ) : quickChoices.length > 0 ? (
            <div className="space-y-2">
              <Label htmlFor="choice-response">Refine your answer</Label>
              <Input
                id="choice-response"
                value={response}
                onChange={(event) => setResponse(event.target.value)}
                placeholder="Optional details…"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="question-response">Response</Label>
              <Textarea
                id="question-response"
                value={response}
                onChange={(event) => setResponse(event.target.value)}
                placeholder="Type your response…"
                rows={5}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          {onSkip && (
            <Button
              variant="ghost"
              onClick={() => void onSkip()}
              disabled={isSubmitting}
            >
              Skip
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Close
          </Button>
          {question.questionType === "approval" ? (
            <>
              <Button
                variant="outline"
                onClick={() => void onSubmit(response || "rejected")}
                disabled={isSubmitting}
              >
                Reject
              </Button>
              <Button
                onClick={() => void onSubmit(response || "approved")}
                disabled={isSubmitting}
              >
                Approve
              </Button>
            </>
          ) : (
            <Button
              onClick={() => void onSubmit(response)}
              disabled={isSubmitting || response.trim().length === 0}
            >
              Submit response
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
