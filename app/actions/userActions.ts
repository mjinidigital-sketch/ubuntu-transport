"use server";

import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchAction, fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { revalidatePath } from "next/cache";
import { Id } from "@/convex/_generated/dataModel";

export async function setUserRoleAction(data: {
    targetUserId: string;
    newRole: string;
}) {
    const token = await convexAuthNextjsToken();
    await fetchAction(
        api.users.setUserRole,
        {
            targetUserId: data.targetUserId as Id<"users">,
            newRole: data.newRole as any,
        },
        { token },
    );

    // ✅ Only revalidates cache when role is changed
    revalidatePath("/dashboard/admin/users");
    return { success: true };
}

export async function deleteUserAction(data: { targetUserId: string }) {
    const token = await convexAuthNextjsToken();
    await fetchAction(
        api.users.deleteUser,
        { targetUserId: data.targetUserId as Id<"users"> },
        { token },
    );

    // ✅ Only revalidates cache when user is deleted   
    revalidatePath("/dashboard/admin/users");
    return { success: true };
}