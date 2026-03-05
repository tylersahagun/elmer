# Prototype Specification: hubspot-agent-config-ui

Generated: 2026-01-09 01:07
Based on: Jury Evaluation (50.6% combined pass rate)

---

## Prototype Goals

Address the top friction points identified by the jury to improve adoption across all user segments.

## Critical UI/UX Requirements

### Addressing: "Rollback if something breaks"

**Component: Undo/Rollback System**

```
┌─────────────────────────────────────────────────────┐
│  ✓ Synced 5 fields to HubSpot                       │
│                                                     │
│  [View Changes]  [Undo All]  [Dismiss]              │
│                                                     │
│  Undo available for 30 days                         │
└─────────────────────────────────────────────────────┘
```

- Toast notification after every action
- Prominent "Undo" button (not buried in menu)
- Time-limited undo window clearly displayed
- Activity history with per-item undo option

### Addressing: "Integration with existing tools"

**Component: Integration Status Dashboard**

```
┌─────────────────────────────────────────────────────┐
│  Connected Integrations                             │
├─────────────────────────────────────────────────────┤
│  🟢 HubSpot     Last sync: 2 min ago    [Settings]  │
│  🟡 Salesforce  Syncing...              [View]      │
│  ⚪ Slack       Not connected           [Connect]   │
└─────────────────────────────────────────────────────┘
```

- Real-time status indicators
- Clear connection state (connected/syncing/error/not connected)
- Easy access to integration settings
- Error details when sync fails

### Addressing: "Compliance/security concerns"

**Component: Privacy & Compliance Controls**

```
┌─────────────────────────────────────────────────────┐
│  🔒 Privacy Settings                                │
├─────────────────────────────────────────────────────┤
│  ☑️ Record external meetings                        │
│  ☐ Record internal meetings                         │
│  ☐ Transcribe audio (stores transcript)            │
│                                                     │
│  Data Retention: [30 days ▼]                        │
│                                                     │
│  Compliance: SOC2 Type II certified                 │
│  [View Security Documentation]                      │
└─────────────────────────────────────────────────────┘
```

- Granular control over what's captured
- Clear indication of what's stored vs processed
- Easy access to compliance documentation
- Admin-level controls for organization

## Skeptic-Friendly Design Patterns

Based on 18% pass rate among skeptics, implement these patterns:

### 1. Transparency First
- Show exactly what AI will do before it does it
- Explain reasoning in plain language
- Never auto-execute without preview

### 2. Easy Exit Ramps
- Pause/resume at any time
- Disable individual features without affecting others
- "Turn off AI" panic button always visible

### 3. Proof Before Trust
- Show success metrics from similar users
- Provide trial period with full features
- Display error rates and accuracy statistics

### 4. Human Override
- Manual approval option for all actions
- Batch review before sync
- Clear "I'll do this myself" alternatives

## Storybook Stories to Create

```typescript
// Stories to implement in elephant-ai/web/src/components/prototypes/

export default {
  title: 'Prototypes/JuryFeedback',
};

// Core stories addressing friction
export const UndoRollbackToast = () => <UndoToast />;
export const IntegrationStatusDashboard = () => <IntegrationStatus />;
export const ConfigurationWizard = () => <ConfigWizard />;
export const PreviewTestMode = () => <PreviewMode />;
export const PrivacyControls = () => <PrivacySettings />;

// Skeptic-specific stories
export const TransparencyPreview = () => <ActionPreview />;
export const PauseResumeControls = () => <PauseResume />;
export const ManualApprovalFlow = () => <ManualApproval />;
```

## Validation Plan

After building prototypes:
1. Run visual jury evaluation with prototype screenshots
2. Target: >50% pass rate among skeptics (up from 18%)
3. Target: >75% overall combined pass rate
4. If not met, iterate on specific components

