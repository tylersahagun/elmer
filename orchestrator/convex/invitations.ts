import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function generateToken() {
  return crypto.randomUUID().replace(/-/g, "");
}

export const listByWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db
      .query("invitations")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();
  },
});

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    email: v.string(),
    role: v.string(),
    invitedBy: v.optional(v.string()),
    inviterName: v.optional(v.string()),
    inviterEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const normalizedEmail = args.email.trim().toLowerCase();
    const existing = await ctx.db
      .query("invitations")
      .withIndex("by_email_workspace", (q) =>
        q.eq("email", normalizedEmail).eq("workspaceId", args.workspaceId),
      )
      .collect();
    const pending = existing.find(
      (invite) => !invite.acceptedAt && invite.expiresAt > Date.now(),
    );
    if (pending) {
      throw new Error("An invitation for this email is already pending");
    }

    const token = generateToken();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const id = await ctx.db.insert("invitations", {
      workspaceId: args.workspaceId,
      email: normalizedEmail,
      role: args.role,
      token,
      invitedBy: args.invitedBy,
      invitedByClerkUserId: identity.subject,
      inviterName: args.inviterName,
      inviterEmail: args.inviterEmail,
      expiresAt,
    });
    return { id, token, email: normalizedEmail, role: args.role, expiresAt };
  },
});

export const revoke = mutation({
  args: { invitationId: v.id("invitations") },
  handler: async (ctx, { invitationId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await ctx.db.delete(invitationId);
    return { ok: true };
  },
});

export const getByToken = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();
    if (!invitation) return null;
    const workspace = await ctx.db.get(invitation.workspaceId);
    return {
      ...invitation,
      workspace,
      isExpired: invitation.expiresAt < Date.now(),
      isAccepted: !!invitation.acceptedAt,
      isValid: !invitation.acceptedAt && invitation.expiresAt > Date.now(),
    };
  },
});

export const acceptByToken = mutation({
  args: {
    token: v.string(),
    userId: v.optional(v.string()),
    clerkUserId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();
    if (!invitation) return { success: false, error: "Invitation not found" };
    if (invitation.expiresAt < Date.now()) {
      return { success: false, error: "This invitation has expired" };
    }
    if (invitation.acceptedAt) {
      return { success: false, error: "This invitation has already been used" };
    }
    if (invitation.email !== args.email.trim().toLowerCase()) {
      return { success: false, error: "Invitation email does not match signed-in user" };
    }

    const existing = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_clerk_workspace", (q) =>
        q.eq("clerkUserId", args.clerkUserId).eq("workspaceId", invitation.workspaceId),
      )
      .unique();

    if (!existing) {
      await ctx.db.insert("workspaceMembers", {
        workspaceId: invitation.workspaceId,
        userId: args.userId,
        clerkUserId: args.clerkUserId,
        email: args.email,
        displayName: args.name,
        image: args.image,
        role: invitation.role,
        joinedAt: Date.now(),
      });
    }

    await ctx.db.patch(invitation._id, {
      acceptedAt: Date.now(),
    });
    return { success: true, workspaceId: invitation.workspaceId };
  },
});
