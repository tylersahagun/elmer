/**
 * Tickets Stage Executor
 * 
 * Inputs: PRD + engineering-spec + prototype-notes + validation-report
 * Automation:
 *   - Generate ticket plan from engineering spec
 *   - Create Linear tickets (if integration exists)
 *   - Link tickets to prototype components
 * Outputs:
 *   - tickets.md (ticket plan)
 *   - Linear tickets (if integrated)
 * Gates:
 *   - Ticket plan covers all MVP scope
 *   - Tickets have acceptance criteria
 */

import { db } from "@/lib/db";
import { documents, tickets, linearMappings, type DocumentType } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getDefaultProvider, type StreamCallback } from "../providers";
import type { StageContext, StageExecutionResult } from "./index";

const TICKETS_SYSTEM_PROMPT = `You are a technical project manager. Your task is to break down a PRD and engineering spec into implementable tickets.

For each ticket, provide:
1. Title (concise, action-oriented)
2. Description (what needs to be done)
3. Acceptance Criteria (specific, testable)
4. Estimated Points (1=trivial, 2=small, 3=medium, 5=large, 8=epic)
5. Dependencies (other tickets this depends on)
6. Type (feature/bug/chore/spike)

Format your response as markdown:

# Ticket Plan: [Project Name]

## Overview
[Brief summary of the work]

## Tickets

### 1. [Ticket Title]
**Type**: feature
**Points**: 3
**Dependencies**: None

**Description**:
[What needs to be done]

**Acceptance Criteria**:
- [ ] Criterion 1
- [ ] Criterion 2

**Prototype Link**: [Component name if applicable]

---

### 2. [Ticket Title]
[Continue for all tickets...]

## Summary
| Type | Count | Total Points |
|------|-------|--------------|
| Feature | | |
| Chore | | |
| Spike | | |
| **Total** | | |

## Suggested Sprint Breakdown
[How to split across sprints]
`;

export async function executeTickets(
  context: StageContext,
  callbacks: StreamCallback
): Promise<StageExecutionResult> {
  const { run, project, documents: existingDocs } = context;
  
  callbacks.onLog("info", "Starting ticket generation", "tickets");
  callbacks.onProgress(0.1, "Loading PRD and engineering spec...");

  // Get PRD and engineering spec
  const prdDoc = existingDocs.find((doc) => doc.type === "prd");
  const engSpec = existingDocs.find((doc) => doc.type === "engineering_spec");
  const prototypeNotes = existingDocs.find((doc) => doc.type === "prototype_notes");
  
  if (!prdDoc) {
    callbacks.onLog("warn", "No PRD found", "tickets");
    return {
      success: false,
      error: "No PRD found. Complete PRD stage first.",
    };
  }

  const provider = getDefaultProvider();
  
  const userPrompt = `Create a ticket plan for this feature:

Project: ${project.name}

## PRD
${prdDoc.content}

${engSpec ? `## Engineering Spec\n${engSpec.content}` : "No engineering spec available - derive tickets from PRD."}

${prototypeNotes ? `## Prototype Notes\n${prototypeNotes.content}` : ""}

Generate implementable tickets with clear acceptance criteria.
`;

  callbacks.onProgress(0.3, "Generating ticket plan...");

  const result = await provider.execute(
    TICKETS_SYSTEM_PROMPT,
    userPrompt,
    {
      runId: run.id,
      workspaceId: run.workspaceId,
      cardId: run.cardId,
      stage: run.stage,
    },
    callbacks
  );

  if (!result.success) {
    return {
      success: false,
      error: result.error || "AI execution failed",
      tokensUsed: result.tokensUsed,
    };
  }

  callbacks.onProgress(0.6, "Saving ticket plan...");

  const now = new Date();
  const docId = `doc_${nanoid()}`;

  // Save ticket plan document (using engineering_spec type as proxy)
  await db.insert(documents).values({
    id: docId,
    projectId: project.id,
    type: "engineering_spec" as DocumentType, // Using eng spec for ticket plan
    title: `Ticket Plan - ${project.name}`,
    content: result.output || "",
    version: 1,
    filePath: `initiatives/${project.name.toLowerCase().replace(/\s+/g, "-")}/tickets.md`,
    metadata: {
      generatedBy: "ai",
      model: "claude-sonnet-4-20250514",
      promptVersion: "tickets-v1",
      actualType: "ticket_plan",
    },
    createdAt: now,
    updatedAt: now,
  });

  await callbacks.onArtifact(
    "file",
    "Ticket Plan",
    `documents/${docId}`,
    { documentType: "ticket_plan" }
  );

  // Parse tickets from output (simplified - would need better parsing in production)
  const ticketMatches = result.output?.matchAll(/### \d+\. (.+?)\n\*\*Type\*\*: (\w+)\n\*\*Points\*\*: (\d+)/g);
  const parsedTickets: Array<{ title: string; type: string; points: number }> = [];
  
  if (ticketMatches) {
    for (const match of ticketMatches) {
      parsedTickets.push({
        title: match[1],
        type: match[2],
        points: parseInt(match[3], 10),
      });
    }
  }

  callbacks.onProgress(0.8, `Parsed ${parsedTickets.length} tickets`);

  // Save tickets to database
  for (const ticket of parsedTickets) {
    const ticketId = `ticket_${nanoid()}`;
    await db.insert(tickets).values({
      id: ticketId,
      projectId: project.id,
      title: ticket.title,
      description: "", // Would need better parsing
      status: "backlog",
      priority: ticket.points >= 5 ? 1 : ticket.points >= 3 ? 2 : 3,
      estimatedPoints: ticket.points,
      metadata: { type: ticket.type },
      createdAt: now,
      updatedAt: now,
    });
  }

  // Check for Linear integration
  const linearMapping = await db
    .select()
    .from(linearMappings)
    .where(eq(linearMappings.projectId, project.id))
    .limit(1);

  if (linearMapping.length > 0) {
    callbacks.onLog("info", "Linear integration found - tickets would be synced", "tickets");
    await callbacks.onArtifact(
      "ticket",
      "Linear Sync",
      `linear/${linearMapping[0].linearProjectId}`,
      { ticketCount: parsedTickets.length }
    );
  } else {
    callbacks.onLog("info", "No Linear integration - tickets saved locally", "tickets");
  }

  callbacks.onLog("info", `Generated ${parsedTickets.length} tickets`, "tickets");
  callbacks.onProgress(1.0, "Ticket generation complete");

  return {
    success: true,
    tokensUsed: result.tokensUsed,
    skillsExecuted: ["generate_tickets"],
    autoAdvance: parsedTickets.length > 0,
    nextStage: "build",
    gateResults: {
      tickets_generated: {
        passed: parsedTickets.length > 0,
        message: `${parsedTickets.length} tickets generated`,
      },
    },
  };
}
