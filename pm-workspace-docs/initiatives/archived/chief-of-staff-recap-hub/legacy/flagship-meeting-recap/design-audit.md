# Flagship Meeting Recap - Design Audit

**Auditor:** AI Design Companion  
**Date:** 2026-01-28  
**Status:** Pre-Prototype Review  
**Verdict:** ⚠️ Ready with Recommendations (address before prototyping)

---

## Executive Summary

The PRD and design brief establish a strong vision for a flagship meeting recap experience. The core flows are well-defined, but several trust, state, and accessibility gaps need resolution before prototyping.

**Key Findings:**

- ✅ Strong alignment with AI-first UX principles
- ✅ Good persona consideration for Sales Rep
- ⚠️ Missing state designs for 3 critical flows
- ⚠️ Trust safeguards need more explicit design
- ⚠️ Low-confidence states not fully specified
- ❌ Accessibility not addressed in design brief

---

## Trust Check Audit

### Quick Trust Check Results

| Criterion                                         | Status     | Notes                                                                     |
| ------------------------------------------------- | ---------- | ------------------------------------------------------------------------- |
| User understands what AI will do before it acts   | ✅ Pass    | Chat config explains actions, preview shows output                        |
| User can see evidence for AI decisions (receipts) | ⚠️ Partial | Meeting type detection needs confidence indicator                         |
| User can easily undo AI actions                   | ⚠️ Partial | Template changes need undo; share has 30s undo mentioned but not designed |
| User can correct AI and see learning              | ⚠️ Partial | Override mentioned but learning feedback not designed                     |
| AI admits uncertainty appropriately               | ❌ Missing | No low-confidence state designed for recaps                               |
| AI failures are graceful and recoverable          | ⚠️ Partial | Error states listed but not fully designed                                |

### Recommendations

1. **Add confidence indicator to meeting type detection**

   - Show "90% confident this is a Discovery call"
   - Use muted styling for < 80% confidence
   - Design: Subtle badge or inline text beneath detected type

2. **Design explicit undo flows**

   - Template edit: "Undo last change" toast with 10s window
   - Share action: "Undo share" toast with 30s window
   - Visual: Toast with countdown indicator

3. **Create low-confidence recap state**
   - When AI is uncertain about content accuracy
   - Hedging language: "I think the main topics were..."
   - Visual: Yellow/amber border, "Verify this" prompt
   - Action: "Flag for review" button

---

## State Design Audit

### Required States by Feature

#### 1. Template Configuration Chat

| State          | Designed?  | Gap                                                     |
| -------------- | ---------- | ------------------------------------------------------- |
| Loading        | ⚠️ Partial | "Generating preview..." mentioned, no visual spec       |
| Success        | ✅ Yes     | "Template saved!" confirmation                          |
| Error          | ⚠️ Partial | "Preview fails to generate" mentioned, no recovery path |
| Low Confidence | ❌ Missing | What if AI misunderstands user intent?                  |
| Empty          | N/A        | Chat starts with AI prompt                              |

**Recommendations:**

- Design skeleton state for preview panel while AI generates
- Add "I'm not sure I understood. Did you mean..." clarification flow
- Design recovery when preview generation fails (retry, manual fallback)

#### 2. Artifact Tabs (Recap/Coaching/Prep)

| State          | Designed?  | Gap                                                                    |
| -------------- | ---------- | ---------------------------------------------------------------------- |
| Loading        | ❌ Missing | No skeleton or spinner defined                                         |
| Success        | ✅ Yes     | Polished artifact view                                                 |
| Error          | ❌ Missing | What if recap generation fails?                                        |
| Low Confidence | ❌ Missing | What if AI is uncertain about transcript quality?                      |
| Empty          | ⚠️ Partial | "Tabs only appear if content exists" - but what about partial content? |

**Recommendations:**

- Design artifact skeleton (sections loading progressively)
- Design error state: "Couldn't generate recap. [View transcript] [Retry]"
- Design partial state: Some sections complete, others still processing
- Design low-quality indicator: "Transcript quality was low—some details may be missing"

#### 3. In-Place Editing (Feedback Icon)

| State          | Designed?  | Gap                                                 |
| -------------- | ---------- | --------------------------------------------------- |
| Loading        | ❌ Missing | AI processing user feedback                         |
| Success        | ✅ Yes     | Template updated, preview refreshes                 |
| Error          | ⚠️ Partial | "AI can't parse request" → asks clarifying question |
| Low Confidence | ❌ Missing | AI unsure how to implement change                   |
| Empty          | N/A        | User initiates                                      |

**Recommendations:**

- Design "thinking" state: Chat shows typing indicator + "Updating template..."
- Design confidence check: "I'll make it more concise. Here's the preview—is this what you meant?"
- Design partial success: "I changed the format, but couldn't add competitor section. Want to try describing it differently?"

#### 4. Share to Channel

| State          | Designed?  | Gap                                          |
| -------------- | ---------- | -------------------------------------------- |
| Loading        | ❌ Missing | Pushing to HubSpot/Slack                     |
| Success        | ✅ Yes     | "Success confirmation with link"             |
| Error          | ✅ Yes     | "HubSpot disconnected → prompt reconnection" |
| Low Confidence | N/A        | Binary success/fail                          |
| Empty          | N/A        | User initiates                               |

**Recommendations:**

- Design pushing state: "Sending to HubSpot..." with spinner
- Add progress for larger recaps: "Uploading... 2/3 sections"

#### 5. Meeting Type Detection

| State          | Designed?  | Gap                                |
| -------------- | ---------- | ---------------------------------- |
| Loading        | ❌ Missing | Detection happening                |
| Success        | ⚠️ Partial | "Subtle banner" mentioned, no spec |
| Error          | ❌ Missing | What if detection fails entirely?  |
| Low Confidence | ❌ Missing | What if confidence is low?         |
| Empty          | ❌ Missing | New user, no history to learn from |

**Recommendations:**

- Design detection banner with confidence: "Discovery call (high confidence)" vs "Might be a Demo (60%)"
- Design fallback: "Couldn't detect type. Select: [Discovery] [Demo] [Follow-up] [Other]"
- Design first-time state: "I'll learn your call types as you tag them"

---

## Emotional Design Audit

### Visceral (First Impression)

| Check                                  | Status        | Notes                                                 |
| -------------------------------------- | ------------- | ----------------------------------------------------- |
| Looks trustworthy and polished?        | ✅ Pass       | Design brief emphasizes polish                        |
| AI visually distinguished from static? | ⚠️ Needs spec | No indicator defined for AI-generated vs user content |
| Animations convey intelligence?        | ⚠️ Needs spec | No animation spec for preview generation              |

**Recommendations:**

- Add subtle "sparkle" or AI icon to indicate AI-generated content
- Design smooth transition for live preview updates (not jarring replacement)
- Consider typing animation for chat responses (humanizes AI)

### Behavioral (During Use)

| Check                       | Status     | Notes                                                       |
| --------------------------- | ---------- | ----------------------------------------------------------- |
| Response time acceptable?   | ⚠️ Partial | Performance reqs in PRD, but no fallback for slow responses |
| Interactions predictable?   | ✅ Pass    | Clear flows defined                                         |
| Easy to dismiss/correct AI? | ⚠️ Partial | Override exists, but "dismiss" not designed                 |

**Recommendations:**

- Design timeout handling: After 5s, show "Taking longer than usual. [Cancel] [Keep waiting]"
- Add "X" dismiss on detection banner (user can ignore AI suggestion)
- Design "Ignore for this meeting" option that doesn't affect future

### Reflective (After Use)

| Check                         | Status        | Notes                                                 |
| ----------------------------- | ------------- | ----------------------------------------------------- |
| User feels augmented?         | ✅ Pass       | Chat config keeps user in control                     |
| Would recommend?              | ⚠️ Unmeasured | Consider NPS prompt after first successful share      |
| Feels capable, not dependent? | ⚠️ Partial    | Show "You customized this" rather than "AI made this" |

**Recommendations:**

- Attribution language: "Your Discovery template" not "AI template"
- Success moment: "Nice! Your recap is ready." (celebrates user, not AI)
- Consider onboarding tip: "You can always customize this to match how you think"

---

## Persona Fear Check

### Sales Rep ("Rachel Rep")

| Fear                                        | Addressed? | Design Response                             |
| ------------------------------------------- | ---------- | ------------------------------------------- |
| Replacement ("Will AI take my job?")        | ⚠️ Partial | Implicit in "AI helps you" but not explicit |
| Surveillance ("Is AI tracking me?")         | ❌ Missing | No mention of data privacy in config        |
| Embarrassment ("Will AI make me look bad?") | ✅ Yes     | Preview before share, edit capability       |

**Recommendations:**

- Add to chat config: "This is just for you—your templates are private"
- In share modal: "Only you can see this until you share it"
- Consider: "AI suggestions are never shared with your manager"

### Sales Leader (Secondary)

| Fear                          | Addressed? | Design Response                             |
| ----------------------------- | ---------- | ------------------------------------------- |
| Losing touch with team        | ⚠️ Partial | Leader can see recaps but not designed how  |
| AI replacing judgment         | N/A        | Not relevant to recap feature               |
| Creating surveillance culture | ❌ Missing | Team templates could feel like surveillance |

**Recommendations:**

- If team templates are added later, emphasize "templates help consistency" not "enforce standards"
- Leader view should show aggregate ("3 team members use custom templates") not individual tracking

---

## Accessibility Audit

### Current Status: ❌ Not Addressed

The design brief mentions no accessibility considerations. This must be fixed before prototype.

### Required Accessibility Specs

| Feature               | Requirement                 | Recommended Implementation                        |
| --------------------- | --------------------------- | ------------------------------------------------- |
| Chat configuration    | Keyboard navigable          | Tab through chat, Enter to send                   |
| Live preview          | Screen reader announcements | `aria-live="polite"` for preview updates          |
| Artifact tabs         | Tab key navigation          | Standard tab panel pattern with arrow keys        |
| Feedback icon         | Discoverable                | Tooltip on hover/focus, visible focus ring        |
| Share modal           | Focus trap                  | Focus stays in modal until close                  |
| Type detection banner | Screen reader               | `role="status"` with "Detected as Discovery call" |
| Loading states        | Announced                   | "Generating preview" for screen readers           |

### Color Contrast Check

| Element              | Foreground           | Background | Ratio Needed   |
| -------------------- | -------------------- | ---------- | -------------- |
| Tab labels           | `--foreground`       | `--card`   | 4.5:1 ✅       |
| Muted text           | `--muted-foreground` | `--card`   | 4.5:1 ⚠️ Check |
| Low confidence amber | `amber-700`          | `amber-50` | 4.5:1 ✅       |
| Error text           | `destructive`        | `--card`   | 4.5:1 ✅       |

**Recommendation:** Verify muted foreground contrast in dark/light modes.

### Motion Preferences

- Preview transitions should respect `prefers-reduced-motion`
- Typing indicators can be static for reduced motion
- Loading spinners should have static fallback

---

## Design System Alignment

### Patterns to Use (from system.md)

| Component        | Pattern                               | Notes                                        |
| ---------------- | ------------------------------------- | -------------------------------------------- |
| Artifact card    | `border bg-card shadow-sm rounded-lg` | Standard card                                |
| Tab pills        | Custom needed                         | System doesn't have tabs spec—need to design |
| Feedback icon    | `h-4 w-4` with tooltip                | Icon button pattern                          |
| Chat messages    | Card variant                          | AI vs User styling                           |
| Share modal      | Dialog with `shadow-lg`               | Elevated overlay                             |
| Detection banner | Alert variant                         | `bg-blue-50 text-blue-700` for info          |

### Components to Create for Prototype

1. **ArtifactTab** - Tab pill component with badge, active state
2. **FeedbackIcon** - Dotted outline button with tooltip
3. **DetectionBanner** - Inline alert with confidence, dismiss, override
4. **ChatConfigPanel** - Split view layout with chat + preview
5. **ArtifactSkeleton** - Loading skeleton for recap sections
6. **ChannelPicker** - Icon buttons with selection state

### Anti-Patterns to Avoid

| Anti-Pattern           | Current Risk | Mitigation                                   |
| ---------------------- | ------------ | -------------------------------------------- |
| Off-grid spacing       | Low          | Use spacing grid from system                 |
| Mixed depth            | Medium       | Tabs may need different treatment than cards |
| Inconsistent heights   | Medium       | Ensure all tab pills same height             |
| Missing transitions    | High         | Add `transition-colors` to all interactive   |
| Forgotten focus states | High         | Every interactive element needs focus ring   |

---

## Copy Audit

### Loading States

| Flow               | Current Copy            | Recommended                      |
| ------------------ | ----------------------- | -------------------------------- |
| Preview generation | "Generating preview..." | ✅ Good                          |
| Template save      | Not specified           | "Saving your template..."        |
| Recap generation   | Not specified           | "Analyzing your conversation..." |
| Share push         | Not specified           | "Sending to HubSpot..."          |

### Error States

| Flow                    | Current Copy        | Recommended                                                    |
| ----------------------- | ------------------- | -------------------------------------------------------------- |
| Preview fails           | Not specified       | "Couldn't generate preview. [Try again] [Skip preview]"        |
| Global chat unavailable | "Edit in Workflows" | "Chat is temporarily unavailable. [Edit in Workflows]"         |
| Share fails             | Not specified       | "Couldn't send to HubSpot. [Reconnect HubSpot] [Copy instead]" |

### Low Confidence States

| Flow                   | Current Copy  | Recommended                                                     |
| ---------------------- | ------------- | --------------------------------------------------------------- |
| Meeting type uncertain | Not specified | "This might be a Demo call. [Looks right] [Change]"             |
| Recap accuracy         | Not specified | "I'm not 100% confident on some details. [Review highlights]"   |
| AI misunderstands edit | Not specified | "I'm not sure I got that. Did you mean: [Option 1] [Option 2]?" |

---

## Critical Gaps to Address Before Prototype

### P0 (Must Fix)

1. **Design artifact loading skeleton** - Users will see this often
2. **Design low-confidence recap state** - Trust critical
3. **Add accessibility specs** - Required for shipping
4. **Design detection banner with confidence** - Core flow
5. **Design undo toast pattern** - Mentioned but not spec'd

### P1 (Should Fix)

6. **Design timeout handling** - "Taking longer than usual"
7. **Add privacy reassurance copy** - Addresses rep fear
8. **Design error recovery flows** - Beyond "try again"
9. **Spec AI visual indicator** - Distinguish AI from static

### P2 (Nice to Have)

10. **Animation spec for preview updates** - Polish
11. **Team template considerations** - Future-proofing
12. **NPS prompt design** - Measurement

---

## Updated Design Brief Recommendations

Add these sections to design brief before prototyping:

### Section: State Matrix

| Screen         | Loading          | Success           | Error                  | Low Conf           | Empty          |
| -------------- | ---------------- | ----------------- | ---------------------- | ------------------ | -------------- |
| Chat Config    | Skeleton preview | "Saved!" toast    | Retry + fallback       | "Did you mean...?" | First prompt   |
| Artifact Tabs  | Section skeleton | Full artifact     | "[Retry] [Transcript]" | Amber highlight    | Tab hidden     |
| In-Place Edit  | Typing indicator | Preview refresh   | Clarify question       | "Is this right?"   | N/A            |
| Share          | "Sending..."     | Link confirmation | Reconnect prompt       | N/A                | N/A            |
| Type Detection | N/A              | Banner            | Manual select          | "Might be..."      | First-time tip |

### Section: Trust Copy

| Moment            | Copy                                                |
| ----------------- | --------------------------------------------------- |
| Template creation | "Your templates are private and just for you."      |
| Before share      | "Only you can see this until you share it."         |
| Low confidence    | "I'm not 100% sure about this. Does it look right?" |
| After success     | "Nice! Your recap is ready."                        |

### Section: Accessibility Requirements

- All interactive elements: visible focus ring
- Dynamic content: `aria-live` regions
- Tab panels: proper ARIA roles
- Reduced motion: static fallbacks

---

## Prototype Readiness Checklist

Before running `/proto flagship-meeting-recap`:

- [ ] Design artifact loading skeleton (P0)
- [ ] Design low-confidence state for recaps (P0)
- [ ] Add accessibility notes to each screen (P0)
- [ ] Design detection banner with confidence levels (P0)
- [ ] Design undo toast component (P0)
- [ ] Approve final state matrix
- [ ] Review copy for all states
- [ ] Confirm tab component design

---

## Appendix: Reference Screenshots Needed

For prototype accuracy, gather references for:

1. **Notion AI onboarding** - Chat config flow
2. **PostHog annotations** - Feedback icon pattern
3. **Linear tabs** - Tab pill design
4. **Slack share modal** - Channel picker
5. **Figma AI** - Live preview pattern

---

_Audit complete. Address P0 items before prototyping._
