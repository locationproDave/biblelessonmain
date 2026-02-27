import { query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

// Helper to get authenticated user ID
async function getAuthUserId(ctx: any) {
  const user = await authComponent.getAuthUser(ctx);
  return user?._id || null;
}

// Lesson queries
export const getAllLessons = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("lessons")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getLesson = query({
  args: { id: v.id("lessons") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const lesson = await ctx.db.get(args.id);
    if (!lesson || lesson.userId !== userId) return null;

    return lesson;
  },
});

export const getLessonsByAgeGroup = query({
  args: { ageGroup: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("lessons")
      .withIndex("by_ageGroup", (q) => q.eq("ageGroup", args.ageGroup))
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();
  },
});

export const getFavoriteLessons = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("lessons")
      .withIndex("by_favorite", (q) => q.eq("favorite", true))
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();
  },
});

// User preferences queries
export const getUserPreferences = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

export const getUserBibleVersion = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const prefs = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return prefs?.bibleVersion || "KJV";
  },
});

// Team queries
export const getTeamMembers = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("members")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .collect();
  },
});

export const getPendingInvitations = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("invitations")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();
  },
});

export const getTeamInvitations = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("invitations")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .collect();
  },
});

export const getMyTeams = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("members")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

// Onboarding status
export const hasCompletedOnboarding = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const prefs = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return prefs?.onboardingCompleted === true;
  },
});
