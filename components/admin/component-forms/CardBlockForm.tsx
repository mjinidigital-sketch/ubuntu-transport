"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ComponentFormProps } from "./form-registry";
import { Sparkles, Layers, Image as ImageIcon, Grid, List } from "lucide-react";

// Debounce hook for delayed updates
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function CardBlockForm({ props, onChange, mode = "edit" }: ComponentFormProps) {
  const collections = useQuery(api.collections.listPublishedCollections);
  const [localProps, setLocalProps] = React.useState(props);

  React.useEffect(() => {
    setLocalProps(props);
  }, [props]);

  const debouncedProps = useDebounce(localProps, 400);

  React.useEffect(() => {
    Object.keys(debouncedProps).forEach((key) => {
      if (debouncedProps[key] !== props[key]) {
        onChange(key, debouncedProps[key]);
      }
    });
  }, [debouncedProps, props, onChange]);

  const updateProp = (key: string, value: any) => {
    setLocalProps((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Information Banner */}
      <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 space-y-1">
        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
          <Sparkles className="w-4 h-4" />
          <span>Collection Card Integration</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Select any collection (like <strong>Services</strong>, <strong>Fleet</strong>, or <strong>Destinations</strong>) to dynamically render real-time cards on this route.
        </p>
      </div>

      {/* Collection Selector */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-foreground">
          Source Collection
        </Label>
        <Select
          value={localProps.collectionSlug || "none"}
          onValueChange={(val) => updateProp("collectionSlug", val === "none" ? undefined : val)}
        >
          <SelectTrigger className="h-10 bg-background">
            <SelectValue placeholder="Choose a collection..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Manual / Static Cards (No Collection)</SelectItem>
            {collections?.map((col) => (
              <SelectItem key={col._id} value={col.slug}>
                {col.icon ? `${col.icon} ` : ""}{col.name} ({col.slug})
              </SelectItem>
            ))}
            {/* Fallback items if query is still loading */}
            {!collections && (
              <>
                <SelectItem value="services">💼 Services (services)</SelectItem>
                <SelectItem value="fleet">🚐 Fleet (fleet)</SelectItem>
                <SelectItem value="destinations">🌍 Destinations (destinations)</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
        {localProps.collectionSlug && (
          <p className="text-xs text-muted-foreground">
            Displaying live cards from the <strong>{localProps.collectionSlug}</strong> collection.
          </p>
        )}
      </div>

      {/* Card Layout Variant */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-foreground">
          Card Layout Variant
        </Label>
        <Select
          value={localProps.variant || "image-cards"}
          onValueChange={(val) => updateProp("variant", val)}
        >
          <SelectTrigger className="h-10 bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="image-cards">📸 Image Cards (Photo + Details + CTA)</SelectItem>
            <SelectItem value="grid">🔲 Feature Grid Cards (Icon + Details)</SelectItem>
            <SelectItem value="list">📄 Horizontal List Cards (Side by side)</SelectItem>
            <SelectItem value="masonry">🧱 Masonry Cards (Dynamic height)</SelectItem>
            <SelectItem value="stats">📊 Stats Cards (Numeric counters)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Columns & Limit Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Columns</Label>
          <Select
            value={String(localProps.columns || 3)}
            onValueChange={(val) => updateProp("columns", Number(val))}
          >
            <SelectTrigger className="h-10 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 Columns (Wide)</SelectItem>
              <SelectItem value="3">3 Columns (Standard)</SelectItem>
              <SelectItem value="4">4 Columns (Compact)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Item Limit</Label>
          <Input
            type="number"
            min={1}
            max={50}
            value={localProps.limit || ""}
            onChange={(e) => updateProp("limit", e.target.value ? Number(e.target.value) : undefined)}
            placeholder="Show all items (or e.g. 3, 6)"
            className="h-10"
          />
        </div>
      </div>

      {/* Optional Tag Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Tag Filter (Optional)</Label>
        <Input
          value={localProps.tagFilter || ""}
          onChange={(e) => updateProp("tagFilter", e.target.value)}
          placeholder="e.g. Corporate, Safari, VIP"
          className="h-10"
        />
        <p className="text-xs text-muted-foreground">
          Only items matching this tag will be displayed.
        </p>
      </div>

      {/* Section Title */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Section Title</Label>
        <Input
          value={localProps.title || ""}
          onChange={(e) => updateProp("title", e.target.value)}
          placeholder="Leave blank to use collection name"
          className="h-10"
        />
      </div>

      {/* Section Subtitle */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Subtitle</Label>
        <Textarea
          value={localProps.subtitle || ""}
          onChange={(e) => updateProp("subtitle", e.target.value)}
          placeholder="Leave blank to use collection description"
          rows={2}
          className="resize-none"
        />
      </div>

      {/* Section Badge */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Badge Text</Label>
        <Input
          value={localProps.badge || ""}
          onChange={(e) => updateProp("badge", e.target.value)}
          placeholder="e.g. Featured, Highlights, Our Fleet"
          className="h-10"
        />
      </div>

      {/* View All Button Toggle */}
      <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-card">
        <div className="space-y-0.5">
          <Label className="text-sm font-medium">Show "View All" Button</Label>
          <p className="text-xs text-muted-foreground">
            Display a bottom link leading directly to the full collection page.
          </p>
        </div>
        <Switch
          checked={localProps.showViewAll !== false}
          onCheckedChange={(val) => updateProp("showViewAll", val)}
        />
      </div>

      {localProps.showViewAll !== false && localProps.collectionSlug && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Custom View All Button Text</Label>
          <Input
            value={localProps.viewAllText || ""}
            onChange={(e) => updateProp("viewAllText", e.target.value)}
            placeholder={`View All ${localProps.collectionSlug}`}
            className="h-10"
          />
        </div>
      )}
    </div>
  );
}
