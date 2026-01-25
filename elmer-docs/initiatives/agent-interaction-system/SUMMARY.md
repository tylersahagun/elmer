# Agent Interaction System - Summary

## Quick Reference

### Interaction Types

| Type | Blocks Execution | Timeout | Primary UI | Use Case |
|------|-----------------|---------|------------|----------|
| **Blocking Question** | ✅ Yes | 30 min | Modal → Inbox | Need answer to proceed |
| **Non-Blocking Question** | ❌ No | None | Inbox | Preference/optional input |
| **Approval Request** | ✅ Yes | 15 min | Modal → Inbox | Permission before action |
| **Error Recovery** | ✅ Yes | 10 min | Modal → Inbox | Handle errors gracefully |
| **Progress Update** | ❌ No | N/A | Logs | Status updates |

### Architecture Decision: Hybrid Approach

**Real-time (if page open)**:
- Modal dialog for blocking questions/approvals
- Toast notification for non-blocking

**Persistent (always available)**:
- Notification inbox
- Question queue page

**External (async/mobile)**:
- Browser notifications
- Email (future)
- Slack (future)

### Key Components

1. **Database**: `agent_questions` table
2. **Agent Tool**: `ask_question` tool
3. **UI Components**: QuestionModal, QuestionInbox
4. **APIs**: CRUD endpoints for questions
5. **SSE Events**: `question_asked`, `question_answered`

### Implementation Timeline

- **Week 1**: Core infrastructure + Backend APIs
- **Week 2**: Frontend components
- **Week 3**: Enhanced UX
- **Week 4**: External integrations

### Key Files

- **Design Doc**: `design.md` (this folder)
- **Database Schema**: `orchestrator/src/lib/db/schema.ts`
- **Agent Tools**: `orchestrator/src/lib/agent/tools.ts`
- **Agent Executor**: `orchestrator/src/lib/agent/executor.ts`
- **UI Components**: `orchestrator/src/components/jobs/`
