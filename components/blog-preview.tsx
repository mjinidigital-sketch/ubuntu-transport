"use client";

import { useState } from "react";
import { BlogBlock } from "@/components/blocks/BlogBlock";
import { BlockRenderer } from "@/components/BlockRenderer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Monitor, X, Smartphone, Tablet, Laptop, RotateCw } from "lucide-react";

interface BlogPreviewProps {
  open: boolean;
  onClose: () => void;
  post?: any;
  cmsPage?: any;
  variant?: "magazine" | "hero-focus" | "carousel" | "category-filter" | "compact-list" | "featured-sidebar" | "author-spotlight" | "podcast" | "video";
}

type DeviceType = "desktop" | "tablet" | "mobile";
type Orientation = "portrait" | "landscape";

export function BlogPreview({ open, onClose, post, cmsPage, variant = "magazine" }: BlogPreviewProps) {
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [orientation, setOrientation] = useState<Orientation>("portrait");

  if (!open) return null;

  const deviceDimensions = {
    desktop: { width: "100%", height: "100%" },
    tablet: { 
      portrait: { width: "768px", height: "1024px" },
      landscape: { width: "1024px", height: "768px" }
    },
    mobile: { 
      portrait: { width: "375px", height: "812px" },
      landscape: { width: "812px", height: "375px" }
    },
  };

  const getCurrentDimensions = () => {
    if (device === "desktop") return deviceDimensions.desktop;
    return deviceDimensions[device][orientation];
  };

  const dimensions = getCurrentDimensions();

  const mockPosts = post
    ? [
        {
          id: 1,
          title: post.title,
          excerpt: post.excerpt || "This is a preview of your blog post content...",
          category: post.category,
          date: post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : new Date().toLocaleDateString(),
          readTime: post.readTime || "5 min read",
          imageUrl: post.featuredImage || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
          author: {
            name: post.author?.name || "Author Name",
            avatar: post.author?.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
          },
        },
      ]
    : undefined;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-6xl h-[90vh] bg-background border border-border/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
          <div>
            <h2 className="text-xl font-bold">Blog Preview</h2>
            <p className="text-sm text-muted-foreground">Preview your blog post at different screen sizes</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={device === "desktop" ? "default" : "outline"}
              size="sm"
              onClick={() => setDevice("desktop")}
              className="rounded-lg gap-2"
            >
              <Laptop className="w-4 h-4" /> Desktop
            </Button>
            <Button
              variant={device === "tablet" ? "default" : "outline"}
              size="sm"
              onClick={() => setDevice("tablet")}
              className="rounded-lg gap-2"
            >
              <Tablet className="w-4 h-4" /> Tablet
            </Button>
            <Button
              variant={device === "mobile" ? "default" : "outline"}
              size="sm"
              onClick={() => setDevice("mobile")}
              className="rounded-lg gap-2"
            >
              <Smartphone className="w-4 h-4" /> Mobile
            </Button>
            {device !== "desktop" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOrientation(orientation === "portrait" ? "landscape" : "portrait")}
                className="rounded-lg gap-2"
              >
                <RotateCw className="w-4 h-4" /> {orientation === "portrait" ? "Landscape" : "Portrait"}
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-lg ml-4">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto bg-muted/30 p-8 flex items-center justify-center">
          <div
            className="bg-background rounded-xl shadow-lg overflow-auto transition-all duration-300"
            style={{ 
              width: dimensions.width, 
              height: device === "desktop" ? "auto" : dimensions.height,
              maxWidth: "100%",
              maxHeight: device === "desktop" ? "100%" : "80vh"
            }}
          >
            <div className="min-h-full">
              {post ? (
                <BlogBlock variant={variant as any} posts={mockPosts} />
              ) : cmsPage ? (
                <div className="min-h-full">
                  <div className="text-center text-muted-foreground mb-4 p-4 border-b bg-muted/30">
                    <p className="font-medium">CMS Page Preview: {cmsPage.title}</p>
                  </div>
                  {/* Render CMS page blocks using BlockRenderer */}
                  <div className="min-h-full">
                    <BlockRenderer blocks={cmsPage.blocks || []} />
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <p>No content to preview</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="outline">Device: {device}</Badge>
            {device !== "desktop" && (
              <Badge variant="outline">Orientation: {orientation}</Badge>
            )}
            <Badge variant="outline">Width: {dimensions.width}</Badge>
            {device !== "desktop" && (
              <Badge variant="outline">Height: {dimensions.height}</Badge>
            )}
            {variant && <Badge variant="outline">Variant: {variant}</Badge>}
          </div>
          <Button onClick={onClose} className="rounded-xl">
            Close Preview
          </Button>
        </div>
      </div>
    </div>
  );
}
