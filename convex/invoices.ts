import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createInvoice = mutation({
  args: {
    invoiceNumber: v.string(),
    date: v.string(),
    dueDate: v.optional(v.string()),
    fromName: v.string(),
    fromEmail: v.string(),
    toName: v.string(),
    toEmail: v.string(),
    items: v.array(v.object({
      id: v.string(),
      description: v.string(),
      quantity: v.union(v.number(), v.string()),
      rate: v.union(v.number(), v.string()),
      amount: v.number(),
      numberOfDays: v.union(v.number(), v.string()),
    })),
    taxRate: v.union(v.number(), v.string()),
    taxAmount: v.number(),
    subtotal: v.number(),
    total: v.number(),
    notes: v.optional(v.string()),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("paid"),
      v.literal("partially_paid"),
      v.literal("overdue"),
      v.literal("cancelled")
    ),
    numberOfDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const invoiceId = await ctx.db.insert("invoices", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return invoiceId;
  },
});

export const updateInvoice = mutation({
  args: {
    id: v.id("invoices"),
    invoiceNumber: v.optional(v.string()),
    date: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    fromName: v.optional(v.string()),
    fromEmail: v.optional(v.string()),
    toName: v.optional(v.string()),
    toEmail: v.optional(v.string()),
    items: v.optional(v.array(v.object({
      id: v.string(),
      description: v.string(),
      quantity: v.union(v.number(), v.string()),
      rate: v.union(v.number(), v.string()),
      amount: v.number(),
      numberOfDays: v.union(v.number(), v.string()),
    }))),
    taxRate: v.optional(v.union(v.number(), v.string())),
    taxAmount: v.optional(v.number()),
    subtotal: v.optional(v.number()),
    total: v.optional(v.number()),
    notes: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("paid"),
      v.literal("partially_paid"),
      v.literal("overdue"),
      v.literal("cancelled")
    )),
    numberOfDays: v.optional(v.number()),
    paidAmount: v.optional(v.string()),
    balanceDue: v.optional(v.string()),
    paymentType: v.optional(v.union(v.literal("MPESA"), v.literal("BANK"), v.literal("CASH"), v.literal("OTHER"))),
    paymentReference: v.optional(v.string()),
    paymentDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;
    await ctx.db.patch(id, {
      ...updateData,
      updatedAt: Date.now(),
    });
  },
});

export const deleteInvoice = mutation({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const getInvoices = query({
  handler: async (ctx) => {
    const invoices = await ctx.db.query("invoices").order("desc").collect();
    return invoices;
  },
});

export const listInvoices = getInvoices;

export const getInvoice = query({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getInvoiceByNumber = query({
  args: { invoiceNumber: v.string() },
  handler: async (ctx, args) => {
    const invoice = await ctx.db
      .query("invoices")
      .withIndex("by_number", (q) => q.eq("invoiceNumber", args.invoiceNumber))
      .first();
    return invoice;
  },
});

export const generateInvoiceNumber = query({
  args: {},
  handler: async (ctx) => {
    const invoices = await ctx.db.query("invoices").collect();
    const count = invoices.length + 1;
    const year = new Date().getFullYear();
    return `INV-${year}-${String(count).padStart(4, "0")}`;
  },
});
