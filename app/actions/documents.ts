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
    return await fetchQuery(api.services.listServices, {}, { token });
});

export const getService = cache(async (id: string) => {
    const token = await convexAuthNextjsToken();
    return await fetchQuery(api.services.getService, { id: id as any }, { token });
});

export async function createServiceAction(values: any) {
    const token = await convexAuthNextjsToken();
    try {
        await fetchMutation(api.services.createService, values, { token });
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
        await fetchMutation(api.services.updateService, { id: id as any, ...values }, { token });
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
        await fetchMutation(api.services.deleteService, { id: id as any }, { token });
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
    return await fetchQuery(api.clients.listClients, {}, { token });
});

export const getClient = cache(async (id: string) => {
    const token = await convexAuthNextjsToken();
    return await fetchQuery(api.clients.getClient, { id: id as any }, { token });
});

export async function createClientAction(values: any) {
    const token = await convexAuthNextjsToken();
    try {
        await fetchMutation(api.clients.createClient, values, { token });
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
        await fetchMutation(api.clients.updateClient, { id: id as any, ...values }, { token });
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
        await fetchMutation(api.clients.deleteClient, { id: id as any }, { token });
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
    return await fetchQuery(api.quotations.listQuotations, {}, { token });
});

export const getQuotation = cache(async (id: string) => {
    const token = await convexAuthNextjsToken();
    return await fetchQuery(api.quotations.getQuotation, { id: id as any }, { token });
});

export async function generateQuotationNumberAction() {
    const token = await convexAuthNextjsToken();
    try {
        const number = await fetchQuery(api.quotations.generateQuotationNumber, {}, { token });
        return { success: true, number };
    } catch (error) {
        console.error("Failed to generate quotation number:", error);
        return { error: "Failed to generate quotation number" };
    }
}

export async function createQuotationAction(values: any) {
    const token = await convexAuthNextjsToken();
    try {
        await fetchMutation(api.quotations.createQuotation, values, { token });
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
        await fetchMutation(api.quotations.updateQuotation, { id: id as any, ...values }, { token });
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
        await fetchMutation(api.quotations.deleteQuotation, { id: id as any }, { token });
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
    return await fetchQuery(api.invoices.listInvoices, {}, { token });
});

export const getInvoice = cache(async (id: string) => {
    const token = await convexAuthNextjsToken();
    return await fetchQuery(api.invoices.getInvoice, { id: id as any }, { token });
});

export async function generateInvoiceNumberAction() {
    const token = await convexAuthNextjsToken();
    try {
        const number = await fetchQuery(api.invoices.generateInvoiceNumber, {}, { token });
        return { success: true, number };
    } catch (error) {
        console.error("Failed to generate invoice number:", error);
        return { error: "Failed to generate invoice number" };
    }
}

export async function createInvoiceAction(values: any) {
    const token = await convexAuthNextjsToken();
    try {
        await fetchMutation(api.invoices.createInvoice, values, { token });
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
        await fetchMutation(api.invoices.updateInvoice, { id: id as any, ...values }, { token });
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
        await fetchMutation(api.invoices.deleteInvoice, { id: id as any }, { token });
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
    return await fetchQuery(api.receipts.listReceipts, {}, { token });
});

export const getReceipt = cache(async (id: string) => {
    const token = await convexAuthNextjsToken();
    return await fetchQuery(api.receipts.getReceipt, { id: id as any }, { token });
});

export async function generateReceiptNumberAction() {
    const token = await convexAuthNextjsToken();
    try {
        const number = await fetchQuery(api.receipts.generateReceiptNumber, {}, { token });
        return { success: true, number };
    } catch (error) {
        console.error("Failed to generate receipt number:", error);
        return { error: "Failed to generate receipt number" };
    }
}

export async function createReceiptAction(values: any) {
    const token = await convexAuthNextjsToken();
    try {
        await fetchMutation(api.receipts.createReceipt, values, { token });
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
        await fetchMutation(api.receipts.updateReceipt, { id: id as any, ...values }, { token });
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
        await fetchMutation(api.receipts.deleteReceipt, { id: id as any }, { token });
        revalidatePath("/admin/receipts");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete receipt:", error);
        return { error: "Failed to delete receipt" };
    }
}
