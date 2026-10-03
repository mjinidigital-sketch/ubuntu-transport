// ✅ No "use client" — this is a Server Component
import { getInvoiceTemplates, getCurrentUserRole } from "@/app/actions/documents";
import { redirect } from "next/navigation";
import { InvoiceTemplatesDataTable } from "./InvoiceTemplatesDataTable";

const ALLOWED_ROLES = ["superadmin", "admin"];

export default async function InvoiceTemplatesPage() {
    const [templates, currentUserRole] = await Promise.all([
        getInvoiceTemplates(),
        getCurrentUserRole(),
    ]);

    // Redirect if not authorized
    if (!currentUserRole || !ALLOWED_ROLES.includes(currentUserRole)) {
        redirect("/unauthorized");
    }

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-3xl font-bold mb-6">Invoice Templates</h1>
            <InvoiceTemplatesDataTable
                data={templates ?? []}
                currentUserRole={currentUserRole}
            />
        </div>
    );
}
