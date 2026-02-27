import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Better Auth tables (user, session, account, verification) are managed
  // automatically by the @convex-dev/better-auth component.

  // User preferences
  userPreferences: defineTable({
    userId: v.string(),
    bibleVersion: v.string(),
    ministryRole: v.optional(v.string()),
    preferredAgeGroup: v.optional(v.string()),
    onboardingCompleted: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"]),

  // Application tables
  lessons: defineTable({
    userId: v.string(),
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
    favorite: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_ageGroup", ["ageGroup"])
    .index("by_theme", ["theme"])
    .index("by_favorite", ["favorite"]),

  // Team invitations sent by account owners
  invitations: defineTable({
    ownerId: v.string(),
    email: v.string(),
    role: v.union(v.literal("editor"), v.literal("viewer")),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("revoked")),
    token: v.string(),
    invitedAt: v.number(),
    acceptedAt: v.optional(v.number()),
  })
    .index("by_owner", ["ownerId"])
    .index("by_email", ["email"])
    .index("by_token", ["token"])
    .index("by_status", ["status"]),

  // Active team members (created when invitation is accepted)
  members: defineTable({
    ownerId: v.string(),
    userId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    role: v.union(v.literal("editor"), v.literal("viewer")),
    joinedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_user", ["userId"])
    .index("by_owner_user", ["ownerId", "userId"]),

  // Stripe payments
  payments: defineTable({
    userId: v.optional(v.string()),
    userEmail: v.optional(v.string()),
    stripeSessionId: v.string(),
    stripeCustomerId: v.optional(v.string()),
    stripePaymentIntentId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    priceId: v.optional(v.string()),
    amount: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("refunded"),
      v.literal("cancelled")
    ),
    paymentType: v.union(v.literal("one_time"), v.literal("subscription")),
    paidAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_session", ["stripeSessionId"])
    .index("by_status", ["status"]),

  // Stripe subscriptions
  subscriptions: defineTable({
    userId: v.string(),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("cancelled"),
      v.literal("past_due"),
      v.literal("unpaid"),
      v.literal("trialing")
    ),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_subscription", ["stripeSubscriptionId"])
    .index("by_customer", ["stripeCustomerId"])
    .index("by_status", ["status"]),
});
