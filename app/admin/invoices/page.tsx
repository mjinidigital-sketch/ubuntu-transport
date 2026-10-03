// ✅ No "use client" — this is a Server Component
import { getInvoices, getCurrentUserRole, getClients, getServices, getQuotations, getInvoiceTemplates } from "@/app/actions/documents";
import { redirect } from "next/navigation";
import { InvoicesDataTable } from "./InvoicesDataTable";

const ALLOWED_ROLES = ["superadmin", "admin", "staff"];

export default async function InvoicesPage() {
    const [invoices, clients, services, quotations, templates, currentUserRole] = await Promise.all([
        getInvoices(),
        getClients(),
        getServices(),
        getQuotations(),
        getInvoiceTemplates(),
        getCurrentUserRole(),
    ]);

    // Redirect if not authorized
    if (!currentUserRole || !ALLOWED_ROLES.includes(currentUserRole)) {
        redirect("/unauthorized");
    }

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-3xl font-bold mb-6">Invoices</h1>
            <InvoicesDataTable
                data={invoices ?? []}
                clients={clients ?? []}
                services={services ?? []}
                quotations={quotations ?? []}
                templates={templates ?? []}
                currentUserRole={currentUserRole}
            />
        </div>
    );
}
