# Engineer Profile Command

Generate a comprehensive personality assessment and AskElephant impact analysis for any engineer on the team. Combines Slack communication patterns, meeting transcript mentions, Linear issue history, and GitHub PR data into a single profile document.

## Usage

```
/engineer-profile [name]           # Full profile (personality + impact)
/engineer-profile [name] --impact  # Impact analysis only (skip personality)
/engineer-profile [name] --personality  # Personality assessment only (skip impact)
/engineer-profile --all            # Run for ALL engineers (sequential)
```

## Target Engineers

Resolve from `pm-workspace-docs/company-context/org-chart.md` under **Engineering, Product, and Design > Team (reports to Bryan Lund)**:

| Name            | Slack ID      | Linear (look up via API)               |
| --------------- | ------------- | -------------------------------------- |
| Dylan Shallow   | `U08L75ZGCV8` | Look up via `LINEAR_LIST_LINEAR_USERS` |
| Eduardo Gueiros | `U07TKK5JH5G` | Look up via `LINEAR_LIST_LINEAR_USERS` |
| Jason Harmon    | `U094MHCL68M` | Look up via `LINEAR_LIST_LINEAR_USERS` |
| Matt Noxon      | `U097YDR3L5P` | Look up via `LINEAR_LIST_LINEAR_USERS` |
| Palmer Turley   | `U074WTX6KAN` | Look up via `LINEAR_LIST_LINEAR_USERS` |

Also include engineering leadership if requested:

| Name            | Slack ID      |
| --------------- | ------------- |
| Kaden Wilkinson | `U06EPEY9WNM` |
| Bryan Lund      | `U086JDRUYFJ` |

## Workflow

### Step 1: Resolve Identity

1. Read `pm-workspace-docs/company-context/org-chart.md` to get the person's:
   - Full name, title, tenure, location, reports-to, Slack ID
2. Call `LINEAR_LIST_LINEAR_USERS` to find their Linear user ID by matching name
3. Store both IDs for data collection

### Step 2: Collect Slack Data (Personality)

_Skip if `--impact` flag_

1. **Search all messages** using `SLACK_SEARCH_MESSAGES` with query `from:<SlackID>` sorted ascending
   - Fetch pages 1-4 minimum (400 messages) for sufficient sample
   - Note: Total message count is in `data.messages.total`
2. **Also fetch most recent 100** sorted descending for current communication patterns
3. **Extract from messages:**
   - Channel distribution (which channels they're most active in)
   - Communication style signals (message length, question-asking, credit-giving)
   - Personality markers: look for keywords like `sorry`, `my fault`, `appreciate`, `thanks`, `love`, `great work`, `nice`, `excited`, `happy`, `learned`, `figured out`, `shoutout`
   - Technical communication: how they explain problems, propose solutions, ask for help
   - Messages in social channels (`watering-hole`, `general`, `out-of-context-quotes`, `office-utah`) for personality color
   - Substantive messages (>200 chars) for depth of communication

### Step 3: Collect Meeting Data (Personality)

_Skip if `--impact` flag_

1. **Grep meeting transcripts** for the person's name:
   ```
   grep -rl "[Name]" pm-workspace-docs/signals/transcripts/
   ```
2. **Read matching transcripts** and extract:
   - Direct quotes from the person
   - Topics they contributed to
   - How they interact in group settings (ownership, questions, pushback)

### Step 4: Collect Linear Data (Impact)

_Skip if `--personality` flag_

1. **Fetch all issues** using `LINEAR_LIST_LINEAR_ISSUES` with `assignee_id` set to their Linear user ID
   - Request up to 250 issues per page, paginate if needed
2. **Parse and categorize** completed issues by:
   - **Project** (group by `project.name`)
   - **State** (count by `state.name` — focus on "Done")
   - **Thematic category** using keyword matching:
     - CRM & Integrations: `crm`, `hubspot`, `salesforce`, `contact`, `company_id`, `enrichment`
     - Onboarding & User Experience: `onboard`, `invite`, `signup`, `registration`
     - Workflows: `workflow`, `node`, `trigger`, `action`, `automation`
     - Authentication & Permissions: `auth`, `role`, `permission`, `login`, `firebase`
     - Billing & Payments: `billing`, `stripe`, `subscription`, `payment`, `plan`, `seat`
     - Privacy & Compliance: `privacy`, `pii`, `redact`, `determination`
     - UI/UX Polish: `ui`, `button`, `modal`, `banner`, `display`, `cosmetic`, `design`
     - Infrastructure & DevOps: `infra`, `deploy`, `migration`, `script`, `db`, `database`, `schema`
     - Bug Fixes: `fix`, `bug`, `error`, `issue`, `broken`, `crash`
     - Data Quality: `data`, `backfill`, `export`, `sync`
     - Other: anything not matching above
   - **Labels** (collect all label names and counts)

### Step 5: Collect PR Data (Impact)

_Skip if `--personality` flag_

1. **Grep activity reports** for the person's name:
   ```
   grep -rn "[Name]" pm-workspace-docs/status/activity/
   ```
2. **Extract PR numbers and descriptions** from matches (format: `#XXXX: description`)
3. **Also check Slack messages** for PR links (`github.com/AskElephant/elephant-ai/pull/`)
4. **Compile PR list** with:
   - PR number
   - Description/title
   - Whether merged or open (from context)

### Step 6: Synthesize & Write Profile

Generate a comprehensive profile document following this structure:

```markdown
# [Name] — AskElephant Profile

**Title:** [title] | **Tenure:** [tenure] | **Location:** [location]
**Reports to:** [manager] | **Department:** EPD

---

## Part 1: Personality Assessment

_Based on [N] Slack messages across [N]+ channels, meeting transcripts, and team interactions._

### Communication DNA

- Channel presence table (top 5-6 channels with what each reveals)
- Communication style analysis (shows vs tells, transparency, credit-giving, etc.)

### Core Personality Traits

- 4-6 traits with evidence from messages
- Each trait backed by direct quotes or behavioral patterns

### How [Name] Shows Up in Meetings

- From transcript analysis
- Interaction style, ownership, product awareness

### Personality Summary

> One-paragraph synthesis of who this person is as a teammate

---

## Part 2: AskElephant Impact Analysis

_Based on [N] completed Linear issues, [N]+ PRs, and Slack/meeting documentation._

### By the Numbers

| Metric | Value |
| Linear Issues Completed | N |
| Projects Touched | N |
| PRs Tracked | N+ |
| Slack Messages | N |

### Impact Areas (3-8 sections depending on breadth)

Each area includes:

- Context of what the work was
- Specific issues/PRs within the area
- Why it mattered to the product/team
- Evidence of growth or ownership

### Evolution Timeline

| Period | Focus | Growth Signal |
(Monthly breakdown showing how their focus and capability evolved)

### Who They Collaborate With

Table of frequent collaborators with relationship description

### Summary

Narrative synthesis of their AskElephant journey — what they've built, how they work, and who they've become.
```

### Step 7: Save Output

Save to: `pm-workspace-docs/status/[firstname-lastname]-profile.md`

Example: `pm-workspace-docs/status/jason-harmon-profile.md`

## Running for All Engineers (`--all`)

When `--all` is specified, run sequentially for each engineer in the team table. Between each profile:

1. Announce which engineer is next
2. Run the full workflow
3. Confirm the file was saved
4. Move to the next person

Final output: summary table of all profiles generated with links.

## Data Volume Expectations

| Data Source      | Expected Volume per Engineer               |
| ---------------- | ------------------------------------------ |
| Slack messages   | 500-3,000+ (varies by tenure and activity) |
| Linear issues    | 30-150+ completed                          |
| PRs              | 10-50+                                     |
| Meeting mentions | 2-10 transcripts                           |

## Tips

- **Longer-tenured engineers** (Palmer, 2 years) will have significantly more data — may need more Slack pages
- **Data engineers** (Dylan) may have different channel patterns — look for #team-dev, data pipeline channels
- **Recent hires** (Matt, 6 months) will have less data but the evolution arc is still meaningful
- **The personality section is the hardest part** — look beyond technical messages into social channels, how they handle mistakes, and how they celebrate others

## Output Location

```
pm-workspace-docs/status/[firstname-lastname]-profile.md
```

## Examples

### Single Engineer

```
/engineer-profile Jason
```

Generates: `pm-workspace-docs/status/jason-harmon-profile.md`

### Impact Only

```
/engineer-profile Eduardo --impact
```

Generates impact section only for Eduardo Gueiros.

### All Engineers

```
/engineer-profile --all
```

Generates profiles for Dylan, Eduardo, Jason, Matt, and Palmer sequentially.
