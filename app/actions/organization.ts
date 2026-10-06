"use server";

import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { cache } from "react";
import { revalidatePath } from "next/cache";

export const getOrganization = cache(async () => {
    const token = await convexAuthNextjsToken();
    return await fetchQuery(api.organization.getOrganization, {}, { token });
});

export async function updateOrganizationAction(values: any) {
    const token = await convexAuthNextjsToken();
    try {
        await fetchMutation(api.organization.upsertOrganization, values, { token });
        revalidatePath("/"); // Revalidate all pages since organization affects metadata
        revalidatePath("/admin/organization");
        return { success: true };
    } catch (error) {
        console.error("Failed to update organization:", error);
        return { error: "Failed to update organization" };
    }
}
