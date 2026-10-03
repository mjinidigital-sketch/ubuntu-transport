import { Button } from '@/components/ui/button';
import { ChevronRight, ArrowRight, Check } from 'lucide-react';

interface SplitContentHeroProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  imageUrl?: string;
  badge?: string;
  features?: string[];
}

export default function SplitContentHero({
  title = "Transform your workflow with our platform",
  subtitle = "Our all-in-one solution helps teams collaborate, manage projects, and deliver exceptional results with ease.",
  ctaText = "Start for free",
  ctaLink = "#",
  imageUrl = "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
  badge = "New Release 2.0",
  features = ["No credit card required", "Free 14-day trial", "Cancel anytime", "24/7 customer support"]
}: SplitContentHeroProps) {
  return (
    <div className="bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 py-16 md:px-6 md:py-24 2xl:max-w-[1400px]">
        <div className="grid items-center gap-8 md:grid-cols-2">
          {/* Left content */}
          <div className="flex flex-col space-y-4">
            <div className="focus:ring-ring bg-primary text-primary-foreground hover:bg-primary/80 inline-flex w-fit items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none">
              <span>{badge}</span>
              <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="text-muted-foreground max-w-[600px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {subtitle}
            </p>
            <div className="flex flex-col gap-3 min-[400px]:flex-row">
              <Button size="lg" >
                <a href={ctaLink}>{ctaText}
                  <ArrowRight className="ml-2 h-4 w-4" /></a>
              </Button>
              <Button size="lg" variant="outline" >
                <a href="#">Book a demo</a>
              </Button>
            </div>
            <div className="flex items-center space-x-4 pt-4 text-sm">
              <div className="flex -space-x-2">
                <div className="bg-muted text-muted-foreground ring-background inline-flex h-8 w-8 items-center justify-center rounded-full ring-2">
                  JL
                </div>
                <div className="bg-muted text-muted-foreground ring-background inline-flex h-8 w-8 items-center justify-center rounded-full ring-2">
                  SD
                </div>
                <div className="bg-muted text-muted-foreground ring-background inline-flex h-8 w-8 items-center justify-center rounded-full ring-2">
                  TK
                </div>
                <div className="bg-primary text-primary-foreground ring-background inline-flex h-8 w-8 items-center justify-center rounded-full ring-2">
                  +8
                </div>
              </div>
              <div className="text-muted-foreground">
                Join 10,000+ teams using our platform
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="bg-primary/10 text-primary flex h-5 w-5 items-center justify-center rounded-full">
                    <Check className="h-4 w-4" />
                  </div>
                  <div className="text-sm">{feature}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right image */}
          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="relative h-[450px] w-full max-w-[500px] overflow-hidden rounded-lg shadow-2xl">
              <img
                src={imageUrl}
                alt="Team working on digital projects"
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              <div className="absolute right-0 bottom-0 left-0 p-6">
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-md bg-white/90 p-3 shadow-lg backdrop-blur dark:bg-gray-800/90">
                    <div className="text-muted-foreground text-xs">
                      Active Projects
                    </div>
                    <div className="text-foreground text-xl font-bold">86</div>
                  </div>
                  <div className="rounded-md bg-white/90 p-3 shadow-lg backdrop-blur dark:bg-gray-800/90">
                    <div className="text-muted-foreground text-xs">
                      Team Members
                    </div>
                    <div className="text-foreground text-xl font-bold">32</div>
                  </div>
                  <div className="rounded-md bg-white/90 p-3 shadow-lg backdrop-blur dark:bg-gray-800/90">
                    <div className="text-muted-foreground text-xs">
                      Completion
                    </div>
                    <div className="text-foreground text-xl font-bold">92%</div>
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="bg-primary/10 absolute -right-20 -bottom-20 -z-10 h-[300px] w-[300px] rounded-full blur-3xl"></div>
            <div className="bg-secondary/10 absolute -top-10 right-10 -z-10 h-[200px] w-[200px] rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="via-foreground/10 absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent to-transparent"></div>
    </div>
  );
}
