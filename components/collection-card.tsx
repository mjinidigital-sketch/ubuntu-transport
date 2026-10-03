"use client";

import Link from "next/link";
import { ArrowRight, Clock, User, MapPin, CheckCircle } from "lucide-react";

const ICON_NAME_TO_EMOJI: Record<string, string> = {
  briefcase: "💼",
  folder: "📁",
  users: "👥",
  package: "📦",
  services: "💼",
  projects: "📁",
  team: "👥",
  products: "📦",
  truck: "🚐",
  shield: "🛡️",
  heart: "❤️",
  plane: "✈️",
  trees: "🌳",
  "map-pin": "📍",
  "user-check": "✅",
  "truck-moving": "🚚",
};

function getIconDisplay(icon?: string): string {
  if (!icon) return "📦";
  if (icon.length > 1 && !/^[a-zA-Z-]+$/.test(icon)) return icon;
  return ICON_NAME_TO_EMOJI[icon] || "📦";
}

// Deterministic gradient per card based on title hash
function getCardAccent(title: string): { from: string; to: string; badge: string } {
  const palettes = [
    { from: "#262559", to: "#3d3a8c", badge: "rgba(38,37,89,0.85)" },
    { from: "#D72533", to: "#a01c27", badge: "rgba(215,37,51,0.85)" },
    { from: "#1a4a6e", to: "#0d2d45", badge: "rgba(26,74,110,0.85)" },
    { from: "#2d6a4f", to: "#1b4332", badge: "rgba(45,106,79,0.85)" },
    { from: "#7b3f00", to: "#5c3000", badge: "rgba(123,63,0,0.85)" },
  ];
  const idx = title.charCodeAt(0) % palettes.length;
  return palettes[idx];
}

interface CollectionCardProps {
  item: {
    _id: string;
    title: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    icon?: string;
    tags?: string[];
    metadata?: {
      duration?: string;
      client?: string;
      projectDate?: string;
      role?: string;
      stock?: number;
      features?: string[];
      location?: string;
    };
  };
  collectionSlug: string;
}

export function CollectionCard({ item, collectionSlug }: CollectionCardProps) {
  const { title, slug, description, imageUrl, icon, tags, metadata } = item;
  const accent = getCardAccent(title);
  const iconEmoji = getIconDisplay(icon);
  const topFeatures = metadata?.features?.slice(0, 2) ?? [];

  return (
    <Link href={`/collections/${collectionSlug}/${slug}`} className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl">
      <article className="relative h-full flex flex-col rounded-2xl overflow-hidden border border-border/60 bg-card shadow-sm transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-1 group-hover:border-primary/40">

        {/* ── IMAGE / ICON HERO ─────────────────────────────── */}
        <div className="relative w-full aspect-[16/9] overflow-hidden shrink-0">
          {imageUrl ? (
            <>
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              {/* Deep gradient for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            </>
          ) : (
            /* Animated gradient fallback */
            <div
              className="w-full h-full flex items-center justify-center relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${accent.from}, ${accent.to})` }}
            >
              {/* Decorative orbs */}
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white/10 blur-2xl group-hover:scale-150 transition-transform duration-700 delay-100" />
              <span className="relative text-7xl drop-shadow-lg group-hover:scale-110 transition-transform duration-500 select-none">
                {iconEmoji}
              </span>
            </div>
          )}

          {/* Tags overlay — top-left */}
          {tags && tags.length > 0 && (
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[80%]">
              {tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full text-white backdrop-blur-sm border border-white/20"
                  style={{ background: accent.badge }}
                >
                  {tag}
                </span>
              ))}
              {tags.length > 2 && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white/80 bg-black/40 backdrop-blur-sm border border-white/10">
                  +{tags.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Icon badge — bottom-right (when image exists) */}
          {imageUrl && icon && (
            <div className="absolute bottom-3 right-3 w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg border border-white/20 backdrop-blur-sm bg-black/40">
              {iconEmoji}
            </div>
          )}
        </div>

        {/* ── BODY ─────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 p-5 gap-3">
          {/* Title */}
          <h3 className="font-bold text-base leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>

          {/* Description */}
          {description && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
              {description}
            </p>
          )}

          {/* Key features (up to 2) */}
          {topFeatures.length > 0 && (
            <ul className="space-y-1.5 mt-1">
              {topFeatures.map((feat, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{feat}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Metadata chips */}
          {(metadata?.duration || metadata?.location || metadata?.client) && (
            <div className="flex flex-wrap gap-2 mt-auto pt-3 border-t border-border/50">
              {metadata.duration && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full">
                  <Clock className="w-3 h-3 text-primary" />
                  {metadata.duration}
                </span>
              )}
              {metadata.location && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full">
                  <MapPin className="w-3 h-3 text-primary" />
                  <span className="truncate max-w-[120px]">{metadata.location}</span>
                </span>
              )}
              {metadata.client && !metadata.location && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full">
                  <User className="w-3 h-3 text-primary" />
                  <span className="truncate max-w-[120px]">{metadata.client}</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── CTA STRIP ────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-5 py-3.5 border-t border-border/50 bg-muted/30 group-hover:bg-primary group-hover:border-primary transition-all duration-300"
        >
          <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary-foreground transition-colors duration-300 tracking-wide uppercase">
            Learn More
          </span>
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 group-hover:bg-primary-foreground/20 transition-all duration-300 group-hover:translate-x-0.5">
            <ArrowRight className="w-3.5 h-3.5 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
          </span>
        </div>

        {/* Shimmer overlay on hover */}
        <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
        </div>
      </article>
    </Link>
  );
}