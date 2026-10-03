"use server";

import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchMutation, fetchQuery, fetchAction } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { cache } from "react";
import { revalidatePath } from "next/cache";
import { getCurrentUserRole as getCurrentUserRoleFromUsers } from "./users";

// Re-export for convenience
export const getCurrentUserRole = getCurrentUserRoleFromUsers;

// ==================== SERVICES ====================

export const getServices = cache(async () => {
    const token = await convexAuthNextjsToken();
    return await fetchQuery(api.documents.listServices, {}, { token });
});

export const getService = cache(async (id: string) => {
    const token = await convexAuthNextjsToken();
    return await fetchQuery(api.documents.getService, { id: id as any }, { token });
});

export async function createServiceAction(values: any) {
    const token = await convexAuthNextjsToken();
    try {
        await fetchMutation(api.documents.createService, values, { token });
        revalidatePath("/admin/services");
        return { success: true };
    } catch (error) {
        console.error("Failed to create service:", error);
        return { error: "Failed to create service" };
    }
}

export async function updateServiceAction(id: string, values: any) {
    const token = await convexAuthNextjsToken();
    try {
        await fetchMutation(api.documents.updateService, { id: id as any, ...values }, { token });
        revalidatePath("/admin/services");
        return { success: true };
    } catch (error) {
        console.error("Failed to update service:", error);
        return { error: "Failed to update service" };
    }
}

export async function deleteServiceAction(id: string) {
    const token = await convexAuthNextjsToken();
    try {
        await fetchMutation(api.documents.deleteService, { id: id as any }, { token });
        revalidatePath("/admin/services");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete service:", error);
        return { error: "Failed to delete service" };
    }
}

// ==================== CLIENTS ====================

export const getClients = cache(async () => {
    const token = await convexAuthNextjsToken();
    return await fetchQuery(api.documents.listClients, {}, { token });
});

export const getClient = cache(async (id: string) => {
    const token = await convexAuthNextjsToken();
    return await fetchQuery(api.documents.getClient, { id: id as any }, { token });
});

export async function createClientAction(values: any) {
    const token = await convexAuthNextjsToken();
    try {
        await fetchMutation(api.documents.createClient, values, { token });
        revalidatePath("/admin/clients");
        return { success: true };
    } catch (error) {
        console.error("Failed to create client:", error);
        return { error: "Failed to create client" };
    }
}

export async function updateClientAction(id: string, values: any) {
    const token = await convexAuthNextjsToken();
    try {
        await fetchMutation(api.documents.updateClient, { id: id as any, ...values }, { token });
        revalidatePath("/admin/clients");
        return { success: true };
    } catch (error) {
        console.error("Failed to update client:", error);
        return { error: "Failed to update client" };
    }
}

export async function deleteClientAction(id: string) {
    const token = await convexAuthNextjsToken();
    try {
        await fetchMutation(api.documents.deleteClient, { id: id as any }, { token });
        revalidatePath("/admin/clients");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete client:", error);
        return { error: "Failed to delete client" };
    }
}

// ==================== QUOTATIONS ====================

export const getQuotations = cache(async () => {
    const token = await convexAuthNextjsToken();
    return await fetchQuery(api.documents.listQuotations, {}, { token });
});

export const getQuotation = cache(async (id: string) => {
    const token = await convexAuthNextjsToken();
    return await fetchQuery(api.documents.getQuotation, { id: id as any }, { token });
});

export async function generateQuotationNumberAction() {
    const token = await convexAuthNextjsToken();
    try {
        const number = await fetchAction(api.documents.generateQuotationNumber, {}, { token });
        return { success: true, number };
    } catch (error) {
        console.error("Failed to generate quotation number:", error);
        return { error: "Failed to generate quotation number" };
    }
}

export async function createQuotationAction(values: any) {
    const token = await convexAuthNextjsToken();
    try {
        await fetchMutation(api.documents.createQuotation, values, { token });
        revalidatePath("/admin/quotations");
        return { success: true };
    } catch (error) {
        console.error("Failed to create quotation:", error);
        return { error: "Failed to create quotation" };
    }
}

export async function updateQuotationAction(id: string, values: any) {
    const token = await convexAuthNextjsToken();
    try {
        await fetchMutation(api.documents.updateQuotation, { id: id as any, ...values }, { token });
        revalidatePath("/admin/quotations");
        return { success: true };
    } catch (error) {
        console.error("Failed to update quotation:", error);
        return { error: "Failed to update quotation" };
    }
}

export async function deleteQuotationAction(id: string) {
    const token = await convexAuthNextjsToken();
    try {
        await fetchMutation(api.documents.deleteQuotation, { id: id as any }, { token });
        revalidatePath("/admin/quotations");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete quotation:", error);
        return { error: "Failed to delete quotation" };
    }
}

// ==================== INVOICES ====================

export const getInvoices = cache(async () => {
    const token = await convexAuthNextjsToken();
    return await fetchQuery(api.documents.listInvoices, {}, { token });
});

export const getInvoice = cache(async (id: string) => {
    const token = await convexAuthNextjsToken();
    return await fetchQuery(api.documents.getInvoice, { id: id as any }, { token });
});

export async function generateInvoiceNumberAction() {
    const token = await convexAuthNextjsToken();
    try {
        const number = await fetchAction(api.documents.generateInvoiceNumber, {}, { token });
        return { success: true, number };
    } catch (error) {
        console.error("Failed to generate invoice number:", error);
        return { error: "Failed to generate invoice number" };
    }
}

export async function createInvoiceAction(values: any) {
    const token = await convexAuthNextjsToken();
    try {
        await fetchMutation(api.documents.createInvoice, values, { token });
        revalidatePath("/admin/invoices");
        return { success: true };
    } catch (error) {
        console.error("Failed to create invoice:", error);
        return { error: "Failed to create invoice" };
    }
}

export async function updateInvoiceAction(id: string, values: any) {
    const token = await convexAuthNextjsToken();
    try {
        await fetchMutation(api.documents.updateInvoice, { id: id as any, ...values }, { token });
        revalidatePath("/admin/invoices");
        return { success: true };
    } catch (error) {
        console.error("Failed to update invoice:", error);
        return { error: "Failed to update invoice" };
    }
}

export async function deleteInvoiceAction(id: string) {
    const token = await convexAuthNextjsToken();
    try {
        await fetchMutation(api.documents.deleteInvoice, { id: id as any }, { token });
        revalidatePath("/admin/invoices");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete invoice:", error);
        return { error: "Failed to delete invoice" };
    }
}

// ==================== RECEIPTS ====================

export const getReceipts = cache(async () => {
    const token = await convexAuthNextjsToken();
    return await fetchQuery(api.documents.listReceipts, {}, { token });
});

export const getReceipt = cache(async (id: string) => {
    const token = await convexAuthNextjsToken();
    return await fetchQuery(api.documents.getReceipt, { id: id as any }, { token });
});

export async function generateReceiptNumberAction() {
    const token = await convexAuthNextjsToken();
    try {
        const number = await fetchAction(api.documents.generateReceiptNumber, {}, { token });
        return { success: true, number };
    } catch (error) {
        console.error("Failed to generate receipt number:", error);
        return { error: "Failed to generate receipt number" };
    }
}

export async function createReceiptAction(values: any) {
    const token = await convexAuthNextjsToken();
    try {
        await fetchMutation(api.documents.createReceipt, values, { token });
        revalidatePath("/admin/receipts");
        revalidatePath("/admin/invoices");
        return { success: true };
    } catch (error) {
        console.error("Failed to create receipt:", error);
        return { error: "Failed to create receipt" };
    }
}

export async function updateReceiptAction(id: string, values: any) {
    const token = await convexAuthNextjsToken();
    try {
        await fetchMutation(api.documents.updateReceipt, { id: id as any, ...values }, { token });
        revalidatePath("/admin/receipts");
        return { success: true };
    } catch (error) {
        console.error("Failed to update receipt:", error);
        return { error: "Failed to update receipt" };
    }
}

export async function deleteReceiptAction(id: string) {
    const token = await convexAuthNextjsToken();
    try {
        await fetchMutation(api.documents.deleteReceipt, { id: id as any }, { token });
        revalidatePath("/admin/receipts");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete receipt:", error);
        return { error: "Failed to delete receipt" };
    }
}

// ==================== INVOICE TEMPLATES ====================

export const getInvoiceTemplates = cache(async () => {
    const token = await convexAuthNextjsToken();
    return await fetchQuery(api.documents.listInvoiceTemplates, {}, { token });
});

export const getInvoiceTemplate = cache(async (id: string) => {
    const token = await convexAuthNextjsToken();
    return await fetchQuery(api.documents.getInvoiceTemplate, { id: id as any }, { token });
});

export async function createInvoiceTemplateAction(values: any) {
    const token = await convexAuthNextjsToken();
    try {
        await fetchMutation(api.documents.createInvoiceTemplate, values, { token });
        revalidatePath("/admin/invoice-templates");
        return { success: true };
    } catch (error) {
        console.error("Failed to create invoice template:", error);
        return { error: "Failed to create invoice template" };
    }
}

export async function updateInvoiceTemplateAction(id: string, values: any) {
    const token = await convexAuthNextjsToken();
    try {
        await fetchMutation(api.documents.updateInvoiceTemplate, { id: id as any, ...values }, { token });
        revalidatePath("/admin/invoice-templates");
        return { success: true };
    } catch (error) {
        console.error("Failed to update invoice template:", error);
        return { error: "Failed to update invoice template" };
    }
}

export async function deleteInvoiceTemplateAction(id: string) {
    const token = await convexAuthNextjsToken();
    try {
        await fetchMutation(api.documents.deleteInvoiceTemplate, { id: id as any }, { token });
        revalidatePath("/admin/invoice-templates");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete invoice template:", error);
        return { error: "Failed to delete invoice template" };
    }
}
