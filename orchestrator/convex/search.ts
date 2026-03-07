import { query } from "./_generated/server";
import { v } from "convex/values";
import { buildWorkspaceRuntimeSearch } from "./runtimeMemory";

export const searchWorkspace = query({
  args: {
    workspaceId: v.id("workspaces"),
    q: v.string(),
  },
  handler: async (ctx, { workspaceId, q }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await buildWorkspaceRuntimeSearch(ctx as never, workspaceId, q);
  },
});
