import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertBusinessAccess, computeCustomerBalance } from "./auth_helpers";

export const list = query({
  args: {
    businessId: v.id("businesses"),
    userId: v.string(),
    search: v.optional(v.string()),
    includeArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await assertBusinessAccess(ctx, args.businessId, args.userId);

    const customers = await ctx.db
      .query("customers")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .collect();

    const searchTerm = (args.search || "").toLowerCase().trim();

    // Filter and compute balances
    const results = [];
    for (const customer of customers) {
      if (!args.includeArchived && customer.isArchived) {
        continue;
      }

      if (searchTerm) {
        const matchesName = customer.name.toLowerCase().includes(searchTerm);
        const matchesPhone = customer.phone?.toLowerCase().includes(searchTerm);
        if (!matchesName && !matchesPhone) {
          continue;
        }
      }

      const balanceInfo = await computeCustomerBalance(ctx, customer._id);
      results.push({
        ...customer,
        ...balanceInfo,
      });
    }

    // Sort by outstanding balance descending, then by name
    return results.sort((a, b) => {
      if (b.outstandingBalance !== a.outstandingBalance) {
        return b.outstandingBalance - a.outstandingBalance;
      }
      return a.name.localeCompare(b.name);
    });
  },
});

export const get = query({
  args: {
    customerId: v.id("customers"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const customer = await ctx.db.get(args.customerId);
    if (!customer) {
      throw new Error("Client introuvable.");
    }

    await assertBusinessAccess(ctx, customer.businessId, args.userId);
    const balanceInfo = await computeCustomerBalance(ctx, customer._id);

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_customer", (q) => q.eq("customerId", customer._id))
      .collect();

    // Sort transactions chronologically descending (most recent first)
    transactions.sort((a, b) => {
      if (b.date !== a.date) {
        return b.date.localeCompare(a.date);
      }
      return b.createdAt - a.createdAt;
    });

    return {
      ...customer,
      ...balanceInfo,
      transactions,
    };
  },
});

export const create = mutation({
  args: {
    businessId: v.id("businesses"),
    userId: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertBusinessAccess(ctx, args.businessId, args.userId);

    const trimmedName = args.name.trim();
    if (!trimmedName) {
      throw new Error("Le nom du client est obligatoire.");
    }

    const now = Date.now();
    const customerId = await ctx.db.insert("customers", {
      businessId: args.businessId,
      name: trimmedName,
      phone: args.phone ? args.phone.trim() : undefined,
      notes: args.notes ? args.notes.trim() : undefined,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    });

    return customerId;
  },
});

export const update = mutation({
  args: {
    customerId: v.id("customers"),
    userId: v.string(),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const customer = await ctx.db.get(args.customerId);
    if (!customer) {
      throw new Error("Client introuvable.");
    }

    await assertBusinessAccess(ctx, customer.businessId, args.userId);

    const updates: Record<string, any> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) {
      const trimmed = args.name.trim();
      if (!trimmed) throw new Error("Le nom ne peut pas être vide.");
      updates.name = trimmed;
    }
    if (args.phone !== undefined) {
      updates.phone = args.phone.trim() || undefined;
    }
    if (args.notes !== undefined) {
      updates.notes = args.notes.trim() || undefined;
    }

    await ctx.db.patch(customer._id, updates);
    return true;
  },
});

export const archive = mutation({
  args: {
    customerId: v.id("customers"),
    userId: v.string(),
    archive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const customer = await ctx.db.get(args.customerId);
    if (!customer) {
      throw new Error("Client introuvable.");
    }

    await assertBusinessAccess(ctx, customer.businessId, args.userId);

    await ctx.db.patch(customer._id, {
      isArchived: args.archive,
      updatedAt: Date.now(),
    });

    return true;
  },
});
