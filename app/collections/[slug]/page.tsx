"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CollectionCard } from "@/components/collection-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Grid, List, Search, Filter } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

const ICON_NAME_TO_EMOJI: Record<string, string> = {
  briefcase: "💼",
  folder: "📁",
  users: "👥",
  package: "📦",
  services: "💼",
  projects: "📁",
  team: "👥",
  products: "📦",
};

function getIconDisplay(icon?: string): string {
  if (!icon) return "📦";
  if (icon.length > 1 && !/^[a-zA-Z]+$/.test(icon)) return icon;
  return ICON_NAME_TO_EMOJI[icon] || "📦";
}

export default function CollectionPage() {
  const router = useRouter();
  const params = useParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const collection = useQuery(api.collections.getCollectionBySlug, { slug: params.slug as string });
  const items = useQuery(
    api.collections.getPublishedItemsByCollection,
    collection?._id ? { collectionId: collection._id as any } : "skip"
  );

  useEffect(() => {
    if (collection && !collection.published) {
      router.push("/collections");
    }
  }, [collection, router]);

  if (!collection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!collection.published) {
    return null;
  }

  const cardColumns = collection.cardColumns || 3;

  const getGridCols = () => {
    switch (cardColumns) {
      case 1: return "grid-cols-1";
      case 2: return "grid-cols-1 md:grid-cols-2";
      case 3: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case 4: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
      case 5: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";
      case 6: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6";
      default: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    }
  };

  const allTags = items?.reduce((tags: string[], item) => {
    if (item.tags) {
      item.tags.forEach(tag => {
        if (!tags.includes(tag)) tags.push(tag);
      });
    }
    return tags;
  }, []) || [];

  const filteredItems = items?.filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || (item.tags && item.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  }) || [];

  return (
    <div className="min-h-screen bg-background">

      {/* ── HERO HEADER ─────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-[#1a1560]" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 80%, #D72533 0%, transparent 50%), radial-gradient(circle at 80% 20%, #3d3a8c 0%, transparent 50%)",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 py-14 md:py-20">
          <Link href="/collections">
            <Button
              variant="ghost"
              size="sm"
              className="mb-8 text-white/70 hover:text-white hover:bg-white/10 border border-white/10 rounded-full gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              All Collections
            </Button>
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            {/* Title block */}
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-5xl shadow-2xl shrink-0">
                {getIconDisplay(collection.icon)}
              </div>
              <div>
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 mb-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold text-white/80 uppercase tracking-widest">
                    Collection
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-3">
                  {collection.name}
                </h1>
                {collection.description && (
                  <p className="text-white/70 text-base md:text-lg max-w-xl leading-relaxed">
                    {collection.description}
                  </p>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col items-start lg:items-end gap-3 shrink-0">
              {items && (
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
                  <span className="text-white font-bold text-2xl">{items.length}</span>
                  <span className="text-white/60 text-sm ml-1.5">items</span>
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={`rounded-xl h-9 px-3 ${
                    viewMode === "grid"
                      ? "bg-white text-primary hover:bg-white/90"
                      : "text-white/70 hover:text-white hover:bg-white/10 border border-white/10 bg-transparent"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={`rounded-xl h-9 px-3 ${
                    viewMode === "list"
                      ? "bg-white text-primary hover:bg-white/90"
                      : "text-white/70 hover:text-white hover:bg-white/10 border border-white/10 bg-transparent"
                  }`}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Fade to page background */}
        <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ── SEARCH & FILTER BAR ─────────────────────────────── */}
      <section className="sticky top-0 z-10 py-4 px-4 bg-background/80 backdrop-blur-xl border-b border-border/60 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 rounded-xl bg-muted/40 border-border/60 focus-visible:ring-primary/40 text-sm"
              />
            </div>

            {allTags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all duration-200 ${
                    selectedTag === null
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-muted/60 text-muted-foreground border-border/60 hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  All
                </button>
                {allTags.slice(0, 8).map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all duration-200 ${
                      selectedTag === tag
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-muted/60 text-muted-foreground border-border/60 hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
                {allTags.length > 8 && (
                  <span className="text-xs text-muted-foreground">+{allTags.length - 8} more</span>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── ITEMS GRID ──────────────────────────────────────── */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {!items ? (
            <div className="text-center py-20">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">Loading items…</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-24 h-24 rounded-3xl bg-primary/10 text-primary mx-auto flex items-center justify-center text-5xl mb-6 border border-primary/20 shadow-inner">
                📭
              </div>
              <h3 className="text-2xl font-bold mb-2">Nothing here yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
                This collection doesn&apos;t have any published items yet. Check back soon.
              </p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-2">No matches found</h3>
              <p className="text-muted-foreground text-sm">
                Try adjusting your search or filter.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-semibold text-foreground">{filteredItems.length}</span> of{" "}
                  <span className="font-semibold text-foreground">{items.length}</span>{" "}
                  item{items.length !== 1 ? "s" : ""}
                  {selectedTag && (
                    <>
                      {" "}filtered by{" "}
                      <span className="text-primary font-semibold">#{selectedTag}</span>
                    </>
                  )}
                </p>
              </div>

              <div className={`grid gap-7 ${getGridCols()}`}>
                {filteredItems.map((item) => (
                  <CollectionCard
                    key={item._id}
                    item={item}
                    collectionSlug={collection.slug}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}