import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertBusinessAccess } from "./auth_helpers";

export const getMine = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Check direct owner
    const owned = await ctx.db
      .query("businesses")
      .withIndex("by_owner", (q) => q.eq("ownerUserId", args.userId))
      .first();

    if (owned) return owned;

    // Check membership
    const membership = await ctx.db
      .query("businessMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (membership) {
      return await ctx.db.get(membership.businessId);
    }

    return null;
  },
});

export const getById = query({
  args: {
    businessId: v.id("businesses"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const { business } = await assertBusinessAccess(
      ctx,
      args.businessId,
      args.userId
    );
    return business;
  },
});

export const create = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    ownerName: v.string(),
    country: v.string(),
    city: v.string(),
    phone: v.string(),
    currency: v.string(),
    currencyDecimals: v.number(),
    language: v.string(),
    timezone: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const businessId = await ctx.db.insert("businesses", {
      name: args.name.trim(),
      ownerName: args.ownerName.trim(),
      ownerUserId: args.userId,
      country: args.country.trim(),
      city: args.city.trim(),
      phone: args.phone.trim(),
      currency: args.currency.toUpperCase().trim(),
      currencyDecimals: args.currencyDecimals,
      language: args.language || "fr",
      timezone: args.timezone || "Africa/Dakar",
      createdAt: now,
      updatedAt: now,
    });

    // Create owner member record
    await ctx.db.insert("businessMembers", {
      businessId,
      userId: args.userId,
      role: "owner",
      createdAt: now,
    });

    return businessId;
  },
});

export const update = mutation({
  args: {
    businessId: v.id("businesses"),
    userId: v.string(),
    name: v.optional(v.string()),
    ownerName: v.optional(v.string()),
    country: v.optional(v.string()),
    city: v.optional(v.string()),
    phone: v.optional(v.string()),
    currency: v.optional(v.string()),
    currencyDecimals: v.optional(v.number()),
    language: v.optional(v.string()),
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { business } = await assertBusinessAccess(
      ctx,
      args.businessId,
      args.userId
    );

    const updates: Record<string, any> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updates.name = args.name.trim();
    if (args.ownerName !== undefined) updates.ownerName = args.ownerName.trim();
    if (args.country !== undefined) updates.country = args.country.trim();
    if (args.city !== undefined) updates.city = args.city.trim();
    if (args.phone !== undefined) updates.phone = args.phone.trim();
    if (args.currency !== undefined)
      updates.currency = args.currency.toUpperCase().trim();
    if (args.currencyDecimals !== undefined)
      updates.currencyDecimals = args.currencyDecimals;
    if (args.language !== undefined) updates.language = args.language;
    if (args.timezone !== undefined) updates.timezone = args.timezone;

    await ctx.db.patch(business._id, updates);
    return true;
  },
});
