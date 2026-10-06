import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── Queries ────────────────────────────────────────────────────────────────

export const listReceipts = query({
  handler: async (ctx) => {
    return await ctx.db.query("receipts").order("desc").collect();
  },
});

export const getReceipt = query({
  args: { id: v.id("receipts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getReceiptsByInvoice = query({
  args: { invoiceId: v.id("invoices") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("receipts")
      .withIndex("by_invoice", (q) => q.eq("invoiceId", args.invoiceId))
      .order("desc")
      .collect();
  },
});

// ─── Mutations ───────────────────────────────────────────────────────────────

export const createReceipt = mutation({
  args: {
    receiptNumber: v.string(),
    invoiceId: v.id("invoices"),
    clientId: v.id("clients"),
    receiptDate: v.number(),
    amount: v.string(),
    paymentMethod: v.union(
      v.literal("cash"),
      v.literal("bank_transfer"),
      v.literal("credit_card"),
      v.literal("debit_card"),
      v.literal("check"),
      v.literal("other")
    ),
    paymentReference: v.optional(v.string()),
    notes: v.optional(v.string()),
    stampUrl: v.optional(v.string()),
    signatureUrl: v.optional(v.string()),
    signatoryName: v.optional(v.string()),
    signatoryTitle: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("receipts", args);
  },
});

export const updateReceipt = mutation({
  args: {
    id: v.id("receipts"),
    receiptNumber: v.optional(v.string()),
    receiptDate: v.optional(v.number()),
    amount: v.optional(v.string()),
    paymentMethod: v.optional(
      v.union(
        v.literal("cash"),
        v.literal("bank_transfer"),
        v.literal("credit_card"),
        v.literal("debit_card"),
        v.literal("check"),
        v.literal("other")
      )
    ),
    paymentReference: v.optional(v.string()),
    notes: v.optional(v.string()),
    stampUrl: v.optional(v.string()),
    signatureUrl: v.optional(v.string()),
    signatoryName: v.optional(v.string()),
    signatoryTitle: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    await ctx.db.patch(id, rest);
  },
});

export const deleteReceipt = mutation({
  args: { id: v.id("receipts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// ─── Auto-generate receipt number ────────────────────────────────────────────

export const generateReceiptNumber = query({
  handler: async (ctx) => {
    const count = (await ctx.db.query("receipts").collect()).length + 1;
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    return `RCPT-${month}-${year}-${String(count).padStart(3, "0")}`;
  },
});
