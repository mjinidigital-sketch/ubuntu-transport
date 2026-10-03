"use client";

import { getBlockConfig, BlockVariant } from "./block-config";
import { lazy, Suspense } from "react";

// Dynamic component loader cache
const componentCache = new Map<string, React.ComponentType<any>>();

// Dynamic import mapping based on component paths
const componentImportMap: Record<string, () => Promise<{ default: React.ComponentType<any> }>> = {
  // Hero sections
  './marketing/hero-sections/split-content-hero': () => import('./marketing/hero-sections/split-content-hero'),
  './marketing/hero-sections/animated-gradient': () => import('./marketing/hero-sections/animated-gradient'),
  './marketing/hero-sections/gradient-mesh-hero': () => import('./marketing/hero-sections/gradient-mesh-hero'),
  './marketing/hero-sections/video-background-hero': () => import('./marketing/hero-sections/video-background-hero'),
  './marketing/hero-sections/image-carousel-hero': () => import('./marketing/hero-sections/image-carousel-hero'),
  './marketing/hero-sections/countdown-hero': () => import('./marketing/hero-sections/countdown-hero'),
  './marketing/hero-sections/split-with-video': () => import('./marketing/hero-sections/split-with-video'),
  './marketing/hero-sections/with-3d-mockup': () => import('./marketing/hero-sections/with-3d-mockup'),
  './Hero': () => import('./Hero').then(m => ({ default: m.Hero })),
  
  // Feature sections
  './marketing/feature-sections/3d-cards': () => import('./marketing/feature-sections/3d-cards'),
  './marketing/feature-sections/with-carousel': () => import('./marketing/feature-sections/with-carousel'),
  './Features': () => import('./Features').then(m => ({ default: m.Features })),
  
  // Blog sections
  './marketing/blog-sections/magazine-layout': () => import('./marketing/blog-sections/magazine-layout'),
  './marketing/blog-sections/hero-focus': () => import('./marketing/blog-sections/hero-focus'),
  './marketing/blog-sections/carousel': () => import('./marketing/blog-sections/carousel'),
  './marketing/blog-sections/category-filter': () => import('./marketing/blog-sections/category-filter'),
  './marketing/blog-sections/compact-list': () => import('./marketing/blog-sections/compact-list'),
  './marketing/blog-sections/featured-with-sidebar': () => import('./marketing/blog-sections/featured-with-sidebar'),
  './marketing/blog-sections/author-spotlight': () => import('./marketing/blog-sections/author-spotlight'),
  './marketing/blog-sections/podcast-list': () => import('./marketing/blog-sections/podcast-list'),
  './marketing/blog-sections/video-blog': () => import('./marketing/blog-sections/video-blog'),
  
  // Career sections
  './marketing/careers/job-listings': () => import('./marketing/careers/job-listings'),
  './marketing/careers/featured-job-slider': () => import('./marketing/careers/featured-job-slider'),
  './marketing/careers/company-benefits': () => import('./marketing/careers/company-benefits'),
  './marketing/careers/workplace-culture': () => import('./marketing/careers/workplace-culture'),
  './marketing/careers/job-details': () => import('./marketing/careers/job-details'),
  
  // Contact sections
  './ContactBlock': () => import('./ContactBlock').then(m => ({ default: m.ContactBlock })),
  './marketing/contact-sections/with-map': () => import('./marketing/contact-sections/with-map'),
  
  // Pricing sections
  './Pricing': () => import('./Pricing').then(m => ({ default: m.Pricing })),
  './marketing/pricing-sections/stacked': () => import('./marketing/pricing-sections/stacked'),
  './marketing/pricing-sections/custom-builder': () => import('./marketing/pricing-sections/custom-builder'),
  
  // Form sections
  './FormBlock': () => import('./FormBlock').then(m => ({ default: m.FormBlock })),
  './BookingBlock': () => import('./BookingBlock').then(m => ({ default: m.BookingBlock })),
  './SubscribeBlock': () => import('./SubscribeBlock').then(m => ({ default: m.SubscribeBlock })),
  './FeedbackBlock': () => import('./FeedbackBlock').then(m => ({ default: m.FeedbackBlock })),
  
  // Basic blocks
  './TextBlock': () => import('./TextBlock').then(m => ({ default: m.TextBlock })),
  './ImageText': () => import('./ImageText').then(m => ({ default: m.ImageText })),
  './CardBlock': () => import('./CardBlock').then(m => ({ default: m.CardBlock })),
  './Testimonials': () => import('./Testimonials').then(m => ({ default: m.Testimonials })),
};

// Loading fallback component
function BlockLoadingFallback() {
  return (
    <div className="p-8 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
      <div className="text-sm text-gray-500">Loading component...</div>
    </div>
  );
}

// Dynamic component loader
export async function loadVariantComponent(componentPath: string): Promise<React.ComponentType<any>> {
  // Check cache first
  if (componentCache.has(componentPath)) {
    return componentCache.get(componentPath)!;
  }

  // Try to load the component
  const importFn = componentImportMap[componentPath];
  if (!importFn) {
    console.error(`No import mapping found for: ${componentPath}`);
    return () => <div>Component not found: {componentPath}</div>;
  }

  try {
    const module = await importFn();
    const Component = module.default;
    
    // Cache the component
    componentCache.set(componentPath, Component);
    return Component;
  } catch (error) {
    console.error(`Failed to load component: ${componentPath}`, error);
    return () => <div>Failed to load component: {componentPath}</div>;
  }
}

// Create a dynamic block renderer component
export function createDynamicBlockRenderer(blockType: string) {
  return function DynamicBlockRenderer({ variant, ...props }: any) {
    const config = getBlockConfig(blockType);
    
    if (!config) {
      return <div>Block type not found: {blockType}</div>;
    }

    const selectedVariant = config.variants.find(v => v.id === variant) || config.variants[0];
    const componentPath = selectedVariant.component;

    // For now, we'll use a simpler approach with lazy loading
    const importFn = componentImportMap[componentPath];
    
    if (!importFn) {
      console.error(`No import mapping found for: ${componentPath}`);
      return <div>Component not found: {componentPath}</div>;
    }

    const LazyComponent = lazy(importFn);

    return (
      <Suspense fallback={<BlockLoadingFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Get all available variants for a block type
export function getBlockVariants(blockType: string): BlockVariant[] {
  const config = getBlockConfig(blockType);
  return config?.variants || [];
}

// Get default variant for a block type
export function getDefaultVariant(blockType: string): string {
  const config = getBlockConfig(blockType);
  return config?.defaultVariant || '';
}