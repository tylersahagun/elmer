# Signal: Agency Dashboard API + AI Meeting Brief Request

- **Date:** 2026-02-11
- **Source:** Customer quote
- **Type:** feature-request
- **Initiative:** client-usage-metrics
- **Strength:** Strong (clear user intent + concrete integration use case)

## Customer Quote

> "Where can I find API documentation? I'm exploring building some integration into an agency dashboard we want to build that would ideally pull in some brief AI-generated overview of recent meetings broken out by client, show sentiment, trends, and some other qualitative data I think we could pull out of AskElephant"

## JTBD Interpretation

When an agency partner needs to operationalize customer intelligence across accounts, they want a documented API and account-level AI summary payloads so they can embed AskElephant value directly inside their own dashboard workflows.

## Requested Outcome

1. Discoverable API documentation
2. Programmatic access to recent-meeting AI summaries by client/account
3. Sentiment and trend signals suitable for dashboard widgets
4. Qualitative highlights (themes, risks, opportunities) with clear provenance

## Why This Matters

- Expands AskElephant value outside the product UI into partner workflows
- Creates stronger retention stickiness through embedded intelligence
- Supports QBR/renewal narratives with account-level summaries
- Opens path for agency and RevOps-led expansion motions

## Suggested Product Response

- **Near-term:** Provide integration guidance and pilot endpoint shape
- **Mid-term:** Launch "Insights API" bundle with:
  - account summary endpoint
  - recent meetings digest endpoint
  - sentiment/trend timeline endpoint
  - confidence/freshness metadata in every response

## Risks / Guardrails

- No qualitative claim without provenance and confidence
- Keep API output action-oriented (not generic summaries)
- Enforce tenant/account scoping and role-safe data boundaries
