/**
 * External service tool executors — Composio, PostHog, web search.
 * These are plain async functions that make HTTP calls from Convex Actions.
 */

import type { ActionCtx } from "../_generated/server";
import { api } from "../_generated/api";
import type { Id } from "../_generated/dataModel";

// ── Composio ──────────────────────────────────────────────────────────────────

async function getComposioKey(
  ctx: ActionCtx,
  workspaceId: Id<"workspaces">,
): Promise<string> {
  const workspace = await ctx.runQuery(api.workspaces.get, { workspaceId });
  const key =
    (workspace?.settings as Record<string, unknown> | undefined)?.composio as
      | { apiKey?: string }
      | undefined;
  if (!key?.apiKey) throw new Error("Composio API key not configured for workspace");
  return key.apiKey;
}

async function executeComposio(
  apiKey: string,
  workspaceId: string,
  toolName: string,
  args: Record<string, unknown>,
): Promise<unknown> {
  const res = await fetch("https://backend.composio.dev/api/v3/tools/execute", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      toolName,
      userId: `workspace-${workspaceId}`,
      arguments: args,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Composio error ${res.status}: ${text}`);
  }
  return res.json();
}

// ── Web Search (Brave) ────────────────────────────────────────────────────────

async function braveSearch(
  query: string,
  count = 5,
): Promise<unknown> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) return { error: "BRAVE_SEARCH_API_KEY not configured" };

  const res = await fetch(
    `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${count}`,
    { headers: { "X-Subscription-Token": apiKey } },
  );
  if (!res.ok) return { error: `Brave search error ${res.status}` };
  const data = await res.json() as { web?: { results?: unknown[] } };
  return data.web?.results ?? [];
}

// ── PostHog ───────────────────────────────────────────────────────────────────

async function posthogRequest(
  apiKey: string,
  projectId: string,
  endpoint: string,
  body?: unknown,
): Promise<unknown> {
  const method = body ? "POST" : "GET";
  const res = await fetch(
    `https://app.posthog.com/api/projects/${projectId}/${endpoint}`,
    {
      method,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    },
  );
  if (!res.ok) return { error: `PostHog error ${res.status}` };
  return res.json();
}

// ── Tool builder ──────────────────────────────────────────────────────────────

export function buildServiceTools(
  ctx: ActionCtx,
  workspaceId: Id<"workspaces">,
) {
  return {
    composio_execute: {
      description:
        "Execute a Composio tool by name (Slack, Linear, Notion, HubSpot, Google, GitHub)",
      inputSchema: {
        type: "object" as const,
        properties: {
          toolName: {
            type: "string",
            description:
              "Composio tool name e.g. SLACK_SEND_MESSAGE, LINEAR_CREATE_LINEAR_ISSUE, NOTION_QUERY_DATABASE",
          },
          arguments: { type: "object", description: "Tool arguments" },
        },
        required: ["toolName", "arguments"],
      },
      execute: async (args: Record<string, unknown>) => {
        try {
          const apiKey = await getComposioKey(ctx, workspaceId);
          return await executeComposio(
            apiKey,
            workspaceId,
            args.toolName as string,
            (args.arguments as Record<string, unknown>) ?? {},
          );
        } catch (e) {
          return { error: e instanceof Error ? e.message : String(e) };
        }
      },
    },

    web_search: {
      description: "Search the web for current information",
      inputSchema: {
        type: "object" as const,
        properties: {
          query: { type: "string" },
          count: { type: "number", description: "Number of results (default 5)" },
        },
        required: ["query"],
      },
      execute: async (args: Record<string, unknown>) => {
        return braveSearch(args.query as string, (args.count as number) ?? 5);
      },
    },

    posthog_query: {
      description: "Query PostHog analytics — insights, trends, funnels",
      inputSchema: {
        type: "object" as const,
        properties: {
          endpoint: {
            type: "string",
            description: "PostHog API endpoint path e.g. insights/trend/",
          },
          body: { type: "object", description: "Request body for POST" },
        },
        required: ["endpoint"],
      },
      execute: async (args: Record<string, unknown>) => {
        const workspace = await ctx.runQuery(api.workspaces.get, { workspaceId });
        const settings = workspace?.settings as Record<string, unknown> | undefined;
        const posthog = settings?.posthog as
          | { apiKey?: string; projectId?: string }
          | undefined;
        if (!posthog?.apiKey || !posthog?.projectId) {
          return { error: "PostHog not configured for workspace" };
        }
        return posthogRequest(
          posthog.apiKey,
          posthog.projectId,
          args.endpoint as string,
          args.body as Record<string, unknown> | undefined,
        );
      },
    },
  };
}
