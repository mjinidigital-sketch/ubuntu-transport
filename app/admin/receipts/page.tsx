// ✅ No "use client" — this is a Server Component
import { getReceipts, getCurrentUserRole, getClients, getInvoices } from "@/app/actions/documents";
import { redirect } from "next/navigation";
import { ReceiptsDataTable } from "./ReceiptsDataTable";

const ALLOWED_ROLES = ["superadmin", "admin", "staff"];

export default async function ReceiptsPage() {
    const [receipts, clients, invoices, currentUserRole] = await Promise.all([
        getReceipts(),
        getClients(),
        getInvoices(),
        getCurrentUserRole(),
    ]);

    // Redirect if not authorized
    if (!currentUserRole || !ALLOWED_ROLES.includes(currentUserRole)) {
        redirect("/unauthorized");
    }

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-3xl font-bold mb-6">Receipts</h1>
            <ReceiptsDataTable
                data={receipts ?? []}
                clients={clients ?? []}
                invoices={invoices ?? []}
                currentUserRole={currentUserRole}
            />
        </div>
    );
}
