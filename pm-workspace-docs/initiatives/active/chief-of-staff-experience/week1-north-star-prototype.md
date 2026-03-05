# Design Spec: Week 10 High-Fi Prototype (The North Star)

**Week**: 1 (Feb 26 – Mar 4)
**Owner**: Skylar Sanford
**Initiative**: Project Babar — Chief of Staff Agent
**Status**: Defined

---

## Purpose

To support vertical slicing, Design must build the complete "Week 10" interactive prototype up front. Engineering will work backward from this prototype, deploying the shell in Week 1 and filling it with functionality week by week.

---

## 1. The Global Chat & Agent UX Map

This defines how the Chief of Staff Agent behaves globally inside the persistent chat sidebar, regardless of what page the user is on.

### Interaction Models:
- **Proactive Interruption (Push)**: If a P1 (High Urgency) event occurs while the user is navigating the app, the Global Chat icon shows a red badge. If opened, the Agent says: *"Sarah just emailed asking for the contract. I've drafted a reply. [Review Draft]"*
- **Contextual Query (Pull)**: If the user is on the `/chief-of-staff` feed and asks the Chat, *"Remind me to do this tomorrow,"* the Agent must understand *"this"* refers to the feed card currently expanded or in focus.
- **Cross-Channel Execution**: User typing *"Draft an email to Marcus saying we need to delay"* into the chat triggers the Agent to write the draft, surface it in the chat UI, and wait for the user to click "Send."

---

## 2. Feed Card Variants (High-Fi Requirements)

### 2.1 The Urgent Comm Card (Event-Based)
*Visual signature: Red accent border, prominent time received.*
- **Header**: Avatar + Name · Company · Deal Value (e.g., "$120K")
- **Title**: "Urgent Request: Pricing Proposal"
- **Evidence**: Quote block containing the exact Slack/Email sentence.
- **Actions**: `[Send Reply]` (Primary) · `[Remind me later]` (Secondary)
- **Expansion**: Clicking `[Send Reply]` expands the card to show the editable AI-drafted response.

### 2.2 The Action Item Card (Extracted Task)
*Visual signature: Yellow accent border, checkbox.*
- **Header**: Avatar + Name
- **Title**: "Send Q4 Usage Report"
- **Evidence**: "You said: 'I owe you the Q4 usage report — give me until tomorrow AM.'"
- **Actions**: `[Mark Done]` · `[Snooze]`

### 2.3 The Meeting Impact Report Card (Post-Meeting)
*Visual signature: Blue accent border, Trajectory Badge.*
- **Header**: Meeting Name · Time
- **Title**: "Trajectory: ADVANCED" (or NEUTRAL/DETRACTED)
- **Evidence**: "Decision maker agreed to evaluate the pilot next week."
- **Actions**: `[Read Report]` (Primary)

### 2.4 The Meeting Prep Card (Proximity Trigger)
*Visual signature: Purple accent border, pulsing dot if < 5 mins.*
- **Header**: Meeting Name · Starting in [X] mins
- **Title**: "Prep Brief Available"
- **Evidence**: "Last touchpoint was 4 days ago. They raised concerns about security."
- **Actions**: `[Open Prep Brief]` (Primary)

---

## 3. The Empty Shell & Zero-State (Week 1 Deployment Target)

Palmer will deploy this exact view in Week 1.

**The "Empty Feed" State:**
- **Header**: "Hi, I'm your Chief of Staff."
- **Subtitle**: "Connect your tools and I'll start keeping track of what matters across your day."
- **Tiles**: 3 large, friendly tiles for `[Connect Gmail]`, `[Connect Slack]`, `[Connect Calendar]`.
- **Active Agents Module**: Rendered at the bottom, but all stats say `0`.

---

## 4. Figma Prototype Delivery Requirements

Skylar must deliver a clickable Figma prototype that demonstrates:
1. The Zero-State onboarding flow (connecting Gmail/Slack).
2. The UI transitioning from empty to populated (simulating Week 2 task extraction).
3. Clicking a "Send Reply" button to expand the inline auto-drafting sheet.
4. Snoozing a card and watching it disappear from the feed.

This prototype must be signed off by Tyler and Palmer by **March 4** to unblock the rest of the vertical slicing.