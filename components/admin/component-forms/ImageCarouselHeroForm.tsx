"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X, ImageIcon } from "lucide-react";
import { ImageArrayUpload } from "@/components/ui/image-array-upload";

interface ImageCarouselHeroFormProps {
  props: any;
  onChange: (key: string, value: any) => void;
  mode?: 'form' | 'edit' | 'media' | 'block-editor';
}

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

export function ImageCarouselHeroForm({ props, onChange, mode = 'form' }: ImageCarouselHeroFormProps) {
  const [localProps, setLocalProps] = React.useState(props);

  // Sync local props when external props change
  React.useEffect(() => {
    setLocalProps(props);
  }, [props]);

  // Debounced local props for external updates
  const debouncedLocalProps = useDebounce(localProps, 500);

  // Sync debounced changes to external props
  React.useEffect(() => {
    Object.keys(debouncedLocalProps).forEach(key => {
      if (debouncedLocalProps[key] !== props[key]) {
        onChange(key, debouncedLocalProps[key]);
      }
    });
  }, [debouncedLocalProps, props, onChange]);
  if (mode === 'form') {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <p className="text-sm text-indigo-700">
            This component uses an image carousel. Configure your images in the Media tab.
          </p>
        </div>
      </div>
    );
  }

  if (mode === 'edit') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">Title</Label>
          <Input
            value={localProps.title || ''}
            onChange={(e) => setLocalProps((prev: any) => ({ ...prev, title: e.target.value }))}
            placeholder="Transform Your Digital Experience"
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">Subtitle</Label>
          <Textarea
            value={localProps.subtitle || ''}
            onChange={(e) => setLocalProps((prev: any) => ({ ...prev, subtitle: e.target.value }))}
            placeholder="Discover our powerful platform with cutting-edge features..."
            rows={3}
            className="resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">CTA Button Text</Label>
          <Input
            value={localProps.ctaText || ''}
            onChange={(e) => setLocalProps((prev: any) => ({ ...prev, ctaText: e.target.value }))}
            placeholder="Get Started"
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">CTA Link</Label>
          <Input
            value={localProps.ctaLink || ''}
            onChange={(e) => setLocalProps((prev: any) => ({ ...prev, ctaLink: e.target.value }))}
            placeholder="#"
            className="h-10"
          />
        </div>
      </div>
    );
  }

  if (mode === 'media') {
    const imageUrls = Array.isArray(localProps.imageUrls) ? localProps.imageUrls : [];

    return (
      <div className="space-y-4">
        <ImageArrayUpload
          value={imageUrls}
          onChange={(value) => setLocalProps((prev: any) => ({ ...prev, imageUrls: value }))}
          label="Carousel Images"
          placeholder="https://images.unsplash.com/..."
          aspectRatio="video"
        />

        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-xs text-amber-700">
            💡 <strong>Tip:</strong> Add at least 3 images for a smooth carousel experience. Images will auto-rotate every 5 seconds.
          </p>
        </div>
      </div>
    );
  }

  if (mode === 'block-editor') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">Auto-Play Interval</Label>
          <Input
            type="number"
            value={localProps.autoPlayInterval || 5000}
            onChange={(e) => setLocalProps((prev: any) => ({ ...prev, autoPlayInterval: parseInt(e.target.value) || 5000 }))}
            placeholder="5000"
            className="h-10"
          />
          <p className="text-xs text-slate-500">Time in milliseconds between image transitions (default: 5000ms)</p>
        </div>
      </div>
    );
  }

  return null;
}