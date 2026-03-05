# Meeting Summary — Instrumentation Check
*Generated: 2026-03-04*

## TL;DR

One view event exists (`meeting_summary:viewed`) and is firing — but it captures **zero meeting-specific properties** (no `engagement_id`, no `workspace_id`). There is **no generation event** at all, so the denominator for the North Star metric (% of users who view after generation) is completely unmeasured. Current data is 100% internal AskElephant employees behind a beta feature flag. **Baseline cannot be established without 3 instrumentation gaps being closed first.**

---

## Events Found in Codebase

| Event Name | Location | Properties Captured | Status |
|---|---|---|---|
| `meeting_summary:viewed` | `apps/web/src/components/chat/chats-tabs.tsx:271` | ❌ None (no context props) | ✅ Firing |
| _(no event)_ | `apps/functions/src/contexts/media-recording-processing/media-recording-processing.context.ts:662-680` | — | ❌ Generation never tracked |
| _(no event)_ | `apps/web/src/components/engagements/meeting-summary-card.tsx` | — | ❌ No events on render/view duration |
| _(no event)_ | Sharing flow (not yet built) | — | ❌ Not in scope yet |

### Code Details

**`meeting_summary:viewed` — how it fires today:**
```typescript
// chats-tabs.tsx:270-273
const onMeetingSummaryClick = () => {
  track(AnalyticsEvent.MEETING_SUMMARY_VIEWED);   // NO properties
  setSearchParams({ meetingSummary: 'true' });
};
```
- Fires on sidebar button click, not on content render
- No `engagement_id`, `workspace_id`, or any meeting context attached
- Entire feature is gated: `PostHogFeature flag="new-meeting-page"` wraps the component
- Button only shows if `first-class-meeting-summary` flag AND `props.meetingSummary` (summary exists)

**Summary generation pipeline (backend — zero events fired):**
```
media-recording-processing.context.ts:662
  → meetingSummaryAgentNode.execute({ engagementId })
  → upsertEngagementSummaryByEngagementId(workspaceId, engagementId, summaryMarkdown)
  → DB write only — no PostHog event
```
- Summary is **auto-generated** post-recording processing (not user-triggered)
- Generation is done by `MEETING_SUMMARY_AGENT` node
- No event on success, no event on failure, no latency measurement

**Feature flags governing visibility:**
- `first-class-meeting-summary` — gates sidebar button
- `new-meeting-page` — gates the entire `ChatsTabs` component

---

## Events Found in PostHog (Last 30d)

| Event | Count | Unique Users | Notes |
|---|---|---|---|
| `meeting_summary:viewed` | 100+ | 21 | All internal AE users; FF-gated; no context props |
| `meeting_summary:generated` | 0 | 0 | **Does not exist** |
| `meeting_summary:returned` | 0 | 0 | **Does not exist** |
| `$ai_generation_summary` | Active daily | Unknown | PostHog LLM auto-tracing; not meeting-summary specific |
| `$ai_trace_summary` | Active daily | Unknown | PostHog LLM auto-tracing; not meeting-summary specific |

### Who is firing `meeting_summary:viewed` today?

All 21 unique users are **internal AskElephant employees** under the `first-class-meeting-summary` beta flag:

> Adia Toll, Andrew Brown, Ben Harrison, Eli Gómez, Erika Vasquez, Jake Allen, James Hinkson, Jamis Benson, Matt Bennett, McKenzie Sacks, Mike Cook, Nate Williams, Palmer Turley, Parker Alexander, Robert Henderson, Sam Ho, Skylar Sanford, Tyler Sahagun, Tyler Whittaker, Woody Klemetson, Wyatt Cooper

**Zero external customers are tracked.** Feature is pre-GA.

---

## Gaps & Recommendations

### Critical Gaps (block baseline)

- [ ] **`meeting_summary:generated`** — No event when summary is auto-generated after recording processing. Without this, we have no denominator and can't calculate view rate. This is the single biggest gap.
  - Recommended: `meeting_summary:generated` with props: `{ engagement_id, workspace_id, generation_time_ms, summary_length_chars, transcript_length_chars, success: true/false, error_type? }`
  - File: `apps/functions/src/contexts/media-recording-processing/media-recording-processing.context.ts` (around line 679-687)

- [ ] **`meeting_summary:viewed` — add context properties** — Event fires but with no `engagement_id` or `workspace_id`. Can't calculate per-meeting metrics, workspace-level adoption, or join to generation events.
  - Recommended: Update `onMeetingSummaryClick` in `chats-tabs.tsx` to include:
    ```typescript
    track(AnalyticsEvent.MEETING_SUMMARY_VIEWED, {
      engagement_id: props.engagementId,
      workspace_id: viewer?.currentWorkspace?.id,
    });
    ```
  - File: `apps/web/src/components/chat/chats-tabs.tsx:271`
  - Also add `engagement_id` and `workspace_id` to `AnalyticsEventParams` type in `constants.ts`

- [ ] **`meeting_summary:generated_failed`** — No error tracking when summary generation fails. We can't measure generation error rate (guardrail metric).
  - Can be combined into `meeting_summary:generated` with `success: false` and `error_type: 'no_transcript' | 'agent_failed' | 'empty_output'`

### Nice-to-Have

- [ ] **`meeting_summary:returned`** — Track when a user comes back to view the same summary a 2nd+ time. Key for understanding stickiness of the artifact.
  - Recommended: Fire a separate event when `contentType === 'meeting-summary'` and user has seen it before (requires local state tracking on the component).

- [ ] **`meeting_summary:section_expanded`** — For the future redesign, track which sections users engage with most (Key Takeaways, Topics, Next Steps, Unresolved Questions).

- [ ] **`meeting_summary:share_initiated`** — When sharing feature ships (open beta), track when sharing flow is triggered.

- [ ] **`meeting_summary:chat_with_summary_opened`** — When user opens chat from within the summary context.

---

## Baseline Calculation

**Current State:** Cannot calculate North Star metric.

| Metric | Can Measure Today? | Blocker |
|---|---|---|
| `meeting_summary:viewed` volume | ✅ Yes (100+ in 30d) | No denominator; internal-only |
| Summary View Rate (% who viewed after gen) | ❌ No | Missing: `meeting_summary:generated` event |
| Unique users viewing summaries | ✅ Yes (21 users, internal) | Feature-flag restricted to internal |
| Time to first view post-generation | ❌ No | Missing: `meeting_summary:generated` + no `engagement_id` on viewed event |
| Return view rate | ❌ No | No `meeting_summary:returned` event |
| Generation error rate | ❌ No | No generation event, no error event |

**Confidence: LOW** — One event firing, zero context. Can count clicks, nothing more.

**Blockers:**
1. `meeting_summary:generated` does not exist → can't calculate view rate
2. `meeting_summary:viewed` has no context props → can't tie to specific meetings or workspaces
3. Feature is beta-only → all current data is internal; not a customer baseline

---

## Recommended Instrumentation (Priority Order)

### 1. `meeting_summary:generated` (Backend — HIGHEST PRIORITY)

```typescript
// In: apps/functions/src/contexts/media-recording-processing/media-recording-processing.context.ts
// After line 679 (successful upsert) or line 682-687 (catch block)

captureEvent(AnalyticsEventName.MeetingSummaryGenerated, {
  engagement_id: engagementId,
  workspace_id: workspaceId,
  success: true,
  summary_length_chars: summaryMarkdown?.length ?? 0,
  transcript_length_chars: transcriptText?.length ?? 0,
  generation_time_ms: Date.now() - startTime,  // add startTime = Date.now() before execute()
}, workspaceId);
```

Also add to backend enum:
```typescript
// apps/functions/src/contexts/infra/analytics/constants.ts
MeetingSummaryGenerated = 'meeting_summary:generated',
MeetingSummaryGenerationFailed = 'meeting_summary:generation_failed',
```

### 2. `meeting_summary:viewed` — Add context properties (Frontend — HIGH PRIORITY)

```typescript
// In: apps/web/src/components/chat/chats-tabs.tsx:270
const onMeetingSummaryClick = () => {
  track(AnalyticsEvent.MEETING_SUMMARY_VIEWED, {
    engagement_id: props.engagementId,
    workspace_id: viewer?.currentWorkspace?.id,
  });
  setSearchParams({ meetingSummary: 'true' });
};
```

Also update `AnalyticsEventParams` in `constants.ts`:
```typescript
[AnalyticsEvent.MEETING_SUMMARY_VIEWED]: {
  engagement_id?: string;
  workspace_id?: string;
};
```

### 3. `meeting_summary:returned` (Frontend — MEDIUM PRIORITY)

Track on subsequent views within same session or across sessions. Minimal implementation:

```typescript
// In chats-tabs.tsx, add local state to track if summary was already seen this session
const [hasPreviouslyViewedSummary, setHasPreviouslyViewedSummary] = useState(false);

const onMeetingSummaryClick = () => {
  if (hasPreviouslyViewedSummary) {
    track(AnalyticsEvent.MEETING_SUMMARY_RETURNED, {
      engagement_id: props.engagementId,
      workspace_id: viewer?.currentWorkspace?.id,
    });
  } else {
    track(AnalyticsEvent.MEETING_SUMMARY_VIEWED, {
      engagement_id: props.engagementId,
      workspace_id: viewer?.currentWorkspace?.id,
    });
    setHasPreviouslyViewedSummary(true);
  }
  setSearchParams({ meetingSummary: 'true' });
};
```

---

## PostHog Setup Needed (After Instrumentation)

Once events are firing with proper context, create these PostHog queries:

### North Star Metric Insight
```json
{
  "kind": "InsightVizNode",
  "source": {
    "kind": "FunnelsQuery",
    "series": [
      { "kind": "EventsNode", "event": "meeting_summary:generated", "custom_name": "Summary Generated" },
      { "kind": "EventsNode", "event": "meeting_summary:viewed", "custom_name": "Summary Viewed" }
    ],
    "funnelOrderType": "unordered",
    "dateRange": { "date_from": "-30d" },
    "breakdownType": "person",
    "breakdown": "workspace_id"
  }
}
```

This funnel will give: **"% of users who received a summary and then viewed it"** — the North Star metric.

### Weekly Engagement Rate (Target Metric)
- Denominator: unique users with `meeting_summary:generated` events that week
- Numerator: unique users with `meeting_summary:viewed` events that week

---

## Linear Ticket Recommendation

**Title:** `[analytics] Add PostHog instrumentation for Meeting Summary feature`

**Description:**
Meeting Summary needs 3 events to establish a product baseline:
1. `meeting_summary:generated` (backend) — no event exists today
2. `meeting_summary:viewed` context props (frontend) — event fires but has no engagement_id or workspace_id
3. `meeting_summary:generation_failed` (backend) — error rate is unmeasurable

Without these, the North Star metric (>60% view rate) cannot be tracked.

**Labels:** analytics, instrumentation, meeting-summary
**Priority:** P1 (required for launch metrics)
**Team:** EPD/Product → Development
