# Elmer PM Orchestrator — Stage Documentation

> **elmer** — AI-powered PM orchestrator that compresses discovery from weeks to days.

This document defines each stage of the Elmer Kanban workflow, including required inputs, automation/functionality, expected outputs, and how stages connect through iteration loops.

---

## Overview: The Product Lifecycle Kanban

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                     │
│  ┌─────────┐   ┌───────────┐   ┌───────┐   ┌────────┐   ┌───────────┐   ┌──────────┐   ┌─────────┐ │
│  │  INBOX  │ → │ DISCOVERY │ → │  PRD  │ → │ DESIGN │ → │ PROTOTYPE │ → │ VALIDATE │ → │ TICKETS │ │
│  └─────────┘   └───────────┘   └───────┘   └────────┘   └───────────┘   └──────────┘   └─────────┘ │
│       │              ↑             ↑            ↑              ↑              │                     │
│       │              └─────────────┴────────────┴──────────────┘              │                     │
│       │                        ITERATION LOOP #1                              │                     │
│       │                    (Discovery → Validate)                             │                     │
│       │                                                                       │                     │
│       │        ┌───────────────────────────────────────────────────────┘      │                     │
│       │        │                                                              │                     │
│       │        ↓                                                              │                     │
│       │   ┌─────────┐   ┌─────────┐   ┌──────┐   ┌──────┐                     │                     │
│       │   │  BUILD  │ → │  ALPHA  │ → │ BETA │ → │  GA  │ ────────────────────┘                     │
│       │   └─────────┘   └─────────┘   └──────┘   └──────┘                                           │
│       │        │              ↑           ↑          │                                              │
│       │        └──────────────┴───────────┘          │                                              │
│       │              ITERATION LOOP #2               │                                              │
│       │           (Build → Alpha → Beta)             │                                              │
│       │                                              │                                              │
│       └──────────────────────────────────────────────┘                                              │
│                    Metrics-driven sub-features                                                      │
│                                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Iteration Loops

### Loop #1: Discovery → Validate

The first iteration loop is where product concepts are refined until ready for engineering.

| Stage Range | Loop Behavior |
|-------------|---------------|
| Discovery ↔ PRD | If PRD fails alignment checks, return to Discovery for more research |
| PRD ↔ Design | If design reveals UX issues, update PRD requirements |
| Design ↔ Prototype | Iterate on design through prototyping feedback |
| Prototype ↔ Validate | AI Jury or human feedback triggers prototype refinement |

**Typical iterations:** 2-5 cycles before advancing to Tickets

### Loop #2: Build → Beta

The second iteration loop handles technical refinement and staged rollout.

| Stage Range | Loop Behavior |
|-------------|---------------|
| Build ↔ Alpha | If alpha metrics fail, return to Build for fixes |
| Alpha ↔ Beta | If beta shows issues, iterate on implementation |

**Typical iterations:** 1-3 cycles before GA

### Loop #3: GA → Inbox (Subfeatures)

When GA metrics plateau or decline, the system can automatically create sub-feature initiatives:

- Low metrics trigger hypothesis creation
- Sub-features inherit parent context
- Parent GA dashboard shows combined metrics

---

## Automation Levels

Each stage supports configurable automation:

| Level | Behavior | When to Use |
|-------|----------|-------------|
| **Fully Automated** | AI executes without human review | Low-risk stages, trusted patterns |
| **Auto + Notify** | AI executes and notifies human | Medium-risk, monitoring needed |
| **Human Approval** | AI proposes, human must approve to advance | High-risk decisions, strategic stages |
| **Fully Manual** | Human initiates all actions | Initial setup, learning the system |

Default recommendation: **Auto + Notify** for Inbox→Prototype, **Human Approval** for Validate→GA

---

## Stage 1: Inbox

### Purpose

Capture raw signals (transcripts, tickets, conversations, ideas) and triage them into actionable initiatives or evidence for existing hypotheses.

### Associated Commands

- `/ingest transcript` — Process meeting transcripts
- `/ingest ticket` — Process support tickets  
- `/ingest issue [linear-id]` — Pull Linear issues
- `/ingest conversation` — Process Slack/email threads

### Required Inputs

| Input Type | Source | Format |
|------------|--------|--------|
| Transcript | Uploaded file, pasted text, video link | Raw text or audio file |
| Support Ticket | Pylon, Intercom, email | Ticket content |
| Linear Issue | Linear MCP | Issue ID |
| Voice Memo | Audio recording | .mp3, .m4a |
| Conversation | Slack thread, email chain | Pasted text |

### Automation/Functionality

1. **Parse input** — Extract structure from raw content
2. **Extract signals:**
   - TL;DR summary (2-3 sentences)
   - Key decisions made
   - Action items (who, what, when)
   - User problems with verbatim quotes
   - Feature requests with severity/frequency
   - Personas mentioned
3. **Strategic alignment check** — Flag signals that don't align with product vision
4. **Hypothesis matching** — Compare problems to existing hypotheses (>70% match)
5. **File to correct location** — Save to `signals/[type]/YYYY-MM-DD-[topic].md`
6. **Update index** — Add entry to `signals/_index.json`

### Expected Output

```
📥 Signal Processed

📄 Saved to: signals/transcripts/2026-01-18-user-interview-maya.md

🔍 Extracted:
- 3 user problems identified
- 2 feature requests
- 1 persona match: Sales Rep

🎯 Hypothesis Matches:
- "Config complexity" (82% match) — suggest adding evidence
- No match for "Notification overload" — suggest new hypothesis

⏭️ Next: `/hypothesis show config-complexity` or `/synthesize`
```

### Graduation Criteria (→ Discovery)

- [ ] Signal is saved with proper structure
- [ ] Problems extracted with quotes
- [ ] Persona identified
- [ ] Hypothesis match checked

---

## Stage 2: Discovery

### Purpose

Deep research and pattern recognition. Aggregate signals, validate hypotheses, and determine if there's sufficient evidence to commit to building something.

### Associated Commands

- `/research [initiative-name]` — Analyze research with strategic lens
- `/hypothesis new [name]` — Create new hypothesis
- `/hypothesis validate [name]` — Validate with evidence
- `/hypothesis commit [name]` — Commit to roadmap
- `/synthesize [topic]` — Find patterns across signals

### Required Inputs

| Input Type | Source | Required? |
|------------|--------|-----------|
| Signals | `signals/` folder | ✅ At least 3 |
| Company Context | `company-context/product-vision.md` | ✅ Auto-loaded |
| Strategic Guardrails | `company-context/strategic-guardrails.md` | ✅ Auto-loaded |
| Personas | `company-context/personas.md` | ✅ Auto-loaded |
| Existing Hypotheses | `hypotheses/` folder | Optional |

### Automation/Functionality

1. **Synthesis across signals:**
   - Group similar problems into themes
   - Count occurrences across sources
   - Track persona mentions per theme
   - Calculate signal strength (Strong/Moderate/Weak)

2. **Hypothesis management:**
   - Create structured hypothesis files
   - Track evidence accumulation
   - Validate against criteria (3+ sources, clear persona, severity/frequency)

3. **Strategic alignment:**
   - Score against outcome chain test
   - Flag anti-vision concerns
   - Surface clarifying questions

4. **Research documentation:**
   - Create `research.md` with findings
   - Link evidence to hypotheses
   - Document open questions

### Expected Output

```markdown
# Research Summary: [Initiative Name]

## Strategic Alignment: Strong ✅

## Theme Analysis

### Theme 1: Configuration Complexity
**Strength:** Strong (5 signals, 3 sources)
**Personas:** RevOps, Sales Managers
**Evidence:**
> "I spend hours configuring things that should be automatic" — RevOps Manager, 2026-01-15

## Recommendation
Ready to commit hypothesis and create initiative.
Run `/hypothesis commit config-complexity` to proceed to PRD.
```

### Graduation Criteria (→ PRD)

- [ ] `research.md` exists and is complete
- [ ] User problems documented with verbatim quotes
- [ ] Persona(s) clearly identified
- [ ] 3+ independent evidence sources
- [ ] Strategic alignment score: Strong or Moderate
- [ ] Hypothesis committed to roadmap

### Iteration Triggers

| Condition | Action |
|-----------|--------|
| Insufficient evidence (<3 sources) | Stay in Discovery, gather more signals |
| Persona unclear | Return to Inbox to capture more context |
| Strategic misalignment | Discuss with stakeholders or drop |

---

## Stage 3: PRD

### Purpose

Generate structured product documentation: PRD, design brief, engineering spec, and GTM brief. These documents are **fuel for AI prototyping**, not static artifacts.

### Associated Commands

- `/PM [initiative-name]` — Full documentation generation
- `/new-initiative [name]` — Create folder structure (if not exists)

### Required Inputs

| Input Type | Source | Required? |
|------------|--------|-----------|
| Research | `initiatives/[name]/research.md` | ✅ |
| Company Context | `company-context/*.md` | ✅ Auto-loaded |
| Personas | `company-context/personas.md` | ✅ Auto-loaded |
| Hypothesis | `hypotheses/committed/[id].md` | ✅ Must be committed |

### Automation/Functionality

1. **Read all context:**
   - Company vision and guardrails
   - Research findings and evidence
   - Committed hypothesis details
   - Relevant personas

2. **Generate four documents:**

   **A. PRD (`prd.md`):**
   - Problem statement with user quotes
   - Target personas
   - Success metrics (concrete, measurable)
   - User journey (current → desired)
   - MVP scope
   - Out of scope
   - Open questions

   **B. Design Brief (`design-brief.md`):**
   - User flows to design
   - Required states (loading, success, error, empty)
   - Accessibility requirements
   - Trust considerations

   **C. Engineering Spec (`engineering-spec.md`):**
   - Technical requirements
   - Data model changes
   - API specifications
   - Integration points

   **D. GTM Brief (`gtm-brief.md`):**
   - Launch strategy
   - Messaging
   - User education needs
   - Rollout plan

3. **Strategic validation:**
   - Run outcome chain test
   - Verify metrics are concrete (not "increase engagement")
   - Check for anti-vision language

### Expected Output

```
✅ Project documentation created for config-complexity!

📁 Files Created:
- elmer-docs/initiatives/config-complexity/prd.md
- elmer-docs/initiatives/config-complexity/design-brief.md
- elmer-docs/initiatives/config-complexity/engineering-spec.md
- elmer-docs/initiatives/config-complexity/gtm-brief.md

📊 Validation:
- Outcome chain: ✅ Complete
- Success metrics: ✅ Concrete (3 metrics defined)
- Personas: ✅ 2 identified (RevOps, Sales Manager)

⏭️ Next: `/proto config-complexity` or `/design config-complexity`
```

### Graduation Criteria (→ Design)

- [ ] `prd.md` exists with all sections complete
- [ ] `design-brief.md` exists
- [ ] Outcome chain articulated
- [ ] Success metrics defined with formulas
- [ ] MVP scope clearly bounded

### Iteration Triggers

| Condition | Action |
|-----------|--------|
| Outcome chain incomplete | Return to Discovery for clarification |
| Metrics are vague | Run `/measure [name]` to define concrete metrics |
| Scope too large | Split into multiple initiatives |

---

## Stage 4: Design

### Purpose

Review and refine design considerations before prototyping. Apply human-centric AI design principles, trust calibration, and emotional design frameworks.

### Associated Commands

- `/design [initiative-name]` — Full design review

### Required Inputs

| Input Type | Source | Required? |
|------------|--------|-----------|
| PRD | `initiatives/[name]/prd.md` | ✅ |
| Design Brief | `initiatives/[name]/design-brief.md` | ✅ |
| Personas | `company-context/personas.md` | ✅ |
| Human-Centric AI Research | `research/human-centric-ai-design-research.md` | ✅ Auto-loaded |

### Automation/Functionality

1. **Emotional journey assessment:**
   - Before: How user currently feels
   - During: Target emotions during interaction
   - After: Target feeling upon completion

2. **Trust analysis (Trust Equation):**
   - Credibility: Does AI know what it's talking about?
   - Reliability: Does it behave consistently?
   - Intimacy: Does it feel safe?
   - Self-Orientation: Does it serve user or itself?

3. **State completeness check:**
   - [ ] Loading state (short and long)
   - [ ] Success state
   - [ ] Error state
   - [ ] Low confidence state
   - [ ] Empty state

4. **Transparency check:**
   - [ ] Evidence/receipts visible for AI decisions
   - [ ] Confidence levels communicated
   - [ ] "Why did AI do this?" answerable

5. **Accessibility check:**
   - [ ] Screen reader compatible
   - [ ] Keyboard navigable
   - [ ] Appropriate reading level
   - [ ] Aria-live for dynamic content

6. **Persona-specific concerns:**
   - Sales Reps: No surveillance vibes, rep gets credit
   - Managers: Coaching insights, not surveillance
   - RevOps: Visibility and auditability

### Expected Output

```markdown
## Design Companion Review: config-complexity

### Emotional Journey Assessment
- **Before:** Frustrated, overwhelmed by settings
- **During:** Guided, in control, understood
- **After:** Confident, efficient, empowered

### Trust Analysis
- ✅ Trust Building: AI explains its suggestions
- ⚠️ Trust Risk: Silent failure could erode trust
- 📋 Recovery Plan: Show undo option + clear error messages

### State Completeness
- ✅ Loading state designed
- ✅ Success state designed
- ⚠️ Error state: Needs more helpful recovery actions
- ✅ Low confidence state designed
- ✅ Empty state designed

### Recommendations
1. Add "Why this suggestion?" tooltip (HIGH IMPACT)
2. Improve error recovery with specific actions
3. Add progress indicators for long operations
```

### Graduation Criteria (→ Prototype)

- [ ] All required states identified
- [ ] Trust considerations documented
- [ ] Accessibility requirements defined
- [ ] Persona-specific concerns addressed
- [ ] No P0 design blockers

### Iteration Triggers

| Condition | Action |
|-----------|--------|
| Missing trust plan | Update design brief before prototyping |
| State not designed | Add to design brief |
| Accessibility gap | Define requirements before building |

---

## Stage 5: Prototype

### Purpose

Build interactive Storybook prototypes. Create **multiple creative options** (2-3 directions) that stakeholders can interact with—working software, not static mockups.

### Associated Commands

- `/proto [initiative-name]` — Standalone prototype (isolated, PRD-driven)
- `/context-proto [initiative-name]` — Integrated prototype (shows placement in app)
- `/placement [initiative-name]` — Research where feature belongs (no building)
- `/iterate [initiative-name]` — Refine existing prototype with feedback

### Required Inputs

| Input Type | Source | Required? |
|------------|--------|-----------|
| PRD | `initiatives/[name]/prd.md` | ✅ |
| Design Brief | `initiatives/[name]/design-brief.md` | ✅ |
| Workspace Config | `workspace-config.json` | ✅ Auto-loaded |
| Human-Centric AI Research | `research/human-centric-ai-design-research.md` | ✅ Auto-loaded |
| Product Repo | `product-repos/[repo]/` | For `/context-proto` only |

### Automation/Functionality

1. **Creative exploration (2-3 options):**

   | Option | Philosophy | Best For |
   |--------|------------|----------|
   | Option A | Maximum control—user confirms everything | Low-trust users |
   | Option B | Balanced—AI suggests, easy override | Most users |
   | Option C | Maximum efficiency—AI acts, user reviews | Power users |

2. **Build all required states:**
   - Loading (short): Subtle spinner
   - Loading (long): Progress stages with messaging
   - Success: Check mark, affirming copy
   - Error: Warning icon, honest recovery-focused
   - Low Confidence: Muted colors, hedging language
   - Empty: Helpful illustration, actionable

3. **Storybook structure:**
   ```
   prototypes/src/components/[ProjectName]/
   ├── [Component].tsx
   ├── [Component].stories.tsx    # All options + all states
   ├── index.ts
   └── v2/ (after iteration)
   ```

4. **Chromatic deployment:**
   - Auto-publish to Chromatic on new prototypes
   - Generate shareable preview URLs
   - Enable visual regression testing

5. **Context prototype (optional):**
   - Analyze codebase for placement
   - Build integration demo (in page/panel/modal)
   - Document placement decision

### Expected Output

```
✅ Prototype exploration complete for config-complexity!

🎨 Creative Options:

**Option A: Maximum Control**
- User confirms every AI action
- Best for: Low-trust scenarios, new users
- Story: `OptionA_MaxControl`

**Option B: Balanced (Recommended)**
- AI suggests, easy override
- Best for: Most users, trust-building
- Story: `OptionB_Balanced`

**Option C: Maximum Efficiency**
- AI acts, user reviews
- Best for: Power users, routine tasks
- Story: `OptionC_Efficient`

📱 Preview:
- Local: `cd prototypes && npm run storybook`
- Chromatic: https://main--xxx.chromatic.com

📁 Files:
- prototypes/src/components/ConfigComplexity/
- elmer-docs/initiatives/config-complexity/prototype-notes.md

🎯 Recommendation: Option B balances trust-building with efficiency.
```

### Graduation Criteria (→ Validate)

- [ ] Prototype exists with all required states
- [ ] 2-3 creative options built
- [ ] Storybook stories complete
- [ ] Design review passed
- [ ] `prototype-notes.md` documented

### Iteration Triggers

| Condition | Action |
|-----------|--------|
| Missing states | Add states before validation |
| Single option only | Create additional options |
| Design feedback received | Run `/iterate [name]` |

---

## Stage 6: Validate

### Purpose

Validate prototypes with synthetic AI juries (Condorcet Jury System) and/or real stakeholder feedback. Gate for engineering—nothing advances without validation on working software.

### Associated Commands

- `/validate [initiative-name]` — Run jury evaluation + check criteria
- `/iterate [initiative-name]` — Refine based on validation feedback

### Required Inputs

| Input Type | Source | Required? |
|------------|--------|-----------|
| Prototype | Storybook stories | ✅ |
| PRD | `initiatives/[name]/prd.md` | ✅ |
| Design Brief | `initiatives/[name]/design-brief.md` | ✅ |
| Personas | `personas/seeds/*.json` | ✅ For jury |
| Measurement Plan | `initiatives/[name]/measurement-plan.md` | ✅ |

### Automation/Functionality

1. **Jury simulation (Condorcet Jury System):**
   - Generate 100-1000 synthetic user personas
   - Each persona evaluates prototype
   - Calculate approval/conditional/rejection rates
   - Aggregate concerns and suggestions by theme

2. **Graduation criteria check:**
   
   | Phase | Criteria |
   |-------|----------|
   | Discovery → Define | Research complete, 3+ evidence |
   | Define → Build | PRD complete, measurement plan exists |
   | Build → Validate | Prototype complete, all states |
   | Validate → Launch | Jury ≥70%, stakeholder approval |

3. **Feedback aggregation:**
   - Top concerns (ranked by mention count)
   - Top suggestions (ranked by mention count)
   - Persona-specific issues

4. **Iteration recommendation:**
   - If <70% approval: Must iterate
   - If 70-85%: Recommended to iterate
   - If >85%: Ready to advance

### Expected Output

```markdown
# Validation Report: config-complexity

**Date:** 2026-01-18
**Jury Size:** 100 personas
**Current Phase:** Build

## Jury Results

| Metric | Value | Target |
|--------|-------|--------|
| Approval Rate | 72% | ≥60% |
| Conditional Rate | 18% | — |
| Rejection Rate | 10% | <40% |
| **Combined Pass** | **90%** | **≥70%** |

### By Persona
| Persona | Pass Rate |
|---------|-----------|
| Sales Rep | 85% |
| RevOps | 78% |
| Sales Manager | 91% |

### Top Concerns
1. "What if AI is wrong?" — 23 mentions
2. "How do I undo?" — 18 mentions

### Top Suggestions
1. "Show why AI made this suggestion" — 31 mentions
2. "Add confirmation for destructive actions" — 19 mentions

## Recommendation

✅ **Ready to advance to Tickets**

Address in Tickets:
1. Add "Why this?" tooltips
2. Implement undo functionality
```

### Graduation Criteria (→ Tickets)

- [ ] Jury evaluation pass rate ≥ 70%
- [ ] Stakeholder approval obtained
- [ ] No P0 blockers
- [ ] GTM brief complete
- [ ] Measurement plan finalized

### Iteration Triggers

| Condition | Action |
|-----------|--------|
| Jury <70% | Return to Prototype, address top concerns |
| Specific persona failing | Focus iteration on that persona's needs |
| Stakeholder rejection | Return to PRD to realign |

---

## Stage 7: Tickets

### Purpose

Convert validated prototypes into bite-sized Linear/Jira tickets. Ensure each ticket traces back to prototype components and includes implementation guidance.

### Associated Commands

- `/tickets [initiative-name]` — Generate ticket structure (pending implementation)
- Linear MCP integration for ticket creation

### Required Inputs

| Input Type | Source | Required? |
|------------|--------|-----------|
| Validated Prototype | Storybook stories | ✅ |
| PRD | `initiatives/[name]/prd.md` | ✅ |
| Engineering Spec | `initiatives/[name]/engineering-spec.md` | ✅ |
| Measurement Plan | `initiatives/[name]/measurement-plan.md` | ✅ |

### Automation/Functionality

1. **Ticket generation:**
   - Create Linear Project for initiative
   - Generate milestones from prototype components
   - Break down into small, AI-workable tickets
   - Each ticket references:
     - Prototype story (visual reference)
     - Code location
     - Acceptance criteria
     - PostHog events to implement

2. **Ticket structure:**
   ```
   Project: config-complexity
   ├── Milestone 1: Core Component
   │   ├── Ticket: Implement ConfigPanel component
   │   ├── Ticket: Add loading states
   │   └── Ticket: Implement error handling
   ├── Milestone 2: AI Integration
   │   ├── Ticket: Connect to suggestion API
   │   └── Ticket: Add confidence display
   └── Milestone 3: Analytics
       ├── Ticket: Implement PostHog events
       └── Ticket: Create dashboard
   ```

3. **Ticket validation (AI jury):**
   - Do tickets cover all prototype functionality?
   - Are tickets small enough for AI agents?
   - Do tickets include measurement implementation?
   - Would completing these tickets achieve the outcome?

4. **Prototype linking:**
   - Each ticket links to relevant Storybook story
   - Engineers can see working reference
   - Acceptance = "matches prototype"

### Expected Output

```
✅ Tickets generated for config-complexity!

📋 Linear Project Created: CONFIG-123

📊 Breakdown:
- 3 Milestones defined
- 12 Tickets created
- Average ticket size: 4-8 hours

🔗 Prototype Links:
- Each ticket references Storybook story
- Acceptance criteria = matches prototype

🎯 Measurement Coverage:
- 8/12 tickets include PostHog events
- Dashboard ticket created

🤖 AI Validation:
- Ticket completeness: 94%
- Coverage gaps: None identified

⏭️ Next: Move to Build when engineering ready
```

### Graduation Criteria (→ Build)

- [ ] All prototype features have tickets
- [ ] Tickets are small (4-8 hour chunks)
- [ ] Each ticket has Storybook reference
- [ ] Measurement plan events included in tickets
- [ ] AI validation passed

### Iteration Triggers

| Condition | Action |
|-----------|--------|
| Missing prototype coverage | Add tickets for uncovered features |
| Tickets too large | Break down further |
| Measurement gaps | Add analytics tickets |

---

## Stage 8: Build

### Purpose

AI agents build the feature using Linear tickets as work items. Engineers review, and AI iterates based on feedback. This is the engineering execution phase.

### Associated Commands

- Agent-based execution via cursor CLI/MCP
- Linear MCP for ticket management

### Required Inputs

| Input Type | Source | Required? |
|------------|--------|-----------|
| Linear Tickets | Linear project | ✅ |
| Prototype Reference | Storybook stories | ✅ |
| Engineering Spec | `initiatives/[name]/engineering-spec.md` | ✅ |
| Measurement Plan | `initiatives/[name]/measurement-plan.md` | ✅ |
| Product Codebase | `product-repos/[repo]/` | ✅ |

### Automation/Functionality

1. **Agent-driven development:**
   - Pick up ticket from Linear
   - Read prototype as reference
   - Implement in product codebase
   - Create PR with ticket reference
   - AI code review

2. **Build process:**
   ```
   Ticket Assigned
   → Agent reads ticket + prototype
   → Agent implements in codebase
   → Agent creates PR
   → AI Review Agent checks
   → Human review (if configured)
   → Merge to development branch
   → Update ticket status
   ```

3. **Quality gates:**
   - Code matches prototype visually
   - All states implemented (loading, error, etc.)
   - PostHog events fire correctly
   - Tests pass
   - No regressions

4. **Feedback loop:**
   - Code review comments trigger iteration
   - Prototype comparison highlights mismatches
   - Automated testing catches issues

### Expected Output

```
🔨 Build Progress: config-complexity

📊 Tickets:
- ✅ Completed: 8/12
- 🔄 In Progress: 2/12
- ⏳ Todo: 2/12

🤖 Agent Activity:
- Last PR: CONFIG-127 "Add error states"
- Review status: Approved
- Next up: CONFIG-128 "PostHog events"

✅ Quality Checks:
- Visual match: 94%
- Test coverage: 87%
- Events implemented: 6/8

⏭️ Ready for Alpha when all tickets complete
```

### Graduation Criteria (→ Alpha)

- [ ] All tickets completed
- [ ] Code review approved
- [ ] Tests passing
- [ ] PostHog events implemented
- [ ] Feature flag created (if needed)
- [ ] Documentation updated

### Iteration Triggers

| Condition | Action |
|-----------|--------|
| Code doesn't match prototype | Return to implementing agent |
| Tests failing | Fix before advancing |
| Events not firing | Debug analytics implementation |

---

## Stage 9: Alpha

### Purpose

First deployment to limited users with full instrumentation. Validate that built feature works in production and metrics are tracking correctly.

### Associated Commands

- `/measure [initiative-name]` — Review/update measurement plan
- PostHog MCP for dashboard creation and monitoring

### Required Inputs

| Input Type | Source | Required? |
|------------|--------|-----------|
| Deployed Feature | Production (feature-flagged) | ✅ |
| Measurement Plan | `initiatives/[name]/measurement-plan.md` | ✅ |
| PostHog Dashboard | PostHog | ✅ |
| Alpha Users List | Internal team / pilot customers | ✅ |

### Automation/Functionality

1. **Deployment:**
   - Feature flag enabled for alpha users
   - PostHog identified for alpha cohort
   - Error monitoring enabled (GCP/Sentry)

2. **Metrics tracking:**
   - Funnel conversion rates
   - Feature adoption %
   - Error rates
   - Performance metrics
   - User feedback

3. **Alpha criteria:**
   | Metric | Target | Blocker? |
   |--------|--------|----------|
   | Error rate | <5% | Yes |
   | Feature adoption | >30% of alpha users | No |
   | Funnel completion | >50% | No |
   | Critical bugs | 0 | Yes |

4. **Dashboard views:**
   - Real-time usage
   - Error tracking
   - Funnel analysis
   - Cohort comparison

### Expected Output

```
📊 Alpha Metrics: config-complexity

🗓️ Alpha Duration: 7 days
👥 Alpha Users: 25

## Key Metrics

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Error Rate | 2.3% | <5% | ✅ |
| Feature Adoption | 68% | >30% | ✅ |
| Funnel Completion | 72% | >50% | ✅ |
| Critical Bugs | 0 | 0 | ✅ |

## Feedback

### Positive
- "Finally, something that just works" — Alpha User 3

### Issues
- "Slow on first load" — 3 mentions
- Performance ticket created: CONFIG-145

## Recommendation

✅ Ready for Beta expansion

Address before Beta:
- Performance optimization (CONFIG-145)
```

### Graduation Criteria (→ Beta)

- [ ] Error rate <5%
- [ ] No critical bugs
- [ ] Core funnel >50% completion
- [ ] Alpha feedback addressed
- [ ] Performance acceptable

### Automatic Advancement

If all criteria met for 7+ days, system can auto-advance to Beta (if configured).

### Iteration Triggers

| Condition | Action |
|-----------|--------|
| Error rate >5% | Return to Build, fix issues |
| Critical bug found | Pause alpha, fix, redeploy |
| Funnel <30% | Investigate, may need prototype iteration |

---

## Stage 10: Beta

### Purpose

Expanded rollout to broader user base. Validate metrics at scale, gather broader feedback, and prepare for general availability.

### Associated Commands

- PostHog MCP for expanded monitoring
- Linear MCP for beta feedback tickets

### Required Inputs

| Input Type | Source | Required? |
|------------|--------|-----------|
| Alpha Success | Alpha metrics met | ✅ |
| Expanded User List | % of total users | ✅ |
| Updated Dashboard | PostHog | ✅ |

### Automation/Functionality

1. **Staged rollout:**
   - Increase feature flag percentage
   - Monitor metrics at each stage
   - Auto-pause if metrics degrade

   ```
   Day 1-3:  10% of users
   Day 4-7:  25% of users
   Day 8-14: 50% of users
   Day 15+:  75% of users (pre-GA)
   ```

2. **Expanded metrics:**
   - Segment by user type
   - Compare to control group
   - Track retention (D1, D7, D30)
   - Monitor guardrail metrics

3. **Beta criteria:**
   | Metric | Target | Blocker? |
   |--------|--------|----------|
   | Error rate | <2% | Yes |
   | Feature adoption | >40% | No |
   | Retention D7 | >60% | No |
   | NPS impact | No decrease | Yes |

4. **Feedback aggregation:**
   - Automatic ticket creation from feedback
   - Theme analysis
   - Prioritization recommendations

### Expected Output

```
📊 Beta Metrics: config-complexity

🗓️ Beta Duration: 14 days
👥 Beta Users: 500 (25% rollout)

## Key Metrics

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Error Rate | 1.1% | <2% | ✅ |
| Feature Adoption | 54% | >40% | ✅ |
| Retention D7 | 71% | >60% | ✅ |
| NPS Impact | +3 | No decrease | ✅ |

## Segment Analysis

| Segment | Adoption | Satisfaction |
|---------|----------|--------------|
| Sales Reps | 62% | High |
| RevOps | 48% | Medium |
| Managers | 71% | High |

## Recommendation

✅ Ready for General Availability

🎉 All targets exceeded. Recommend GA launch.
```

### Graduation Criteria (→ GA)

- [ ] Error rate <2%
- [ ] No NPS degradation
- [ ] Adoption target met
- [ ] Retention target met
- [ ] No P0 issues in beta period
- [ ] GTM ready (docs, messaging, training)

### Automatic Advancement

If all criteria met at 75% rollout for 7+ days, system can auto-advance to GA.

### Iteration Triggers

| Condition | Action |
|-----------|--------|
| Error rate spikes | Reduce rollout %, fix |
| Adoption below target | Investigate, may need UX iteration |
| NPS drops | Pause expansion, investigate |

---

## Stage 11: GA (General Availability)

### Purpose

Feature is live for all users. This is the **permanent home** for tracking feature health, metrics, and spawning sub-features when improvement is needed.

### Associated Commands

- PostHog MCP for ongoing monitoring
- `/hypothesis new` for sub-feature creation
- Linear MCP for maintenance tickets

### Required Inputs

| Input Type | Source | Required? |
|------------|--------|-----------|
| Beta Success | Beta criteria met | ✅ |
| GA Dashboard | PostHog | ✅ |
| GTM Execution | Marketing/enablement | ✅ |

### Automation/Functionality

1. **Full rollout:**
   - Feature flag: 100%
   - Public documentation published
   - Knowledge base updated
   - Training materials available

2. **Ongoing monitoring:**
   - Real-time metrics dashboard
   - Weekly/monthly rollups
   - Anomaly detection alerts
   - Error rate monitoring

3. **GA dashboard sections:**
   - **Adoption:** % users using feature, growth trend
   - **Engagement:** Frequency of use, depth of use
   - **Performance:** Load times, error rates
   - **Business Impact:** Tie to revenue/retention

4. **Health indicators:**
   | Status | Condition |
   |--------|-----------|
   | 🟢 Healthy | All metrics on target |
   | 🟡 Watch | One metric declining |
   | 🔴 Action Needed | Multiple metrics below target |

5. **Sub-feature triggers:**
   - When metrics plateau → Create improvement hypothesis
   - When errors spike → Create bug fix initiative
   - When new feedback pattern → Create enhancement hypothesis

### Expected Output

```
📊 GA Dashboard: config-complexity

🗓️ GA Since: 2026-02-01
👥 Total Users: 2,500

## Health Status: 🟢 Healthy

## Key Metrics (Last 30 Days)

| Metric | Value | Trend | Target |
|--------|-------|-------|--------|
| Adoption | 61% | ↑ +3% | >50% |
| Weekly Active | 78% | → | >70% |
| Error Rate | 0.8% | ↓ | <2% |
| Satisfaction | 4.2/5 | ↑ | >4.0 |

## Business Impact

| Metric | Before | After | Δ |
|--------|--------|-------|---|
| Config Time | 45 min | 8 min | -82% |
| Support Tickets | 23/wk | 7/wk | -70% |

## Sub-Features

| Initiative | Status | Impact |
|------------|--------|--------|
| Advanced Rules | Beta | +15% adoption |
| Bulk Actions | Prototype | — |

## Alerts

⚠️ None active

## Recommended Actions

✅ Feature healthy, no action needed

📈 Consider: "Advanced rules" showing strong beta results
```

### Ongoing Operations

| Trigger | Action |
|---------|--------|
| Metrics drop 20% | Create hypothesis, investigate |
| New feature request pattern | Run `/synthesize` on feedback |
| Error rate >2% | Create fix initiative |
| Competitor move | Review positioning |

### Sub-Feature Loop

When GA metrics indicate need for improvement:

```
GA Metrics Decline
→ Automatic hypothesis creation
→ New initiative in Inbox
→ Full cycle for sub-feature
→ Sub-feature metrics roll up to parent GA
```

---

## Stage Execution Summary

### Stages That Run Together

| Group | Stages | Reason |
|-------|--------|--------|
| **Intake** | Inbox → Discovery | Can auto-chain if hypothesis criteria met |
| **Documentation** | PRD → Design | Design brief is part of PRD workflow |
| **Building** | Prototype → Validate | Tight iteration loop, often same session |
| **Deployment** | Alpha → Beta → GA | Progressive rollout, metrics-driven |

### Stages That Iterate

| Loop | Stages Involved | Exit Condition |
|------|-----------------|----------------|
| **Discovery Loop** | Discovery ↔ PRD | Strategic alignment confirmed |
| **Design Loop** | PRD ↔ Design ↔ Prototype | All states designed |
| **Validation Loop** | Prototype ↔ Validate | Jury ≥70% |
| **Build Loop** | Build ↔ Alpha | Error <5%, no critical bugs |
| **Rollout Loop** | Alpha ↔ Beta | All metrics on target |
| **Health Loop** | GA → Inbox (sub-features) | Ongoing |

### Automation Configuration

```json
{
  "automation_config": {
    "inbox_to_discovery": "auto",
    "discovery_to_prd": "auto_with_notify",
    "prd_to_design": "auto",
    "design_to_prototype": "auto_with_notify",
    "prototype_to_validate": "human_approval",
    "validate_to_tickets": "human_approval",
    "tickets_to_build": "auto",
    "build_to_alpha": "human_approval",
    "alpha_to_beta": "auto_with_metrics",
    "beta_to_ga": "human_approval"
  }
}
```

---

## Quick Reference

| Stage | Command(s) | Key Input | Key Output | Iteration Loop |
|-------|------------|-----------|------------|----------------|
| **Inbox** | `/ingest` | Raw signal | Structured signal file | — |
| **Discovery** | `/research`, `/hypothesis`, `/synthesize` | Signals | Committed hypothesis | ↔ PRD |
| **PRD** | `/PM` | Research | 4 documents | ↔ Discovery, Design |
| **Design** | `/design` | PRD, Design Brief | Design review | ↔ PRD, Prototype |
| **Prototype** | `/proto`, `/context-proto` | PRD, Design | Storybook stories | ↔ Design, Validate |
| **Validate** | `/validate`, `/iterate` | Prototype | Jury report | ↔ Prototype |
| **Tickets** | `/tickets` (pending) | Validated proto | Linear tickets | — |
| **Build** | Agent execution | Tickets | Deployed code | ↔ Alpha |
| **Alpha** | `/measure`, PostHog | Code | Alpha metrics | ↔ Build |
| **Beta** | PostHog | Alpha success | Beta metrics | ↔ Alpha |
| **GA** | PostHog | Beta success | Live dashboard | → Inbox (sub-features) |

---

## Related Documents

- [Product Vision](./company-context/product-vision.md)
- [Strategic Guardrails](./company-context/strategic-guardrails.md)
- [Personas](./company-context/personas.md)
- [Workspace Config](./workspace-config.json)
- [Initiative Template](./initiatives/_template/)
