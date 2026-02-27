import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

// Helper to get authenticated user ID
async function getAuthUserId(ctx: any) {
  const user = await authComponent.getAuthUser(ctx);
  return user?._id || null;
}

// Lesson mutations
export const createLesson = mutation({
  args: {
    title: v.string(),
    passage: v.string(),
    ageGroup: v.string(),
    duration: v.string(),
    format: v.string(),
    theme: v.string(),
    memoryVerseText: v.string(),
    memoryVerseReference: v.string(),
    objectives: v.array(v.string()),
    sectionsJson: v.string(),
    materialsJson: v.string(),
    crossReferencesJson: v.optional(v.string()),
    configJson: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("lessons", {
      userId,
      ...args,
      favorite: false,
    });
  },
});

export const updateLesson = mutation({
  args: {
    id: v.id("lessons"),
    title: v.optional(v.string()),
    passage: v.optional(v.string()),
    ageGroup: v.optional(v.string()),
    duration: v.optional(v.string()),
    format: v.optional(v.string()),
    theme: v.optional(v.string()),
    memoryVerseText: v.optional(v.string()),
    memoryVerseReference: v.optional(v.string()),
    objectives: v.optional(v.array(v.string())),
    sectionsJson: v.optional(v.string()),
    materialsJson: v.optional(v.string()),
    crossReferencesJson: v.optional(v.string()),
    configJson: v.optional(v.string()),
    favorite: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const lesson = await ctx.db.get(args.id);
    if (!lesson || lesson.userId !== userId) {
      throw new Error("Not authorized");
    }

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

export const deleteLesson = mutation({
  args: { id: v.id("lessons") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const lesson = await ctx.db.get(args.id);
    if (!lesson || lesson.userId !== userId) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(args.id);
  },
});

export const toggleFavorite = mutation({
  args: { id: v.id("lessons") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const lesson = await ctx.db.get(args.id);
    if (!lesson || lesson.userId !== userId) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.id, { favorite: !lesson.favorite });
    return await ctx.db.get(args.id);
  },
});

// User preferences mutations
export const setUserBibleVersion = mutation({
  args: { bibleVersion: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if preferences exist
    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { bibleVersion: args.bibleVersion });
      return await ctx.db.get(existing._id);
    } else {
      return await ctx.db.insert("userPreferences", {
        userId,
        bibleVersion: args.bibleVersion,
      });
    }
  },
});

export const updateUserBibleVersion = mutation({
  args: { bibleVersion: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { bibleVersion: args.bibleVersion });
      return await ctx.db.get(existing._id);
    } else {
      return await ctx.db.insert("userPreferences", {
        userId,
        bibleVersion: args.bibleVersion,
      });
    }
  },
});

// Team mutations
export const inviteTeamMember = mutation({
  args: {
    email: v.string(),
    role: v.union(v.literal("editor"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const token = crypto.randomUUID();

    return await ctx.db.insert("invitations", {
      ownerId: userId,
      email: args.email,
      role: args.role,
      status: "pending",
      token,
      invitedAt: Date.now(),
    });
  },
});

export const acceptInvitation = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invitation) throw new Error("Invitation not found");
    if (invitation.status !== "pending") throw new Error("Invitation already used");

    // Create member record
    const memberId = await ctx.db.insert("members", {
      ownerId: invitation.ownerId,
      userId,
      email: invitation.email,
      name: undefined,
      role: invitation.role,
      joinedAt: Date.now(),
    });

    // Update invitation status
    await ctx.db.patch(invitation._id, {
      status: "accepted",
      acceptedAt: Date.now(),
    });

    return memberId;
  },
});

export const revokeTeamMember = mutation({
  args: { memberId: v.id("members") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const member = await ctx.db.get(args.memberId);
    if (!member || member.ownerId !== userId) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(args.memberId);
  },
});

export const revokeInvitation = mutation({
  args: { invitationId: v.id("invitations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation || invitation.ownerId !== userId) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.invitationId, { status: "revoked" });
  },
});

// Onboarding completion
export const completeOnboarding = mutation({
  args: {
    ministryRole: v.optional(v.string()),
    bibleVersion: v.string(),
    preferredAgeGroup: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        bibleVersion: args.bibleVersion,
        ministryRole: args.ministryRole,
        preferredAgeGroup: args.preferredAgeGroup,
        onboardingCompleted: true,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("userPreferences", {
        userId,
        bibleVersion: args.bibleVersion,
        ministryRole: args.ministryRole,
        preferredAgeGroup: args.preferredAgeGroup,
        onboardingCompleted: true,
      });
    }
  },
});
