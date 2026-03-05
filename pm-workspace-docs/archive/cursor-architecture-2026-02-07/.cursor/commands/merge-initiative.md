# Merge Initiative Command

Safely consolidate duplicate initiatives into a single canonical set of docs with guided questions and pushback when separation is the better call.

## Usage

```
/merge-initiative
/merge-initiative [initiative-a] [initiative-b] [...]
```

## Behavior

### 1) Collect targets, signals scope, and intent (AskQuestion required)

Ask for:

- Which initiatives should be merged (2+)
- Which initiative should be the canonical "home"
- Signal scope preference:
  - Types to include (slack, issues, transcripts, releases, memos, synthesis)
  - Date range (optional)
  - "Auto-detect related signals" vs. "I will specify"
- Why they should be merged
- Similarities (persona, outcome chain, pillar, scope)
- Differences (scope, phase, stakeholders, success metrics)
- What must stay separate vs. what should be unified

### 2) Gather related signals

Use `pm-workspace-docs/signals/_index.json` to assemble a short list of related signals:

- Match `related_initiatives` to the candidate initiatives
- Fuzzy match initiative names to `topic` and `key_themes`
- Respect the signal types and date range requested

If no matches or scope is unclear, ask for signal types and keywords to use.

### 3) Load context

For each initiative:

- Read `_meta.json` and key docs if present:
  - `research.md`
  - `prd.md`
  - `design-brief.md`
  - `engineering-spec.md`
  - `prototype-notes.md`
  - `gtm-brief.md`

### 4) Produce a Merge Assessment

Create a short assessment with:

- Doc presence matrix (which initiative has which artifacts)
- Related signals summary (top 5–10, with why each is relevant)
- Overlap summary (what is clearly redundant)
- Conflict summary (what is contradictory or divergent)
- Proposed canonical structure (what sections should live where)
- Open questions (gaps that block a clean merge)

Save to: `pm-workspace-docs/initiatives/[canonical]/merge-notes.md`

### 5) Separation Pushback Gate

If any of the following are true, **push back** and recommend keeping them separate (or only sharing a parent umbrella initiative):

- Different target personas
- Different outcome chains or success metrics
- Different strategic pillars
- One initiative is in validate/launch while the other is discovery
- Active workstreams are owned by different stakeholders with different goals

Use a direct pushback tone and ask for confirmation before continuing.

### 6) Optional merge execution (only after explicit approval)

If user approves:

- Consolidate docs into the canonical initiative
- Add sections labeled "Merged from [initiative]" where needed
- Deprecate duplicate initiatives with a `README.md` pointing to the canonical initiative (or move their docs into `legacy/` under the canonical folder)
- Run `/maintain sync` after changes to refresh indexes

## Output

- A decision-ready merge assessment
- A clear yes/no recommendation with reasoning
- Next steps and any blocking questions
