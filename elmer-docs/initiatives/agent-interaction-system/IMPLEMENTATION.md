# Agent Interaction System - Implementation Guide

## Quick Start

This guide provides step-by-step implementation instructions for the Agent Interaction System.

## Phase 1: Database Schema

### Step 1.1: Create Migration

Create migration file: `orchestrator/drizzle/[NEXT]_agent_questions.sql`

```sql
CREATE TABLE agent_questions (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  
  type TEXT NOT NULL CHECK (type IN ('blocking', 'non_blocking', 'approval', 'error_recovery')),
  question TEXT NOT NULL,
  context JSONB,
  
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'timeout', 'cancelled')),
  response_type TEXT CHECK (response_type IN ('text', 'choice', 'boolean', 'approval')),
  options JSONB,
  
  response JSONB,
  responded_by TEXT REFERENCES users(id),
  responded_at TIMESTAMP,
  
  timeout_at TIMESTAMP NOT NULL,
  default_response JSONB,
  
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_questions_job_id ON agent_questions(job_id);
CREATE INDEX idx_agent_questions_workspace_id ON agent_questions(workspace_id);
CREATE INDEX idx_agent_questions_status ON agent_questions(status);
CREATE INDEX idx_agent_questions_timeout ON agent_questions(timeout_at) WHERE status = 'pending';
```

### Step 1.2: Update Schema Types

Add to `orchestrator/src/lib/db/schema.ts`:

```typescript
export const agentQuestions = pgTable("agent_questions", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  jobId: text("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
  
  type: text("type").$type<QuestionType>().notNull(),
  question: text("question").notNull(),
  context: jsonb("context").$type<QuestionContext>(),
  
  status: text("status").$type<QuestionStatus>().notNull().default("pending"),
  responseType: text("response_type").$type<ResponseType>(),
  options: jsonb("options").$type<QuestionOption[]>(),
  
  response: jsonb("response").$type<QuestionResponse>(),
  respondedBy: text("responded_by").references(() => users.id),
  respondedAt: timestamp("responded_at"),
  
  timeoutAt: timestamp("timeout_at").notNull(),
  defaultResponse: jsonb("default_response").$type<QuestionResponse>(),
  
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").notNull(),
});

export type QuestionType = "blocking" | "non_blocking" | "approval" | "error_recovery";
export type QuestionStatus = "pending" | "answered" | "timeout" | "cancelled";
export type ResponseType = "text" | "choice" | "boolean" | "approval";

export interface QuestionContext {
  jobType?: string;
  projectName?: string;
  currentStep?: string;
  errorDetails?: string;
  suggestedOptions?: string[];
}

export interface QuestionOption {
  id: string;
  label: string;
  value: string | boolean;
  description?: string;
}

export interface QuestionResponse {
  type: ResponseType;
  value: string | boolean | number;
  text?: string;
}
```

### Step 1.3: Update JobStatus Enum

Add to `JobStatus` type in schema:

```typescript
export type JobStatus = 
  | "pending"
  | "running"
  | "waiting_for_input"  // NEW
  | "waiting_for_approval"  // NEW
  | "completed"
  | "failed"
  | "cancelled";
```

## Phase 2: Agent Tool Implementation

### Step 2.1: Add Tool Definition

Add to `orchestrator/src/lib/agent/tools.ts`:

```typescript
{
  name: "ask_question",
  description: "Ask the user a question that may require clarification, approval, or input. Use this when you need information to proceed or want user preference.",
  input_schema: {
    type: "object",
    properties: {
      question: { 
        type: "string", 
        description: "The question to ask the user" 
      },
      type: {
        type: "string",
        enum: ["blocking", "non_blocking", "approval", "error_recovery"],
        description: "Type of question - blocking pauses execution, non_blocking continues with default"
      },
      responseType: {
        type: "string",
        enum: ["text", "choice", "boolean", "approval"],
        description: "Expected response format"
      },
      options: {
        type: "array",
        items: {
          type: "object",
          properties: {
            label: { type: "string" },
            value: { type: "string" },
            description: { type: "string" }
          }
        },
        description: "Options for choice questions"
      },
      context: {
        type: "object",
        description: "Additional context about the question"
      },
      timeoutMinutes: {
        type: "number",
        description: "Timeout in minutes (default: 30 for blocking, 15 for approval, 10 for error)"
      },
      defaultResponse: {
        type: "object",
        description: "Default response if timeout (for non-blocking or error recovery)"
      }
    },
    required: ["question", "type", "responseType"]
  }
}
```

### Step 2.2: Implement Tool Execution

Add to `executeTool` function in `tools.ts`:

```typescript
case "ask_question": {
  const question = input.question as string;
  const questionType = input.type as QuestionType;
  const responseType = input.responseType as ResponseType;
  const options = (input.options as QuestionOption[]) || [];
  const context = input.context as QuestionContext | undefined;
  const timeoutMinutes = (input.timeoutMinutes as number) || 
    (questionType === "blocking" ? 30 : 
     questionType === "approval" ? 15 : 10);
  const defaultResponse = input.defaultResponse as QuestionResponse | undefined;

  // Get job context
  const job = await getJobById(jobId); // Need to pass jobId from executor
  if (!job) {
    return { success: false, error: "Job not found" };
  }

  const timeoutAt = new Date(Date.now() + timeoutMinutes * 60 * 1000);

  // Create question record
  const questionRecord = await createAgentQuestion({
    jobId: job.id,
    workspaceId: job.workspaceId,
    projectId: job.projectId,
    type: questionType,
    question,
    responseType,
    options,
    context,
    timeoutAt,
    defaultResponse,
  });

  // Update job status
  if (questionType === "blocking" || questionType === "approval" || questionType === "error_recovery") {
    await updateJobStatus(
      job.id,
      questionType === "approval" ? "waiting_for_approval" : "waiting_for_input"
    );
  }

  // Create notification
  await createNotification({
    workspaceId: job.workspaceId,
    projectId: job.projectId,
    jobId: job.id,
    type: "action_required",
    priority: questionType === "blocking" ? "high" : "medium",
    title: "Agent Question",
    message: question,
    actionType: "provide_input",
    actionLabel: "Answer Question",
    actionUrl: `/questions/${questionRecord.id}`,
    actionData: { questionId: questionRecord.id },
  });

  // Broadcast SSE event
  broadcastJobUpdate(job.workspaceId, {
    type: "question_asked",
    questionId: questionRecord.id,
    jobId: job.id,
    question: {
      question,
      type: questionType,
      responseType,
      options,
      context,
      timeoutAt: timeoutAt.toISOString(),
    },
  });

  return {
    success: true,
    output: {
      questionId: questionRecord.id,
      timeoutAt: timeoutAt.toISOString(),
      // For blocking questions, return a special marker that executor should wait
      blocking: questionType === "blocking" || questionType === "approval" || questionType === "error_recovery",
    },
  };
}
```

### Step 2.3: Update Executor to Handle Blocking Questions

Modify `AgentExecutor.executeJob` to check for blocking questions:

```typescript
// After tool execution
if (toolResult.success && toolName === "ask_question") {
  const output = toolResult.output as { blocking?: boolean; questionId: string };
  if (output.blocking) {
    // Pause execution - wait for question to be answered
    log("Waiting for user response to question...");
    // Poll for question answer or timeout
    const answered = await waitForQuestionAnswer(output.questionId, job.id);
    if (!answered) {
      return {
        success: false,
        error: "Question timed out without response",
        logs,
        tokensUsed,
        durationMs: Date.now() - startTime,
      };
    }
    // Continue execution
  }
}
```

## Phase 3: API Endpoints

### Step 3.1: Create Question Queries

Add to `orchestrator/src/lib/db/queries.ts`:

```typescript
export async function createAgentQuestion(data: {
  jobId: string;
  workspaceId: string;
  projectId?: string;
  type: QuestionType;
  question: string;
  responseType: ResponseType;
  options?: QuestionOption[];
  context?: QuestionContext;
  timeoutAt: Date;
  defaultResponse?: QuestionResponse;
}) {
  const id = nanoid();
  await db.insert(agentQuestions).values({
    id,
    jobId: data.jobId,
    workspaceId: data.workspaceId,
    projectId: data.projectId,
    type: data.type,
    question: data.question,
    responseType: data.responseType,
    options: data.options,
    context: data.context,
    timeoutAt: data.timeoutAt,
    defaultResponse: data.defaultResponse,
    status: "pending",
    createdAt: new Date(),
  });
  return getAgentQuestion(id);
}

export async function answerAgentQuestion(
  questionId: string,
  response: QuestionResponse,
  userId?: string
) {
  const question = await getAgentQuestion(questionId);
  if (!question || question.status !== "pending") {
    throw new Error("Question not found or already answered");
  }

  await db.update(agentQuestions)
    .set({
      status: "answered",
      response,
      respondedBy: userId,
      respondedAt: new Date(),
    })
    .where(eq(agentQuestions.id, questionId));

  // Resume job if blocking
  if (question.type === "blocking" || question.type === "approval" || question.type === "error_recovery") {
    await resumeJob(question.jobId);
  }

  return getAgentQuestion(questionId);
}
```

### Step 3.2: Create API Routes

Create `orchestrator/src/app/api/questions/[id]/answer/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { answerAgentQuestion } from "@/lib/db/queries";
import { getCurrentUser } from "@/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  const body = await request.json();

  try {
    const question = await answerAgentQuestion(id, body.response, user?.id);
    
    return NextResponse.json({
      success: true,
      question,
      jobResumed: question.type === "blocking" || question.type === "approval",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to answer question" },
      { status: 400 }
    );
  }
}
```

## Phase 4: Frontend Components

### Step 4.1: Question Modal Component

Create `orchestrator/src/components/jobs/QuestionModal.tsx`:

```typescript
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AgentQuestion, QuestionResponse } from "@/lib/db/schema";

interface QuestionModalProps {
  question: AgentQuestion;
  onAnswer: (response: QuestionResponse) => Promise<void>;
  onDismiss?: () => void;
}

export function QuestionModal({ question, onAnswer, onDismiss }: QuestionModalProps) {
  const [response, setResponse] = useState<string | boolean>("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onAnswer({
        type: question.responseType!,
        value: response,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{question.question}</DialogTitle>
        </DialogHeader>
        
        {/* Render input based on responseType */}
        {question.responseType === "text" && (
          <Input
            value={response as string}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Your answer..."
          />
        )}
        
        {question.responseType === "choice" && question.options && (
          <div className="space-y-2">
            {question.options.map((option) => (
              <Button
                key={option.id}
                variant={response === option.value ? "default" : "outline"}
                onClick={() => setResponse(option.value)}
                className="w-full"
              >
                {option.label}
              </Button>
            ))}
          </div>
        )}
        
        {question.responseType === "boolean" && (
          <div className="flex gap-2">
            <Button
              variant={response === true ? "default" : "outline"}
              onClick={() => setResponse(true)}
            >
              Yes
            </Button>
            <Button
              variant={response === false ? "default" : "outline"}
              onClick={() => setResponse(false)}
            >
              No
            </Button>
          </div>
        )}

        <div className="flex justify-end gap-2">
          {onDismiss && (
            <Button variant="outline" onClick={onDismiss}>
              Dismiss
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={!response || submitting}>
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

## Phase 5: Timeout Handler

Create `orchestrator/src/lib/jobs/question-timeout-handler.ts`:

```typescript
import { db } from "@/lib/db";
import { agentQuestions, jobs } from "@/lib/db/schema";
import { eq, and, lt } from "drizzle-orm";
import { answerAgentQuestion, updateJobStatus } from "@/lib/db/queries";

export async function handleQuestionTimeouts() {
  const now = new Date();
  
  const timedOutQuestions = await db.query.agentQuestions.findMany({
    where: and(
      eq(agentQuestions.status, "pending"),
      lt(agentQuestions.timeoutAt, now)
    ),
  });

  for (const question of timedOutQuestions) {
    if (question.type === "blocking") {
      if (question.defaultResponse) {
        await answerAgentQuestion(question.id, question.defaultResponse, undefined);
        await updateJobStatus(question.jobId, "running");
      } else {
        await updateJobStatus(question.jobId, "failed");
        await db.update(agentQuestions)
          .set({ status: "timeout" })
          .where(eq(agentQuestions.id, question.id));
      }
    } else {
      if (question.defaultResponse) {
        await answerAgentQuestion(question.id, question.defaultResponse, undefined);
      } else {
        await db.update(agentQuestions)
          .set({ status: "timeout" })
          .where(eq(agentQuestions.id, question.id));
      }
    }
  }
}

// Run every minute
setInterval(handleQuestionTimeouts, 60 * 1000);
```

## Testing Checklist

- [ ] Database migration runs successfully
- [ ] Agent can call `ask_question` tool
- [ ] Question is created in database
- [ ] Job status updates correctly
- [ ] Notification is created
- [ ] SSE event is broadcast
- [ ] Question modal appears when page is open
- [ ] User can answer question
- [ ] Job resumes after answer
- [ ] Timeout handler works correctly
- [ ] Default responses are used on timeout

## Next Steps

1. Implement Phase 1 (Database)
2. Implement Phase 2 (Agent Tool)
3. Implement Phase 3 (APIs)
4. Implement Phase 4 (Frontend)
5. Implement Phase 5 (Timeout Handler)
6. Test end-to-end
7. Deploy incrementally
