# Brainstorm Board Generator

Generate visual brainstorming prompts for an initiative. Outputs two prompt styles for manual use in NanoBanana or other image generation tools.

## How to Use

1. Mention the initiative name or provide context
2. Optionally specify which aspect to focus on (research findings, PRD summary, decisions, etc.)

## Workflow

### Step 1: Gather Content

Read the relevant initiative documents:
- `@elmer-docs/initiatives/[name]/research.md` - for raw findings
- `@elmer-docs/initiatives/[name]/prd.md` - for structured requirements

### Step 2: Extract Key Elements

From the documents, extract:

**CORE CONCEPT:**
- The single most important insight or goal
- Should be one sentence, action-oriented

**IDEAS (3-5 items):**
- Core solution components
- Key features/capabilities
- Technical approaches
- Process improvements

**QUESTIONS (6-10 items):**
- Mark resolved questions with ✓
- Mark open questions with ?
- Include both strategic and tactical questions

**METRICS (if applicable):**
- Before → After improvements
- Key success indicators

**NEXT STEPS:**
- 2-3 key action items

### Step 3: Generate Both Prompts

Output BOTH prompts below, filled in with the extracted content. Present them in copy-paste ready format.

---

## Prompt 1: Billboard Style

A structured whiteboard layout with clear sections.

~~~
A professional whiteboard-style brainstorming board titled "[INITIATIVE NAME] #BRAINSTORM" with a hand-drawn sketched aesthetic on a warm cream background.

HEADER:
- Large bold title: "[INITIATIVE NAME] #BRAINSTORM"
- Goal: "GOAL: [One-line objective from PRD]"
- Central highlighted box with star accent: "CORE CONCEPT: [Key insight - what's the main thing we're trying to achieve?]"

LEFT SECTION - "IDEAS" (yellow rectangular header):
1. [IDEA 1 NAME] - Icon: [icon] - "[2-3 key points]"
2. [IDEA 2 NAME] - Icon: [icon] - "[2-3 key points]"
3. [IDEA 3 NAME] - Icon: [icon] - "[2-3 key points]"
4. [IDEA 4 NAME] - Icon: [icon] - "[2-3 key points]"
5. [IDEA 5 NAME] - Icon: [icon] - "[2-3 key points]"

RIGHT SECTION - "QUESTIONS" (red rectangular header):
✓ [ANSWERED QUESTION 1]?
✓ [ANSWERED QUESTION 2]?
? [OPEN QUESTION 1]?
? [OPEN QUESTION 2]?
? [OPEN QUESTION 3]?

METRICS BOX with stopwatch icon:
- "[Metric 1]: [Current] → [Target]"
- "[Metric 2]: [Current] → [Target]"

BOTTOM:
"NEXT STEPS: [2-3 key action items]"

STYLE: Hand-drawn professional whiteboard aesthetic, blue/teal icons, orange/yellow accent stars, arrows connecting ideas to core concept, checkmarks in green and question marks in orange, sketched drop shadows, warm cream background, slight paper texture, neat handwritten font style
~~~

---

## Prompt 2: Mind Map Style

An organic, radial layout centered on the core concept.

~~~
A professional mind map illustration titled "[INITIATIVE NAME]" with a creative hand-drawn aesthetic on a light gray textured paper background.

CENTER:
- Large central bubble/node: "[CORE CONCEPT - one sentence]"
- Emphasized with bold outline and subtle glow/highlight

MAIN BRANCHES (radiating outward, each a different color):

BRANCH 1 - "SOLUTION" (blue):
- [IDEA 1] with small icon
  - Sub-node: "[Key detail]"
- [IDEA 2] with small icon
  - Sub-node: "[Key detail]"
- [IDEA 3] with small icon

BRANCH 2 - "APPROACH" (green):
- [IDEA 4] with small icon
  - Sub-node: "[Key detail]"
- [IDEA 5] with small icon

BRANCH 3 - "RESOLVED ✓" (teal):
- [ANSWERED QUESTION 1]
- [ANSWERED QUESTION 2]
- [ANSWERED QUESTION 3]

BRANCH 4 - "OPEN ?" (orange):
- [OPEN QUESTION 1]
- [OPEN QUESTION 2]
- [OPEN QUESTION 3]

BRANCH 5 - "METRICS" (purple):
- [Metric 1]: [Current] → [Target]
- [Metric 2]: [Current] → [Target]

CORNER CALLOUT:
"NEXT: [Primary action item]"

STYLE: Organic flowing branches, hand-drawn line art, colorful but professional palette, small doodle icons at each node, curved connecting lines, subtle shadows, slight paper grain texture, balanced radial composition
~~~

---

## Icon Suggestions by Topic

| Topic | Icon |
|-------|------|
| Architecture/Framework | gear/cogs |
| Testing/POC | beaker/flask |
| Documentation | book/clipboard |
| Process/Workflow | flow chart arrows |
| Integration | puzzle pieces |
| Security/Privacy | lock/shield |
| Performance | speedometer |
| User/Persona | person silhouette |
| Data/Analytics | chart/graph |
| Communication | speech bubble |
| Time/Speed | stopwatch/clock |
| Money/Pricing | dollar sign |
| Decision | fork in road |
| Validation | checkmark badge |

---

## Output Format

After extracting content, output:

1. **Summary table** of extracted elements
2. **Billboard Prompt** - copy-paste ready for NanoBanana
3. **Mind Map Prompt** - copy-paste ready for NanoBanana

---

## Related Commands

- `/pm` - Full PM workflow
- `/research` - Research analysis
- `/proto` - Prototype builder
