import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { BlockRenderer } from "@/components/BlockRenderer";
import { notFound } from "next/navigation";

export const revalidate = 3600; // Revalidate every hour

export default async function BlogPage() {
  // Resolve matching blog page from Convex database
  const page = await fetchQuery(api.pages.getPublishedBySlug, { slug: "blog" });

  if (!page) {
    // Fallback to default blog page if no CMS page exists
    return (
      <div className="min-h-screen bg-background">
        <div className="py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Our Blog</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Insights, tutorials, and stories from our team
            </p>
          </div>
        </div>
        <div className="py-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-xl text-muted-foreground">No custom blog page configured. Create one in the admin panel.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="w-full min-h-screen bg-background">
      <BlockRenderer blocks={page.blocks} />
    </main>
  );
}