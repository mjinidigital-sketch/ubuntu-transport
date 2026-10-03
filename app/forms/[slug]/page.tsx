"use client";

import { use, useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormRenderer } from "@/components/form-renderer";
import { FormBlock } from "@/components/blocks/FormBlock";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FormPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const form = useQuery(api.forms.getFormBySlug, { slug });

  // Known preset forms
  if (slug === "contact" || slug === "booking" || slug === "subscribe" || slug === "feedback") {
    return (
      <div className="min-h-screen bg-background py-10 px-4">
        <div className="max-w-6xl mx-auto mb-6">
          <Button variant="ghost" size="sm"  className="mb-4">
            <Link href="/forms">
              <ArrowLeft className="w-4 h-4 mr-2" /> All Forms
            </Link>
          </Button>
        </div>
        <FormBlock formType={slug as any} layout="split" />
      </div>
    );
  }

  // Loading state
  if (form === undefined) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
        <p className="text-sm text-muted-foreground">Loading form...</p>
      </div>
    );
  }

  // Form not found
  if (form === null) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Form Not Found</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          The requested form <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-sm">{slug}</code> doesn't exist or hasn't been published yet.
        </p>
        <Button >
          <Link href="/forms">View All Forms</Link>
        </Button>
      </div>
    );
  }

  // Custom Form Definition Render
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" size="sm"  className="mb-6">
          <Link href="/forms">
            <ArrowLeft className="w-4 h-4 mr-2" /> All Forms
          </Link>
        </Button>

        <Card className="shadow-lg rounded-2xl overflow-hidden border">
          <CardHeader className="bg-muted/30 border-b pb-6">
            <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight">{form.name}</CardTitle>
            {form.description && (
              <CardDescription className="text-base mt-1.5">{form.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <FormRenderer
              formId={form.slug}
              blocks={form.blocks}
              settings={form.settings}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}