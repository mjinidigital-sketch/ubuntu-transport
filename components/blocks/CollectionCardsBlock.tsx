"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CollectionCard } from "@/components/collection-card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export interface CollectionCardsBlockProps {
  title?: string;
  subtitle?: string;
  collectionSlug: string; // e.g., "services", "projects", "team"
  limit?: number; // max items to display
  columns?: 2 | 3 | 4;
  tagFilter?: string; // optional tag filter
  showViewAll?: boolean;
  viewAllText?: string;
  variant?: "grid" | "list" | "masonry";
}

export function CollectionCardsBlock({
  title,
  subtitle,
  collectionSlug,
  limit = 6,
  columns = 3,
  tagFilter,
  showViewAll = true,
  viewAllText,
  variant = "grid",
}: CollectionCardsBlockProps) {
  const collection = useQuery(
    api.collections.getCollectionBySlug,
    { slug: collectionSlug }
  );

  const items = useQuery(
    api.collections.getPublishedItemsByCollection,
    collection?._id ? { collectionId: collection._id } : "skip"
  );

  if (!collection || !items) {
    return (
      <div className="py-16 px-4">
        <div className="max-w-7xl mx-auto flex justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Filter by tag if specified
  let filteredItems = items;
  if (tagFilter && tagFilter.trim() !== "") {
    filteredItems = items.filter((item) =>
      item.tags?.some((t) => t.toLowerCase() === tagFilter.toLowerCase())
    );
  }

  // Apply limit
  if (limit && limit > 0) {
    filteredItems = filteredItems.slice(0, limit);
  }

  const displayTitle = title || collection.name;
  const displaySubtitle = subtitle || collection.description;

  const gridColsClass =
    columns === 2
      ? "grid-cols-1 md:grid-cols-2"
      : columns === 4
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  const layoutClass =
    variant === "list"
      ? "space-y-4 max-w-5xl mx-auto"
      : variant === "masonry"
      ? "columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6"
      : `grid ${gridColsClass} gap-6`;

  return (
    <section className="py-16 px-4 md:px-8 bg-background">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        {(displayTitle || displaySubtitle) && (
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
              {displayTitle}
            </h2>
            {displaySubtitle && (
              <p className="text-lg text-muted-foreground leading-relaxed">
                {displaySubtitle}
              </p>
            )}
          </div>
        )}

        {/* Items */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No items found in this collection.</p>
          </div>
        ) : (
          <div className={layoutClass}>
            {filteredItems.map((item) => (
              <CollectionCard
                key={item._id}
                item={item}
                collectionSlug={collectionSlug}
              />
            ))}
          </div>
        )}

        {/* View All Button */}
        {showViewAll && filteredItems.length > 0 && (
          <div className="text-center pt-8">
            <Link href={`/collections/${collectionSlug}`}>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 py-6 font-semibold group border-primary/30 hover:bg-primary hover:text-primary-foreground shadow-sm hover:shadow-md transition-all gap-2"
              >
                <span>
                  {viewAllText || `View All ${collection.name}`}
                </span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
