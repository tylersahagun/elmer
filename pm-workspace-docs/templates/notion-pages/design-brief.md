# Design Brief Generator

> **Output:** A complete design brief ready for Skylar or designer review.
> **Owner:** Tyler / Skylar

## Prompt

You are generating a Design Brief for **[FEATURE NAME]** at AskElephant.

### Step 1: Gather context from all sources

**PRD** — Read the requirements:

- Read `pm-workspace-docs/initiatives/active/[initiative]/prd.md` for user stories, personas, and requirements
- Note the E2E experience section for the expected user journey

**GitHub (elephant-ai repo)** — Understand current UI:

- Search `elephant-ai/apps/web/src/components/` for existing components in the feature area
- Check `elephant-ai/apps/web/src/routes/` for the current page structure and navigation
- Look at the design system components in use (shadcn, custom components)
- Read existing Storybook stories for related components if they exist

**Figma** — Check existing designs:

- Search Figma for existing designs, explorations, or design system components related to this feature
- Note existing patterns, color usage, component library elements

**Linear** — Design-specific context:

- Search for design-related issues, UX feedback, or accessibility requirements
- Check for any mockup links or design discussion comments

**Competitive Landscape** — Check for competitive intelligence:

- Read `pm-workspace-docs/initiatives/active/[initiative]/competitive-landscape.md` if it exists
- Extract the "Design Vocabulary" section (patterns to adopt, reject, leapfrog)
- Note the "UX Pattern Inventory" for how competitors handle relevant flows
- Reference the "Visual Reference Gallery" for competitor design patterns
- If no competitive landscape exists and the feature area has active competitors, suggest running `/landscape [name]` first

**Transcripts & Signals:**

- Search transcripts for UX feedback, usability complaints, or design preferences mentioned by customers
- Note any competitive references customers have made ("I wish it worked like [X tool]")
- Check research.md for "Competitive Signals" section if present

**PM Workspace:**

- Read `pm-workspace-docs/company-context/storybook-guide.md` for component conventions
- Check for any existing prototype notes in the initiative folder

### Step 2: Write the design brief

Write for a designer audience. Focus on user outcomes, not pixel specifications. Leave room for design creativity.

**Required sections:**

1. **Context** — Link to PRD, what we're designing, target personas.

2. **Design Goals** — 3-4 goals tied to user outcomes. E.g., "User can configure in under 2 minutes", "Zero-training required", "Feels reliable and transparent about AI decisions". Source from PRD user stories and customer feedback.

3. **User Flow** — ASCII flow diagram showing the step-by-step journey. Source from PRD E2E experience. Include entry point, core interactions, and exit/next actions.

4. **Key Screens / States** — For each state, describe layout, key elements, and data shown:
   - Default State
   - Loading State (especially for AI-powered features)
   - Success State
   - Error State (messaging, recovery options)
   - Empty State (onboarding guidance)
   - Edge Cases
     Source error states from Linear bug reports and customer complaints.

5. **Constraints** — Technical (API limitations, existing architecture), design system (must-use components, new patterns needed), accessibility (WCAG), mobile considerations. Source from eng spec and codebase analysis.

6. **References & Competitive Context** — Expanded competitive intelligence section:

   **Competitive Landscape Link** — Link to `competitive-landscape.md` if it exists for this initiative.

   **Patterns to Adopt** — Design patterns from the competitive landscape that are becoming user expectations. These are table-stakes patterns we should match or exceed. Source from `competitive-landscape.md` Design Vocabulary section.

   **Patterns to Reject** — Competitor approaches that conflict with AskElephant's values (trust, anti-surveillance, augmentation over replacement). Explain why each is rejected. Source from strategic guardrails and competitive landscape.

   **Internal Patterns** — Similar features within AskElephant that should inform the design. Include component references and Storybook story links.

   **Design Inspiration** — External design references, Dribbble shots, or exemplary product UX. Include links.

   **Visual Directions Link** — After `/visual-design` runs, link to `visual-directions.md` here. This connects the design brief to the validated visual mockups.

7. **Figma Link** — Placeholder for the Figma file link.

**Footer:** `_Owner: Tyler / Skylar_ / _Last updated: [date]_`
