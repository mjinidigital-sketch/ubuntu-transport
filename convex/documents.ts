import { mutation, query, action, internalQuery } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { auth } from "./auth";
import { api, internal } from "./_generated/api";

// ==================== SERVICES ====================

// List all services
export const listServices = query({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new ConvexError("Not authenticated");

        const currentUser = await ctx.db.get(userId);
        if (!currentUser) throw new ConvexError("User not found");

        const ALLOWED_ROLES = ["superadmin", "admin", "staff"];
        if (!currentUser.role || !ALLOWED_ROLES.includes(currentUser.role)) {
            throw new ConvexError("Not authorized");
        }

        return await ctx.db.query("services").collect();
    },
});

// Get a single service
export const getService = query({
    args: { id: v.id("services") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new ConvexError("Not authenticated");

        const currentUser = await ctx.db.get(userId);
        if (!currentUser) throw new ConvexError("User not found");

        const ALLOWED_ROLES = ["superadmin", "admin", "staff"];
        if (!currentUser.role || !ALLOWED_ROLES.includes(currentUser.role)) {
            throw new ConvexError("Not authorized");
        }

        return await ctx.db.get(args.id);
    },
});

// Create a service
export const createService = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
        category: v.optional(v.string()),
        duration: v.optional(v.string()),
        features: v.optional(v.array(v.string())),
        imageUrl: v.optional(v.string()),
        icon: v.optional(v.string()),
        active: v.boolean(),
        order: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new ConvexError("Not authenticated");

        const currentUser = await ctx.db.get(userId);
        if (!currentUser) throw new ConvexError("User not found");

        const ALLOWED_ROLES = ["superadmin", "admin", "staff"];
        if (!currentUser.role || !ALLOWED_ROLES.includes(currentUser.role)) {
            throw new ConvexError("Not authorized");
        }

        const serviceId = await ctx.db.insert("services", {
            ...args,
        });

        return serviceId;
    },
});

// Update a service
export const updateService = mutation({
    args: {
        id: v.id("services"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        category: v.optional(v.string()),
        duration: v.optional(v.string()),
        features: v.optional(v.array(v.string())),
        imageUrl: v.optional(v.string()),
        icon: v.optional(v.string()),
        active: v.optional(v.boolean()),
        order: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new ConvexError("Not authenticated");

        const currentUser = await ctx.db.get(userId);
        if (!currentUser) throw new ConvexError("User not found");

        const ALLOWED_ROLES = ["superadmin", "admin", "staff"];
        if (!currentUser.role || !ALLOWED_ROLES.includes(currentUser.role)) {
            throw new ConvexError("Not authorized");
        }

        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});

// Delete a service
export const deleteService = mutation({
    args: { id: v.id("services") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new ConvexError("Not authenticated");

        const currentUser = await ctx.db.get(userId);
        if (!currentUser) throw new ConvexError("User not found");

        const ALLOWED_ROLES = ["superadmin", "admin"];
        if (!currentUser.role || !ALLOWED_ROLES.includes(currentUser.role)) {
            throw new ConvexError("Not authorized");
        }

        await ctx.db.delete(args.id);
    },
});

// ==================== CLIENTS ====================

// List all clients
export const listClients = query({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new ConvexError("Not authenticated");

        const currentUser = await ctx.db.get(userId);
        if (!currentUser) throw new ConvexError("User not found");

        const ALLOWED_ROLES = ["superadmin", "admin", "staff"];
        if (!currentUser.role || !ALLOWED_ROLES.includes(currentUser.role)) {
            throw new ConvexError("Not authorized");
        }

        const clients = await ctx.db.query("clients").collect();
        
        // Fetch user details for linked users
        const clientsWithUsers = await Promise.all(
            clients.map(async (client) => {
                if (client.userId) {
                    const user = await ctx.db.get(client.userId);
                    return { ...client, user };
                }
                return { ...client, user: null };
            })
        );

        return clientsWithUsers;
    },
});

// Get a single client
export const getClient = query({
    args: { id: v.id("clients") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new ConvexError("Not authenticated");

        const currentUser = await ctx.db.get(userId);
        if (!currentUser) throw new ConvexError("User not found");

        const ALLOWED_ROLES = ["superadmin", "admin", "staff"];
        if (!currentUser.role || !ALLOWED_ROLES.includes(currentUser.role)) {
            throw new ConvexError("Not authorized");
        }

        const client = await ctx.db.get(args.id);
        if (!client) return null;

        if (client.userId) {
            const user = await ctx.db.get(client.userId);
            return { ...client, user };
        }

        return { ...client, user: null };
    },
});

// Create a client
export const createClient = mutation({
    args: {
        name: v.string(),
        userId: v.optional(v.id("users")),
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        address: v.optional(v.string()),
        city: v.optional(v.string()),
        state: v.optional(v.string()),
        country: v.optional(v.string()),
        postalCode: v.optional(v.string()),
        companyName: v.optional(v.string()),
        taxId: v.optional(v.string()),
        notes: v.optional(v.string()),
        active: v.boolean(),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new ConvexError("Not authenticated");

        const currentUser = await ctx.db.get(userId);
        if (!currentUser) throw new ConvexError("User not found");

        const ALLOWED_ROLES = ["superadmin", "admin", "staff"];
        if (!currentUser.role || !ALLOWED_ROLES.includes(currentUser.role)) {
            throw new ConvexError("Not authorized");
        }

        const clientId = await ctx.db.insert("clients", {
            ...args,
        });

        return clientId;
    },
});

// Update a client
export const updateClient = mutation({
    args: {
        id: v.id("clients"),
        name: v.optional(v.string()),
        userId: v.optional(v.id("users")),
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        address: v.optional(v.string()),
        city: v.optional(v.string()),
        state: v.optional(v.string()),
        country: v.optional(v.string()),
        postalCode: v.optional(v.string()),
        companyName: v.optional(v.string()),
        taxId: v.optional(v.string()),
        notes: v.optional(v.string()),
        active: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new ConvexError("Not authenticated");

        const currentUser = await ctx.db.get(userId);
        if (!currentUser) throw new ConvexError("User not found");

        const ALLOWED_ROLES = ["superadmin", "admin", "staff"];
        if (!currentUser.role || !ALLOWED_ROLES.includes(currentUser.role)) {
            throw new ConvexError("Not authorized");
        }

        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});

// Delete a client
export const deleteClient = mutation({
    args: { id: v.id("clients") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new ConvexError("Not authenticated");

        const currentUser = await ctx.db.get(userId);
        if (!currentUser) throw new ConvexError("User not found");

        const ALLOWED_ROLES = ["superadmin", "admin"];
        if (!currentUser.role || !ALLOWED_ROLES.includes(currentUser.role)) {
            throw new ConvexError("Not authorized");
        }

        await ctx.db.delete(args.id);
    },
});

// ==================== QUOTATIONS ====================

// Internal list functions for actions
export const listQuotationsInternal = internalQuery({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("quotations").collect();
    },
});

export const listInvoicesInternal = internalQuery({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("invoices").collect();
    },
});

export const listReceiptsInternal = internalQuery({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("receipts").collect();
    },
});

// List all quotations
export const listQuotations = query({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new ConvexError("Not authenticated");

        const currentUser = await ctx.db.get(userId);
        if (!currentUser) throw new ConvexError("User not found");

        const ALLOWED_ROLES = ["superadmin", "admin", "staff"];
        if (!currentUser.role || !ALLOWED_ROLES.includes(currentUser.role)) {
            throw new ConvexError("Not authorized");
        }

        const quotations = await ctx.db.query("quotations").collect();
        
        // Fetch client details
        const quotationsWithClients = await Promise.all(
            quotations.map(async (quotation) => {
                const client = await ctx.db.get(quotation.clientId);
                return { ...quotation, client };
            })
        );

        return quotationsWithClients;
    },
});

// Get a single quotation
export const getQuotation = query({
    args: { id: v.id("quotations") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new ConvexError("Not authenticated");

        const currentUser = await ctx.db.get(userId);
        if (!currentUser) throw new ConvexError("User not found");

        const ALLOWED_ROLES = ["superadmin", "admin", "staff"];
        if (!currentUser.role || !ALLOWED_ROLES.includes(currentUser.role)) {
            throw new ConvexError("Not authorized");
        }

        const quotation = await ctx.db.get(args.id);
        if (!quotation) return null;

        const client = await ctx.db.get(quotation.clientId);
        return { ...quotation, client };
    },
});

// Generate unique quotation number
export const generateQuotationNumber = action({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new ConvexError("Not authenticated");

        const currentUser = await ctx.runQuery(api.users.viewer, {});
        if (!currentUser) throw new ConvexError("User not found");

        const ALLOWED_ROLES = ["superadmin", "admin", "staff"];
        if (!currentUser.role || !ALLOWED_ROLES.includes(currentUser.role)) {
            throw new ConvexError("Not authorized");
        }

        const quotations = await ctx.runQuery(internal.documents.listQuotationsInternal, {});
        const count: number = quotations.length + 1;
        const year = new Date().getFullYear();
        return `QT-${year}-${String(count).padStart(4, '0')}`;
    },
});

// Create a quotation
export const createQuotation = mutation({
    args: {
        quotationNumber: v.string(),
        clientId: v.id("clients"),
        quotationDate: v.number(),
        validUntil: v.optional(v.number()),
        status: v.union(
            v.literal("draft"),
            v.literal("sent"),
            v.literal("accepted"),
            v.literal("rejected"),
            v.literal("expired")
        ),
        items: v.array(v.object({
            serviceId: v.optional(v.id("services")),
            description: v.string(),
            quantity: v.number(),
            unitPrice: v.string(),
            total: v.string(),
        })),
        subtotal: v.string(),
        taxRate: v.optional(v.number()),
        taxAmount: v.optional(v.string()),
        discountAmount: v.optional(v.string()),
        total: v.string(),
        notes: v.optional(v.string()),
        terms: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new ConvexError("Not authenticated");

        const currentUser = await ctx.db.get(userId);
        if (!currentUser) throw new ConvexError("User not found");

        const ALLOWED_ROLES = ["superadmin", "admin", "staff"];
        if (!currentUser.role || !ALLOWED_ROLES.includes(currentUser.role)) {
            throw new ConvexError("Not authorized");
        }

        const quotationId = await ctx.db.insert("quotations", {
            ...args,
        });

        return quotationId;
    },
});

// Update a quotation
export const updateQuotation = mutation({
    args: {
        id: v.id("quotations"),
        quotationNumber: v.optional(v.string()),
        clientId: v.optional(v.id("clients")),
        quotationDate: v.optional(v.number()),
        validUntil: v.optional(v.number()),
        status: v.optional(v.union(
            v.literal("draft"),
            v.literal("sent"),
            v.literal("accepted"),
            v.literal("rejected"),
            v.literal("expired")
        )),
        items: v.optional(v.array(v.object({
            serviceId: v.optional(v.id("services")),
            description: v.string(),
            quantity: v.number(),
            unitPrice: v.string(),
            total: v.string(),
        }))),
        subtotal: v.optional(v.string()),
        taxRate: v.optional(v.number()),
        taxAmount: v.optional(v.string()),
        discountAmount: v.optional(v.string()),
        total: v.optional(v.string()),
        notes: v.optional(v.string()),
        terms: v.optional(v.string()),
        convertedToInvoiceId: v.optional(v.id("invoices")),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new ConvexError("Not authenticated");

        const currentUser = await ctx.db.get(userId);
        if (!currentUser) throw new ConvexError("User not found");

        const ALLOWED_ROLES = ["superadmin", "admin", "staff"];
        if (!currentUser.role || !ALLOWED_ROLES.includes(currentUser.role)) {
            throw new ConvexError("Not authorized");
        }

        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});

// Delete a quotation
export const deleteQuotation = mutation({
    args: { id: v.id("quotations") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new ConvexError("Not authenticated");

        const currentUser = await ctx.db.get(userId);
        if (!currentUser) throw new ConvexError("User not found");

        const ALLOWED_ROLES = ["superadmin", "admin"];
        if (!currentUser.role || !ALLOWED_ROLES.includes(currentUser.role)) {
            throw new ConvexError("Not authorized");
        }

        await ctx.db.delete(args.id);
    },
});

// ==================== INVOICES ====================

// List all invoices
export const listInvoices = query({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new ConvexError("Not authenticated");

        const currentUser = await ctx.db.get(userId);
        if (!currentUser) throw new ConvexError("User not found");

        const ALLOWED_ROLES = ["superadmin", "admin", "staff"];
        if (!currentUser.role || !ALLOWED_ROLES.includes(currentUser.role)) {
            throw new ConvexError("Not authorized");
        }

        const invoices = await ctx.db.query("invoices").collect();
        
        // Fetch client details
        const invoicesWithClients = await Promise.all(
            invoices.map(async (invoice) => {
                const client = await ctx.db.get(invoice.clientId);
                return { ...invoice, client };
            })
        );

        return invoicesWithClients;
    },
});

// Get a single invoice
export const getInvoice = query({
    args: { id: v.id("invoices") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new ConvexError("Not authenticated");

        const currentUser = await ctx.db.get(userId);
        if (!currentUser) throw new ConvexError("User not found");

        const ALLOWED_ROLES = ["superadmin", "admin", "staff"];
        if (!currentUser.role || !ALLOWED_ROLES.includes(currentUser.role)) {
            throw new ConvexError("Not authorized");
        }

        const invoice = await ctx.db.get(args.id);
        if (!invoice) return null;

        const client = await ctx.db.get(invoice.clientId);
        let quotation = null;
        if (invoice.quotationId) {
            quotation = await ctx.db.get(invoice.quotationId);
        }

        return { ...invoice, client, quotation };
    },
});

// Generate unique invoice number
export const generateInvoiceNumber = action({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new ConvexError("Not authenticated");

        const currentUser = await ctx.runQuery(api.users.viewer, {});
        if (!currentUser) throw new ConvexError("User not found");

        const ALLOWED_ROLES = ["superadmin", "admin", "staff"];
        if (!currentUser.role || !ALLOWED_ROLES.includes(currentUser.role)) {
            throw new ConvexError("Not authorized");
        }

        const invoices = await ctx.runQuery(internal.documents.listInvoicesInternal, {});
        const count: number = invoices.length + 1;
        const year = new Date().getFullYear();
        return `INV-${year}-${String(count).padStart(4, '0')}`;
    },
});

// Create an invoice
export const createInvoice = mutation({
    args: {
        invoiceNumber: v.string(),
        clientId: v.id("clients"),
        quotationId: v.optional(v.id("quotations")),
        invoiceDate: v.number(),
        dueDate: v.optional(v.number()),
        status: v.union(
            v.literal("draft"),
            v.literal("sent"),
            v.literal("paid"),
            v.literal("overdue"),
            v.literal("cancelled")
        ),
        items: v.array(v.object({
            serviceId: v.optional(v.id("services")),
            description: v.string(),
            quantity: v.number(),
            unitPrice: v.string(),
            total: v.string(),
        })),
        subtotal: v.string(),
        taxRate: v.optional(v.number()),
        taxAmount: v.optional(v.string()),
        discountAmount: v.optional(v.string()),
        total: v.string(),
        paidAmount: v.optional(v.string()),
        balanceDue: v.optional(v.string()),
        notes: v.optional(v.string()),
        terms: v.optional(v.string()),
        templateId: v.optional(v.id("invoiceTemplates")),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new ConvexError("Not authenticated");

        const currentUser = await ctx.db.get(userId);
        if (!currentUser) throw new ConvexError("User not found");

        const ALLOWED_ROLES = ["superadmin", "admin", "staff"];
        if (!currentUser.role || !ALLOWED_ROLES.includes(currentUser.role)) {
            throw new ConvexError("Not authorized");
        }

        const invoiceId = await ctx.db.insert("invoices", {
            ...args,
        });

        // If created from quotation, link it
        if (args.quotationId) {
            await ctx.db.patch(args.quotationId, {
                convertedToInvoiceId: invoiceId,
            });
        }

        return invoiceId;
    },
});

// Update an invoice
export const updateInvoice = mutation({
    args: {
        id: v.id("invoices"),
        invoiceNumber: v.optional(v.string()),
        clientId: v.optional(v.id("clients")),
        quotationId: v.optional(v.id("quotations")),
        invoiceDate: v.optional(v.number()),
        dueDate: v.optional(v.number()),
        status: v.optional(v.union(
            v.literal("draft"),
            v.literal("sent"),
            v.literal("paid"),
            v.literal("overdue"),
            v.literal("cancelled")
        )),
        items: v.optional(v.array(v.object({
            serviceId: v.optional(v.id("services")),
            description: v.string(),
            quantity: v.number(),
            unitPrice: v.string(),
            total: v.string(),
        }))),
        subtotal: v.optional(v.string()),
        taxRate: v.optional(v.number()),
        taxAmount: v.optional(v.string()),
        discountAmount: v.optional(v.string()),
        total: v.optional(v.string()),
        paidAmount: v.optional(v.string()),
        balanceDue: v.optional(v.string()),
        notes: v.optional(v.string()),
        terms: v.optional(v.string()),
        templateId: v.optional(v.id("invoiceTemplates")),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new ConvexError("Not authenticated");

        const currentUser = await ctx.db.get(userId);
        if (!currentUser) throw new ConvexError("User not found");

        const ALLOWED_ROLES = ["superadmin", "admin", "staff"];
        if (!currentUser.role || !ALLOWED_ROLES.includes(currentUser.role)) {
            throw new ConvexError("Not authorized");
        }

        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});

// Delete an invoice
export const deleteInvoice = mutation({
    args: { id: v.id("invoices") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new ConvexError("Not authenticated");

        const currentUser = await ctx.db.get(userId);
        if (!currentUser) throw new ConvexError("User not found");

        const ALLOWED_ROLES = ["superadmin", "admin"];
        if (!currentUser.role || !ALLOWED_ROLES.includes(currentUser.role)) {
            throw new ConvexError("Not authorized");
        }

        await ctx.db.delete(args.id);
    },
});

// ==================== RECEIPTS ====================

// List all receipts
export const listReceipts = query({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new ConvexError("Not authenticated");

        const currentUser = await ctx.db.get(userId);
        if (!currentUser) throw new ConvexError("User not found");

        const ALLOWED_ROLES = ["superadmin", "admin", "staff"];
        if (!currentUser.role || !ALLOWED_ROLES.includes(currentUser.role)) {
            throw new ConvexError("Not authorized");
        }

        const receipts = await ctx.db.query("receipts").collect();
        
        // Fetch invoice and client details
        const receiptsWithDetails = await Promise.all(
            receipts.map(async (receipt) => {
                const invoice = await ctx.db.get(receipt.invoiceId);
                const client = await ctx.db.get(receipt.clientId);
                return { ...receipt, invoice, client };
            })
        );

        return receiptsWithDetails;
    },
});

// Get a single receipt
export const getReceipt = query({
    args: { id: v.id("receipts") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new ConvexError("Not authenticated");

        const currentUser = await ctx.db.get(userId);
        if (!currentUser) throw new ConvexError("User not found");

        const ALLOWED_ROLES = ["superadmin", "admin", "staff"];
        if (!currentUser.role || !ALLOWED_ROLES.includes(currentUser.role)) {
            throw new ConvexError("Not authorized");
        }

        const receipt = await ctx.db.get(args.id);
        if (!receipt) return null;

        const invoice = await ctx.db.get(receipt.invoiceId);
        const client = await ctx.db.get(receipt.clientId);

        return { ...receipt, invoice, client };
    },
});

// Generate unique receipt number
export const generateReceiptNumber = action({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new ConvexError("Not authenticated");

        const currentUser = await ctx.runQuery(api.users.viewer, {});
        if (!currentUser) throw new ConvexError("User not found");

        const ALLOWED_ROLES = ["superadmin", "admin", "staff"];
        if (!currentUser.role || !ALLOWED_ROLES.includes(currentUser.role)) {
            throw new ConvexError("Not authorized");
        }

        const receipts = await ctx.runQuery(internal.documents.listReceiptsInternal, {});
        const count: number = receipts.length + 1;
        const year = new Date().getFullYear();
        return `RCPT-${year}-${String(count).padStart(4, '0')}`;
    },
});

// Create a receipt
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
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new ConvexError("Not authenticated");

        const currentUser = await ctx.db.get(userId);
        if (!currentUser) throw new ConvexError("User not found");

        const ALLOWED_ROLES = ["superadmin", "admin", "staff"];
        if (!currentUser.role || !ALLOWED_ROLES.includes(currentUser.role)) {
            throw new ConvexError("Not authorized");
        }

        const receiptId = await ctx.db.insert("receipts", {
            ...args,
        });

        // Update invoice paid amount
        const invoice = await ctx.db.get(args.invoiceId);
        if (invoice) {
            const currentPaid = parseFloat(invoice.paidAmount || "0");
            const newPaid = currentPaid + parseFloat(args.amount);
            const total = parseFloat(invoice.total);
            const balance = total - newPaid;
            
            await ctx.db.patch(args.invoiceId, {
                paidAmount: newPaid.toString(),
                balanceDue: balance.toString(),
                status: balance <= 0 ? "paid" : invoice.status,
            });
        }

        return receiptId;
    },
});

// Update a receipt
export const updateReceipt = mutation({
    args: {
        id: v.id("receipts"),
        receiptNumber: v.optional(v.string()),
        invoiceId: v.optional(v.id("invoices")),
        clientId: v.optional(v.id("clients")),
        receiptDate: v.optional(v.number()),
        amount: v.optional(v.string()),
        paymentMethod: v.optional(v.union(
            v.literal("cash"),
            v.literal("bank_transfer"),
            v.literal("credit_card"),
            v.literal("debit_card"),
            v.literal("check"),
            v.literal("other")
        )),
        paymentReference: v.optional(v.string()),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new ConvexError("Not authenticated");

        const currentUser = await ctx.db.get(userId);
        if (!currentUser) throw new ConvexError("User not found");

        const ALLOWED_ROLES = ["superadmin", "admin", "staff"];
        if (!currentUser.role || !ALLOWED_ROLES.includes(currentUser.role)) {
            throw new ConvexError("Not authorized");
        }

        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});

// Delete a receipt
export const deleteReceipt = mutation({
    args: { id: v.id("receipts") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new ConvexError("Not authenticated");

        const currentUser = await ctx.db.get(userId);
        if (!currentUser) throw new ConvexError("User not found");

        const ALLOWED_ROLES = ["superadmin", "admin"];
        if (!currentUser.role || !ALLOWED_ROLES.includes(currentUser.role)) {
            throw new ConvexError("Not authorized");
        }

        await ctx.db.delete(args.id);
    },
});

// ==================== INVOICE TEMPLATES ====================

// List all invoice templates
export const listInvoiceTemplates = query({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new ConvexError("Not authenticated");

        const currentUser = await ctx.db.get(userId);
        if (!currentUser) throw new ConvexError("User not found");

        const ALLOWED_ROLES = ["superadmin", "admin", "staff"];
        if (!currentUser.role || !ALLOWED_ROLES.includes(currentUser.role)) {
            throw new ConvexError("Not authorized");
        }

        return await ctx.db.query("invoiceTemplates").collect();
    },
});

// Get a single invoice template
export const getInvoiceTemplate = query({
    args: { id: v.id("invoiceTemplates") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new ConvexError("Not authenticated");

        const currentUser = await ctx.db.get(userId);
        if (!currentUser) throw new ConvexError("User not found");

        const ALLOWED_ROLES = ["superadmin", "admin", "staff"];
        if (!currentUser.role || !ALLOWED_ROLES.includes(currentUser.role)) {
            throw new ConvexError("Not authorized");
        }

        return await ctx.db.get(args.id);
    },
});

// Create an invoice template
export const createInvoiceTemplate = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
        style: v.union(
            v.literal("modern"),
            v.literal("classic"),
            v.literal("minimal")
        ),
        primaryColor: v.optional(v.string()),
        secondaryColor: v.optional(v.string()),
        logoPosition: v.union(
            v.literal("left"),
            v.literal("center"),
            v.literal("right")
        ),
        showLogo: v.boolean(),
        showStamps: v.boolean(),
        showCompanyDetails: v.boolean(),
        showPaymentDetails: v.boolean(),
        showTerms: v.boolean(),
        defaultTerms: v.optional(v.string()),
        active: v.boolean(),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new ConvexError("Not authenticated");

        const currentUser = await ctx.db.get(userId);
        if (!currentUser) throw new ConvexError("User not found");

        const ALLOWED_ROLES = ["superadmin", "admin"];
        if (!currentUser.role || !ALLOWED_ROLES.includes(currentUser.role)) {
            throw new ConvexError("Not authorized");
        }

        const templateId = await ctx.db.insert("invoiceTemplates", {
            ...args,
        });

        return templateId;
    },
});

// Update an invoice template
export const updateInvoiceTemplate = mutation({
    args: {
        id: v.id("invoiceTemplates"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        style: v.optional(v.union(
            v.literal("modern"),
            v.literal("classic"),
            v.literal("minimal")
        )),
        primaryColor: v.optional(v.string()),
        secondaryColor: v.optional(v.string()),
        logoPosition: v.optional(v.union(
            v.literal("left"),
            v.literal("center"),
            v.literal("right")
        )),
        showLogo: v.optional(v.boolean()),
        showStamps: v.optional(v.boolean()),
        showCompanyDetails: v.optional(v.boolean()),
        showPaymentDetails: v.optional(v.boolean()),
        showTerms: v.optional(v.boolean()),
        defaultTerms: v.optional(v.string()),
        active: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new ConvexError("Not authenticated");

        const currentUser = await ctx.db.get(userId);
        if (!currentUser) throw new ConvexError("User not found");

        const ALLOWED_ROLES = ["superadmin", "admin"];
        if (!currentUser.role || !ALLOWED_ROLES.includes(currentUser.role)) {
            throw new ConvexError("Not authorized");
        }

        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});

// Delete an invoice template
export const deleteInvoiceTemplate = mutation({
    args: { id: v.id("invoiceTemplates") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new ConvexError("Not authenticated");

        const currentUser = await ctx.db.get(userId);
        if (!currentUser) throw new ConvexError("User not found");

        const ALLOWED_ROLES = ["superadmin", "admin"];
        if (!currentUser.role || !ALLOWED_ROLES.includes(currentUser.role)) {
            throw new ConvexError("Not authorized");
        }

        await ctx.db.delete(args.id);
    },
});
