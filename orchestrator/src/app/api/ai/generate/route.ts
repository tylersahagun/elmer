/**
 * AI Generation API - Wraps Claude API for document generation
 * 
 * This endpoint is called by the job executor to generate content.
 * In production, you might want to replace this with MCP server calls.
 */

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

// Tool-specific prompts
const TOOL_PROMPTS: Record<string, { system: string; format: string }> = {
  "generate-prd": {
    system: `You are a senior product manager creating a PRD (Product Requirements Document) for a specific company/product.

## Critical Instructions

1. **USE THE COMPANY CONTEXT PROVIDED** - The PRD must be specific to the company's product, personas, and strategic direction. Never generate a generic PRD.
2. **FOLLOW THE OUTCOME CHAIN** - Every feature must connect: [Feature] enables [action] → so that [benefit] → so that [behavior change] → so that [business outcome]
3. **INCLUDE ANTI-VISION CHECK** - Reference what the company is NOT building and why.

## Required PRD Structure

# [Project Name] PRD

## Overview
- **Owner:** [Identify from context or mark TBD]
- **Target Release:** [Quarter/Date or TBD]
- **Status:** Draft
- **Strategic Pillar:** [From company context]

## Outcome Chain
[Feature] enables [action]
  → so that [benefit]
    → so that [behavior change]
      → so that [business outcome]

## Problem Statement
What problem? Who has it? Why now? What evidence?
Include user quotes from research when available.

### Evidence
- User quotes/feedback
- Churn/support data (if mentioned)
- Competitive pressure (if relevant)

## Goals & Non-Goals

### Goals (Measurable)
- Goal with success metric and target

### Non-Goals
- Explicit exclusion with reasoning
- Reference anti-vision if applicable

## User Personas
### Primary: [Name from company context]
- **Job-to-be-done:** 
- **Current pain:** 
- **Success looks like:** 
- **Trust factors:** What builds/breaks trust for this persona?

## User Stories
- As a [persona], I want [action] so that [benefit]

## Requirements

### Must Have (MVP)
- Requirement with acceptance criteria

### Should Have
### Could Have

## User Flows
### Flow: [Name]
**Trigger:** 
**Steps:** 1 → 2 → 3
**Outcome:** 
**Error states:** What happens when it fails?

## Success Metrics
- **North star:** 
- **Leading indicators:** 
- **Guardrails (what we don't want to break):**

## Open Questions
1. [Questions that need answers before building]

---
Write in markdown format. Be specific to the company context provided. If no research is available, clearly mark assumptions.`,
    format: "markdown",
  },
  "generate-design-brief": {
    system: `You are a senior product designer creating a design brief.

Your design brief MUST include these exact sections as markdown headings:

## Design Goals
What are we trying to achieve with this design? Design principles and success criteria.

## User Experience
How should users feel when using this? Key UX considerations and flows.

## Visual Design
Direction for visual elements - colors, typography, layout, spacing.

## Accessibility
WCAG compliance requirements and considerations for users with disabilities.

## Interaction Patterns
How users interact with the feature - clicks, hovers, gestures, keyboard navigation.

## Component Specifications
Key UI components needed - buttons, forms, cards, modals, etc.

## Edge Cases
Error states, empty states, loading states, and boundary conditions.

Write in markdown format. You MUST use the exact section headings above (Design Goals, User Experience, Visual Design, Accessibility).`,
    format: "markdown",
  },
  "generate-engineering-spec": {
    system: `You are a senior software engineer creating a technical specification.

Your engineering spec MUST include these exact sections as markdown headings:

## Technical Overview
High-level architecture, approach, and key technical decisions.

## Data Models
Database schemas, TypeScript types, and data structures.

## API
Endpoints, request/response formats, and integration points.

## Testing Strategy
Unit tests, integration tests, E2E tests, and test coverage approach.

## Performance Considerations
Optimization strategies, caching, lazy loading, and benchmarks.

## Security Considerations
Authentication, authorization, data protection, and input validation.

## Migration Plan
How to roll this out safely - feature flags, rollback strategy, phased rollout.

Write in markdown format with code examples where helpful. You MUST use the exact section headings above (Technical Overview, Data Models, API, Testing Strategy).`,
    format: "markdown",
  },
  "generate-gtm-brief": {
    system: `You are a product marketing manager creating a go-to-market brief.

Your GTM brief MUST include these exact sections as markdown headings:

## Positioning
How we position this feature - key messages, value proposition, differentiation.

## Target Audience
Who we're marketing to - segments, personas, use cases.

## Launch Timeline
Recommended launch phases - beta, soft launch, GA, and key milestones.

## Success Metrics
Marketing KPIs and how we'll measure launch success.

## Key Benefits
Core value propositions and user benefits.

## Marketing Channels
Channels and tactics for promotion.

## Sales Enablement
What sales team needs to know and sell this feature.

## Customer Communication
How we'll communicate to existing customers.

Write in markdown format with actionable recommendations. You MUST use the exact section headings above (Positioning, Target Audience, Launch Timeline, Success Metrics).`,
    format: "markdown",
  },
  "analyze-transcript": {
    system: `You are a user research analyst extracting insights from transcripts.

Analyze the transcript and extract:
- Key themes and patterns
- User problems mentioned (with verbatim quotes)
- Feature requests and suggestions
- Pain points and frustrations
- Positive feedback
- Questions that came up
- Action items

Return as JSON with these fields:
{
  "summary": "brief summary",
  "keyInsights": ["insight1", "insight2"],
  "userProblems": [{"problem": "...", "quote": "...", "severity": "high|medium|low"}],
  "featureRequests": [{"request": "...", "frequency": "mentioned N times"}],
  "painPoints": ["..."],
  "positives": ["..."],
  "actionItems": ["..."]
}`,
    format: "json",
  },
  "run-jury-evaluation": {
    system: `You are running a synthetic jury evaluation with diverse personas.

Evaluate the content from multiple perspectives (PM, Engineer, Designer, End User, Executive).
For each persona, consider their priorities, pain points, and expertise.

Return results as JSON:
{
  "approvalRate": 0.0-1.0,
  "conditionalRate": 0.0-1.0,
  "rejectionRate": 0.0-1.0,
  "verdict": "pass|conditional|fail",
  "topConcerns": ["concern1", "concern2", "concern3"],
  "topSuggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "evaluations": [
    {
      "persona": "Sarah Chen - Senior PM",
      "vote": "approve|conditional|reject",
      "reasoning": "...",
      "concerns": ["..."],
      "suggestions": ["..."]
    }
  ]
}`,
    format: "json",
  },
  "generate-tickets": {
    system: `You are a senior engineering manager breaking down a feature into implementable tickets.

Create bite-sized tickets that:
- Are independently deployable when possible
- Have clear acceptance criteria
- Include appropriate labels
- Have realistic point estimates (1, 2, 3, 5, 8)
- Identify dependencies between tickets
- Link to relevant prototype components when provided

Return tickets as a JSON array:
[
  {
    "title": "string",
    "description": "string",
    "type": "feature|task|bug|chore",
    "priority": "urgent|high|medium|low",
    "estimatedPoints": number,
    "labels": ["string"],
    "dependencies": ["ticket title references"],
    "acceptanceCriteria": ["string"]
  }
]`,
    format: "json",
  },
  "validate-tickets": {
    system: `You are a QA lead validating that a set of tickets will fully implement a feature.

Analyze:
1. Coverage: Do the tickets cover all PRD requirements?
2. Completeness: Are there missing tickets?
3. Redundancy: Are there duplicate or overlapping tickets?
4. Dependencies: Are dependencies correctly identified?
5. Feasibility: Will completing these tickets achieve the prototype outcome?

Return validation as JSON:
{
  "isValid": boolean,
  "coverage": 0.0-1.0,
  "missingTickets": ["description of missing work"],
  "redundantTickets": ["ticket titles that overlap"],
  "suggestions": ["improvement suggestions"],
  "dependencyIssues": ["dependency problems found"]
}`,
    format: "json",
  },
  "score-stage-alignment": {
    system: `You are a senior product reviewer scoring alignment to vision and guardrails.

Evaluate the document and context. Return JSON:
{
  "score": 0.0-1.0,
  "summary": "1-2 sentence assessment",
  "strengths": ["..."],
  "gaps": ["..."],
  "recommendations": ["..."]
}`,
    format: "json",
  },
};

export async function POST(request: NextRequest) {
  try {
    const { tool, input } = await request.json();

    if (!tool || !input) {
      return NextResponse.json(
        { error: "tool and input are required" },
        { status: 400 }
      );
    }

    const toolConfig = TOOL_PROMPTS[tool];
    if (!toolConfig) {
      return NextResponse.json(
        { error: `Unknown tool: ${tool}` },
        { status: 400 }
      );
    }

    // Build user prompt from input
    let userPrompt = "";
    
    switch (tool) {
      case "generate-prd":
        userPrompt = `Create a PRD for: ${input.projectName}

${input.research ? `## Research Context\n${input.research}\n` : ""}
${input.transcript ? `## Transcript/Notes\n${input.transcript}\n` : ""}
${input.companyContext ? `## Company Context\n${input.companyContext}\n` : ""}
${input.personas?.length ? `## Target Personas\n${input.personas.join(", ")}\n` : ""}

Generate a comprehensive PRD in markdown format.`;
        break;

      case "generate-design-brief":
        userPrompt = `Create a design brief based on this PRD:

${input.prd}

${input.designLanguage ? `## Design Language\n${input.designLanguage}\n` : ""}
${input.existingPatterns?.length ? `## Existing Patterns to Consider\n${input.existingPatterns.join("\n")}\n` : ""}

Generate a comprehensive design brief in markdown format.`;
        break;

      case "generate-engineering-spec":
        userPrompt = `Create an engineering specification based on:

## PRD
${input.prd}

${input.designBrief ? `## Design Brief\n${input.designBrief}\n` : ""}
${input.techStack ? `## Tech Stack\n${input.techStack}\n` : ""}

Generate a comprehensive engineering specification in markdown format.`;
        break;

      case "generate-gtm-brief":
        userPrompt = `Create a go-to-market brief based on:

## PRD
${input.prd}

${input.targetPersonas?.length ? `## Target Personas\n${input.targetPersonas.join("\n")}\n` : ""}
${input.marketingGuidelines ? `## Marketing Guidelines\n${input.marketingGuidelines}\n` : ""}

Generate a comprehensive GTM brief in markdown format.`;
        break;

      case "analyze-transcript":
        userPrompt = `Analyze this transcript:

${input.transcript}

${input.context ? `## Additional Context\n${input.context}\n` : ""}

Return insights as JSON.`;
        break;

      case "run-jury-evaluation":
        userPrompt = `Evaluate this ${input.phase} with a jury of ${input.jurySize || 12} personas:

${input.content}

Return evaluation results as JSON.`;
        break;

      case "generate-tickets":
        userPrompt = `Break down this engineering spec into tickets:

${input.engineeringSpec}

${input.prototypeComponents?.length ? `## Prototype Components\n${input.prototypeComponents.join("\n")}\n` : ""}

Maximum tickets: ${input.maxTickets || 20}

Return ONLY valid JSON array.`;
        break;

      case "validate-tickets":
        userPrompt = `Validate these tickets against the PRD:

## PRD
${input.prd}

${input.prototypeDescription ? `## Prototype Description\n${input.prototypeDescription}\n` : ""}

## Tickets
${JSON.stringify(input.tickets, null, 2)}

Return ONLY valid JSON.`;
        break;

      case "score-stage-alignment":
        userPrompt = `Score alignment for this stage:

## Stage
${input.stage}

## Document
${input.document}

## Company Context
${input.companyContext || ""}

## Guardrails
${input.guardrails || ""}

Return ONLY valid JSON.`;
        break;

      default:
        userPrompt = JSON.stringify(input);
    }

    const validationHint =
      typeof (input as { validationHint?: unknown }).validationHint === "string"
        ? String((input as { validationHint?: unknown }).validationHint)
        : "";
    if (validationHint) {
      userPrompt += `\n\n## Validation Issues\n${validationHint}\n\nReturn corrected output only.`;
    }

    // Call Claude
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: toolConfig.system,
      messages: [{ role: "user", content: userPrompt }],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      return NextResponse.json(
        { error: "Unexpected response type from AI" },
        { status: 500 }
      );
    }

    return NextResponse.json({ content: content.text });
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI generation failed" },
      { status: 500 }
    );
  }
}
