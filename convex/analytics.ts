import { v } from "convex/values";
import { query } from "./_generated/server";
import { assertBusinessAccess, computeCustomerBalance } from "./auth_helpers";

export const getDashboardMetrics = query({
  args: {
    businessId: v.id("businesses"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    await assertBusinessAccess(ctx, args.businessId, args.userId);

    const customers = await ctx.db
      .query("customers")
      .withIndex("by_business_archived", (q) =>
        q.eq("businessId", args.businessId).eq("isArchived", false)
      )
      .collect();

    let totalOutstandingBalance = 0;
    let customersWithBalanceCount = 0;
    let overdueCount = 0;
    let dueSoonCount = 0;

    for (const customer of customers) {
      const balance = await computeCustomerBalance(ctx, customer._id);
      if (balance.outstandingBalance > 0) {
        totalOutstandingBalance += balance.outstandingBalance;
        customersWithBalanceCount += 1;
        if (balance.status === "overdue") overdueCount += 1;
        if (balance.status === "due_soon") dueSoonCount += 1;
      }
    }

    // All payments for period (current month)
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const allTransactions = await ctx.db
      .query("transactions")
      .withIndex("by_business", (q) => q.eq("businessId", args.businessId))
      .collect();

    let reimbursedThisMonth = 0;
    let totalReimbursedAllTime = 0;

    for (const tx of allTransactions) {
      if (tx.type === "payment") {
        totalReimbursedAllTime += tx.amount;
        if (tx.date.startsWith(currentMonthPrefix)) {
          reimbursedThisMonth += tx.amount;
        }
      }
    }

    // Recent 5 operations
    allTransactions.sort((a, b) => {
      if (b.date !== a.date) return b.date.localeCompare(a.date);
      return b.createdAt - a.createdAt;
    });

    const recentSlice = allTransactions.slice(0, 5);
    const recentOperations = await Promise.all(
      recentSlice.map(async (tx) => {
        const customer = await ctx.db.get(tx.customerId);
        return {
          ...tx,
          customerName: customer ? customer.name : "Client inconnu",
          customerPhone: customer?.phone,
        };
      })
    );

    return {
      totalOutstandingBalance,
      customersWithBalanceCount,
      overdueCount,
      dueSoonCount,
      totalActiveCustomers: customers.length,
      reimbursedThisMonth,
      totalReimbursedAllTime,
      recentOperations,
    };
  },
});
