import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertBusinessAccess, computeCustomerBalance } from "./auth_helpers";

export const addCredit = mutation({
  args: {
    businessId: v.id("businesses"),
    customerId: v.id("customers"),
    userId: v.string(),
    amount: v.number(), // minor units, integer > 0
    date: v.string(), // YYYY-MM-DD
    dueDate: v.optional(v.string()), // YYYY-MM-DD
    description: v.optional(v.string()),
    idempotencyKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertBusinessAccess(ctx, args.businessId, args.userId);

    const customer = await ctx.db.get(args.customerId);
    if (!customer || customer.businessId !== args.businessId) {
      throw new Error("Client introuvable ou n'appartient pas à ce commerce.");
    }

    if (!Number.isInteger(args.amount) || args.amount <= 0) {
      throw new Error("Le montant du crédit doit être un nombre entier strictement positif.");
    }

    // Idempotency check
    if (args.idempotencyKey) {
      const existing = await ctx.db
        .query("transactions")
        .withIndex("by_idempotency", (q) =>
          q.eq("idempotencyKey", args.idempotencyKey)
        )
        .first();

      if (existing) {
        return existing._id;
      }
    }

    const now = Date.now();
    const transactionId = await ctx.db.insert("transactions", {
      businessId: args.businessId,
      customerId: args.customerId,
      type: "credit",
      amount: args.amount,
      date: args.date,
      dueDate: args.dueDate || undefined,
      description: args.description?.trim() || undefined,
      idempotencyKey: args.idempotencyKey || undefined,
      createdByUserId: args.userId,
      createdAt: now,
    });

    return transactionId;
  },
});

export const addPayment = mutation({
  args: {
    businessId: v.id("businesses"),
    customerId: v.id("customers"),
    userId: v.string(),
    amount: v.number(), // minor units, integer > 0
    date: v.string(), // YYYY-MM-DD
    paymentMethod: v.optional(
      v.union(
        v.literal("cash"),
        v.literal("mobile_money"),
        v.literal("transfer"),
        v.literal("other")
      )
    ),
    reference: v.optional(v.string()),
    description: v.optional(v.string()),
    idempotencyKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertBusinessAccess(ctx, args.businessId, args.userId);

    const customer = await ctx.db.get(args.customerId);
    if (!customer || customer.businessId !== args.businessId) {
      throw new Error("Client introuvable ou n'appartient pas à ce commerce.");
    }

    if (!Number.isInteger(args.amount) || args.amount <= 0) {
      throw new Error("Le montant du remboursement doit être un nombre entier strictement positif.");
    }

    // Idempotency check
    if (args.idempotencyKey) {
      const existing = await ctx.db
        .query("transactions")
        .withIndex("by_idempotency", (q) =>
          q.eq("idempotencyKey", args.idempotencyKey)
        )
        .first();

      if (existing) {
        return existing._id;
      }
    }

    // Server-side financial balance calculation
    const balanceInfo = await computeCustomerBalance(ctx, args.customerId);
    if (args.amount > balanceInfo.outstandingBalance) {
      throw new Error(
        `Le remboursement (${args.amount}) ne peut pas dépasser le solde restant dû (${balanceInfo.outstandingBalance}).`
      );
    }

    const now = Date.now();
    const transactionId = await ctx.db.insert("transactions", {
      businessId: args.businessId,
      customerId: args.customerId,
      type: "payment",
      amount: args.amount,
      date: args.date,
      paymentMethod: args.paymentMethod || "cash",
      reference: args.reference?.trim() || undefined,
      description: args.description?.trim() || undefined,
      idempotencyKey: args.idempotencyKey || undefined,
      createdByUserId: args.userId,
      createdAt: now,
    });

    return transactionId;
  },
});

export const listRecent = query({
  args: {
    businessId: v.id("businesses"),
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await assertBusinessAccess(ctx, args.businessId, args.userId);

    const limit = args.limit || 20;
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .collect();

    // Sort descending by date, then createdAt
    transactions.sort((a, b) => {
      if (b.date !== a.date) {
        return b.date.localeCompare(a.date);
      }
      return b.createdAt - a.createdAt;
    });

    const recent = transactions.slice(0, limit);

    // Enrich with customer names
    const enriched = await Promise.all(
      recent.map(async (tx) => {
        const customer = await ctx.db.get(tx.customerId);
        return {
          ...tx,
          customerName: customer ? customer.name : "Client supprimé",
          customerPhone: customer?.phone,
        };
      })
    );

    return enriched;
  },
});
