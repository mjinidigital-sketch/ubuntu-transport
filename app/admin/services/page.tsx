// ✅ No "use client" — this is a Server Component
import { getServices, getCurrentUserRole } from "@/app/actions/documents";
import { redirect } from "next/navigation";
import { ServicesDataTable } from "./ServicesDataTable";

const ALLOWED_ROLES = ["superadmin", "admin", "staff"];

export default async function ServicesPage() {
    const [services, currentUserRole] = await Promise.all([
        getServices(),
        getCurrentUserRole(),
    ]);

    // Redirect if not authorized
    if (!currentUserRole || !ALLOWED_ROLES.includes(currentUserRole)) {
        redirect("/unauthorized");
    }

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-3xl font-bold mb-6">Service Catalogue</h1>
            <ServicesDataTable
                data={services ?? []}
                currentUserRole={currentUserRole}
            />
        </div>
    );
}
