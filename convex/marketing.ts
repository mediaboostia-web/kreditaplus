import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getConsent = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("marketingConsents")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase().trim()))
      .first();
  },
});

export const recordConsent = mutation({
  args: {
    email: v.string(),
    status: v.union(v.literal("subscribed"), v.literal("unsubscribed")),
    source: v.string(),
    businessId: v.optional(v.id("businesses")),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.toLowerCase().trim();
    const now = Date.now();

    const existing = await ctx.db
      .query("marketingConsents")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        source: args.source,
        consentDate: now,
        updatedAt: now,
        businessId: args.businessId || existing.businessId,
        userId: args.userId || existing.userId,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("marketingConsents", {
        email: normalizedEmail,
        status: args.status,
        source: args.source,
        consentDate: now,
        updatedAt: now,
        businessId: args.businessId,
        userId: args.userId,
      });
    }
  },
});
