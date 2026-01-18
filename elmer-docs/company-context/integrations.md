# Integrations

> External services and data flows that power elmer's PM orchestration.

---

## Core Integrations

### GitHub

- **Status:** Production
- **Purpose:** Repository management, submodules, PR creation
- **Features:**
  - Link product repos as submodules for context
  - Create feature branches from orchestrator
  - Auto-commit and push documentation/prototypes
  - Create PRs with generated descriptions
- **Auth:** GitHub App or Personal Access Token
- **MCP Server:** Yes (via Cursor)

### Linear

- **Status:** Development
- **Purpose:** Automated ticket creation from validated prototypes
- **Features:**
  - Generate bite-sized issues from PRD/prototype
  - Link issues to initiatives
  - Sync issue status back to orchestrator
  - Pull existing issues for context
- **Auth:** OAuth 2.0 / API Key
- **MCP Server:** Yes (via Cursor)

### Chromatic / Storybook

- **Status:** Production
- **Purpose:** Prototype hosting and visual review
- **Features:**
  - Auto-deploy Storybook on push
  - Visual regression testing
  - Shareable prototype URLs for stakeholder review
  - PR comments with preview links
- **Auth:** Chromatic project token
- **URL:** https://main--696c2c54e35ea5bca2a772d8.chromatic.com

### Notion

- **Status:** Planning
- **Purpose:** Knowledge base sync and documentation
- **Features:**
  - Sync PRDs to Notion pages
  - Pull existing documentation for context
  - Update docs as prototypes evolve
- **Auth:** OAuth 2.0 (Notion integration)
- **MCP Server:** Yes (via Cursor)

---

## Planned Integrations

### PostHog

- **Status:** Planning (P1)
- **Purpose:** Metrics tracking for released features
- **Features:**
  - Track feature adoption (Alpha → Beta → GA)
  - Surface low-engagement features for iteration
  - Auto-create issues when metrics drop below threshold
  - Dashboard integration in orchestrator
- **Auth:** API Key
- **Triggers:**
  - Feature reaches adoption threshold → auto-promote to Beta
  - Feature drops below threshold → flag for review, create issue

### Jira

- **Status:** Planning (P2)
- **Purpose:** Alternative to Linear for enterprise teams
- **Features:**
  - Same ticket generation as Linear
  - Epic/Story hierarchy support
  - Sprint integration
- **Auth:** OAuth 2.0 / API Token
- **Note:** Lower priority than Linear; only if there's demand

### Figma

- **Status:** Available (via MCP)
- **Purpose:** Design context for prototypes
- **Features:**
  - Pull design system tokens
  - Reference Figma components in PRDs
  - Generate code from Figma designs
- **Auth:** Figma Access Token
- **MCP Server:** Yes (via Cursor)

### Google Cloud Platform (GCP)

- **Status:** Planning (P2)
- **Purpose:** Error monitoring for released features
- **Features:**
  - Surface error rates for features in Alpha/Beta/GA
  - Link errors back to prototype/tickets
  - Alert when error rate spikes
- **Auth:** Service Account
- **Note:** Complements PostHog metrics with error data

---

## Data Flow

### Discovery → Prototype Flow

```
1. User uploads transcript / starts conversation
2. AI generates PRD (stored in elmer-docs/)
3. AI generates prototype (stored in prototypes/, deployed to Chromatic)
4. Stakeholders review on Chromatic
5. Iterate until validated
6. AI generates Linear tickets from validated prototype
7. Engineering builds from tickets + prototype reference
```

### Release → Metrics Flow

```
1. Feature ships to production
2. PostHog tracks adoption metrics
3. Orchestrator displays metrics on project card
4. If metrics hit threshold → auto-promote (Alpha → Beta → GA)
5. If metrics drop → create issue, flag for review
6. Sub-features can be created to iterate on released features
```

---

## Integration Priority Matrix

| Integration | Business Value | Technical Complexity | Priority |
|-------------|---------------|---------------------|----------|
| GitHub | High | Low | P0 (done) |
| Linear | High | Medium | P0 (in progress) |
| Chromatic | High | Low | P0 (done) |
| Notion | Medium | Medium | P1 |
| PostHog | High | Medium | P1 |
| Figma | Medium | Low | P1 (available) |
| Jira | Medium | Medium | P2 |
| GCP | Low | Medium | P2 |

---

## MCP Server Configuration

elmer leverages Cursor's MCP (Model Context Protocol) servers for integrations:

```json
{
  "mcpServers": {
    "linear": { "enabled": true },
    "notion": { "enabled": true },
    "figma": { "enabled": true },
    "posthog": { "enabled": false, "note": "planned" }
  }
}
```

---

## Notes

- **Linear over Jira** — Linear is the default; Jira only if users explicitly need it
- **PostHog is key** — Metrics integration closes the loop from prototype → release → iteration
- **GitHub is foundational** — Everything depends on repo management working well
- **Chromatic enables sharing** — Stakeholder review on working software is core to the value prop
