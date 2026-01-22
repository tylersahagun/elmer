"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Users,
  GitBranch,
  ArrowRight,
  Quote,
} from "lucide-react";

interface ExtractedProblem {
  problem: string;
  quote?: string;
  persona?: string;
  severity?: string;
}

interface HypothesisMatch {
  hypothesisName: string;
  similarity: number;
  matchType: string;
}

interface InboxItemInsightsProps {
  aiSummary?: string;
  extractedProblems?: ExtractedProblem[];
  hypothesisMatches?: HypothesisMatch[];
  extractedInsights?: string[];
  suggestedProjectName?: string;
  suggestedPersonaName?: string;
  className?: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  high: "bg-red-500/20 text-red-300 border-red-500/30",
  medium: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  low: "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

export function InboxItemInsights({
  aiSummary,
  extractedProblems,
  hypothesisMatches,
  extractedInsights,
  suggestedProjectName,
  suggestedPersonaName,
  className,
}: InboxItemInsightsProps) {
  const hasContent = aiSummary || 
    (extractedProblems && extractedProblems.length > 0) ||
    (hypothesisMatches && hypothesisMatches.length > 0) ||
    (extractedInsights && extractedInsights.length > 0);

  if (!hasContent) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("space-y-3", className)}
    >
      {/* AI Summary */}
      {aiSummary && (
        <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-medium text-purple-300">AI Summary</span>
          </div>
          <p className="text-sm text-muted-foreground">{aiSummary}</p>
        </div>
      )}

      {/* Suggestions Row */}
      {(suggestedProjectName || suggestedPersonaName) && (
        <div className="flex flex-wrap gap-2">
          {suggestedProjectName && (
            <Badge variant="outline" className="gap-1.5 text-[10px]">
              <ArrowRight className="w-3 h-3" />
              Suggested: {suggestedProjectName}
            </Badge>
          )}
          {suggestedPersonaName && (
            <Badge variant="outline" className="gap-1.5 text-[10px]">
              <Users className="w-3 h-3" />
              Persona: {suggestedPersonaName}
            </Badge>
          )}
        </div>
      )}

      {/* Extracted Problems */}
      {extractedProblems && extractedProblems.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-medium text-muted-foreground">
              Problems Identified ({extractedProblems.length})
            </span>
          </div>
          <ScrollArea className="max-h-[200px]">
            <div className="space-y-2">
              {extractedProblems.map((problem, i) => (
                <div
                  key={i}
                  className="p-2 rounded-lg bg-muted/30 border border-border"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <p className="text-sm">{problem.problem}</p>
                      {problem.quote && (
                        <div className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
                          <Quote className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span className="italic">&quot;{problem.quote}&quot;</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 items-end shrink-0">
                      {problem.severity && (
                        <Badge 
                          className={cn(
                            "text-[10px]",
                            SEVERITY_COLORS[problem.severity] || SEVERITY_COLORS.low
                          )}
                        >
                          {problem.severity}
                        </Badge>
                      )}
                      {problem.persona && (
                        <Badge variant="outline" className="text-[10px]">
                          {problem.persona}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Key Insights */}
      {extractedInsights && extractedInsights.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-medium text-muted-foreground">
              Key Insights
            </span>
          </div>
          <div className="space-y-1">
            {extractedInsights.map((insight, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <span className="text-teal-400">•</span>
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hypothesis Matches */}
      {hypothesisMatches && hypothesisMatches.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-medium text-muted-foreground">
              Hypothesis Matches
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {hypothesisMatches.map((match, i) => (
              <Badge
                key={i}
                variant="outline"
                className={cn(
                  "text-[10px] gap-1",
                  match.matchType === "existing"
                    ? "border-blue-500/30 text-blue-300"
                    : "border-purple-500/30 text-purple-300"
                )}
              >
                {match.matchType === "candidate" && (
                  <Sparkles className="w-2.5 h-2.5" />
                )}
                {match.hypothesisName}
                <span className="opacity-60">
                  ({Math.round(match.similarity * 100)}%)
                </span>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
