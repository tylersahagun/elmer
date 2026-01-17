/**
 * Research Analysis Tools
 * 
 * NOTE: These tools are kept for backwards compatibility but are NOT the primary
 * way to analyze research. The recommended flow is:
 * 
 * 1. Jobs are created in the orchestrator with status "pending"
 * 2. Cursor AI processes them via MCP CRUD tools (get-pending-jobs, complete-job)
 * 3. Cursor generates content using its own AI credentials
 */

import type { AnalyzeTranscriptInput, ToolResult } from "../types.js";

// ============================================
// TRANSCRIPT ANALYSIS
// ============================================

export interface TranscriptAnalysis {
  tldr: string;
  keyDecisions: string[];
  actionItems: Array<{
    who: string;
    what: string;
    when?: string;
  }>;
  userProblems: Array<{
    problem: string;
    verbatimQuote?: string;
    severity: "low" | "medium" | "high" | "critical";
  }>;
  featureRequests: Array<{
    request: string;
    verbatimQuote?: string;
    frequency: "one-off" | "recurring" | "widespread";
  }>;
  openQuestions: string[];
  sentiment: "positive" | "neutral" | "negative" | "mixed";
  strategicInsights: string[];
}

/**
 * Analyze transcript - Stub that returns instructions for Cursor
 * 
 * For actual analysis, use the job system:
 * 1. Create a job with type "analyze_transcript"
 * 2. Process via get-pending-jobs + complete-job MCP tools
 */
export async function analyzeTranscript(input: AnalyzeTranscriptInput): Promise<ToolResult<TranscriptAnalysis>> {
  // Return a template/placeholder instead of calling Anthropic directly
  const placeholder: TranscriptAnalysis = {
    tldr: `[Cursor AI should analyze this transcript and provide a 2-3 sentence summary]`,
    keyDecisions: ["[Extract key decisions from the transcript]"],
    actionItems: [
      { who: "[Person]", what: "[Action item from transcript]", when: "[Timeline]" }
    ],
    userProblems: [
      { 
        problem: "[User problem identified in transcript]", 
        verbatimQuote: "[Direct quote from transcript]",
        severity: "medium"
      }
    ],
    featureRequests: [
      {
        request: "[Feature request from transcript]",
        verbatimQuote: "[Direct quote]",
        frequency: "one-off"
      }
    ],
    openQuestions: ["[Questions that need follow-up]"],
    sentiment: "neutral",
    strategicInsights: ["[Strategic insights from the conversation]"],
  };

  // If transcript is very short, return the placeholder
  if (input.transcript.length < 100) {
    return { 
      success: true, 
      data: {
        ...placeholder,
        tldr: `Transcript too short for meaningful analysis (${input.transcript.length} chars). Provide more content.`,
      }
    };
  }

  // Return placeholder with context about what should be analyzed
  return { 
    success: true, 
    data: {
      ...placeholder,
      tldr: `[Analyze ${input.transcript.length} character transcript using Cursor AI]`,
      strategicInsights: [
        "This analysis should be performed by Cursor AI via the job system",
        "Use get-pending-jobs to find analyze_transcript jobs",
        "Generate proper analysis and call complete-job with results"
      ],
    }
  };
}

// ============================================
// RESEARCH SYNTHESIS
// ============================================

export interface ResearchSynthesis {
  themes: Array<{
    theme: string;
    evidence: string[];
    frequency: number;
  }>;
  patterns: string[];
  contradictions: string[];
  gaps: string[];
  recommendations: string[];
}

/**
 * Synthesize research - Stub that returns instructions for Cursor
 */
export async function synthesizeResearch(
  analyses: TranscriptAnalysis[]
): Promise<ToolResult<ResearchSynthesis>> {
  const placeholder: ResearchSynthesis = {
    themes: [
      {
        theme: "[Common theme across research sessions]",
        evidence: ["[Evidence from session 1]", "[Evidence from session 2]"],
        frequency: analyses.length,
      }
    ],
    patterns: ["[Behavioral patterns identified]"],
    contradictions: ["[Contradictions or edge cases]"],
    gaps: ["[Research gaps to fill]"],
    recommendations: ["[Recommendations based on synthesis]"],
  };

  return { 
    success: true, 
    data: {
      ...placeholder,
      recommendations: [
        `Synthesize ${analyses.length} research sessions using Cursor AI`,
        "This should be performed via the job system for proper AI generation"
      ],
    }
  };
}
