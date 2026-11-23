import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Better Auth tables
  users: defineTable({
    name: v.string(),
    email: v.string(),
    emailVerified: v.boolean(),
    image: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("email", ["email"]),

  sessions: defineTable({
    userId: v.string(),
    token: v.string(),
    expiresAt: v.number(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("token", ["token"])
    .index("userId", ["userId"]),

  accounts: defineTable({
    userId: v.string(),
    accountId: v.string(),
    providerId: v.string(),
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    idToken: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    password: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("userId", ["userId"])
    .index("provider_account", ["providerId", "accountId"]),

  verifications: defineTable({
    identifier: v.string(),
    value: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("identifier", ["identifier"]),

  // Kredita Core Tables
  businesses: defineTable({
    name: v.string(),
    ownerName: v.string(),
    ownerUserId: v.string(),
    country: v.string(),
    city: v.string(),
    phone: v.string(),
    currency: v.string(), // e.g. "XOF", "XAF", "GNF", "CDF", "EUR", "USD"
    currencyDecimals: v.number(), // 0 for XOF, 2 for EUR
    language: v.string(), // "fr"
    timezone: v.string(), // "Africa/Dakar", "Africa/Abidjan", etc.
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_owner", ["ownerUserId"]),

  businessMembers: defineTable({
    businessId: v.id("businesses"),
    userId: v.string(),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("staff")),
    createdAt: v.number(),
  })
    .index("by_business", ["businessId"])
    .index("by_user", ["userId"])
    .index("by_business_user", ["businessId", "userId"]),

  customers: defineTable({
    businessId: v.id("businesses"),
    name: v.string(),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
    isArchived: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_business", ["businessId"])
    .index("by_business_archived", ["businessId", "isArchived"]),

  transactions: defineTable({
    businessId: v.id("businesses"),
    customerId: v.id("customers"),
    type: v.union(v.literal("credit"), v.literal("payment")),
    // Amount in minor currency units (integers strictly > 0)
    // Ex: 5000 XOF => 5000; 12.50 EUR => 1250
    amount: v.number(),
    date: v.string(), // YYYY-MM-DD
    dueDate: v.optional(v.string()), // YYYY-MM-DD
    paymentMethod: v.optional(
      v.union(
        v.literal("cash"),
        v.literal("mobile_money"),
        v.literal("transfer"),
        v.literal("other")
      )
    ),
    description: v.optional(v.string()),
    reference: v.optional(v.string()),
    idempotencyKey: v.optional(v.string()),
    createdByUserId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_business", ["businessId"])
    .index("by_customer", ["customerId"])
    .index("by_business_date", ["businessId", "date"])
    .index("by_business_type", ["businessId", "type"])
    .index("by_customer_type", ["customerId", "type"])
    .index("by_idempotency", ["idempotencyKey"]),

  marketingConsents: defineTable({
    businessId: v.optional(v.id("businesses")),
    userId: v.optional(v.string()),
    email: v.string(),
    status: v.union(v.literal("subscribed"), v.literal("unsubscribed")),
    source: v.string(), // e.g. "onboarding_opt_in", "settings_toggle"
    consentDate: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_business", ["businessId"]),
});
