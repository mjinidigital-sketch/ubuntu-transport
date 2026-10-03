"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, CheckCircle2, TrendingUp, Star, Shield, Zap, Layers, Activity, Clock, DollarSign, Tag, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export interface CardItem {
  id?: string;
  title: string;
  description?: string;
  badge?: string;
  icon?: string;
  value?: string;
  change?: string;
  imageUrl?: string;
  linkText?: string;
  linkUrl?: string;
  metadata?: {
    price?: string;
    duration?: string;
    features?: string[];
    location?: string;
    client?: string;
  };
  tags?: string[];
}

export interface CardBlockProps {
  variant?: "grid" | "stats" | "action" | "image-cards" | "list" | "masonry";
  title?: string;
  subtitle?: string;
  badge?: string;
  cards?: CardItem[];
  columns?: 2 | 3 | 4;
  collectionSlug?: string; // e.g. "services", "fleet", "destinations"
  limit?: number; // max number of items to display
  tagFilter?: string; // optional tag filter
  showViewAll?: boolean; // display bottom link to full collection
  viewAllText?: string;
}

const DEFAULT_CARDS: CardItem[] = [
  {
    id: "1",
    title: "Instant Analytics",
    description: "Get real-time insights into user activity and engagement with integrated analytics dashboard.",
    badge: "Popular",
    icon: "Zap",
    linkText: "Learn more",
    linkUrl: "#",
  },
  {
    id: "2",
    title: "Automated Workflows",
    description: "Connect your tools and trigger automated workflows whenever new data arrives.",
    badge: "Automated",
    icon: "Activity",
    linkText: "Explore features",
    linkUrl: "#",
  },
  {
    id: "3",
    title: "Enterprise Security",
    description: "Bank-grade end-to-end encryption, role-based controls, and SOC2 compliant architecture.",
    badge: "Secure",
    icon: "Shield",
    linkText: "View compliance",
    linkUrl: "#",
  },
];

export function CardBlock({
  variant = "grid",
  title,
  subtitle,
  badge,
  cards,
  columns = 3,
  collectionSlug,
  limit,
  tagFilter,
  showViewAll = true,
  viewAllText,
}: CardBlockProps) {
  // Query dynamic collection if collectionSlug is set
  const collection = useQuery(
    api.collections.getCollectionBySlug,
    collectionSlug ? { slug: collectionSlug } : "skip"
  );

  const collectionItems = useQuery(
    api.collections.getPublishedItemsByCollection,
    collection?._id ? { collectionId: collection._id } : "skip"
  );

  // Compute final cards array
  const displayCards: CardItem[] = useMemo(() => {
    if (collectionSlug) {
      if (!collectionItems) return [];
      let filtered = collectionItems;
      if (tagFilter && tagFilter.trim() !== "") {
        filtered = filtered.filter((item) =>
          item.tags?.some((t) => t.toLowerCase() === tagFilter.toLowerCase())
        );
      }
      if (limit && limit > 0) {
        filtered = filtered.slice(0, limit);
      }
      return filtered.map((item) => {
        const price = item.metadata?.price;
        const topTag = item.tags && item.tags.length > 0 ? item.tags[0] : undefined;
        return {
          id: item._id,
          title: item.title,
          description: item.description,
          badge: price || topTag,
          icon: item.icon,
          imageUrl: item.imageUrl,
          linkText: "View Details",
          linkUrl: `/collections/${collectionSlug}/${item.slug}`,
          metadata: item.metadata,
          tags: item.tags,
        };
      });
    }

    if (cards && cards.length > 0) return cards;
    return DEFAULT_CARDS;
  }, [collectionSlug, collectionItems, tagFilter, limit, cards]);

  // Section titles with dynamic fallback from collection
  const displayTitle = title || (collection ? collection.name : "Explore Our Highlights");
  const displaySubtitle = subtitle || (collection ? collection.description : undefined);
  const displayBadge = badge || (collection ? collection.name : undefined);

  const gridColsClass =
    columns === 2
      ? "grid-cols-1 md:grid-cols-2"
      : columns === 4
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      : "grid-cols-1 md:grid-cols-3";

  // Effective layout variant: if image-cards, masonry, list, stats, or grid
  const effectiveVariant = variant === "action" ? "grid" : variant;

  return (
    <section className="py-16 px-4 md:px-8 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        {(displayTitle || displaySubtitle || displayBadge) && (
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            {displayBadge && (
              <Badge variant="outline" className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/5 text-primary border-primary/20">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 inline-block text-primary" />
                {displayBadge}
              </Badge>
            )}
            {displayTitle && <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">{displayTitle}</h2>}
            {displaySubtitle && <p className="text-lg text-muted-foreground leading-relaxed">{displaySubtitle}</p>}
          </div>
        )}

        {/* Loading state for collection query */}
        {collectionSlug && !collectionItems && (
          <div className="flex justify-center items-center py-16">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Variant 1: Grid Cards */}
        {effectiveVariant === "grid" && (
          <div className={`grid ${gridColsClass} gap-6`}>
            {displayCards.map((card, idx) => (
              <Card key={card.id || idx} className="group relative border border-border/80 bg-card hover:border-primary/50 hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden flex flex-col justify-between">
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                      {card.icon === "Zap" && <Zap className="w-6 h-6" />}
                      {card.icon === "Shield" && <Shield className="w-6 h-6" />}
                      {card.icon === "Activity" && <Activity className="w-6 h-6" />}
                      {card.icon === "Star" && <Star className="w-6 h-6" />}
                      {card.icon === "Sparkles" && <Sparkles className="w-6 h-6" />}
                      {(!card.icon || !["Zap", "Shield", "Activity", "Star", "Sparkles"].includes(card.icon)) && (
                        <Layers className="w-6 h-6" />
                      )}
                    </div>
                    {card.badge && (
                      <Badge variant="secondary" className="rounded-full text-xs max-w-[200px] truncate">
                        {card.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                    {card.title}
                  </CardTitle>
                  {card.description && (
                    <CardDescription className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {card.description}
                    </CardDescription>
                  )}
                  {card.metadata?.duration && (
                    <div className="flex items-center text-xs text-muted-foreground pt-1">
                      <Clock className="w-3.5 h-3.5 mr-1 text-primary" />
                      <span>{card.metadata.duration}</span>
                    </div>
                  )}
                </CardHeader>
                {card.linkText && (
                  <CardFooter className="pt-0">
                    <Link href={card.linkUrl || "#"} className="w-full">
                      <Button variant="ghost" className="w-full justify-between group-hover:bg-primary/10 rounded-xl">
                        <span>{card.linkText}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Variant 2: Image Cards */}
        {effectiveVariant === "image-cards" && (
          <div className={`grid ${gridColsClass} gap-8`}>
            {displayCards.map((card, idx) => (
              <Card key={card.id || idx} className="group overflow-hidden border border-border/80 bg-card hover:border-primary/50 rounded-2xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="aspect-video relative overflow-hidden bg-muted">
                    <img
                      src={card.imageUrl || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80"}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {card.badge && (
                      <Badge className="absolute top-3 right-3 bg-background/90 text-foreground backdrop-blur-md rounded-full px-3 py-1 shadow-sm max-w-[200px] truncate">
                        {card.badge}
                      </Badge>
                    )}
                  </div>
                  <CardHeader className="space-y-2 pb-2">
                    <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">
                      {card.title}
                    </CardTitle>
                    {card.description && (
                      <CardDescription className="line-clamp-2 text-sm text-muted-foreground">
                        {card.description}
                      </CardDescription>
                    )}
                    {card.metadata?.duration && (
                      <div className="flex items-center text-xs text-muted-foreground pt-1">
                        <Clock className="w-3.5 h-3.5 mr-1 text-primary" />
                        <span>{card.metadata.duration}</span>
                      </div>
                    )}
                  </CardHeader>
                </div>
                {card.linkText && (
                  <CardFooter className="pt-2">
                    <Link href={card.linkUrl || "#"} className="w-full">
                      <Button className="w-full rounded-xl gap-2 font-medium">
                        {card.linkText} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Variant 3: Horizontal List Cards */}
        {effectiveVariant === "list" && (
          <div className="space-y-4 max-w-5xl mx-auto">
            {displayCards.map((card, idx) => (
              <Card key={card.id || idx} className="group overflow-hidden border border-border/80 hover:border-primary/50 hover:shadow-lg transition-all duration-300 rounded-2xl flex flex-col sm:flex-row items-center justify-between p-4 gap-6">
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                  {card.imageUrl ? (
                    <div className="w-full sm:w-36 h-28 rounded-xl overflow-hidden shrink-0 bg-muted">
                      <img
                        src={card.imageUrl}
                        alt={card.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-xl">
                      <Layers className="w-6 h-6" />
                    </div>
                  )}
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                      <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                        {card.title}
                      </h3>
                      {card.badge && (
                        <Badge variant="outline" className="text-xs">
                          {card.badge}
                        </Badge>
                      )}
                    </div>
                    {card.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 max-w-xl">
                        {card.description}
                      </p>
                    )}
                    {card.metadata?.duration && (
                      <span className="inline-flex items-center text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1 text-primary" />
                        {card.metadata.duration}
                      </span>
                    )}
                  </div>
                </div>
                {card.linkText && (
                  <div className="shrink-0 w-full sm:w-auto">
                    <Link href={card.linkUrl || "#"}>
                      <Button variant="outline" className="w-full rounded-xl gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        {card.linkText} <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Variant 4: Masonry Cards */}
        {effectiveVariant === "masonry" && (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {displayCards.map((card, idx) => (
              <Card key={card.id || idx} className="break-inside-avoid group border border-border/80 hover:border-primary/50 hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
                {card.imageUrl && (
                  <div className="aspect-auto max-h-56 overflow-hidden bg-muted">
                    <img
                      src={card.imageUrl}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                      {card.title}
                    </CardTitle>
                    {card.badge && (
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {card.badge}
                      </Badge>
                    )}
                  </div>
                  {card.description && (
                    <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                      {card.description}
                    </CardDescription>
                  )}
                </CardHeader>
                {card.linkText && (
                  <CardFooter className="pt-0">
                    <Link href={card.linkUrl || "#"} className="w-full">
                      <Button variant="ghost" size="sm" className="w-full justify-between group-hover:bg-primary/10 rounded-xl">
                        <span>{card.linkText}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Variant 5: Stats Cards */}
        {effectiveVariant === "stats" && (
          <div className={`grid ${gridColsClass} gap-6`}>
            {displayCards.map((card, idx) => (
              <Card key={card.id || idx} className="border border-border/80 bg-gradient-to-br from-card to-card/60 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{card.title}</span>
                  {card.badge && <Badge variant="outline">{card.badge}</Badge>}
                </div>
                <div className="text-4xl font-extrabold text-foreground mb-2">{card.value || "12,450+"}</div>
                {card.description && <p className="text-sm text-muted-foreground">{card.description}</p>}
                {card.change && (
                  <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                    {card.change}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Bottom CTA to View Full Collection */}
        {showViewAll && collectionSlug && (
          <div className="text-center pt-8">
            <Link href={`/collections/${collectionSlug}`}>
              <Button size="lg" variant="outline" className="rounded-full px-8 py-6 font-semibold group border-primary/30 hover:bg-primary hover:text-primary-foreground shadow-sm hover:shadow-md transition-all gap-2">
                <span>{viewAllText || `View All ${collection?.name || collectionSlug}`}</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

