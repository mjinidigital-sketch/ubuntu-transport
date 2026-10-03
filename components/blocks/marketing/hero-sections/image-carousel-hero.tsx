"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ImageCarouselHeroProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  imageUrl?: string;
  imageUrls?: string[];
}

export default function ImageCarouselHero({
  title = "Build exceptional digital experiences",
  subtitle = "Our platform helps you create stunning websites and applications with ease, designed to engage your audience and drive results.",
  ctaText = "Get Started",
  ctaLink = "#",
  imageUrl,
  imageUrls,
}: ImageCarouselHeroProps) {
  const images = useMemo(() => {
    if (imageUrls?.length) {
      return imageUrls.map((src, index) => ({
        src,
        alt: `${title} ${index + 1}`,
      }));
    }

    if (imageUrl) {
      return [
        {
          src: imageUrl,
          alt: title,
        },
      ];
    }

    return [];
  }, [imageUrls, imageUrl, title]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    setCurrentImageIndex((current) =>
      Math.min(current, Math.max(images.length - 1, 0))
    );
  }, [images.length]);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = window.setInterval(() => {
      setCurrentImageIndex((current) => (current + 1) % images.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [images.length]);

  const goToNextImage = () => {
    if (images.length <= 1) return;

    setCurrentImageIndex((current) => (current + 1) % images.length);
  };

  const goToPreviousImage = () => {
    if (images.length <= 1) return;

    setCurrentImageIndex(
      (current) => (current - 1 + images.length) % images.length
    );
  };

  return (
    <section
      aria-label="Hero"
      className="relative isolate min-h-screen overflow-hidden bg-muted"
    >
      {/* Background images */}
      {images.length > 0 && (
        <div className="absolute inset-0 -z-10">
          {images.map((image, index) => (
            <div
              key={`${image.src}-${index}`}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImageIndex
                ? "opacity-100"
                : "pointer-events-none opacity-0"
                }`}
              aria-hidden={index !== currentImageIndex}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover object-center"
              />

              <div className="absolute inset-0 bg-black/40" />

              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          ))}
        </div>
      )}

      {/* Navigation */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={goToPreviousImage}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-black/25 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/50 focus:outline-none focus:ring-2 focus:ring-white sm:left-5 md:block"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          <button
            type="button"
            onClick={goToNextImage}
            aria-label="Next image"
            className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-black/25 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/50 focus:outline-none focus:ring-2 focus:ring-white sm:right-5 md:block"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </>
      )}

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-20 text-center sm:min-h-[580px] sm:px-6 sm:py-24 lg:min-h-[680px] lg:px-8">
        <div className="flex flex-col items-center justify-center w-full max-w-4xl">
          <div className="mt-20 flex flex-col items-center justify-center space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
              {title}
            </h1>

            <p className="mx-auto max-w-2xl text-base leading-7 text-white/90 ">
              {subtitle}
            </p>

            <div className="flex justify-center pt-6">
              <Button
                size="lg"
                className="h-12 rounded-full px-6 text-sm shadow-lg sm:h-13 sm:px-8 sm:text-base"
              >
                <Link href={ctaLink} className="flex items-center">
                  {ctaText}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Indicators */}
      {images.length > 1 && (
        <div
          className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 sm:bottom-7"
          role="tablist"
          aria-label="Hero images"
        >
          {images.map((image, index) => (
            <button
              key={`${image.src}-indicator`}
              type="button"
              onClick={() => setCurrentImageIndex(index)}
              role="tab"
              aria-selected={index === currentImageIndex}
              aria-label={`Go to image ${index + 1}`}
              className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white ${index === currentImageIndex
                ? "w-7 bg-white"
                : "w-2 bg-white/50 hover:bg-white/80"
                }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}