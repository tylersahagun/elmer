/**
 * Task Verification Service - GSD-inspired per-task verification
 * 
 * Verifies task completion against structured criteria:
 * - file:document_type - Check if document exists
 * - sections:Section1,Section2 - Check if sections exist in most recent doc
 * - content:pattern - Check if content matches regex pattern
 * - ai:criterion - Use AI to verify a criterion with context
 * 
 * Example criteria:
 * - "file:prd exists"
 * - "sections:Problem Statement,Goals,Success Metrics"
 * - "ai:PRD includes measurable success metrics"
 * - "ai:aligns with strategic guardrails"
 */

import { db } from "@/lib/db";
import {
  documents,
  stageRuns,
  projects,
  type RecipeStep,
  type DocumentType,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { type StreamCallback, getDefaultProvider, type ExecutionContext } from "./providers";

// ============================================
// TYPES
// ============================================

export interface VerificationContext {
  run: typeof stageRuns.$inferSelect;
  project: typeof projects.$inferSelect;
  documents: Array<typeof documents.$inferSelect>;
  task: RecipeStep;
  workspaceId: string;
  // Context for AI-based verification
  personas?: string;
  guardrails?: string;
  companyContext?: string;
}

export interface VerificationResult {
  passed: boolean;
  criteriaResults: Array<{
    criterion: string;
    passed: boolean;
    evidence?: string;
  }>;
}

export interface CriterionCheck {
  type: "file" | "sections" | "content" | "ai";
  value: string;
  original: string;
}

// ============================================
// CRITERION PARSING
// ============================================

/**
 * Parse a criterion string into a structured check
 * Formats:
 * - "file:prd" or "file:prd exists" -> Check document type exists
 * - "sections:Problem Statement,Goals" -> Check sections in most recent doc
 * - "content:/metrics?/i" -> Check content matches pattern
 * - "ai:PRD includes metrics" -> AI-based verification
 */
export function parseCriterion(criterion: string): CriterionCheck {
  const trimmed = criterion.trim();
  
  // File exists check
  if (trimmed.startsWith("file:")) {
    const value = trimmed.slice(5).replace(/ exists$/, "").trim();
    return { type: "file", value, original: criterion };
  }
  
  // Sections exist check
  if (trimmed.startsWith("sections:")) {
    const value = trimmed.slice(9).trim();
    return { type: "sections", value, original: criterion };
  }
  
  // Content pattern check
  if (trimmed.startsWith("content:")) {
    const value = trimmed.slice(8).trim();
    return { type: "content", value, original: criterion };
  }
  
  // AI check (default for "ai:" prefix or unrecognized)
  if (trimmed.startsWith("ai:")) {
    const value = trimmed.slice(3).trim();
    return { type: "ai", value, original: criterion };
  }
  
  // Default to AI check for natural language criteria
  return { type: "ai", value: trimmed, original: criterion };
}

// ============================================
// VERIFICATION STRATEGIES
// ============================================

/**
 * Check if a document of the given type exists
 */
export async function verifyFileExists(
  ctx: VerificationContext,
  documentType: string,
  callbacks?: StreamCallback
): Promise<{ passed: boolean; evidence?: string }> {
  callbacks?.onLog("debug", `Checking if document type '${documentType}' exists`, "verification");
  
  // Normalize document type (handle both "prd" and "PRD")
  const normalizedType = documentType.toLowerCase().replace(/ /g, "_") as DocumentType;
  
  const exists = ctx.documents.some((doc) => doc.type === normalizedType);
  
  if (exists) {
    const doc = ctx.documents.find((d) => d.type === normalizedType);
    return {
      passed: true,
      evidence: `Document '${documentType}' exists (${doc?.title || "untitled"})`,
    };
  }
  
  return {
    passed: false,
    evidence: `Document '${documentType}' not found. Available: ${ctx.documents.map(d => d.type).join(", ") || "none"}`,
  };
}

/**
 * Check if required sections exist in documents
 */
export async function verifySectionsExist(
  ctx: VerificationContext,
  sectionsStr: string,
  callbacks?: StreamCallback
): Promise<{ passed: boolean; evidence?: string }> {
  const sections = sectionsStr.split(",").map((s) => s.trim());
  callbacks?.onLog("debug", `Checking for sections: ${sections.join(", ")}`, "verification");
  
  // Find the most recent document (by updatedAt) that might contain these sections
  const sortedDocs = [...ctx.documents].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  
  // Check each document for sections
  for (const doc of sortedDocs) {
    const content = doc.content.toLowerCase();
    const foundSections: string[] = [];
    const missingSections: string[] = [];
    
    for (const section of sections) {
      const sectionLower = section.toLowerCase();
      // Check for markdown headers (# or ##)
      if (
        content.includes(`# ${sectionLower}`) ||
        content.includes(`## ${sectionLower}`) ||
        content.includes(`### ${sectionLower}`)
      ) {
        foundSections.push(section);
      } else {
        missingSections.push(section);
      }
    }
    
    if (missingSections.length === 0) {
      return {
        passed: true,
        evidence: `All sections found in '${doc.title}': ${foundSections.join(", ")}`,
      };
    }
    
    // If we found some sections but not all, continue checking other docs
    if (foundSections.length > 0 && sortedDocs.indexOf(doc) === sortedDocs.length - 1) {
      return {
        passed: false,
        evidence: `Missing sections in '${doc.title}': ${missingSections.join(", ")}. Found: ${foundSections.join(", ")}`,
      };
    }
  }
  
  return {
    passed: false,
    evidence: `No documents contain required sections: ${sections.join(", ")}`,
  };
}

/**
 * Check if content matches a pattern
 */
export async function verifyContentMatches(
  ctx: VerificationContext,
  pattern: string,
  callbacks?: StreamCallback
): Promise<{ passed: boolean; evidence?: string }> {
  callbacks?.onLog("debug", `Checking content pattern: ${pattern}`, "verification");
  
  try {
    // Parse regex pattern (supports /pattern/flags format)
    let regex: RegExp;
    const regexMatch = pattern.match(/^\/(.+)\/([gimsuy]*)$/);
    if (regexMatch) {
      regex = new RegExp(regexMatch[1], regexMatch[2]);
    } else {
      // Treat as literal string search (case-insensitive)
      regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    }
    
    // Check all documents
    for (const doc of ctx.documents) {
      if (regex.test(doc.content)) {
        const match = doc.content.match(regex);
        return {
          passed: true,
          evidence: `Pattern found in '${doc.title}': "${match?.[0]?.slice(0, 50)}..."`,
        };
      }
    }
    
    return {
      passed: false,
      evidence: `Pattern '${pattern}' not found in any document`,
    };
  } catch (error) {
    return {
      passed: false,
      evidence: `Invalid pattern: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Use AI to verify a criterion with full context
 */
export async function verifyAICheck(
  ctx: VerificationContext,
  criterion: string,
  callbacks?: StreamCallback
): Promise<{ passed: boolean; evidence: string }> {
  callbacks?.onLog("info", `Running AI verification: "${criterion}"`, "verification");
  
  const provider = getDefaultProvider();
  
  // Build context for AI
  const contextParts: string[] = [];
  
  if (ctx.companyContext) {
    contextParts.push(`## Company Context\n${ctx.companyContext}`);
  }
  
  if (ctx.guardrails) {
    contextParts.push(`## Strategic Guardrails\n${ctx.guardrails}`);
  }
  
  if (ctx.personas) {
    contextParts.push(`## Target Personas\n${ctx.personas}`);
  }
  
  // Add relevant documents
  const docsContext = ctx.documents
    .map((doc) => `### ${doc.title} (${doc.type})\n${doc.content.slice(0, 4000)}${doc.content.length > 4000 ? "..." : ""}`)
    .join("\n\n");
  
  if (docsContext) {
    contextParts.push(`## Project Documents\n${docsContext}`);
  }
  
  const systemPrompt = `You are a verification agent. Your job is to determine if a specific criterion has been met based on the provided context.

Respond in this exact JSON format:
{
  "passed": true or false,
  "evidence": "Specific evidence supporting your decision"
}

Be strict but fair. Only pass if there is clear evidence the criterion is met.`;

  const userPrompt = `# Verification Task

## Criterion to Verify
"${criterion}"

## Project
${ctx.project.name}: ${ctx.project.description || "No description"}

${contextParts.join("\n\n")}

---

Evaluate whether the criterion "${criterion}" has been met based on the documents and context above.`;

  try {
    const result = await provider.execute(
      systemPrompt,
      userPrompt,
      {
        runId: ctx.run.id,
        workspaceId: ctx.workspaceId,
        cardId: ctx.run.cardId,
        stage: ctx.run.stage,
      },
      callbacks
    );
    
    if (!result.success) {
      return {
        passed: false,
        evidence: `AI verification failed: ${result.error}`,
      };
    }
    
    // Parse AI response
    try {
      const output = result.output || "";
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = output.match(/\{[\s\S]*"passed"[\s\S]*"evidence"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          passed: Boolean(parsed.passed),
          evidence: String(parsed.evidence || "No evidence provided"),
        };
      }
      
      // Fallback: look for pass/fail keywords
      const lowerOutput = output.toLowerCase();
      if (lowerOutput.includes('"passed": true') || lowerOutput.includes('"passed":true')) {
        return { passed: true, evidence: output.slice(0, 200) };
      }
      
      return {
        passed: false,
        evidence: `Could not parse AI response: ${output.slice(0, 200)}`,
      };
    } catch (parseError) {
      return {
        passed: false,
        evidence: `Failed to parse AI response: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
      };
    }
  } catch (error) {
    return {
      passed: false,
      evidence: `AI verification error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

// ============================================
// MAIN VERIFICATION FUNCTION
// ============================================

/**
 * Verify a task against its verification criteria
 */
export async function verifyTask(
  ctx: VerificationContext,
  callbacks?: StreamCallback
): Promise<VerificationResult> {
  const criteria = ctx.task.verificationCriteria || [];
  
  if (criteria.length === 0) {
    callbacks?.onLog("info", "No verification criteria defined, auto-passing", "verification");
    return {
      passed: true,
      criteriaResults: [],
    };
  }
  
  callbacks?.onLog("info", `Verifying ${criteria.length} criteria for task: ${ctx.task.name || ctx.task.skillId}`, "verification");
  
  const results: VerificationResult["criteriaResults"] = [];
  let allPassed = true;
  
  for (const criterion of criteria) {
    callbacks?.onLog("debug", `Checking: "${criterion}"`, "verification");
    
    const check = parseCriterion(criterion);
    let checkResult: { passed: boolean; evidence?: string };
    
    switch (check.type) {
      case "file":
        checkResult = await verifyFileExists(ctx, check.value, callbacks);
        break;
      case "sections":
        checkResult = await verifySectionsExist(ctx, check.value, callbacks);
        break;
      case "content":
        checkResult = await verifyContentMatches(ctx, check.value, callbacks);
        break;
      case "ai":
        checkResult = await verifyAICheck(ctx, check.value, callbacks);
        break;
      default:
        checkResult = { passed: false, evidence: `Unknown check type: ${check.type}` };
    }
    
    results.push({
      criterion: check.original,
      passed: checkResult.passed,
      evidence: checkResult.evidence,
    });
    
    if (!checkResult.passed) {
      allPassed = false;
      callbacks?.onLog("warn", `Criterion failed: "${criterion}" - ${checkResult.evidence}`, "verification");
    } else {
      callbacks?.onLog("info", `Criterion passed: "${criterion}"`, "verification");
    }
  }
  
  callbacks?.onLog(
    allPassed ? "info" : "warn",
    `Verification ${allPassed ? "PASSED" : "FAILED"}: ${results.filter(r => r.passed).length}/${results.length} criteria met`,
    "verification"
  );
  
  return {
    passed: allPassed,
    criteriaResults: results,
  };
}

// ============================================
// HELPER: Create verification context from stage context
// ============================================

export function createVerificationContext(
  stageContext: {
    run: typeof stageRuns.$inferSelect;
    project: typeof projects.$inferSelect;
    documents: Array<typeof documents.$inferSelect>;
  },
  task: RecipeStep,
  additionalContext?: {
    personas?: string;
    guardrails?: string;
    companyContext?: string;
  }
): VerificationContext {
  return {
    run: stageContext.run,
    project: stageContext.project,
    documents: stageContext.documents,
    task,
    workspaceId: stageContext.run.workspaceId,
    ...additionalContext,
  };
}
