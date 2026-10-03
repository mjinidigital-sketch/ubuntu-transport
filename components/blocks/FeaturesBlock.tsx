"use client";

import ThreeDCards from './marketing/feature-sections/3d-cards';
import WithCarousel from './marketing/feature-sections/with-carousel';
import { Features as SimpleFeatures } from './Features';

export interface FeaturesBlockProps {
  variant?: '3d-cards' | 'carousel' | 'simple-grid';
  title?: string;
  subtitle?: string;
  features?: Array<{
    title: string;
    description: string;
    icon?: string;
    imageUrl?: string;
  }>;
}

export function FeaturesBlock({
  variant = '3d-cards',
  title = "Our Core Features",
  subtitle = "Everything you need to scale your product efficiently.",
  features = [
    { title: "Lightning Fast", description: "Built for speed and performance from the ground up.", icon: "⚡" },
    { title: "Bank-Grade Security", description: "Enterprise level authentication and encryption standard.", icon: "🔒" },
    { title: "Instant Scalability", description: "Scale from 10 to 10 million users with zero config.", icon: "🚀" }
  ]
}: FeaturesBlockProps) {
  // Dynamic variant rendering based on selected variant
  switch (variant) {
    case 'carousel':
      return <WithCarousel title={title} subtitle={subtitle} features={features} />;
    case 'simple-grid':
      return <SimpleFeatures title={title} features={features} />;
    case '3d-cards':
    default:
      return <ThreeDCards />;
  }
}