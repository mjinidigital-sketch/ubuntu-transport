"use client";

import { useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Fingerprint,
  Gauge,
  Globe,
  Laptop,
  Layers,
  Lock,
  RefreshCcw,
  Shield,
} from 'lucide-react';

interface Feature {
  icon: typeof Fingerprint;
  title: string;
  description: string;
  gradient: string;
}

const features: Feature[] = [
  {
    icon: Fingerprint,
    title: 'Biometric Authentication',
    description: 'Secure access with advanced biometric verification systems.',
    gradient: 'from-blue-500/20 to-purple-500/20',
  },
  {
    icon: Shield,
    title: 'Advanced Security',
    description: 'Enterprise-grade security with end-to-end encryption.',
    gradient: 'from-green-500/20 to-emerald-500/20',
  },
  {
    icon: Globe,
    title: 'Global CDN',
    description: 'Lightning-fast content delivery across all continents.',
    gradient: 'from-orange-500/20 to-red-500/20',
  },
  {
    icon: Layers,
    title: 'Microservices',
    description: 'Scalable architecture with independent service components.',
    gradient: 'from-pink-500/20 to-rose-500/20',
  },
  {
    icon: RefreshCcw,
    title: 'Auto Scaling',
    description: 'Dynamic resource allocation based on demand.',
    gradient: 'from-violet-500/20 to-purple-500/20',
  },
  {
    icon: Gauge,
    title: 'Performance',
    description: 'Optimized for speed with sub-millisecond response times.',
    gradient: 'from-cyan-500/20 to-blue-500/20',
  },
  {
    icon: Lock,
    title: 'Data Privacy',
    description: 'GDPR compliant with advanced privacy controls.',
    gradient: 'from-amber-500/20 to-orange-500/20',
  },
  {
    icon: Laptop,
    title: 'Cross Platform',
    description: 'Seamless experience across all devices and platforms.',
    gradient: 'from-indigo-500/20 to-blue-500/20',
  },
];

function Feature3DCard({ feature }: { feature: Feature }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  return (
    <Card
      ref={cardRef}
      className={cn(
        'relative overflow-hidden p-0 transition-all duration-200 ease-out',
        'hover:-translate-y-1 hover:shadow-lg',
        'bg-gradient-to-br',
        feature.gradient
      )}
      style={{
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <CardContent className="space-y-4 p-6">
        <feature.icon className="text-primary h-12 w-12" />
        <div className="space-y-2">
          <h3 className="font-bold">{feature.title}</h3>
          <p className="text-muted-foreground text-sm">{feature.description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FeatureSection3D() {
  return (
    <section className="container mx-auto space-y-8 px-4 py-24 md:px-6 2xl:max-w-[1400px]">
      <div className="space-y-4 text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Next-generation features
        </h2>
        <p className="text-muted-foreground mx-auto max-w-[700px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
          Experience the future of web development with our cutting-edge
          features.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <Feature3DCard key={feature.title} feature={feature} />
        ))}
      </div>
    </section>
  );
}
