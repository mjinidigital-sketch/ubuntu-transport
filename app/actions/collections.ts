"use server";

import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { revalidatePath } from "next/cache";

export async function createCollectionAction(values: any) {
    const token = await convexAuthNextjsToken();
    try {
        await fetchMutation(api.collections.createCollection, values, { token });
        revalidatePath("/admin/collections");
        revalidatePath("/"); // Revalidate all pages since collections might be public
        return { success: true };
    } catch (error) {
        console.error("Failed to create collection:", error);
        return { error: "Failed to create collection" };
    }
}

export async function updateCollectionAction(id: string, values: any) {
    const token = await convexAuthNextjsToken();
    try {
        await fetchMutation(api.collections.updateCollection, { id: id as any, ...values }, { token });
        revalidatePath("/admin/collections");
        revalidatePath("/"); // Revalidate all pages since collection content changed
        return { success: true };
    } catch (error) {
        console.error("Failed to update collection:", error);
        return { error: "Failed to update collection" };
    }
}

export async function deleteCollectionAction(id: string) {
    const token = await convexAuthNextjsToken();
    try {
        await fetchMutation(api.collections.deleteCollection, { id: id as any }, { token });
        revalidatePath("/admin/collections");
        revalidatePath("/"); // Revalidate all pages since collection was deleted
        return { success: true };
    } catch (error) {
        console.error("Failed to delete collection:", error);
        return { error: "Failed to delete collection" };
    }
}

export async function createCollectionItemAction(values: any) {
    const token = await convexAuthNextjsToken();
    try {
        await fetchMutation(api.collections.createCollectionItem, values, { token });
        revalidatePath("/admin/collections");
        revalidatePath("/"); // Revalidate all pages since collection items might be public
        return { success: true };
    } catch (error) {
        console.error("Failed to create collection item:", error);
        return { error: "Failed to create collection item" };
    }
}

export async function updateCollectionItemAction(id: string, values: any) {
    const token = await convexAuthNextjsToken();
    try {
        await fetchMutation(api.collections.updateCollectionItem, { id: id as any, ...values }, { token });
        revalidatePath("/admin/collections");
        revalidatePath("/"); // Revalidate all pages since collection item content changed
        return { success: true };
    } catch (error) {
        console.error("Failed to update collection item:", error);
        return { error: "Failed to update collection item" };
    }
}

export async function deleteCollectionItemAction(id: string) {
    const token = await convexAuthNextjsToken();
    try {
        await fetchMutation(api.collections.deleteCollectionItem, { id: id as any }, { token });
        revalidatePath("/admin/collections");
        revalidatePath("/"); // Revalidate all pages since collection item was deleted
        return { success: true };
    } catch (error) {
        console.error("Failed to delete collection item:", error);
        return { error: "Failed to delete collection item" };
    }
}
