/**
 * Server-side tool catalog — the complete set of tools available to agents
 * running as Convex Actions.
 *
 * Usage inside a Convex Action:
 *   const tools = buildServerTools(ctx, jobContext);
 *   // tools[name].definition → Anthropic Tool format
 *   // tools[name].execute(args) → returns result
 */

import type { ActionCtx } from "../_generated/server";
import { buildDbTools, type JobContext } from "./db";
import { buildServiceTools } from "./services";
import { buildCodebaseTools } from "./codebase";
import type { Id } from "../_generated/dataModel";

export type ToolEntry = {
  definition: {
    name: string;
    description: string;
    input_schema: {
      type: "object";
      properties: Record<string, unknown>;
      required: string[];
    };
  };
  execute: (args: Record<string, unknown>) => Promise<unknown>;
};

export type ToolCatalog = Record<string, ToolEntry>;

export function buildServerTools(
  ctx: ActionCtx,
  jctx: JobContext,
): ToolCatalog {
  const dbTools = buildDbTools(ctx, jctx);
  const serviceTools = buildServiceTools(ctx, jctx.workspaceId);
  const codebaseTools = buildCodebaseTools(ctx, jctx.workspaceId);

  const allRaw = { ...dbTools, ...serviceTools, ...codebaseTools };

  const catalog: ToolCatalog = {};
  for (const [name, tool] of Object.entries(allRaw)) {
    catalog[name] = {
      definition: {
        name,
        description: tool.description,
        input_schema: tool.inputSchema as {
          type: "object";
          properties: Record<string, unknown>;
          required: string[];
        },
      },
      execute: tool.execute,
    };
  }

  return catalog;
}

/** Returns Anthropic-format tool array ready to pass to messages.create */
export function getAnthropicTools(catalog: ToolCatalog) {
  return Object.values(catalog).map((t) => t.definition);
}

/** Model routing per agent frontmatter */
export function resolveModel(modelHint: string | undefined): string {
  switch (modelHint) {
    case "haiku":
      return "claude-3-haiku-20240307";
    case "sonnet":
      return "claude-sonnet-4-20250514";
    case "inherit":
    default:
      return "claude-sonnet-4-5";
  }
}

export type { JobContext };
export type { Id };
