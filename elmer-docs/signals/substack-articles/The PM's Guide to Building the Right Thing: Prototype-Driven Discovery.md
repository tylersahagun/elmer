https://samho.substack.com/p/the-pms-guide-to-building-the-right?__readwiseLocation=

I Watched Teams Waste Months on Rework. Then I Discovered Prototype-Driven Discovery.
I watched an engineering team spend two weeks building a feature. Clean code. Well-tested. Shipped on time.

Then I watched the PM realize the core user flow didn’t work. The mockups looked perfect. The prototype (built in production code) proved they’d designed the wrong thing.

Thanks for reading Sam’s Substack! Subscribe for free to receive new posts and support my work.

Two weeks of engineering effort. Gone. Because discovery happened too late.

After three months of presenting to product teams, I can predict the problem within five minutes:

“We spend 6 weeks on discovery and design. Engineering starts building. Week 3, we realize the flows don’t work. Back to the drawing board.”

The pain point isn’t slow engineering. It’s slow discovery—and discovering problems only after engineering has already started.

This is exactly what Melissa Perri describes as the “build trap” in her work on product thinking—teams optimizing for output (features shipped) instead of outcomes (problems solved). Fast prototyping lets you discover outcomes before committing engineering resources.

Here’s what changed for the teams that solved this:

They stopped using engineering cycles to discover what doesn’t work. Instead, they compressed 6 weeks of iteration and alignment down to 1 week—using AI to generate working prototypes in hours, not weeks. They validate with stakeholders before a single line of production code gets written.

This article breaks down the three stages of AI-enabled discovery (Crawl → Walk → Run), shows you the exact workflow that compresses discovery while avoiding wasted engineering effort, and previews the Agentic AI PM Co-Pilot I’m building to automate the entire workflow.

Don’t Wait for Engineering to Adopt AI—Start with Discovery
Before we go further, let’s address the most common blocker I hear from PMs.

“We’re exploring AI for our engineering workflows, but there’s change management, prerequisites, codebase architecture changes. It’ll take months.”

Here’s what most PMs miss: You don’t need to wait.

While AI-enabled engineering has prerequisites (tooling, infrastructure, team buy-in), AI-enabled discovery doesn’t. You can start prototyping today. No engineering involvement needed.

The opportunity: Compress discovery and planning independently. Validate ideas with working prototypes before engineering starts. Then hand off to whatever system they’re using—Jira, Linear, traditional workflows.

Both can improve in parallel. But as a PM, you’re not blocked. You can improve discovery immediately while engineering figures out their AI adoption path.

Context: This aligns with what Marty Cagan and Chris Jones wrote at SVPG about the importance of continuous discovery—except now AI enables you to compress weeks of iteration into days through instant prototyping.




Old model (iterative but slow—discovery happens too late):

Week 1-3: PM writes PRD, Designer creates mockups, Alignment meetings

Week 4: Engineering starts building iteratively

Week 5: First working version → PM realizes flow doesn’t work

Week 6-7: Back-and-forth on fixes (latency in communication)

Week 8: Ship something → User feedback confirms original concerns

Week 9-10: Engineering backlog fills with fixes, but too slow to iterate

Problem: Discover issues after production code is written. Communication overhead and engineering backlog make fixes expensive and slow. Design decisions hardcoded in ways that are hard to fix.

New model (compress discovery, iterate before engineering):

Day 1: PM conversation → AI generates working prototype

Day 2-3: Stakeholders interact with functional software (discover flow issues immediately)

Day 4-5: Iterate on prototype (fast, no engineering backlog)

Week 2: Validated prototype + detailed spec → Hand off to engineering

Engineering builds what’s already been validated with users

Launch → Feedback is refinement, not “we built the wrong thing”

Breakthrough: Discover and fix issues when iteration is cheap (prototype stage), not expensive (production code stage)

We’re not optimizing the SDLC. We’re using AI to compress discovery so we catch problems before they’re hard to fix.

The Three Stages: Crawl, Walk, Run
After talking to 30+ product teams experimenting with AI, I’ve mapped three distinct maturity stages. Most teams are stuck at Crawl or early Walk.

This framework builds on GitHub’s research on AI-assisted development which found that developers using AI copilots see biggest gains not from code generation alone, but from combining multiple AI workflows. The same applies to product development.

Stage 1: Crawl - Copy/Paste AI
What it looks like:

PM opens ChatGPT, asks for PRD outline

Copies output into Google Doc

Asks for JIRA ticket format

Copies output into JIRA

Repeats for every artifact

Discovery compression: Minimal (maybe 1-2 days saved on writing) Limitation: Human is the integration layer, still no prototype

The bottleneck: You’re still doing all the translation work. AI generates text, but YOU copy/paste between tools, YOU format for each system, YOU maintain consistency.

Critically: You still don’t have a working prototype. Engineers still start blind.

Every PM I talk to is doing this. It’s better than nothing, but it doesn’t compress discovery.

Stage 2: Walk - AI-Generated Artifacts → Tool Import
What it looks like:

PM uses LLMs to create prompts that generate tool-specific output

ChatGPT generates PRD → exports to Google Docs

ChatGPT generates designs → imports to Magic Patterns

AI generates working prototype → deploys on Replit

AI generates JIRA tickets → bulk imports to JIRA

Discovery compression: 6 weeks → 1 week Limitation: Still manual handoffs between AI and tools

The breakthrough: You’re no longer formatting manually. AI knows each tool’s format and generates ready-to-import artifacts.

But more importantly: You now have a working prototype in hours, not weeks.

This addresses what Julie Zhuo calls the “build trap”—building things before validating them. With AI prototyping, validation comes first, building comes second.

Example workflow:

ChatGPT generates PRD from conversation

Magic Patterns creates design variants from PRD

Replit builds functional prototype in 2 hours

Stakeholders interact with working software

Iterate on prototype until it’s right

THEN hand off to engineering with working prototype + detailed spec

This is where Turing was: Compress discovery before engineering starts. Engineers receive working prototype + JIRA tickets, build what customers actually want.

Key advantage: Works with your existing systems. You don’t need AI-native code infrastructure. Keep using Jira, Linear, GitHub—whatever you have today. The prototype validates the direction, then your existing engineering workflow takes over.

But they still had humans triggering each step between tools.

Stage 3: Run - Agentic AI PM Co-Pilot
What it looks like:

PM has conversation with AI agent

Agent automatically:

Generates requirements

Creates design variants

Builds prototype

Iterates based on feedback

Generates production-ready JIRA tickets

Updates documentation as prototype evolves

Manages handoff to engineering

Discovery compression: 6 weeks → 1 week (fully automated) Breakthrough: Agent manages the entire discovery-to-handoff workflow

This is what I’m building.

The Agentic AI PM Co-Pilot doesn’t just generate artifacts. It orchestrates the entire discovery flow from idea to working prototype to production handoff, handling all the tool integrations, maintaining consistency, and learning from feedback loops.

Prerequisites: Unlike Walk stage, Run stage eventually enables AI-native code development—but that requires specific codebase architecture and infrastructure. Most teams aren’t ready for that yet.

For now: Walk stage is the sweet spot. Accessible to any team, works with existing systems, delivers immediate discovery compression.

The Turing Case Study: How Walk Stage Compresses Discovery & Avoids Waste
I led this transformation at Turing, working directly with the product and engineering teams to implement AI-enabled discovery.

The breakthrough came when we shifted from discovering problems during engineering sprints to discovering them in prototypes—when fixing them takes hours, not weeks.

One of my designers captured it perfectly: “Having the PM just show me the prototype he built saved two weeks of back-and-forth. I understood the problem immediately and could jump straight to production-ready design.”

Here’s the specific workflow we implemented:




The Problem (Traditional Process):







Discovery & Planning - 6 weeks:

User interviews → mockups → feedback cycles

Back-and-forth on what to build

Alignment meetings on static mockups

No working prototype to validate ideas

Development Phase - 4 weeks:

Engineers start building from PRD + static mockups

Discover gaps, ask clarifying questions

Build something, realize it doesn’t work

Rework cycles consume time

Testing/UAT - 2 weeks:

QA finds issues with core flows

“This isn’t what we meant”

Rework - 2 weeks:

2 cycles of rebuilding

Weeks of engineering effort wasted

Shipped product different than envisioned

Total: 14 weeks (6 weeks wasted on rework and misalignment)

The AI-Enabled Solution (Walk Stage):

They implemented a 5-step workflow that compresses discovery and validates BEFORE engineering starts:

Step 1: Voice & Transcript

Meeting transcripts captured automatically

AI extracts key decisions and requirements

No more manual note-taking

Step 2: AI PRD Generation

ChatGPT synthesizes insights into structured PRD

30 minutes vs weeks of writing

PM guides and edits, doesn’t write from scratch

Step 3: Design Variant Generation

Magic Patterns creates 3-5 UI approaches from PRD

Stakeholders see options immediately

Designer refines selected variant

Step 4: Functional Prototype (The Game-Changer)

Replit builds working prototype in 2 hours

Not static mockups—clickable, functional UI

Stakeholders interact with real software

Discover what works/doesn’t work BEFORE engineering

Iterate on prototype until it’s right

Step 5: Production Handoff

AI generates detailed JIRA tickets from validated prototype

Engineers receive working prototype + detailed spec

They build what’s already been validated with customers

The Results:

Discovery & Validation - 1 week:

Prototype generated in hours, not weeks

Stakeholder alignment on working software

Iterate until validated

Compress 6 weeks → 1 week

Development Phase - Faster & Cleaner:

Engineers build from validated prototype

No “wait, this doesn’t work” surprises

No rework cycles from misalignment

Build the right thing, first time

The breakthrough: Engineering effort focused on production implementation, not discovering what doesn’t work.

Why PRDs Aren’t Dead (But Reading Them Is)
Here’s the counter-intuitive insight from Turing: They’re writing MORE PRDs, not fewer.

When I mentioned this to a product leader last week, she laughed. “So we still write documentation nobody reads?”

“Exactly,” I said. “Except now the AI reads it. And proves whether it’s right—in hours.”

The PRD is now fuel for AI prototype generation, not documentation for humans to read.




Old paradigm:

PM writes PRD for engineers to read

Engineers don’t read it (too long, outdated, no time)

Start building, discover gaps, ask questions

Weeks lost to misalignment and rework

New paradigm:

AI writes PRD from PM conversation

PRD feeds AI to generate working prototype

Prototype validates the PRD (discover gaps immediately)

Iterate on prototype until right

Engineers build from validated prototype + iterated spec

The PRD becomes the input for instant prototyping, not the artifact engineers struggle to interpret.

The bridge to production: Today, tools like Replit create functional prototypes. Engineering takes that validated prototype and detailed spec (already iterated) to build production-ready code. The gap between prototype and production is shrinking every month.

Further reading: Itamar Gilad has written extensively about the risks of AI-generated artifacts without thinking in “On GenML, Artifacts, and Product Management“—the prototype-driven approach I’m describing here addresses his concerns by using AI to enable faster validation, not replace thinking.

What I Learned Talking to 30+ Product Teams
Over the past six months, I’ve had versions of this conversation with product leaders at companies from 50 to 3000 people.

The conversation usually starts the same way. I ask: “How long does it take from idea to shipped feature?”

“About 8-10 weeks,” they say. Then they pause. “But honestly, 2-3 weeks of that is rework because we built the wrong thing.”

Here are the patterns:

The teams stuck at Crawl:

Using ChatGPT for brainstorming, but manual everything else

Still no working prototypes (engineers still start blind)

“We waste weeks building the wrong thing”

Biggest blocker: Don’t know how to get from AI text to working prototype

The teams reaching Walk:

Built prompt chains to generate prototypes

Massive time savings on discovery (weeks → days)

Still frustrated by manual handoffs between tools

But they’re avoiding wasted engineering effort

The insight everyone shares:

“We need to validate BEFORE engineering starts”

“I don’t want to waste engineering cycles on rework”

“Can’t the AI just manage the whole discovery workflow?”

That’s why I’m building the Agentic AI PM Co-Pilot—to fully automate discovery-to-handoff.

The 5 AI Tools in the Turing Stack (Walk Stage)
If you want to compress discovery and avoid wasted engineering effort today, here’s the exact stack:

1. ChatGPT-4 (Requirements Layer)

Custom GPTs for PRD generation from conversations

Prompt: “Generate a PRD from these meeting notes in [your company’s format]”

Pro tip: Ask ChatGPT to write better prompts for you

2. Magic Patterns (Design Layer)

Input: PRD or text description

Output: 3-5 UI variants with different approaches

Designers refine, don’t create from scratch

Fast iteration on design before prototype




3. Replit (Prototype Layer - THE KEY)

Input: PRD + selected design variant

Output: Functional prototype with working UI in 2 hours

This is where discovery compression happens

Stakeholders interact with real software

Iterate until validated

Read more: Teresa Torres has written extensively about continuous discovery habits—Replit makes her weekly customer touchpoints possible by giving you working prototypes to test, not static wireframes




4. JIRA (Production Handoff Layer)

ChatGPT generates tickets from validated prototype:

User story format

Acceptance criteria

Story point estimates

Dependencies

Engineers receive clear spec + working reference

No more “wait, what did you mean?” cycles

5. Google Docs (Documentation Layer)

ChatGPT generates spec in Docs format

Updates as prototype evolves

Engineers can reference if needed (but prototype is truth)

The missing piece: These tools don’t talk to each other. YOU manually trigger each step and copy between tools.

That’s the Walk→Run gap. That’s what the Agentic AI PM Co-Pilot automates.

Preview: The Agentic AI PM Co-Pilot (Run Stage)
I’m building this because I’m tired of being the integration layer—and because discovery compression is the unlock for avoiding wasted engineering effort.

The vision:

You say: “I need a prototype for a user interview scoring system.”

The agent:

Asks clarifying questions (async, via voice or text)

Generates structured requirements (pulls from your past work for context)

Creates 3 design variants (using your company’s design system)

Builds functional prototype (deployed URL you can share immediately)

Manages iteration cycles (stakeholder feedback → updated prototype)

Generates production-ready JIRA tickets (from validated prototype)

Manages handoff to engineering (working prototype + detailed spec)

You review at each stage. The agent does the execution.

The breakthrough: Full discovery-to-handoff automation with context memory.

The agent knows:

Your company’s PRD format

Your design system

Your JIRA/Linear workflow

Your stakeholder preferences

What worked last time

It’s not just generating artifacts. It’s compressing discovery from weeks to days while ensuring engineers build the right thing.

Target: Same 6-week → 1-week discovery compression as Turing, but fully automated.

The 4-Week Adoption Playbook
Want to compress discovery and avoid wasted engineering effort? Here’s the path from Crawl to Walk in 30 days.

No infrastructure changes needed. Keep your existing Jira, Linear, GitHub workflows. This works no matter what stage you’re at.

Week 1: Start with Prototype Generation

Focus: Get from idea to working prototype

Tool: ChatGPT (PRD) → Replit (prototype)

Pick ONE simple feature to prototype

Goal: See working UI in hours, not weeks

Why this matters: As Gibson Biddle writes, the best product strategy is one you can test quickly—prototyping is how you test strategy, not just features

Week 2: Add Design Iteration

Add: Magic Patterns for design variants

Workflow: Idea → PRD → 3 design options → prototype

Test with real stakeholder feedback

Goal: Validate design before engineering

Week 3: Add Production Handoff

Add: JIRA ticket generation from validated prototype

Workflow ends with: working prototype + detailed tickets

Hand off to engineering team

Goal: Engineers build from validated prototype

Week 4: Measure Discovery Compression

Track: How long did discovery take? (should be days, not weeks)

Track: How many engineering rework cycles? (should be near zero)

Document what worked

Goal: Prove discovery compression to leadership

Month 2: Expand to More Features

Apply workflow to 3-5 more features

Build team muscle memory

Refine prompt chains

Months 3-6: Reach Walk Stage

Discovery compressed for most features

Engineering building right things first time

Team fluent with prompt chains

Month 7+: Prepare for Run Stage

Document remaining manual steps

Ready for Agentic AI PM Co-Pilot when available

The Future: From SaaS to Bespoke AI-Generated Software
Here’s the paradigm shift Turing helped me see:

The SaaS era (2010-2023):

Standardized solutions

Configure existing software

Vendor lock-in

Change requests take quarters

The AI era (2024+):

Bespoke software generated on-demand

Software evolves with your business in real-time

AI generates new features in hours

The product IS the prototype

We’re moving from “configure SaaS” to “generate bespoke software.”

PMs who master this become 4x force multipliers. The ones who don’t become bottlenecks.

Important caveat: Itamar Gilad warns in “What Does Generative AI Mean For Product Development?“ about the risk of AI accelerating feature factories—producing more junk features faster. The antidote: use AI for discovery compression (validate ideas faster), not just execution acceleration (ship more features).

Your Next Move
The teams compressing discovery aren’t waiting for perfect tools. They’re building working prototypes TODAY with ChatGPT + Replit.

The teams wasting engineering effort are still writing docs and hoping for the best.

Don’t be the second group.

Here’s what to do Monday morning:

Pick ONE feature you’re about to build

Open ChatGPT → Generate PRD

Open Replit → Build working prototype from PRD

Share with stakeholders → Get feedback on working software

Iterate until validated → THEN hand off to engineering

If you compress discovery on that ONE feature, do it again for the next.

Do this 5-7 times, and you’re at Walk stage.

That’s where discovery compression happens. That’s where you avoid wasted engineering effort.

And if you want to skip straight to Run stage?

I’m building the Agentic AI PM Co-Pilot to fully automate discovery-to-handoff. It’s not ready yet, but it will be.

In the meantime, start walking. The teams that master prototype-driven discovery today will be the first to adopt full agentic workflows.

The question isn’t whether AI will transform product development. The question is whether you’ll compress discovery now—or keep wasting engineering cycles.

