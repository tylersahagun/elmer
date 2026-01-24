/**
 * AI Signal Extraction Module
 *
 * Extracts structured data (severity, frequency, userSegment, interpretation)
 * from verbatim user feedback using Claude.
 *
 * Uses same Anthropic SDK pattern as /api/ai/generate/route.ts
 */

import Anthropic from "@anthropic-ai/sdk";
import type { SignalSeverity, SignalFrequency } from "@/lib/db/schema";

export interface ExtractionResult {
  severity: SignalSeverity | null;
  frequency: SignalFrequency | null;
  userSegment: string | null;
  interpretation: string | null;
}

const EXTRACTION_SYSTEM_PROMPT = `You are an AI that extracts structured metadata from user feedback/verbatim quotes.

Analyze the provided text and return ONLY valid JSON with these four fields:

1. severity: One of "critical", "high", "medium", "low", or null if unclear
   - critical: User cannot do their job, data loss, security issue, blocking revenue
   - high: Significant productivity impact, workaround is painful
   - medium: Friction or annoyance, workaround exists
   - low: Minor inconvenience, nice-to-have improvement

2. frequency: One of "common", "occasional", "rare", or null if unclear
   - common: Happens daily, affects most users, "always", "every time"
   - occasional: Happens sometimes, affects some users, "sometimes", "often"
   - rare: Edge case, affects few users, "once", "rarely", "just happened"

3. userSegment: String describing user type, or null if unclear
   - Look for: company size (enterprise, SMB, startup), role (developer, PM, designer),
     plan tier (free, pro, enterprise), industry, or other identifying context
   - Examples: "enterprise", "SMB", "prosumer", "developer", "small team"

4. interpretation: A 1-2 sentence PM interpretation of what the feedback really means
   - Translate user words into product insight
   - Focus on the underlying need/pain, not the surface request
   - Null only if the text is completely unclear

Return ONLY the JSON object, no markdown, no explanation.

Example response:
{"severity":"high","frequency":"common","userSegment":"enterprise","interpretation":"Users need bulk operations to manage large accounts efficiently."}`;

/**
 * Extract structured signal fields from verbatim user feedback text.
 *
 * @param verbatim - The raw user feedback/quote to analyze
 * @returns ExtractionResult with severity, frequency, userSegment, and interpretation
 *          Returns all nulls if extraction fails or text is too short
 */
export async function extractSignalFields(
  verbatim: string
): Promise<ExtractionResult> {
  // Handle empty or very short input
  if (!verbatim || verbatim.trim().length < 10) {
    return {
      severity: null,
      frequency: null,
      userSegment: null,
      interpretation: null,
    };
  }

  try {
    const anthropic = new Anthropic();

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system: EXTRACTION_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Extract metadata from this user feedback:\n\n${verbatim}`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      console.error("Unexpected response type from extraction:", content.type);
      return nullResult();
    }

    // Parse the JSON response
    const parsed = JSON.parse(content.text) as {
      severity?: string;
      frequency?: string;
      userSegment?: string;
      interpretation?: string;
    };

    // Validate and return
    return {
      severity: validateSeverity(parsed.severity),
      frequency: validateFrequency(parsed.frequency),
      userSegment: parsed.userSegment || null,
      interpretation: parsed.interpretation || null,
    };
  } catch (error) {
    // Never throw in after() context - log errors per v1.1 (13-02) decision
    console.error("Signal extraction failed:", error);
    return nullResult();
  }
}

function nullResult(): ExtractionResult {
  return {
    severity: null,
    frequency: null,
    userSegment: null,
    interpretation: null,
  };
}

function validateSeverity(value: string | undefined): SignalSeverity | null {
  const valid: SignalSeverity[] = ["critical", "high", "medium", "low"];
  if (value && valid.includes(value as SignalSeverity)) {
    return value as SignalSeverity;
  }
  return null;
}

function validateFrequency(value: string | undefined): SignalFrequency | null {
  const valid: SignalFrequency[] = ["common", "occasional", "rare"];
  if (value && valid.includes(value as SignalFrequency)) {
    return value as SignalFrequency;
  }
  return null;
}
