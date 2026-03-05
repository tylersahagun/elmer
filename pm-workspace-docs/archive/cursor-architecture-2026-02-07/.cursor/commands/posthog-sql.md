# PostHog SQL (Schema-Aware)

Use this command when drafting PostHog SQL queries so suggestions are grounded in the real Elephant AI PostgreSQL schema.

## Usage

```
/posthog-sql [question]
```

## Required Context

Before proposing any SQL:

1. Read the primary schema file:
   - `elephant-ai/functions/src/db/schema.ts`
2. Read any relevant context schemas (if the question maps to a domain):
   - `elephant-ai/functions/src/contexts/**/schema.model.ts`

If you are unsure where a table/column lives, search the schema file directly and cite the exact table/field names you found.

## Behavior

- Use only tables and columns verified in the schema files above.
- Prefer exact, qualified names as defined in `schema.ts`.
- If the question spans multiple domains, load the relevant `schema.model.ts` files first to confirm relationships.
- If the schema is unclear or missing, state the gap explicitly and propose a follow-up check instead of guessing.

## Output

- Provide a concise SQL query (or a small set of alternatives) grounded in verified schema.
- Include a brief note of any assumptions or missing fields.
