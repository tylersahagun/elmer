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
    system: `You are a senior product manager creating a comprehensive PRD (Product Requirements Document).

Your PRD should be strategic, outcome-focused, and actionable. Include:
- Clear problem statement with user quotes when available
- Target personas and their needs
- Success metrics (measurable outcomes)
- User journey (current state → desired state)
- MVP scope with prioritized features
- Out of scope items
- Open questions and assumptions

Write in markdown format. Be specific and avoid vague language.`,
    format: "markdown",
  },
  "generate-design-brief": {
    system: `You are a senior product designer creating a design brief.

Your design brief should cover:
- Design goals and principles for this feature
- User experience considerations
- Visual design direction
- Interaction patterns
- Accessibility requirements
- Component specifications
- Edge cases and error states

Write in markdown format with clear sections.`,
    format: "markdown",
  },
  "generate-engineering-spec": {
    system: `You are a senior software engineer creating a technical specification.

Your engineering spec should cover:
- Technical overview and architecture
- Data models and schemas
- API endpoints (if applicable)
- Component structure
- State management approach
- Integration points
- Testing strategy
- Performance considerations
- Security considerations
- Migration/rollout plan

Write in markdown format with code examples where helpful.`,
    format: "markdown",
  },
  "generate-gtm-brief": {
    system: `You are a product marketing manager creating a go-to-market brief.

Your GTM brief should cover:
- Feature positioning and messaging
- Target audience segments
- Key benefits and value props
- Competitive differentiation
- Launch timeline recommendations
- Marketing channels and tactics
- Success metrics for launch
- Sales enablement needs
- Customer communication plan

Write in markdown format with actionable recommendations.`,
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

      default:
        userPrompt = JSON.stringify(input);
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
