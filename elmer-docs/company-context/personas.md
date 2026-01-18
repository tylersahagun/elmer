# User Personas

> These personas guide product decisions, prototype design, and user validation for elmer.

---

## How to Use Personas

When working on initiatives:
1. **Research**: Interview users matching these personas
2. **PRD**: Specify which personas the feature serves
3. **Prototype**: Design for the persona's needs and fears
4. **Validate**: Run jury evaluations with synthetic versions of these personas

---

## Primary Personas

### The Solo PM (Maya)

**Role:** Product Manager at a startup (50-200 employees), often the only PM or on a team of 2-3

#### Context
- **Organization:** Series A-C startup, moving fast but burning engineering cycles on rework
- **Team Size:** Works with 2-3 engineering squads, no dedicated designer or limited design support
- **Tools Used:** Linear, Figma (basic), Notion, Slack, GitHub
- **Reporting To:** Head of Product or directly to CEO/Founder

#### Goals
What they're trying to achieve:
- Validate product ideas before engineering starts building
- Reduce the "we built the wrong thing" rework cycles
- Get stakeholder alignment on working software, not static mockups
- Ship features that actually move metrics

#### Pain Points
What frustrates them today:
- 6-week discovery cycles before engineering can start
- PRDs nobody reads; engineers start building and ask "what did you mean?"
- Back-and-forth with designers on mockups that don't work when built
- No time to build prototypes; depends on engineering for "proof of concepts"
- Metrics show features aren't being used after all that effort

#### Fears
What they worry about with new tools:
- "Another tool that adds process instead of removing it"
- "AI will generate garbage and I'll spend more time editing than writing"
- "My stakeholders won't trust AI-generated artifacts"
- "This will make me look lazy or replaceable"

#### Success Definition
They know elmer is working when:
- They can show stakeholders a working prototype within 48 hours of an idea
- Engineering starts building from validated prototypes, not ambiguous PRDs
- Rework cycles drop significantly
- They're spending time on strategy, not document formatting

#### Representative Quote
> "I spend half my week writing PRDs that nobody reads, then the other half answering questions because the PRD didn't actually clarify anything. I just want engineers to see what I mean."

---

### The Engineering Lead (Raj)

**Role:** Engineering Manager or Tech Lead, owns a squad of 4-8 engineers

#### Context
- **Organization:** Same startup as Maya, or mid-sized company (200-500)
- **Team Size:** Leads 4-8 engineers across 1-2 squads
- **Tools Used:** GitHub, Linear/Jira, VSCode, Slack
- **Reporting To:** VP Engineering or CTO

#### Goals
- Get clear specs so the team doesn't waste cycles on rework
- Understand what "done" looks like before starting
- Have a working reference (not just words) to build against
- Ship quality code, not throwaway prototypes that get rebuilt

#### Pain Points
- PRDs are vague; half the sprint is clarifying requirements
- Mockups look nice but don't account for edge cases or data
- "We built exactly what the PRD said" but PM says it's wrong
- Prototype code is trash; have to rewrite everything anyway
- No visibility into what PM is planning next

#### Fears
- "AI-generated tickets will be even vaguer than human PRDs"
- "Prototypes will set unrealistic expectations with stakeholders"
- "My team will be blamed when the 'validated' prototype doesn't match production"
- "Another tool that creates busywork for engineers"

#### Success Definition
They know elmer is working when:
- Tickets come with working prototypes they can reference
- Edge cases are already discovered in prototype phase
- Less time spent in clarification meetings
- Features ship closer to the validated prototype

#### Representative Quote
> "Show me a working prototype and I can build it. Show me a 20-page PRD and we'll spend two sprints figuring out what it actually means."

---

## Secondary Personas

### The Founder/CEO (Alex)

**Role:** Founder or CEO at an early-stage startup (Seed to Series B)

Brief description: Wears multiple hats, often acting as de facto Head of Product. Needs visibility into what's being built and why, without getting lost in details.

**Key Needs:**
- See the product pipeline at a glance (what's in discovery, prototype, build, released)
- Understand if released features are hitting metrics
- Know when human intervention is needed vs. when AI is handling it
- Share prototype links with investors or advisors

**Key Fears:**
- "I'll lose touch with what the team is actually building"
- "AI will make decisions that don't align with our vision"

---

### The Design-Savvy PM (Jordan)

**Role:** PM with strong design background, wants more control over prototypes

Brief description: Comfortable in Figma, wants AI to handle the tedious parts but retain creative control over the final prototype.

**Key Needs:**
- AI generates design variants; Jordan picks and refines
- Export prototype to Figma for detailed polish
- Maintain design system consistency across prototypes

**Key Fears:**
- "AI prototypes will look generic and not match our brand"
- "I'll lose creative control if AI handles design"

---

## Anti-Personas

### The Enterprise Process Owner (Patricia)

**Why not:** Patricia works at a Fortune 500 with rigid stage-gate processes, extensive compliance requirements, and 6-month planning cycles. She needs approval workflows, audit trails, and integration with legacy systems.

elmer is not built for this. We embrace iteration and minimal friction. Enterprise complexity theater is anti-vision.

---

### The "No AI" Skeptic (Tom)

**Why not:** Tom fundamentally distrusts AI-generated content and believes everything should be hand-crafted by humans. He'll reject AI outputs on principle, regardless of quality.

elmer requires buy-in that AI can accelerate discovery. Users who won't trust AI-generated PRDs or prototypes won't see value.

---

## Persona Matrix

| Persona | Primary Need | Biggest Fear | Trust Level | Frequency |
|---------|-------------|--------------|-------------|-----------|
| Maya (Solo PM) | Validate faster, reduce rework | "More process, not less" | Medium | Daily |
| Raj (Eng Lead) | Clear specs, working references | "Vague tickets, blame game" | Low | Weekly |
| Alex (Founder) | Pipeline visibility, metric ties | "Losing touch with product" | High | Weekly |
| Jordan (Design PM) | Creative control + AI speed | "Generic, off-brand prototypes" | Medium | Daily |

---

## Persona Evolution

Track how your understanding of personas changes:

| Date | Persona | Learning | Source |
|------|---------|----------|--------|
| 2026-01-18 | Maya | Solo PMs at startups are primary; they have the most pain | Voice memo analysis |
| 2026-01-18 | Raj | Eng leads want working references, not better docs | Voice memo analysis |
| 2026-01-18 | Patricia | Enterprise is explicitly anti-persona; avoid complexity theater | Voice memo analysis |
