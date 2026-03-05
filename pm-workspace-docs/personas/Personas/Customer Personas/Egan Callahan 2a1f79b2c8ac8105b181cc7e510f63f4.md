# Egan Callahan

AE Contact: Matt Bennett, Erika Vasquez
Communication Style: Technical/Detail-oriented
Company: Sendoso
Decision Authority: Influencer
Detected Role: Other
Email: egan.callahan@sendoso.com
Key Quotes: "I've built chatbots for our marketing team using our Gong data. I know it's very difficult." "We're passing a lot of deterministic things off to a probabilistic technology... there's a lot of deterministic stuff in there that we should just not be handing off to a probabilistic technology." "Filling Salesforce with AI slop is a concern for sure. Having human in loop, the ability to look at it, verify it, change it if they want to, and then push it is essential."
Last Analysis Date: November 6, 2025
Match Confidence: 7500%
Matched Persona: Odis (Operations)
New Traits Discovered: Has built custom AI solutions internally Extensive prior experience in CSM role Strong advocate for human-in-the-loop processes Researches competitive products Comfortable challenging vendors with technical questions
Observed Goals: Automate workflows, Improve system integration, Improve visibility, Scale operations
Observed Pain Points: Integration complexity, Integration complexity (Zoom/HubSpot), Manual CRM updates, Manual reporting burden, Tool integration challenges, Understanding integration dependencies
Persona: Odis (https://www.notion.so/Odis-27ff79b2c8ac8056b9ece0a780fbd900?pvs=21)
Recent Meeting Link: https://app.askelephant.ai/workspaces/wrks_01JN30KSYSBMDRRVA3F62N2GHW/engagements/ngmt_01K8XKGF6XMT1V1A03EWXSY5E1
Tools Mentioned: AskElephant, Gong, None, Notion, Salesforce, Slack
Traits That Don't Match: More skeptical and critical than typical operations persona Higher technical sophistication than expected Actively involved in product evaluation (usually more passive)
Traits That Match: Deep technical understanding of AI systems (vector stores, embeddings, chunking) Systems thinking and process-oriented Concerned with workflow efficiency and automation Risk-aware approach to technology adoption Experience with operations tools (Salesforce, Gong)
Validation Notes: Technical go-to-market engineer with deep understanding of AI/ML systems. Has experience building chatbots with Gong data. Highly concerned about data integrity and AI reliability. Acts as technical gatekeeper evaluating product capabilities before team rollout. Shows strong operational mindset focused on workflow efficiency and risk mitigation.
Validation Status: ✅ Strong Match (80-100%)

# Meeting History

- Meeting 1: November 4, 2025 (3:00 PM MST) - Workflow Session: AskElephant Salesforce Agent Beta Training

# Persona Evolution

**Current Assessment**: Odis (Primary) with Irina (Secondary) traits

**Persona Journey**:

- Meeting 1: Strong Odis presentation - demonstrated extensive workflow automation experience across multiple platforms over 18 months. Shows Implementation (Irina) characteristics when discussing specific onboarding workflow requirements and custom Salesforce object configuration.

**Why this classification**:
Egan exhibits classic Odis (RevOps/Operations) persona characteristics through his deep expertise in workflow builders, systems integration, and automation best practices. His opening statement, "I've been building workflows in just about every workflow builder for the past year and a half," immediately signals operational sophistication. However, he also demonstrates Irina (Implementation) traits through his hands-on work building specific customer onboarding workflows with scoring rubrics and custom Salesforce objects. He's not just strategizing - he's actively implementing technical solutions.

# Aggregated Behavioral Insights

**Consistent Patterns Across Meetings:**

- Highly technical and systems-oriented: Immediately asks about MCP servers, API architecture, and field-level Salesforce mechanics
- Efficiency and best-practices focused: Wants to understand "AskElephant specific stuff" and optimal approaches rather than generic workflow training
- Proactive problem-solver: Quickly identifies edge cases (duplicate accounts, custom object matching, stage-based triggers)
- Cost/resource conscious: Aware of token usage implications and API call overhead
- Integration-minded: Thinks in terms of webhooks, forms, Slack integrations, and human-in-the-loop workflows

**Communication Preferences:**

- Direct and technical: Appreciates skipping basics and diving into product-specific implementation details
- Collaborative learner: Offers to "outline a little workflow and send it" to help improve product
- Time-efficient: Values concise responses

# Strategic Engagement Playbook

**Current Stage**: New customer in onboarding/implementation phase

**What We've Learned Works:**

- Technical deep-dives resonate: Egan appreciates granular details about API names, field matching logic, and system architecture
- Show, don't tell: Demo-driven approach with real workflow examples
- Acknowledge limitations transparently: Appreciated honest assessment of what's not yet available
- Position as partnership: Collaborative feedback approach landed well

**What to Avoid:**

- Basic overviews: Egan explicitly stated he's experienced with workflow builders
- Assuming feature completeness: He appreciates knowing what's in beta
- Hand-holding: He's self-sufficient and technically capable

**Evolving Priorities:**

1. Current Priority: Implementing onboarding workflows with stage-based automation and custom Salesforce object integration
2. Secondary Priority: Understanding token/cost implications of complex workflows
3. Future Opportunity: Advanced integrations (Slack interactive workflows, webhook-based human-in-the-loop processes)

# Key Quotes Across All Meetings

**Meeting 1**: "I've been building workflows in just about every workflow builder, uh, for the past, like, year and a half. So I'm most interested in, like, yeah, AskElephant best practices."
Context: Establishes his expertise level and sets expectations for advanced technical content

**Meeting 1**: "We all know that Salesforce is a disaster. Opportunities are better. They're cleaner than accounts, but, like, if we're matching you know, trying to match to an account, like, what if there are duplicates?"
Context: Shows deep familiarity with real-world Salesforce challenges and data quality issues

**Meeting 1**: "I unfortunately know that one the hard way."
Context: When discussing API name requirements - indicates he's learned through hands-on experience

**Meeting 1**: "It feels token heavy... because it's, you know, it's what we're not seeing is, like, how much pulling from the API and what it all has to chunk through, and we have a stupid amount of Salesforce fields."
Context: Demonstrates awareness of technical architecture and performance implications

**Meeting 1**: "Make very good and specific prompts with very specific information is the key takeaway."
Context: His synthesis of the session - values clarity and specificity

# Relationship Intelligence

**Internal Champions:**

- Working directly with Matt Bennett (Solutions Engineer) on technical implementation
- Erika Vasquez serving as main point of contact

**Technical Environment:**

- Sendoso has complex Salesforce configuration with extensive custom fields
- Uses vector stores for transcript management
- Stage-stamping metadata on call records is important
- Heavy Salesforce customization including custom onboarding objects

**Decision Dynamics:**

- Authority level: Appears to have technical decision-making authority for workflow implementation
- Implementation autonomy: Building workflows himself rather than delegating
- Feedback influence: Product team wants his input on beta features

# Use Cases Being Explored

**Active Project: Onboarding Workflow Automation**

- Trigger: Salesforce field change on onboarding stage
- Goal: Analyze calls from specific stages to update custom object fields
- Challenges: Stage-stamping at time of call, custom object matching, field-based triggers
- Fields to update: Scoring rubric (picklists and open text fields across 4 stages)

**Technical Requirements Identified:**

1. Salesforce custom object interaction via API names
2. Account-to-custom-object field mapping
3. Stage-based call filtering and analysis
4. Aggregate insights from multiple stage-specific calls
5. Potentially: Slack interactive responses with webhook callbacks

# Next Steps & Recommendations

**Based on aggregate learnings:**

1. Follow up on feature request: Stage-stamping capability forwarded to product team
2. Offer workflow building support: May benefit from reference implementation
3. Monitor token usage concerns: Provide guidance on model selection
4. Enable advanced features: Ideal beta tester for advanced Salesforce automation

**Watch for:**

- Opportunity: Sophistication makes him ideal beta tester and case study
- Risk: Token costs could become concern with complex Salesforce environment
- Feature gap: Stage-stamping functionality important to use case

# Persona Flexibility Note

Egan exhibits Odis (Operations) as dominant type but shows Irina (Implementation) traits when diving into technical implementation. Strategic about process design but also hands-on with building and troubleshooting. Approach with operations/systems thinking but be ready to go deep into implementation details. Values efficiency, best practices, and technical precision.

**Technical Profile Summary:**

- Experience Level: Advanced (18+ months multi-platform workflow building)
- Tool Stack: Salesforce (heavy customization), vector stores, Gong, webhooks, Slack
- Learning Style: Demo-driven, technical deep-dives, learns from failures
- Communication: Direct, efficient, technically precise
- Value Drivers: Time savings, best practices, system reliability, cost efficiency

# Meeting History

- **November 6, 2025**: Feedback session - Implementation challenges and feature requests discussed

# Persona Validation Summary

**Match Confidence**: 75% match with Odis (Operations)

**Secondary Traits**: Shows 40% traits of Irina (Implementation) - technical depth and system understanding

**Classification Rationale**:

Egan exhibits classic operations persona traits with elevated technical sophistication. His role as "Go-to-Market Engineer" bridges technical implementation and operational processes. Primary concerns center on workflow reliability, data integrity, and team enablement - all core operations priorities. The technical depth (understanding vector stores, embeddings) and prior CSM experience make him an unusually sophisticated operations stakeholder.

# Behavioral Pattern Analysis

**Communication Style**:

- Direct and candid with feedback
- Technical precision in questions
- Solution-oriented despite concerns
- References specific product comparisons (Momentum.al)

**Decision-Making Approach**:

- Evidence-based and thorough
- Risk assessment before adoption
- Seeks proof of concept before expansion
- Values human control over automation

# Aggregated Insights

**Pain Points (November 6, 2025 Meeting)**:

1. Chat context limitations - cannot access Gong calls properly
2. Salesforce authentication failures
3. No human validation before CRM writes
4. Meeting prep feature inconsistent results
5. Unclear what data has been imported
6. Concerns about AI probabilistic nature for deterministic tasks

**Goals (November 6, 2025 Meeting)**:

1. Zero in on specific use case before team expansion
2. Implement human-in-the-loop CRM approval workflow
3. Enable manager visibility across team calls
4. Automate contact role tagging in Salesforce
5. Extract and track use case data from customer calls

**Tools Ecosystem**:

- CRM: Salesforce (experiencing authentication issues)
- Call Recording: Gong (integration challenges)
- Collaboration: Slack, Notion
- Evaluating: Momentum.al as competitive benchmark

# Strategic Engagement Notes

**What Works**:

- Acknowledge technical concerns directly
- Provide specific technical explanations
- Offer workarounds and alternatives
- Give early access to beta features (internal search)
- Reference how other technical customers solved similar issues

**What Doesn't Work**:

- Avoiding technical questions or glossing over limitations
- Pushing for expansion without addressing core issues
- Overpromising AI capabilities
- Ignoring data integrity concerns

**Recommended Next Steps**:

1. Address authentication and integration issues (table stakes)
2. Implement human-in-the-loop workflow as requested
3. Provide beta access to internal search feature
4. Build one solid use case before discussing expansion
5. Regular technical check-ins with product team

# Key Quotes from November 6, 2025 Meeting

**Technical Understanding**:

"Are you taking the transcripts and doing chunking and embedding and putting them in a vector store? Or are you just passing all of the text from the transcript?"

**AI Reliability Concerns**:

"We're passing a lot of deterministic things off to a probabilistic technology. And when it comes to our Salesforce... is it grabbing the right account, the right objects?"

**Data Quality Priority**:

"Filling Salesforce with AI slop is a concern for sure. Having human in loop, the ability to look at it, verify it, change it if they want to, and then push it is essential."

**Prior Experience Context**:

"I've built chatbots for our marketing team using our Gong data. I know it's very difficult."

**CSM Background**:

"I've been in the CSM game long enough to know how hard it is to remember people's names."

**Competitive Awareness**:

"You guys have heard of momentum.al. Right? You should definitely look into them for sure."

**Beta Feature Interest**:

"Yeah. I love it. And if we can get in beta, I would definitely use the crap out of it."