# Composio Release Risks and Restrictions

**Date:** 2026-03-09
**Context:** This document summarizes the concerns, risks, and necessary restrictions for a broader release of the Composio integration, synthesizing findings from the Product Team Deep Dive (Feb 9, 2026) and Partnership Perspective chat with James Hinkson (Feb 10, 2026).

## 1. Security & Accidental Action Risks
The integration's broad capabilities present significant risks of autonomous agents taking destructive or unintended actions. 
* **Incidents:** There have already been occurrences of accidental dangerous actions, such as Ben sending unintended emails and Woody posting Slack messages to the wrong channels.
* **Mitigation:** AI agents executing Composio actions MUST NOT be "always-on" by default for sensitive actions. An opt-in toggle per chat session or specific tool execution guardrails (e.g., confirmation modals) must be implemented to prevent accidental communications.

## 2. Visibility & Connection Management
* **The "No Central Dashboard" Problem:** Currently, workspace admins fly blind. There is no central connection inventory to see which of the 800+ Composio tools are connected, what permissions they hold, or which users/workflows have access to them.
* **Requirement:** A robust **Connection Inventory Page** must be shipped as a prerequisite for any broader release to ensure trust and proper administrative oversight.

## 3. Support Burden & Overselling
* **Overselling Risk:** There is a significant risk of sales teams pitching the beta without guardrails (e.g., Pete Belliston). As highlighted by James Hinkson, a 250-person pilot scaling to 6,000 users (like the Indeed deal) represents a seismic integration risk if mishandled.
* **The "Prevy Scenario":** A scenario where AskElephant spends 100+ hours supporting a single customer who ultimately churns, resulting in wasted seats and lost engineering cycles.
* **Support Impossibility:** Support and Sales Engineering (SE) teams cannot become experts in all 800+ 3rd-party toolkits offered by Composio (ClickUp, Monday, etc.).
* **Requirement:** A clear **Tool Curation Strategy**. We must define whether we hand-pick curated toolkits (tested, supported) or allow community toolkits with a strict "use at your own risk" label.

## 4. Reliability & Silent Failures
* **Latency:** There have been severe reliability issues, such as bulk email sends being delayed by 2.5 hours with zero visibility into the queue or failure state.
* **Silent Failures:** AI validators have shown "green" or successful execution states even when the underlying criteria were not met or the action failed gracefully without notifying the user.

## 5. Release Restrictions (The Guardrails)
To balance the desire to "move fast and deal with consequences" with the realities of enterprise risk, the following guardrails are strictly enforced:
1. **Closed Beta Status:** The Composio integration remains in a closed beta.
2. **Strict Client Vetting:** Only highly selective, vetted customers are allowed into the beta program.
3. **Clear Communication:** Transparent communication regarding existing limitations, potential delays, and the beta nature of the integration must be provided to clients before activation.
4. **Timeline Guardrails:** Establish clear timelines and scope boundaries for pilot rollouts to prevent uncontrolled scaling before the platform is ready.
