"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Coffee,
  GraduationCap,
  HeartPulse,
  Home,
  Laptop,
  MapPin,
  PartyPopper,
  Plane,
  Users,
  Wallet,
} from "lucide-react";

interface Benefit {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: "health" | "work" | "growth" | "lifestyle";
}

export default function CompanyBenefits() {
  const benefits: Benefit[] = [
    {
      id: "1",
      title: "Comprehensive Health Insurance",
      description:
        "Full medical, dental, and vision coverage with premium plans for you and your family.",
      icon: <HeartPulse className="h-10 w-10 text-pink-500" />,
      category: "health",
    },
    {
      id: "2",
      title: "Mental Health Support",
      description:
        "Free access to therapy and counseling services through our wellness platform.",
      icon: <HeartPulse className="h-10 w-10 text-pink-500" />,
      category: "health",
    },
    {
      id: "3",
      title: "Remote-First Culture",
      description:
        "Work from anywhere in the world with our distributed team approach.",
      icon: <Home className="h-10 w-10 text-indigo-500" />,
      category: "work",
    },
    {
      id: "4",
      title: "Flexible Working Hours",
      description:
        "Choose hours that work for you with our core collaboration windows.",
      icon: <Laptop className="h-10 w-10 text-indigo-500" />,
      category: "work",
    },
    {
      id: "5",
      title: "Learning & Development Budget",
      description:
        "$2,500 annual budget for courses, books, and conferences to advance your skills.",
      icon: <GraduationCap className="h-10 w-10 text-amber-500" />,
      category: "growth",
    },
    {
      id: "6",
      title: "Career Advancement",
      description:
        "Clear growth paths and regular promotion cycles to advance your career.",
      icon: <GraduationCap className="h-10 w-10 text-amber-500" />,
      category: "growth",
    },
    {
      id: "7",
      title: "Generous PTO",
      description:
        "Unlimited paid time off with a minimum of 20 days encouraged annually.",
      icon: <Plane className="h-10 w-10 text-sky-500" />,
      category: "lifestyle",
    },
    {
      id: "8",
      title: "Paid Parental Leave",
      description:
        "16 weeks of fully paid leave for all new parents, including adoption.",
      icon: <Users className="h-10 w-10 text-sky-500" />,
      category: "lifestyle",
    },
    {
      id: "9",
      title: "Company Retreats",
      description:
        "Annual all-company gatherings in exciting locations worldwide.",
      icon: <MapPin className="h-10 w-10 text-sky-500" />,
      category: "lifestyle",
    },
    {
      id: "10",
      title: "Wellness Stipend",
      description:
        "$100 monthly wellness stipend for gym, meditation apps, or other wellness activities.",
      icon: <HeartPulse className="h-10 w-10 text-pink-500" />,
      category: "health",
    },
    {
      id: "11",
      title: "Home Office Budget",
      description:
        "$1,500 to set up your ideal home workspace with the equipment you need.",
      icon: <Home className="h-10 w-10 text-indigo-500" />,
      category: "work",
    },
    {
      id: "12",
      title: "Competitive Salary",
      description:
        "Above-market compensation with regular reviews and adjustments.",
      icon: <Wallet className="h-10 w-10 text-green-500" />,
      category: "work",
    },
    {
      id: "13",
      title: "Equity Package",
      description:
        "Generous equity grants so you can share in the company's success.",
      icon: <Wallet className="h-10 w-10 text-green-500" />,
      category: "work",
    },
    {
      id: "14",
      title: "Professional Development",
      description:
        "Mentorship programs and internal workshops led by industry experts.",
      icon: <GraduationCap className="h-10 w-10 text-amber-500" />,
      category: "growth",
    },
    {
      id: "15",
      title: "Sabbatical Program",
      description: "4-week paid sabbatical for every 3 years with the company.",
      icon: <Plane className="h-10 w-10 text-sky-500" />,
      category: "lifestyle",
    },
    {
      id: "16",
      title: "Coffee Allowance",
      description: "$50 monthly coffee allowance for your caffeine needs.",
      icon: <Coffee className="h-10 w-10 text-sky-500" />,
      category: "lifestyle",
    },
    {
      id: "17",
      title: "Company Events",
      description:
        "Regular social events, team celebrations, and holiday parties.",
      icon: <PartyPopper className="h-10 w-10 text-sky-500" />,
      category: "lifestyle",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h2 className="mb-2 text-3xl font-bold tracking-tight">
          Why Work With Us
        </h2>
        <p className="text-muted-foreground mx-auto max-w-2xl">
          We offer competitive benefits and a supportive culture to help you
          thrive both professionally and personally.
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <div className="mb-8 flex justify-center">
          <TabsList className="flex h-fit flex-wrap">
            <TabsTrigger value="all">All Benefits</TabsTrigger>
            <TabsTrigger value="health">Health & Wellness</TabsTrigger>
            <TabsTrigger value="work">Work & Compensation</TabsTrigger>
            <TabsTrigger value="growth">Growth & Development</TabsTrigger>
            <TabsTrigger value="lifestyle">Lifestyle & Perks</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="space-y-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <BenefitCard key={benefit.id} benefit={benefit} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits
              .filter((benefit) => benefit.category === "health")
              .map((benefit) => (
                <BenefitCard key={benefit.id} benefit={benefit} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="work" className="space-y-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits
              .filter((benefit) => benefit.category === "work")
              .map((benefit) => (
                <BenefitCard key={benefit.id} benefit={benefit} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="growth" className="space-y-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits
              .filter((benefit) => benefit.category === "growth")
              .map((benefit) => (
                <BenefitCard key={benefit.id} benefit={benefit} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="lifestyle" className="space-y-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits
              .filter((benefit) => benefit.category === "lifestyle")
              .map((benefit) => (
                <BenefitCard key={benefit.id} benefit={benefit} />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BenefitCard({ benefit }: { benefit: Benefit }) {
  return (
    <Card className="gap-3 overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="">
        <div className="mb-2">{benefit.icon}</div>
        <CardTitle className="text-xl">{benefit.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm">
          {benefit.description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
