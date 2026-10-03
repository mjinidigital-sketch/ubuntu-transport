import { redirect } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { BlockRenderer } from "@/components/BlockRenderer";

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Get all published pages
  const pages = await fetchQuery(api.pages.getPublishedPagesForNav);

  if (!pages || pages.length === 0) {
    redirect("/admin/pages");
  }

  // Find the home page by title (case-insensitive)
  let page = pages.find(p => p.title.toLowerCase() === "home");

  // If no "Home" page found, use the first published page
  if (!page) {
    page = pages[0];
  }

  // Render the page directly at root "/" - navbar is handled by root layout
  return <BlockRenderer blocks={page.blocks} />;
}
