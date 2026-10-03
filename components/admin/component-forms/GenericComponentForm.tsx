"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X, ImageIcon, VideoIcon } from "lucide-react";
import { getBlockConfig } from "@/components/blocks/block-config";
import { ImageUpload } from "@/components/ui/image-upload";
import { ImageArrayUpload } from "@/components/ui/image-array-upload";

interface GenericComponentFormProps {
  blockType: string;
  componentPath: string;
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

// Instant debounce for text inputs (faster response)
function useInstantDebounce<T>(value: T, delay: number): T {
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

export function GenericComponentForm({ 
  blockType, 
  componentPath, 
  props, 
  onChange, 
  mode = 'form' 
}: GenericComponentFormProps) {
  const [tagInput, setTagInput] = React.useState("");
  const [arrayInput, setArrayInput] = React.useState("");
  const [localProps, setLocalProps] = React.useState(props);

  // Sync local props when external props change
  React.useEffect(() => {
    setLocalProps(props);
  }, [props]);

  // Use instant debounce for text fields (150ms) and regular for others (500ms)
  const debouncedLocalProps = useDebounce(localProps, 500);
  const instantDebouncedLocalProps = useInstantDebounce(localProps, 150);

  // Sync debounced changes to external props
  React.useEffect(() => {
    Object.keys(instantDebouncedLocalProps).forEach(key => {
      if (instantDebouncedLocalProps[key] !== props[key]) {
        onChange(key, instantDebouncedLocalProps[key]);
      }
    });
  }, [instantDebouncedLocalProps, props, onChange]);

  const config = getBlockConfig(blockType);
  const variantConfig = config?.variants?.find(v => v.id === props.variant);
  const relevantProps = variantConfig?.props || Object.keys(config?.props || {});

  const addArrayItem = (key: string) => {
    const trimmed = arrayInput.trim();
    if (trimmed) {
      const currentArray = Array.isArray(localProps[key]) ? localProps[key] : [];
      setLocalProps((prev: any) => ({ ...prev, [key]: [...currentArray, trimmed] }));
      setArrayInput("");
    }
  };

  const removeArrayItem = (key: string, index: number) => {
    const currentArray = Array.isArray(localProps[key]) ? localProps[key] : [];
    setLocalProps((prev: any) => ({ ...prev, [key]: currentArray.filter((_: any, i: number) => i !== index) }));
  };

  const addTag = (key: string) => {
    const trimmed = tagInput.trim();
    if (trimmed) {
      const currentArray = Array.isArray(localProps[key]) ? localProps[key] : [];
      if (!currentArray.includes(trimmed)) {
        setLocalProps((prev: any) => ({ ...prev, [key]: [...currentArray, trimmed] }));
        setTagInput("");
      }
    }
  };

  const removeTag = (key: string, tag: string) => {
    const currentArray = Array.isArray(localProps[key]) ? localProps[key] : [];
    setLocalProps((prev: any) => ({ ...prev, [key]: currentArray.filter((t: string) => t !== tag) }));
  };

  if (mode === 'form') {
    // Only show variant selector
    return (
      <div className="space-y-4">
        {config && config.variants && config.variants.length > 1 && (
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700">Variant</Label>
            <Select
              value={localProps.variant || config.defaultVariant}
              onValueChange={(value) => setLocalProps((prev: any) => ({ ...prev, variant: value }))}
            >
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {config.variants.map((variant) => (
                  <SelectItem key={variant.id} value={variant.id}>
                    {variant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    );
  }

  const renderPropertyInput = (key: string, propConfig: any) => {
    const value = localProps[key] || '';
    const isArrayUrlField = key.toLowerCase().includes('url') || key.toLowerCase().includes('image');
    const arrayValue = Array.isArray(value) ? value : [];

    switch (propConfig.type) {
      case 'select':
        return (
          <div key={key} className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">
              {propConfig.label}
              {propConfig.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={value || propConfig.options?.[0]}
              onValueChange={(val) => setLocalProps((prev: any) => ({ ...prev, [key]: val }))}
            >
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {propConfig.options?.map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1).replace(/-/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'textarea':
        return (
          <div key={key} className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">
              {propConfig.label}
              {propConfig.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              value={value}
              onChange={(e) => setLocalProps((prev: any) => ({ ...prev, [key]: e.target.value }))}
              placeholder={propConfig.placeholder}
              rows={3}
              className="resize-none"
            />
          </div>
        );

      case 'array':
        if (isArrayUrlField && mode === 'media') {
          return (
            <div key={key} className="space-y-3">
              <ImageArrayUpload
                value={arrayValue}
                onChange={(value) => setLocalProps((prev: any) => ({ ...prev, [key]: value }))}
                label={propConfig.label}
                placeholder={propConfig.placeholder}
                required={propConfig.required}
                aspectRatio="video"
              />
            </div>
          );
        }

        // Regular array as tags
        return (
          <div key={key} className="space-y-3">
            <Label className="text-sm font-medium text-slate-700">
              {propConfig.label}
              {propConfig.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder={propConfig.placeholder}
                value={arrayInput}
                onChange={(e) => setArrayInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addArrayItem(key);
                  }
                }}
                className="h-10 flex-1"
              />
              <Button type="button" onClick={() => addArrayItem(key)} variant="secondary" className="h-10">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {arrayValue.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {arrayValue.map((item: string, index: number) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {item}
                    <button
                      type="button"
                      onClick={() => removeArrayItem(key, index)}
                      className="hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        );

      case 'boolean':
        return (
          <div key={key} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg">
            <input
              type="checkbox"
              className="w-4 h-4"
              checked={value}
              onChange={(e) => setLocalProps((prev: any) => ({ ...prev, [key]: e.target.checked }))}
            />
            <Label className="text-sm font-medium text-slate-700 cursor-pointer">
              {propConfig.label}
              {propConfig.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          </div>
        );

      case 'number':
        return (
          <div key={key} className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">
              {propConfig.label}
              {propConfig.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              type="number"
              value={value}
              onChange={(e) => setLocalProps((prev: any) => ({ ...prev, [key]: e.target.value }))}
              placeholder={propConfig.placeholder}
              className="h-10"
            />
          </div>
        );

      case 'image':
        return (
          <div key={key} className="space-y-2">
            <ImageUpload
              value={value}
              onChange={(value) => setLocalProps((prev: any) => ({ ...prev, [key]: value }))}
              label={propConfig.label}
              placeholder={propConfig.placeholder}
              required={propConfig.required}
              aspectRatio="video"
            />
          </div>
        );

      case 'video':
        return (
          <div key={key} className="space-y-2">
            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <VideoIcon className="w-4 h-4" /> {propConfig.label}
              {propConfig.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              type="url"
              value={value}
              onChange={(e) => setLocalProps((prev: any) => ({ ...prev, [key]: e.target.value }))}
              placeholder={propConfig.placeholder}
              className="h-10"
            />
            {value && (
              <div className="mt-2">
                <a 
                  href={value} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                >
                  Open video in new tab ↗
                </a>
              </div>
            )}
          </div>
        );

      case 'text':
      default:
        const isUrl = key.toLowerCase().includes('url') || key.toLowerCase().includes('link');
        return (
          <div key={key} className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">
              {propConfig.label}
              {propConfig.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              type={isUrl ? 'url' : 'text'}
              value={value}
              onChange={(e) => setLocalProps((prev: any) => ({ ...prev, [key]: e.target.value }))}
              placeholder={propConfig.placeholder}
              className="h-10"
            />
          </div>
        );
    }
  };

  if (mode === 'edit' || mode === 'media' || mode === 'block-editor') {
    // Filter properties based on mode
    const getFilteredProps = () => {
      const mediaProps = ['imageUrl', 'imageUrls', 'videoUrl', 'image', 'video'];
      const advancedProps = ['backgroundColor', 'textColor', 'buttonColor', 'animation', 'style', 'spacing', 'padding'];
      
      if (mode === 'media') {
        return Object.entries(config?.props || {}).filter(([key]) => 
          mediaProps.includes(key) && relevantProps.includes(key)
        );
      }
      
      if (mode === 'block-editor') {
        return Object.entries(config?.props || {}).filter(([key]) => 
          advancedProps.includes(key) && relevantProps.includes(key)
        );
      }
      
      // Edit mode - show content properties
      return Object.entries(config?.props || {}).filter(([key]) => 
        key !== 'variant' && !mediaProps.includes(key) && !advancedProps.includes(key) && relevantProps.includes(key)
      );
    };

    const filteredProps = getFilteredProps();

    return (
      <div className="space-y-4">
        {filteredProps.map(([key, propConfig]) => renderPropertyInput(key, propConfig))}
      </div>
    );
  }

  return null;
}