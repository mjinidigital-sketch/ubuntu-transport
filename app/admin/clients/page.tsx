// ✅ No "use client" — this is a Server Component
import { getClients, getCurrentUserRole } from "@/app/actions/documents";
import { getUsers } from "@/app/actions/users";
import { redirect } from "next/navigation";
import { ClientsDataTable } from "./ClientsDataTable";

const ALLOWED_ROLES = ["superadmin", "admin", "staff"];

export default async function ClientsPage() {
    const [clients, users, currentUserRole] = await Promise.all([
        getClients(),
        getUsers(),
        getCurrentUserRole(),
    ]);

    // Redirect if not authorized
    if (!currentUserRole || !ALLOWED_ROLES.includes(currentUserRole)) {
        redirect("/unauthorized");
    }

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-3xl font-bold mb-6">Client Management</h1>
            <ClientsDataTable
                data={clients ?? []}
                users={users ?? []}
                currentUserRole={currentUserRole}
            />
        </div>
    );
}
