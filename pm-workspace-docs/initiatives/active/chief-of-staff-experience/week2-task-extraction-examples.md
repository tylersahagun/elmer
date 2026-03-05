# Product Definition: Task Extraction Ground Truth Examples

**Week**: 2 (Mar 5 – Mar 11)
**Owner**: Tyler Sahagun
**Initiative**: Project Babar — Chief of Staff Agent
**Purpose**: Provide the 50 labeled examples the LLM extraction prompt will be evaluated against. Engineers will run the extraction prompt against all 50 examples and verify the output matches the expected label before shipping.

---

## Scoring Standard

- **True Positive**: Message contains a commitment; extraction correctly identifies it
- **True Negative**: Message contains no commitment; extraction correctly returns `[]`
- **False Positive**: Message contains no commitment; extraction incorrectly creates a task (BAD)
- **False Negative**: Message contains a commitment; extraction misses it (BAD)

**Required accuracy before ship**: > 90% TP + TN rate on all 50 examples.

---

## Examples: Commitments (Should Extract)

| # | Channel | Message | Expected Extraction |
|---|---|---|---|
| 1 | Slack DM | "Hey, I'll send the contract over by end of day." | Action: "Send contract", Owner: sender, Target: recipient, Urgency: high |
| 2 | Slack DM | "I can get you the pricing proposal Thursday morning." | Action: "Send pricing proposal", Owner: sender, Target: recipient, Due hint: Thursday, Urgency: high |
| 3 | Gmail | "As discussed, I'll set up a follow-up call with your team next week." | Action: "Schedule follow-up call", Owner: sender, Target: recipient company, Urgency: medium |
| 4 | Meeting transcript | "I'll loop in our legal team on this before Friday." | Action: "Loop in legal team", Owner: speaker, Due hint: Friday, Urgency: high |
| 5 | Slack DM | "Sounds good — I'll update the CRM with the new deal stage." | Action: "Update CRM deal stage", Owner: sender, Urgency: medium |
| 6 | Gmail | "I'll have the revised proposal to you by Tuesday." | Action: "Send revised proposal", Owner: sender, Due hint: Tuesday, Urgency: high |
| 7 | Meeting transcript | "Marcus, you mentioned you'd connect me with your VP of Sales?" | Action: "Intro to VP of Sales", Owner: Marcus, Target: sender, Urgency: medium |
| 8 | Slack DM | "Can you send me the case study we discussed? I need it before the board meeting." | Action: "Send case study", Owner: recipient (of message), Target: sender, Due hint: before board meeting, Urgency: high |
| 9 | Gmail | "I'll circle back after I check with my team on budget." | Action: "Follow up on budget approval", Owner: sender, Urgency: medium |
| 10 | Meeting transcript | "We'll get you the technical specs by next Monday." | Action: "Send technical specs", Owner: sender team, Due hint: next Monday, Urgency: high |
| 11 | Slack DM | "Let me get you an intro to our solutions engineer today." | Action: "Intro to solutions engineer", Owner: sender, Due hint: today, Urgency: high |
| 12 | Gmail | "Happy to jump on a call Friday at 2pm to walk you through the platform." | Action: "Schedule platform walkthrough call Friday 2pm", Owner: sender, Urgency: medium |
| 13 | Meeting transcript | "Sarah said she'd handle the renewal paperwork." | Action: "Complete renewal paperwork", Owner: Sarah, Urgency: medium |
| 14 | Slack DM | "I owe you the Q4 usage report — give me until tomorrow AM." | Action: "Send Q4 usage report", Owner: sender, Due hint: tomorrow morning, Urgency: high |
| 15 | Gmail | "Per your request, I'll send the NDA template to legal for review." | Action: "Send NDA template to legal", Owner: sender, Urgency: medium |
| 16 | Meeting transcript | "I'll move TechFlow to Negotiation stage in HubSpot." | Action: "Update TechFlow to Negotiation in HubSpot", Owner: speaker, Urgency: medium |
| 17 | Slack DM | "I need to send Marcus his onboarding materials by Thursday." | Action: "Send onboarding materials to Marcus", Owner: sender, Due hint: Thursday, Urgency: high |
| 18 | Gmail | "I'll follow up with procurement on the purchase order status." | Action: "Follow up with procurement on PO", Owner: sender, Urgency: medium |
| 19 | Meeting transcript | "Tyler committed to getting us a pilot contract by end of month." | Action: "Send pilot contract", Owner: Tyler, Due hint: end of month, Urgency: high |
| 20 | Slack DM | "Let me check on the implementation timeline and get back to you." | Action: "Check implementation timeline and follow up", Owner: sender, Urgency: medium |
| 21 | Gmail | "I'll have our DevOps team set up a sandbox environment for you this week." | Action: "Set up sandbox environment", Owner: DevOps team (sender's org), Due hint: this week, Urgency: medium |
| 22 | Meeting transcript | "Can you send me the recording after this?" | Action: "Send meeting recording", Owner: recipient, Urgency: low |
| 23 | Slack DM | "I'll escalate this to my manager and get you an answer by noon." | Action: "Escalate to manager and follow up by noon", Owner: sender, Due hint: noon, Urgency: high |
| 24 | Gmail | "We'll get your team access to the beta environment by Monday." | Action: "Provision beta environment access", Owner: sender team, Due hint: Monday, Urgency: high |
| 25 | Meeting transcript | "I promised to send a summary of today's call to all attendees." | Action: "Send meeting summary to attendees", Owner: speaker, Urgency: medium |

---

## Examples: Not Commitments (Should Return Empty)

| # | Channel | Message | Why NOT a commitment |
|---|---|---|---|
| 26 | Slack DM | "That sounds great, looking forward to connecting!" | Social pleasantry; no specific action |
| 27 | Gmail | "It was nice meeting you at the conference last week." | Social; no action |
| 28 | Meeting transcript | "We should probably revisit our pricing model at some point." | Vague aspiration; no owner, no timeline |
| 29 | Slack channel | "Has anyone used HubSpot for this before?" | Question to group; no commitment |
| 30 | Gmail | "I hope you had a great weekend." | Social; no action |
| 31 | Meeting transcript | "That's a good point, I'll have to think about it." | Passive; no concrete commitment |
| 32 | Slack DM | "Thanks for the heads up!" | Acknowledgment; no action |
| 33 | Gmail | "The team loved the demo yesterday." | Positive feedback; no commitment |
| 34 | Meeting transcript | "Yeah, we might need to loop in legal eventually." | Speculative; no owner or timeline |
| 35 | Slack DM | "Makes sense!" | Acknowledgment; no action |
| 36 | Gmail | "I'm out of office until the 15th. I'll respond when I'm back." | Auto-response; not a deal-related commitment |
| 37 | Meeting transcript | "Someone should probably write up the notes from this." | Vague, no owner |
| 38 | Slack channel | "Here's the Figma link everyone has been asking for: [link]" | Information share; no commitment |
| 39 | Gmail | "Looking forward to our meeting next Tuesday." | Calendar confirmation; not an action item |
| 40 | Meeting transcript | "We may want to consider a phased rollout." | Strategic musing; no concrete commitment |
| 41 | Slack DM | "Haha yeah that's a good one." | Casual conversation |
| 42 | Gmail | "Please let me know if you have any questions." | Boilerplate closing; not a commitment |
| 43 | Meeting transcript | "Honestly, this is going to be a big lift for the team." | Observation; no commitment |
| 44 | Slack channel | "Reminder: all-hands is at 3pm today." | Announcement; no commitment for the rep |
| 45 | Gmail | "Just confirming that we're still on for Friday at 2pm." | Confirmation, not a new commitment |
| 46 | Meeting transcript | "I think pricing is flexible, we can probably work something out." | Vague; not a concrete commitment |
| 47 | Slack DM | "I'll let you know if anything changes." | Conditional; too vague to action |
| 48 | Gmail | "This looks good to me, no changes needed." | Approval; no new action required |
| 49 | Meeting transcript | "We've been doing this for about three years now." | Context/background; no commitment |
| 50 | Slack DM | "Ha! Classic." | Casual; no action |

---

## Evaluation Instructions for Engineering

1. Run the extraction prompt against each of the 50 messages above.
2. Record the output (extracted JSON or `[]`).
3. Mark as TP, TN, FP, or FN.
4. Accuracy must exceed 90% (45/50 correct) before the extraction worker ships.
5. Any FPs on examples 26–50 are considered critical failures — casual chatter being turned into tasks is the worst failure mode.

---

_Last updated: 2026-02-26_
_Owner: Tyler_
