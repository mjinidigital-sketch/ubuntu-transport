import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { BlockRenderer } from "@/components/BlockRenderer";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;
  const slugPath = slug.join("/");

  // Resolve matching schema node object from Convex database context directly during SSR lifecycle
  const page = await fetchQuery(api.pages.getBySlug, { slug: slugPath });

  if (!page) notFound();

  return <BlockRenderer blocks={page.blocks} />;
}
