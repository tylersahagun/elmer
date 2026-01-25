# Agent Interaction System Design

## Overview

This document designs how job runners handle interactive communication when agents need clarification, user input, or approval during execution. The system enables agents to pause execution, ask questions, request approvals, and handle errors gracefully.

## Current State

### Existing Infrastructure

- **Job Execution**: `AgentExecutor` runs AI agents with tool use in a loop
- **Real-time Updates**: SSE (Server-Sent Events) streams progress to frontend
- **Progress Events**: `AgentProgressCallback` emits events during execution
- **Notification System**: Database-backed notifications with inbox UI
- **Browser Notifications**: Native browser notification support
- **UI Components**: Dialog, notification inbox, execution panels

### Missing Pieces

- **AskQuestion Tool**: Not yet implemented in agent tools
- **Question State Management**: No database schema for pending questions
- **Blocking Execution**: No mechanism to pause job execution waiting for input
- **Question UI**: No dedicated UI for answering agent questions
- **Timeout Handling**: No strategy for unanswered questions

---

## Interaction Patterns

### 1. Blocking Questions

**Definition**: Agent needs an answer before continuing execution.

**Examples**:
- "Which persona should I target for this PRD?"
- "Should I create tickets in Linear or GitHub?"
- "What's the project deadline?"

**Characteristics**:
- Job status: `waiting_for_input`
- Execution paused until response received
- Timeout required (default: 30 minutes)
- High priority notification

### 2. Non-Blocking Questions

**Definition**: Agent can continue but wants user preference.

**Examples**:
- "Do you want verbose output in the logs?"
- "Should I include design mockups in the PRD?"
- "Prefer TypeScript or JavaScript for prototype?"

**Characteristics**:
- Job continues with default/assumed answer
- User can respond later to influence future behavior
- Low priority notification
- Can be answered via notification action

### 3. Approval Requests

**Definition**: Agent needs permission before taking action.

**Examples**:
- "Create 5 Linear tickets? (Y/N)"
- "Delete 3 duplicate signals? (Y/N)"
- "Merge these two clusters? (Y/N)"

**Characteristics**:
- Job status: `waiting_for_approval`
- Execution paused until approval/rejection
- Binary response (approve/reject)
- Can include preview/details
- Timeout required (default: 15 minutes)

### 4. Progress Updates

**Definition**: Agent sharing status (already implemented).

**Examples**:
- "Analyzed 3/10 documents..."
- "Generated PRD, now creating design brief..."
- "Uploading prototype to Storybook..."

**Characteristics**:
- Non-blocking
- Logged to job logs
- Can trigger browser notification if enabled
- No user response needed

### 5. Error Recovery

**Definition**: Agent encountered issue, needs guidance.

**Examples**:
- "API failed, retry or skip?"
- "File not found, create it or use alternative?"
- "Ambiguous requirement, which interpretation?"

**Characteristics**:
- Job status: `waiting_for_input` or `failed`
- Multiple choice options
- Can include error details
- Timeout required (default: 10 minutes)

---

## Design Options Evaluation

### Option 1: Chat Panel

**Description**: Real-time conversation panel alongside job execution.

**Pros**:
- ✅ Natural conversation flow
- ✅ Context preserved (see full conversation history)
- ✅ Good for complex multi-turn questions
- ✅ Familiar UX (like ChatGPT)

**Cons**:
- ❌ Requires user to be actively watching
- ❌ Not great for async/mobile scenarios
- ❌ More complex UI to build
- ❌ Can be interruptive

**Best For**: Blocking questions, complex clarifications

---

### Option 2: Notifications (Toast/Modal)

**Description**: Toast notifications or modals that pop up for questions.

**Pros**:
- ✅ Non-intrusive (toast) or focused (modal)
- ✅ Works well for quick approvals
- ✅ Can be dismissed and handled later
- ✅ Leverages existing notification system

**Cons**:
- ❌ Easy to miss (toast)
- ❌ Modal can be annoying if frequent
- ❌ Limited space for complex questions
- ❌ Not great for multi-turn conversations

**Best For**: Approval requests, non-blocking questions, error recovery

---

### Option 3: Approval Queue

**Description**: Dedicated page showing all pending approvals/questions.

**Pros**:
- ✅ Centralized view of all pending items
- ✅ Good for batch processing
- ✅ Works well async
- ✅ Can prioritize and filter

**Cons**:
- ❌ Requires user to actively check
- ❌ Not real-time (unless polling)
- ❌ Less immediate for urgent items
- ❌ Additional navigation required

**Best For**: Non-blocking questions, batch approvals, async workflows

---

### Option 4: Email/Slack

**Description**: External notification channels for questions.

**Pros**:
- ✅ Works completely async
- ✅ Mobile-friendly
- ✅ Can integrate with existing workflows
- ✅ Good for urgent blocking questions

**Cons**:
- ❌ Requires external service setup
- ❌ Slower response time
- ❌ Harder to provide rich context
- ❌ Response parsing complexity

**Best For**: Urgent blocking questions, off-hours scenarios, team notifications

---

### Option 5: Hybrid Approach (Recommended)

**Description**: Different channels for different urgency levels and question types.

**Strategy**:

| Question Type | Primary Channel | Fallback Channel | Timeout |
|--------------|----------------|------------------|---------|
| **Blocking Question** | Modal Dialog (if page open) → Notification Inbox | Browser Notification → Email | 30 min |
| **Non-Blocking Question** | Notification Inbox | Browser Notification | No timeout |
| **Approval Request** | Modal Dialog (if page open) → Approval Queue | Browser Notification → Email | 15 min |
| **Error Recovery** | Modal Dialog (if page open) → Notification Inbox | Browser Notification | 10 min |
| **Progress Update** | Job Logs | Browser Notification (if enabled) | N/A |

**Implementation**:
1. **Real-time**: SSE stream detects question → show modal if page active
2. **Persistent**: Save to database → appears in notification inbox
3. **External**: Browser notification → email/Slack if configured
4. **Fallback**: After timeout, use default answer or fail job

---

## Recommended Architecture

### Database Schema

```typescript
// New table: agent_questions
export const agentQuestions = pgTable("agent_questions", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  jobId: text("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
  
  // Question metadata
  type: text("type").$type<QuestionType>().notNull(), // "blocking" | "non_blocking" | "approval" | "error_recovery"
  question: text("question").notNull(),
  context: jsonb("context").$type<QuestionContext>(), // Additional context, options, etc.
  
  // Response handling
  status: text("status").$type<QuestionStatus>().notNull().default("pending"), // "pending" | "answered" | "timeout" | "cancelled"
  responseType: text("response_type").$type<ResponseType>(), // "text" | "choice" | "boolean" | "approval"
  options: jsonb("options").$type<QuestionOption[]>(), // For choice/boolean questions
  
  // Response
  response: jsonb("response").$type<QuestionResponse>(), // User's answer
  respondedBy: text("responded_by").references(() => users.id),
  respondedAt: timestamp("responded_at"),
  
  // Timeout
  timeoutAt: timestamp("timeout_at").notNull(),
  defaultResponse: jsonb("default_response").$type<QuestionResponse>(), // Used if timeout
  
  // Metadata
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
  text?: string; // Optional explanation
}
```

### Agent Tool: AskQuestion

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

### Execution Flow

```
┌─────────────────┐
│ Agent Executing │
└────────┬────────┘
         │
         │ Calls ask_question tool
         ▼
┌─────────────────────────┐
│ Create Question Record  │
│ Status: pending         │
│ Job Status: waiting_*   │
└────────┬────────────────┘
         │
         ├─────────────────────────────────┐
         │                                 │
         ▼                                 ▼
┌──────────────────┐          ┌──────────────────────┐
│ Broadcast via SSE│          │ Create Notification  │
│ (if page open)   │          │ (persistent)          │
└────────┬─────────┘          └──────────┬───────────┘
         │                                │
         ▼                                ▼
┌──────────────────┐          ┌──────────────────────┐
│ Show Modal/Dialog│          │ Browser Notification │
│ (if user active) │          │ (if enabled)          │
└────────┬─────────┘          └──────────────────────┘
         │
         │ User responds
         ▼
┌─────────────────────────┐
│ Update Question Record  │
│ Status: answered        │
│ Store response          │
└────────┬────────────────┘
         │
         │ Resume job execution
         ▼
┌─────────────────────────┐
│ Agent Receives Response │
│ Continues execution     │
└─────────────────────────┘
```

### Timeout Handling

```typescript
// Background job checks for timed-out questions
async function handleQuestionTimeouts() {
  const timedOutQuestions = await db.query.agentQuestions.findMany({
    where: and(
      eq(agentQuestions.status, "pending"),
      lt(agentQuestions.timeoutAt, new Date())
    )
  });

  for (const question of timedOutQuestions) {
    if (question.type === "blocking") {
      // For blocking questions, use default or fail job
      if (question.defaultResponse) {
        await answerQuestion(question.id, question.defaultResponse, "system");
        await resumeJob(question.jobId);
      } else {
        await failJob(question.jobId, "Question timed out without response");
      }
    } else {
      // For non-blocking, use default and continue
      if (question.defaultResponse) {
        await answerQuestion(question.id, question.defaultResponse, "system");
      }
      await updateQuestionStatus(question.id, "timeout");
    }
  }
}
```

---

## UI Components

### 1. Question Modal Component

**Location**: `orchestrator/src/components/jobs/QuestionModal.tsx`

**Features**:
- Shows question with context
- Renders appropriate input (text, choice, boolean)
- Shows job context (project name, current step)
- Displays timeout countdown
- Handles response submission

**Props**:
```typescript
interface QuestionModalProps {
  question: AgentQuestion;
  onAnswer: (response: QuestionResponse) => Promise<void>;
  onDismiss?: () => void; // Only for non-blocking
}
```

### 2. Question Inbox Component

**Location**: `orchestrator/src/components/jobs/QuestionInbox.tsx`

**Features**:
- Lists all pending questions
- Filters by type, project, urgency
- Shows timeout status
- Quick actions (approve/reject for approvals)
- Links to related job/project

### 3. Enhanced Notification Inbox

**Update**: `orchestrator/src/components/inbox/NotificationInbox.tsx`

**Changes**:
- Add question type to notification types
- Show question preview in notification
- Quick answer actions for simple questions
- Link to full question modal for complex ones

### 4. Job Execution Panel Enhancement

**Update**: `orchestrator/src/components/jobs/ExecutionPanel.tsx`

**Changes**:
- Detect `waiting_for_input` status
- Show question modal automatically
- Display question in logs
- Show "Waiting for user response" indicator

---

## API Endpoints

### POST /api/jobs/[id]/questions

Create a question (called by agent tool).

**Request**:
```typescript
{
  question: string;
  type: QuestionType;
  responseType: ResponseType;
  options?: QuestionOption[];
  context?: QuestionContext;
  timeoutMinutes?: number;
  defaultResponse?: QuestionResponse;
}
```

**Response**:
```typescript
{
  questionId: string;
  timeoutAt: string; // ISO timestamp
}
```

### GET /api/jobs/[id]/questions

Get all questions for a job.

**Response**:
```typescript
{
  questions: AgentQuestion[];
}
```

### POST /api/questions/[id]/answer

Answer a question.

**Request**:
```typescript
{
  response: QuestionResponse;
}
```

**Response**:
```typescript
{
  success: boolean;
  jobResumed: boolean; // Whether job execution resumed
}
```

### GET /api/questions/pending

Get all pending questions for workspace.

**Query Params**:
- `workspaceId`: string (required)
- `type?: QuestionType`
- `projectId?: string`

**Response**:
```typescript
{
  questions: AgentQuestion[];
}
```

### POST /api/questions/[id]/cancel

Cancel a question (if job cancelled or question no longer relevant).

---

## SSE Event Types

### New Event: `question_asked`

```typescript
{
  type: "question_asked",
  questionId: string;
  jobId: string;
  question: {
    question: string;
    type: QuestionType;
    responseType: ResponseType;
    options?: QuestionOption[];
    context?: QuestionContext;
    timeoutAt: string;
  };
}
```

### New Event: `question_answered`

```typescript
{
  type: "question_answered",
  questionId: string;
  jobId: string;
  response: QuestionResponse;
}
```

### Updated Event: `status`

Include `waiting_for_input` and `waiting_for_approval` statuses.

---

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1)

1. **Database Schema**
   - Create `agent_questions` table
   - Migration script
   - Type definitions

2. **Agent Tool**
   - Implement `ask_question` tool
   - Add to `AGENT_TOOLS` array
   - Handle tool execution in executor

3. **Job Status Management**
   - Add `waiting_for_input` and `waiting_for_approval` to JobStatus enum
   - Update job status when question created
   - Resume job when question answered

### Phase 2: Backend APIs (Week 1-2)

1. **Question CRUD APIs**
   - Create question endpoint
   - Answer question endpoint
   - Get pending questions endpoint
   - Cancel question endpoint

2. **Timeout Handler**
   - Background job to check timeouts
   - Handle timeout logic
   - Resume/fail jobs appropriately

3. **SSE Integration**
   - Emit `question_asked` events
   - Emit `question_answered` events
   - Update job status events

### Phase 3: Frontend Components (Week 2)

1. **Question Modal**
   - Basic modal component
   - Input rendering (text, choice, boolean)
   - Response submission
   - Timeout countdown

2. **Question Inbox**
   - List view of pending questions
   - Filtering and sorting
   - Quick actions

3. **Integration**
   - Hook into ExecutionPanel
   - Hook into NotificationInbox
   - SSE event handling

### Phase 4: Enhanced UX (Week 3)

1. **Smart Routing**
   - Show modal if page active
   - Fallback to notification
   - Browser notification integration

2. **Rich Context**
   - Show job logs in question context
   - Link to related project
   - Preview of what agent is doing

3. **Error Recovery**
   - Better error question UI
   - Retry/skip options
   - Error details display

### Phase 5: External Integrations (Week 4)

1. **Email Notifications**
   - Send email for blocking questions
   - Include question context
   - Reply-to functionality (future)

2. **Slack Integration** (Optional)
   - Post questions to Slack
   - Interactive buttons for responses
   - Status updates

---

## Multi-User Scenarios

### Who Can Answer?

**Default**: Any workspace member can answer.

**Future Enhancements**:
- Question assignment (assign to specific user)
- Role-based permissions (only admins for approvals)
- First-responder wins (first answer is used)

### Concurrent Questions

**Scenario**: Multiple jobs ask questions simultaneously.

**Solution**:
- Each question is independent
- Questions appear in inbox chronologically
- User can answer in any order
- Jobs resume independently when answered

### Question Conflicts

**Scenario**: User answers question, but job already timed out.

**Solution**:
- Check question status before accepting answer
- If already timed out, show error message
- Option to restart job with new answer

---

## Mobile/Async Scenarios

### Mobile Support

- **Notifications**: Browser notifications work on mobile
- **Email**: Fallback for async access
- **Web UI**: Responsive question inbox
- **Deep Links**: Link from notification to question

### Async Workflow

1. Agent asks question → Creates notification
2. User receives browser notification (if enabled)
3. User clicks notification → Opens question inbox
4. User answers question → Job resumes
5. User receives completion notification

### Offline Handling

- Questions stored in database
- Answers queued if offline
- Sync when connection restored
- Timeout still applies (server-side)

---

## Security Considerations

### Authorization

- Verify user has access to workspace
- Verify user can answer questions for project
- Audit log of all question/answer pairs

### Input Validation

- Validate response type matches question
- Sanitize text inputs
- Validate choice options
- Rate limit question creation

### Timeout Abuse Prevention

- Minimum timeout duration (5 minutes)
- Maximum timeout duration (24 hours)
- Rate limit question creation per job

---

## Metrics & Monitoring

### Key Metrics

- Average time to answer questions
- Timeout rate by question type
- Questions per job
- User response rate

### Alerts

- High timeout rate (>20%)
- Unanswered blocking questions >1 hour
- Question creation errors

---

## Future Enhancements

### 1. Question Templates

Pre-defined questions for common scenarios:
- "Which persona?" → Choice from workspace personas
- "Create tickets?" → Boolean with preview
- "Which integration?" → Choice from configured integrations

### 2. Smart Defaults

AI suggests default answers based on:
- Previous answers
- Workspace settings
- Project context
- User preferences

### 3. Question Threading

Support multi-turn conversations:
- Follow-up questions
- Clarification requests
- Context preservation

### 4. Batch Answers

Answer multiple similar questions at once:
- "Apply this answer to all similar questions?"
- Bulk approve/reject

### 5. Question Analytics

Track:
- Most common questions
- Questions that lead to timeouts
- Questions that improve outcomes

---

## Open Questions

1. **Default Response Strategy**: Should we always require a default, or fail jobs on timeout?
   - **Recommendation**: Require default for non-blocking, optional for blocking (fail if no default)

2. **Question Priority**: Should questions have priority levels?
   - **Recommendation**: Use existing notification priority system

3. **Question History**: Should we show answered questions in job logs?
   - **Recommendation**: Yes, include in job logs for audit trail

4. **Question Editing**: Can users edit answers before job resumes?
   - **Recommendation**: No, but allow cancellation and re-asking

5. **Question Expiration**: Should questions expire if job completes another way?
   - **Recommendation**: Yes, cancel questions if job completes/fails

---

## Conclusion

The **Hybrid Approach** provides the best balance of:
- ✅ Real-time interaction when users are active
- ✅ Async support for mobile/offline scenarios
- ✅ Multiple channels for different urgency levels
- ✅ Leverages existing infrastructure
- ✅ Scalable and maintainable

**Next Steps**:
1. Review and approve this design
2. Create implementation tickets
3. Start with Phase 1 (Core Infrastructure)
4. Iterate based on user feedback
