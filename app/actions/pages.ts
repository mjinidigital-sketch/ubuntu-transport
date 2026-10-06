"use server";

import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { revalidatePath } from "next/cache";

export async function createPageAction(values: any) {
    const token = await convexAuthNextjsToken();
    try {
        await fetchMutation(api.pages.createPage, values, { token });
        revalidatePath("/admin/pages");
        revalidatePath("/"); // Revalidate all pages since new page might be public
        return { success: true };
    } catch (error) {
        console.error("Failed to create page:", error);
        return { error: "Failed to create page" };
    }
}

export async function updatePageAction(id: string, values: any) {
    const token = await convexAuthNextjsToken();
    try {
        await fetchMutation(api.pages.updatePage, { id: id as any, ...values }, { token });
        revalidatePath("/admin/pages");
        revalidatePath("/"); // Revalidate all pages since page content changed
        return { success: true };
    } catch (error) {
        console.error("Failed to update page:", error);
        return { error: "Failed to update page" };
    }
}

export async function deletePageAction(id: string) {
    const token = await convexAuthNextjsToken();
    try {
        await fetchMutation(api.pages.deletePage, { id: id as any }, { token });
        revalidatePath("/admin/pages");
        revalidatePath("/"); // Revalidate all pages since page was deleted
        return { success: true };
    } catch (error) {
        console.error("Failed to delete page:", error);
        return { error: "Failed to delete page" };
    }
}

export async function setPublishStatusAction(id: string, published: boolean) {
    const token = await convexAuthNextjsToken();
    try {
        await fetchMutation(api.pages.setPublishStatus, { id: id as any, published }, { token });
        revalidatePath("/admin/pages");
        revalidatePath("/"); // Revalidate all pages since publish status changed
        return { success: true };
    } catch (error) {
        console.error("Failed to set publish status:", error);
        return { error: "Failed to set publish status" };
    }
}
