// ✅ No "use client" — this is a Server Component
import { getQuotations, getCurrentUserRole, getClients, getServices } from "@/app/actions/documents";
import { redirect } from "next/navigation";
import { QuotationsDataTable } from "./QuotationsDataTable";

const ALLOWED_ROLES = ["superadmin", "admin", "staff"];

export default async function QuotationsPage() {
    const [quotations, clients, services, currentUserRole] = await Promise.all([
        getQuotations(),
        getClients(),
        getServices(),
        getCurrentUserRole(),
    ]);

    // Redirect if not authorized
    if (!currentUserRole || !ALLOWED_ROLES.includes(currentUserRole)) {
        redirect("/unauthorized");
    }

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-3xl font-bold mb-6">Quotations</h1>
            <QuotationsDataTable
                data={quotations ?? []}
                clients={clients ?? []}
                services={services ?? []}
                currentUserRole={currentUserRole}
            />
        </div>
    );
}
