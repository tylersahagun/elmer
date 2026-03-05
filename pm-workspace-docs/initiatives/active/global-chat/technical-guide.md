# Internal Search: Technical Guide (Context-First)

> Focus: system behavior, data flows, and operational constraints without code references.

---

## Why This Exists

Internal Search delivers "context at your fingertips" by letting users ask natural-language questions about their workspace history and getting trustworthy, source-linked answers. This aligns with AskElephant's outcome chain and trust-first principles: it turns captured conversation data into actionable context without forcing users to hunt through recordings or notes.

---

## Context Sources Referenced

Use these as the ground-truth context for this guide:

- `pm-workspace-docs/company-context/product-vision.md`
- `pm-workspace-docs/company-context/strategic-guardrails.md`
- `pm-workspace-docs/initiatives/internal-search/_meta.json`
- `pm-workspace-docs/initiatives/internal-search/research.md`
- `pm-workspace-docs/initiatives/internal-search/help-center-internal-search.md`
- `pm-workspace-docs/initiatives/internal-search/email-validation.md`

---

## Intended Outcomes

- Help reps, leaders, CSMs, and RevOps quickly find conversation evidence.
- Reduce time spent searching and increase confidence in prep, coaching, and renewal decisions.
- Preserve trust by making results traceable and permissions-aware.

---

## Core Capabilities (Context-Based)

Internal Search supports:

- Natural-language queries (no syntax required).
- Semantic search across meetings, companies, contacts, team members, signals, and workflow outputs.
- Relationship traversal (e.g., company → contacts → meetings).
- Source-linked results for verification.
- Workspace permission enforcement (users only see what they are allowed to access).

---

## System Inputs and Data Sources

Primary input:

- User query in chat.

Primary data sources (from existing context):

- Meetings: recordings, transcripts, calendar events.
- Companies and contacts: workspace entities.
- Team members: internal users and their activity.
- Signals: extracted insights (objections, sentiment, action items).
- Workflow outputs: summaries, notes, coaching artifacts.

Dependency assumptions:

- Meetings are captured and processed.
- Workflow outputs exist for high-quality signals and summaries.
- Entity relationships are resolvable (company ↔ contact ↔ meeting).

---

## Context Flow (Mermaid)

```mermaid
%%{init: {
  "theme": "base",
  "themeVariables": {
    "primaryColor": "#E8F1FF",
    "primaryTextColor": "#1B2A4A",
    "primaryBorderColor": "#7AA2FF",
    "lineColor": "#6C7A89",
    "secondaryColor": "#F7F9FC",
    "tertiaryColor": "#FFF4E6",
    "fontFamily": "Inter, Segoe UI, Arial",
    "fontSize": "14px",
    "nodeBorder": "1px",
    "clusterBkg": "#F7F9FC",
    "clusterBorder": "#C9D4E5"
  }
}%%
flowchart TD
  A[User Query in Chat] --> B[Intent + Entity Parsing]
  B --> C{Permission Scope}
  C -->|Allowed| D[Context Retrieval]
  C -->|Denied| X[Return Access-Limited Response]

  subgraph Retrieval[Context Retrieval]
    D1[Meetings + Transcripts]
    D2[Companies + Contacts]
    D3[Signals + Workflow Outputs]
    D4[Team Members]
  end

  D --> D1
  D --> D2
  D --> D3
  D --> D4

  B --> E1[Query Normalization + Intent Hints]
  E1 --> E2[Synonym Expansion + Entity Resolution]
  E2 --> E3[Filter Extraction (Time, People, Entities)]
  E3 --> E4[Semantic Similarity Search]
  D1 --> E4
  D2 --> E4
  D3 --> E4
  D4 --> E4
  E4 --> E5[Hybrid Scoring (Semantic + Filters)]
  E5 --> F[Ranking + De-duplication]
  F --> G[Context Assembly + Source Links]
  G --> H[Response in Chat]

  classDef user fill:#E8F1FF,stroke:#7AA2FF,color:#1B2A4A;
  classDef system fill:#F7F9FC,stroke:#C9D4E5,color:#2B3A55;
  classDef warn fill:#FFF4E6,stroke:#FFB36B,color:#6B3F00;
  class A,H user;
  class B,C,D,E1,E2,E3,E4,E5,F,G,D1,D2,D3,D4 system;
  class X warn;
```

---

## Retrieval and Ranking Behavior (Non-Code)

- Uses semantic matching to interpret meaning, not just keywords.
- Applies filters like time ranges, participants, and entities when implied by query.
- Ranks results by relevance and freshness; removes duplicates.
- Always returns source-linked items so users can validate conclusions.

---

## What Internal Search Does Not Do

From current context:

- It does not generate new analysis on the fly; it surfaces existing insights.
- It does not access CRM deal data without explicit CRM tooling enabled.
- It cannot find meetings that were not captured.

---

## Trust and Permissions

Trust is foundational:

- Results must respect workspace access rules.
- Transparency is maintained by returning sources and links, not opaque answers.
- If access is restricted, the response should be clear and bounded.

---

## Operational Considerations

Reliability expectations:

- Capture consistency is the main dependency; missing recordings reduce coverage.
- Workflow outputs increase answer quality; absence reduces specificity.

Freshness:

- Recent meetings should surface quickly once processed.
- If indexing lags, responses should communicate potential delays.

---

## Failure Modes and User Guidance

Common failure patterns:

- Vague queries (no entities or time ranges).
- Missing recordings or processing delays.
- Permission boundaries across teams.

Recommended guidance:

- Ask for time ranges or specific entities.
- Suggest alternate phrasing or broader scopes.
- Confirm if the meeting was captured.

---

## Observability and Success Signals

Operational metrics to watch:

- Search success rate (results returned per query).
- Query-to-click rate (sources opened).
- Time-to-context (query → useful result).
- Top failure reasons (no data, permissions, vague query).

Outcome indicators:

- Improved prep confidence for reps.
- Faster coaching reviews for leaders.
- Higher renewal context quality for CSMs.

---

## Next Context Gaps to Close

- Define primary persona and outcome chain in `research.md`.
- Add a PRD that formalizes scope, constraints, and success metrics.
- Document permission model specifics and source ranking rules.
