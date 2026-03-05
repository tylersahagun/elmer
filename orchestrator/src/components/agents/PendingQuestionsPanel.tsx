"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bot, Clock, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PendingQuestionsPanelProps {
  workspaceId: string;
  className?: string;
}

function QuestionCard({
  question,
  onAnswered,
}: {
  question: {
    _id: Id<"pendingQuestions">;
    questionText: string;
    questionType: string;
    choices?: string[] | null;
    context?: unknown;
    jobId: Id<"jobs">;
    _creationTime: number;
  };
  onAnswered: () => void;
}) {
  const [textAnswer, setTextAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answered, setAnswered] = useState(false);
  const answerMutation = useMutation(api.pendingQuestions.answer);

  const handleAnswer = async (response: unknown) => {
    setIsSubmitting(true);
    try {
      await answerMutation({ questionId: question._id, response });
      setAnswered(true);
      setTimeout(onAnswered, 800);
    } catch (e) {
      console.error("Failed to answer question:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ageSeconds = Math.round((Date.now() - question._creationTime) / 1000);
  const ageLabel =
    ageSeconds < 60
      ? `${ageSeconds}s ago`
      : `${Math.round(ageSeconds / 60)}m ago`;

  if (answered) {
    return (
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-2 px-4 py-3 text-sm text-emerald-400"
      >
        <CheckCircle className="w-4 h-4" />
        Answer submitted
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-amber-500/30 rounded-2xl bg-amber-500/5 p-4 space-y-3"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
            <Bot className="w-3 h-3 text-amber-400" />
          </div>
          <span className="text-xs font-medium text-amber-400 uppercase tracking-wide">
            Agent needs input
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {ageLabel}
        </div>
      </div>

      {/* Question */}
      <p className="text-sm font-medium leading-relaxed">{question.questionText}</p>

      {/* Context hint */}
      {question.context != null &&
        typeof question.context === "object" &&
        !Array.isArray(question.context) && (
          (question.context as Record<string, unknown>).hint
            ? <p className="text-xs text-muted-foreground italic">
                {String((question.context as Record<string, unknown>).hint)}
              </p>
            : null
        )}

      {/* Answer UI */}
      {question.questionType === "approval" ? (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handleAnswer("approved")}
            disabled={isSubmitting}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          >
            {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Approve"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAnswer("rejected")}
            disabled={isSubmitting}
            className="flex-1"
          >
            Reject
          </Button>
        </div>
      ) : question.choices && question.choices.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {question.choices.map((choice) => (
            <Button
              key={choice}
              size="sm"
              variant="outline"
              onClick={() => handleAnswer(choice)}
              disabled={isSubmitting}
              className="text-xs border-amber-500/30 hover:bg-amber-500/10 hover:border-amber-500/60"
            >
              {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
              {choice}
            </Button>
          ))}
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            placeholder="Type your answer…"
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && textAnswer.trim()) handleAnswer(textAnswer.trim());
            }}
            className="text-sm"
            disabled={isSubmitting}
          />
          <Button
            size="sm"
            onClick={() => handleAnswer(textAnswer.trim())}
            disabled={isSubmitting || !textAnswer.trim()}
          >
            {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Send"}
          </Button>
        </div>
      )}
    </motion.div>
  );
}

export function PendingQuestionsPanel({
  workspaceId,
  className,
}: PendingQuestionsPanelProps) {
  const questions = useQuery(api.pendingQuestions.listPending, {
    workspaceId: workspaceId as Id<"workspaces">,
    status: "pending",
  });

  if (!questions || questions.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className="text-xs border-amber-500/50 text-amber-400 bg-amber-500/10"
        >
          {questions.length} awaiting input
        </Badge>
      </div>

      <AnimatePresence mode="popLayout">
        {questions.map((q) => (
          <QuestionCard
            key={q._id}
            question={q}
            onAnswered={() => {/* useQuery auto-refreshes */}}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
