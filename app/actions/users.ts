"use server";

import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchMutation, fetchQuery, fetchAction } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { setRoleSchema, SetRoleValues, deleteUserSchema, DeleteUserValues } from "@/app/schemas/user";
import { cache } from "react";
import { revalidatePath } from "next/cache";

// ✅ cache() memoizes per request — no refetch unless revalidatePath() is called
export const getUsers = cache(async () => {
    const token = await convexAuthNextjsToken();
    return await fetchQuery(api.users.listUsers, {}, { token });
});

// ✅ Also cached per request
export const getCurrentUserRole = cache(async () => {
    const token = await convexAuthNextjsToken();
    const user = await fetchQuery(api.users.viewer, {}, { token });
    return user?.role;
});

export async function setUserRoleAction(values: SetRoleValues) {
    const validated = setRoleSchema.safeParse(values);
    if (!validated.success) {
        return { error: "Invalid input" };
    }

    const token = await convexAuthNextjsToken();
    try {
        await fetchAction(
            api.users.setUserRole,
            {
                targetUserId: validated.data.targetUserId as any,
                newRole: validated.data.newRole,
            },
            { token }
        );

        // Revalidate the users page to show updated data
        revalidatePath("/admin/users");

        return { success: true };
    } catch (error) {
        console.error("Failed to set user role:", error);
        return { error: "Failed to update role" };
    }
}

export async function deleteUserAction(values: DeleteUserValues) {
    const validated = deleteUserSchema.safeParse(values);
    if (!validated.success) {
        return { error: "Invalid input" };
    }

    const token = await convexAuthNextjsToken();
    try {
        await fetchAction(
            api.users.deleteUser,
            { targetUserId: validated.data.targetUserId as any },
            { token }
        );

        // Revalidate the users page to show updated data
        revalidatePath("/admin/users");

        return { success: true };
    } catch (error) {
        console.error("Failed to delete user:", error);
        return { error: "Failed to delete user" };
    }
}



export async function checkAdminAuth() {
    const token = await convexAuthNextjsToken();
    const user = await fetchQuery(api.users.viewer, {}, { token });

    // Only superadmins and admins allowed
    if (user?.role === "superadmin" || user?.role === "admin") {
        return { authorized: true };
    }
    return { authorized: false };
}