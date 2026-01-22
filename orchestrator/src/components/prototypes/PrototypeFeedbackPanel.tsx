"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Window } from "@/components/chrome/Window";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUIStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Plus,
  Send,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Clock,
  ArrowRight,
  X,
} from "lucide-react";

interface IterationEntry {
  version: string;
  date: string;
  prototype_type?: string;
  focus?: string;
  feedback_source?: string;
}

interface PrototypeFeedbackPanelProps {
  projectId: string;
  projectName: string;
  workspaceId: string;
  prototypeId?: string;
  prototypeName?: string;
  iterationHistory?: IterationEntry[];
  className?: string;
}

export function PrototypeFeedbackPanel({
  projectId,
  projectName,
  workspaceId,
  prototypeId,
  prototypeName,
  iterationHistory = [],
  className,
}: PrototypeFeedbackPanelProps) {
  const queryClient = useQueryClient();
  const openJobLogsDrawer = useUIStore((s) => s.openJobLogsDrawer);
  
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackType, setFeedbackType] = useState<"notes" | "transcript">("notes");

  // Create iteration job mutation
  const iterateMutation = useMutation({
    mutationFn: async () => {
      if (!feedbackText.trim()) throw new Error("Feedback is required");

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          projectId,
          type: "iterate_prototype",
          input: {
            prototypeId,
            prototypeName,
            feedbackType,
            feedback: feedbackText.trim(),
            projectName,
          },
        }),
      });

      if (!res.ok) throw new Error("Failed to create iteration job");
      return res.json();
    },
    onSuccess: (job) => {
      // Clear form
      setFeedbackText("");
      setIsOpen(false);
      
      // Open job logs drawer
      openJobLogsDrawer(job.id, projectName);
      
      // Refresh project data
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    iterateMutation.mutate();
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Feedback Form Toggle */}
      <Window title="feedback --add">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Prototype Feedback</p>
              <p className="text-[10px] text-muted-foreground font-mono">
                // Add feedback to trigger iteration
              </p>
            </div>
          </div>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-border space-y-4">
                {/* Feedback Type Selector */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={feedbackType === "notes" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFeedbackType("notes")}
                    className="gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Notes
                  </Button>
                  <Button
                    type="button"
                    variant={feedbackType === "transcript" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFeedbackType("transcript")}
                    className="gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Transcript
                  </Button>
                </div>

                {/* Feedback Input */}
                <Textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder={
                    feedbackType === "notes"
                      ? "Describe the changes you want to make...\n\nExamples:\n- The CTA button should be more prominent\n- Add loading states for the form submission\n- Simplify the navigation flow"
                      : "Paste meeting transcript or user feedback...\n\nThe AI will extract:\n- Key decisions made\n- Action items\n- User problems with verbatim quotes\n- Suggested improvements"
                  }
                  rows={6}
                  className="resize-none font-mono text-xs"
                />

                {/* Hint */}
                <p className="text-[10px] text-muted-foreground">
                  This will create a new prototype version based on your feedback. The PRD and design brief will also be updated.
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-3.5 h-3.5 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!feedbackText.trim() || iterateMutation.isPending}
                    className="gap-1.5"
                  >
                    {iterateMutation.isPending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Start Iteration
                      </>
                    )}
                  </Button>
                </div>

                {/* Error */}
                {iterateMutation.isError && (
                  <p className="text-xs text-red-400">
                    {iterateMutation.error instanceof Error
                      ? iterateMutation.error.message
                      : "Failed to start iteration"}
                  </p>
                )}
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </Window>

      {/* Iteration History */}
      {iterationHistory.length > 0 && (
        <Window title="cat iteration-history.json">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground">
                {iterationHistory.length} iteration{iterationHistory.length > 1 ? "s" : ""}
              </p>
            </div>
            <ScrollArea className="max-h-[200px]">
              <div className="space-y-2">
                {iterationHistory.map((entry, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-2 rounded-lg bg-muted/30"
                  >
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px] font-mono text-purple-400 shrink-0">
                      {entry.version}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs">
                          {new Date(entry.date).toLocaleDateString()}
                        </span>
                        {entry.prototype_type && (
                          <Badge variant="outline" className="text-[10px]">
                            {entry.prototype_type}
                          </Badge>
                        )}
                      </div>
                      {entry.focus && (
                        <p className="text-[10px] text-muted-foreground mt-1 truncate">
                          {entry.focus}
                        </p>
                      )}
                      {entry.feedback_source && (
                        <p className="text-[10px] text-muted-foreground/70 font-mono flex items-center gap-1 mt-1">
                          <ArrowRight className="w-2.5 h-2.5" />
                          {entry.feedback_source}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </Window>
      )}
    </div>
  );
}
