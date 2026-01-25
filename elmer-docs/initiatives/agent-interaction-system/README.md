# Agent Interaction System

Design and implementation for handling interactive communication between job runners and users when agents need clarification, approval, or input.

## Documents

- **[design.md](./design.md)** - Complete architecture design with evaluation of options
- **[IMPLEMENTATION.md](./IMPLEMENTATION.md)** - Step-by-step implementation guide
- **[SUMMARY.md](./SUMMARY.md)** - Quick reference guide

## Quick Overview

Agents can pause execution to ask users questions through multiple channels:

1. **Blocking Questions** - Must answer before continuing (30 min timeout)
2. **Non-Blocking Questions** - Can continue with default (no timeout)
3. **Approval Requests** - Need permission before action (15 min timeout)
4. **Error Recovery** - Handle errors gracefully (10 min timeout)
5. **Progress Updates** - Status updates (already implemented)

## Architecture

**Hybrid Approach**:
- Real-time: Modal dialog (if page open)
- Persistent: Notification inbox
- External: Browser notifications, email (future)

## Status

🚧 **Design Phase** - Architecture designed, ready for implementation

## Related Files

- Database Schema: `orchestrator/src/lib/db/schema.ts`
- Agent Tools: `orchestrator/src/lib/agent/tools.ts`
- Agent Executor: `orchestrator/src/lib/agent/executor.ts`
- Notification System: `orchestrator/src/components/inbox/NotificationInbox.tsx`
