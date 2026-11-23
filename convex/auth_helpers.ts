import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Helper to ensure a user is a member of the requested business.
 * Throws an explicit error if unauthorized or cross-tenant access is attempted.
 */
export async function assertBusinessAccess(
  ctx: QueryCtx | MutationCtx,
  businessId: Id<"businesses">,
  userId: string
) {
  const member = await ctx.db
    .query("businessMembers")
    .withIndex("by_business_user", (q) =>
      q.eq("businessId", businessId).eq("userId", userId)
    )
    .first();

  if (!member) {
    // Also check if user is the direct owner
    const business = await ctx.db.get(businessId);
    if (!business || business.ownerUserId !== userId) {
      throw new Error("Accès refusé : vous n'avez pas accès à ce commerce.");
    }
    return { role: "owner" as const, business };
  }

  const business = await ctx.db.get(businessId);
  if (!business) {
    throw new Error("Commerce introuvable.");
  }

  return { role: member.role, business };
}

/**
 * Calculates current customer financial balance derived directly from transactions.
 * Never trust browser-supplied balances.
 */
export async function computeCustomerBalance(
  ctx: QueryCtx | MutationCtx,
  customerId: Id<"customers">
) {
  const transactions = await ctx.db
    .query("transactions")
    .withIndex("by_customer", (q) => q.eq("customerId", customerId))
    .collect();

  let totalCredits = 0;
  let totalPayments = 0;
  let hasOverdue = false;
  let hasDueSoon = false;

  const todayStr = new Date().toISOString().split("T")[0];
  const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  for (const tx of transactions) {
    if (tx.type === "credit") {
      totalCredits += tx.amount;
      if (tx.dueDate) {
        if (tx.dueDate < todayStr) {
          hasOverdue = true;
        } else if (tx.dueDate <= threeDaysFromNow) {
          hasDueSoon = true;
        }
      }
    } else if (tx.type === "payment") {
      totalPayments += tx.amount;
    }
  }

  const outstandingBalance = Math.max(0, totalCredits - totalPayments);

  let status: "settled" | "overdue" | "due_soon" | "up_to_date" = "up_to_date";
  if (outstandingBalance === 0) {
    status = "settled";
  } else if (hasOverdue) {
    status = "overdue";
  } else if (hasDueSoon) {
    status = "due_soon";
  }

  return {
    totalCredits,
    totalPayments,
    outstandingBalance,
    status,
    transactionCount: transactions.length,
  };
}
