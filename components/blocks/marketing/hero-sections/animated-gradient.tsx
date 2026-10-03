import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface HeroSectionAnimatedGradientProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  badge?: string;
  tags?: string[];
}

export default function HeroSectionAnimatedGradient({
  title = "Design with confidence",
  subtitle = "Create stunning interfaces with our professionally designed components that adapt to any device or screen size.",
  ctaText = "Subscribe",
  ctaLink = "#",
  badge = "New Features",
  tags = ["React", "Next.js", "TypeScript", "Tailwind CSS", "Radix UI"]
}: HeroSectionAnimatedGradientProps) {
  return (
    <>
      {/* Hero */}
      <div className="relative overflow-hidden py-24 lg:py-32">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 w-full h-full bg-background">
          <div className="absolute inset-0 w-full h-full">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 dark:bg-purple-500 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 dark:bg-yellow-500 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 dark:bg-pink-500 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            <div className="absolute -bottom-8 right-20 w-72 h-72 bg-blue-300 dark:bg-blue-500 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-6000"></div>
          </div>
        </div>

        <div className="relative z-10">
          <div className="container mx-auto px-4 md:px-6 2xl:max-w-[1400px]">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="text-center md:text-left">
                <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
                  {title}
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  {subtitle}
                </p>

                <div className="max-w-md mx-auto md:mx-0 mb-8">
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="email" className="text-left">
                      Email
                    </Label>
                    <div className="flex w-full max-w-sm items-center space-x-2">
                      <Input
                        type="email"
                        id="email"
                        placeholder="Enter your email"
                      />
                      <Button type="submit">{ctaText}</Button>
                    </div>
                    <p className="text-sm text-muted-foreground text-left">
                      Get notified about new features and updates. No spam.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-8">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-center md:justify-start gap-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((id) => (
                      <Avatar key={id} className="w-8 h-8">
                        <AvatarImage
                          width={32}
                          height={32}
                          src={`https://github.com/shadcn.png`}
                          alt={`User ${id}`}
                        />
                      </Avatar>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Joined by{" "}
                    <span className="font-medium text-foreground">2,000+</span>{" "}
                    developers
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-xl blur opacity-75"></div>
                <div className="relative bg-card rounded-xl overflow-hidden border shadow-xl">
                  <div className="flex items-center justify-between border-b p-4">
                    <div className="flex space-x-2">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-xs font-medium">
                      components/ui/button.tsx
                    </div>
                    <div></div>
                  </div>
                  <div className="p-4 font-mono text-xs overflow-hidden">
                    <pre className="text-left">
                      <code className="language-tsx">
                        {`import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input bg-background",
        secondary: "bg-secondary text-secondary-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);`}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End Hero */}
    </>
  );
}

// Add this to your global CSS file
// @keyframes blob {
//   0% {
//     transform: translate(0px, 0px) scale(1);
//   }
//   33% {
//     transform: translate(30px, -50px) scale(1.1);
//   }
//   66% {
//     transform: translate(-20px, 20px) scale(0.9);
//   }
//   100% {
//     transform: translate(0px, 0px) scale(1);
//   }
// }
//
// .animate-blob {
//   animation: blob 7s infinite;
// }
//
// .animation-delay-2000 {
//   animation-delay: 2s;
// }
//
// .animation-delay-4000 {
//   animation-delay: 4s;
// }
//
// .animation-delay-6000 {
//   animation-delay: 6s;
// }
