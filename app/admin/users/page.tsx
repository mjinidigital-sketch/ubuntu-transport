// ✅ No "use client" — this is a Server Component
import { getUsers, getCurrentUserRole } from "@/app/actions/users";
import { redirect } from "next/navigation";
import { UsersDataTable } from "./UsersDataTable";

const ALLOWED_ROLES = ["superadmin", "admin"];

export default async function UsersPage() {
    const [users, currentUserRole] = await Promise.all([
        getUsers(),
        getCurrentUserRole(),
    ]);

    // Redirect if not authorized
    if (!currentUserRole || !ALLOWED_ROLES.includes(currentUserRole)) {
        redirect("/unauthorized");
    }

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-3xl font-bold mb-6">Users</h1>
            <UsersDataTable
                data={users ?? []}
                currentUserRole={currentUserRole}
            />
        </div>
    );
}