"use server";

import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export async function getNavbarPages() {
  try {
    const pages = await fetchQuery(api.pages.getPublishedPagesForNav);

    if (!pages || pages.length === 0) {
      return [];
    }

    // Sort pages: Home first, then alphabetically by title
    const sortedPages = [...pages].sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();

      // Home always comes first
      if (aTitle === "home" && bTitle !== "home") return -1;
      if (bTitle === "home" && aTitle !== "home") return 1;

      // Then sort alphabetically
      return aTitle.localeCompare(bTitle);
    });

    return sortedPages;
  } catch (error) {
    console.error("Failed to fetch navbar pages:", error);
    return [];
  }
}

export async function getOrganizationSettings() {
  try {
    const organization = await fetchQuery(api.organization.getOrganization);
    return organization;
  } catch (error) {
    console.error("Failed to fetch organization settings:", error);
    return null;
  }
}
