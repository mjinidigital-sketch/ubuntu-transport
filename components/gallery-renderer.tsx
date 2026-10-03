"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GalleryRendererProps {
  images: string[];
  type: "grid" | "carousel" | "masonry" | "slider";
}

export function GalleryRenderer({ images, type }: GalleryRendererProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!images || images.length === 0) {
    return null;
  }

  const filteredImages = images.filter(url => url);

  if (filteredImages.length === 0) {
    return null;
  }

  if (type === "grid") {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {filteredImages.map((url, index) => (
          <div key={index} className="aspect-square rounded-xl overflow-hidden border border-border/80 group cursor-pointer">
            <img
              src={url}
              alt={`Gallery ${index + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>
    );
  }

  if (type === "carousel") {
    return (
      <div className="relative">
        <div className="aspect-video rounded-xl overflow-hidden border border-border/80">
          <img
            src={filteredImages[currentIndex]}
            alt={`Gallery ${currentIndex + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
        {filteredImages.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
              onClick={() => setCurrentIndex((prev) => (prev === 0 ? filteredImages.length - 1 : prev - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
              onClick={() => setCurrentIndex((prev) => (prev === filteredImages.length - 1 ? 0 : prev + 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <div className="flex justify-center gap-2 mt-4">
              {filteredImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex ? "bg-primary scale-125" : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  if (type === "masonry") {
    return (
      <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
        {filteredImages.map((url, index) => (
          <div key={index} className="break-inside-avoid rounded-xl overflow-hidden border border-border/80 group cursor-pointer">
            <img
              src={url}
              alt={`Gallery ${index + 1}`}
              className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>
    );
  }

  if (type === "slider") {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
        {filteredImages.map((url, index) => (
          <div key={index} className="flex-shrink-0 w-80 snap-center">
            <div className="aspect-video rounded-xl overflow-hidden border border-border/80">
              <img
                src={url}
                alt={`Gallery ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}
