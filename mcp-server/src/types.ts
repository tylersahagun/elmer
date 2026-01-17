import { z } from "zod";

// ============================================
// DOCUMENT GENERATION TYPES
// ============================================

export const GeneratePRDInputSchema = z.object({
  projectId: z.string(),
  projectName: z.string(),
  research: z.string().optional(),
  transcript: z.string().optional(),
  companyContext: z.string().optional(),
  personas: z.array(z.string()).optional(),
});

export type GeneratePRDInput = z.infer<typeof GeneratePRDInputSchema>;

export const GenerateDesignBriefInputSchema = z.object({
  projectId: z.string(),
  prd: z.string(),
  designLanguage: z.string().optional(),
  existingPatterns: z.array(z.string()).optional(),
});

export type GenerateDesignBriefInput = z.infer<typeof GenerateDesignBriefInputSchema>;

export const GenerateEngineeringSpecInputSchema = z.object({
  projectId: z.string(),
  prd: z.string(),
  designBrief: z.string().optional(),
  techStack: z.string().optional(),
});

export type GenerateEngineeringSpecInput = z.infer<typeof GenerateEngineeringSpecInputSchema>;

export const GenerateGTMBriefInputSchema = z.object({
  projectId: z.string(),
  prd: z.string(),
  targetPersonas: z.array(z.string()).optional(),
  marketingGuidelines: z.string().optional(),
});

export type GenerateGTMBriefInput = z.infer<typeof GenerateGTMBriefInputSchema>;

// ============================================
// RESEARCH TYPES
// ============================================

export const AnalyzeTranscriptInputSchema = z.object({
  projectId: z.string(),
  transcript: z.string(),
  context: z.string().optional(),
});

export type AnalyzeTranscriptInput = z.infer<typeof AnalyzeTranscriptInputSchema>;

// ============================================
// JURY TYPES
// ============================================

export const RunJuryInputSchema = z.object({
  projectId: z.string(),
  phase: z.enum(["research", "prd", "prototype"]),
  content: z.string(),
  jurySize: z.number().min(3).max(100).default(12),
  personasPath: z.string().optional(),
});

export type RunJuryInput = z.infer<typeof RunJuryInputSchema>;

export interface PersonaProfile {
  id: string;
  name: string;
  role: string;
  experience: string;
  techSavviness: "low" | "medium" | "high";
  priorities: string[];
  painPoints: string[];
  communicationStyle: string;
}

export interface JuryVerdict {
  vote: "approve" | "conditional" | "reject";
  confidence: number;
  reasoning: string;
  concerns: string[];
  suggestions: string[];
}

export interface JuryEvaluationResult {
  approvalRate: number;
  conditionalRate: number;
  rejectionRate: number;
  verdict: "pass" | "fail" | "conditional";
  topConcerns: string[];
  topSuggestions: string[];
  evaluations: Array<{
    persona: PersonaProfile;
    verdict: JuryVerdict;
  }>;
}

// ============================================
// PROTOTYPE TYPES
// ============================================

export const BuildPrototypeInputSchema = z.object({
  projectId: z.string(),
  type: z.enum(["standalone", "context"]),
  prd: z.string(),
  designBrief: z.string().optional(),
  workspacePath: z.string(),
  outputPath: z.string().optional(),
  existingComponents: z.array(z.string()).optional(),
});

export type BuildPrototypeInput = z.infer<typeof BuildPrototypeInputSchema>;

export const IteratePrototypeInputSchema = z.object({
  projectId: z.string(),
  prototypeId: z.string(),
  feedback: z.string(),
  workspacePath: z.string(),
});

export type IteratePrototypeInput = z.infer<typeof IteratePrototypeInputSchema>;

// ============================================
// MEMORY TYPES
// ============================================

export const StoreMemoryInputSchema = z.object({
  workspaceId: z.string(),
  projectId: z.string().optional(),
  type: z.enum(["decision", "feedback", "context", "artifact", "conversation"]),
  content: z.string(),
  metadata: z.record(z.unknown()).optional(),
});

export type StoreMemoryInput = z.infer<typeof StoreMemoryInputSchema>;

export const QueryMemoryInputSchema = z.object({
  workspaceId: z.string(),
  projectId: z.string().optional(),
  query: z.string(),
  limit: z.number().default(10),
});

export type QueryMemoryInput = z.infer<typeof QueryMemoryInputSchema>;

// ============================================
// LINEAR TYPES
// ============================================

export const GenerateTicketsInputSchema = z.object({
  projectId: z.string(),
  engineeringSpec: z.string(),
  prototypeComponents: z.array(z.string()).optional(),
  maxTickets: z.number().default(20),
});

export type GenerateTicketsInput = z.infer<typeof GenerateTicketsInputSchema>;

export const ValidateTicketsInputSchema = z.object({
  projectId: z.string(),
  tickets: z.array(z.object({
    title: z.string(),
    description: z.string(),
    estimatedPoints: z.number().optional(),
  })),
  prd: z.string(),
  prototypeDescription: z.string().optional(),
});

export type ValidateTicketsInput = z.infer<typeof ValidateTicketsInputSchema>;

// ============================================
// TOOL RESULT TYPE
// ============================================

export interface ToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
