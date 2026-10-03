"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormBlock } from "@/components/blocks/FormBlock";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Calendar, BellRing, Star, Sparkles, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FormsPage() {
  const [activeTab, setActiveTab] = useState("contact");

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-background py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Interactive Form Center
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              Forms & Data Collection
            </h1>
            <p className="text-muted-foreground mt-1 max-w-xl">
              Preview and test all form types. All submissions are automatically processed, validated, and logged to the admin dashboard.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button  variant="outline" className="rounded-xl">
              <Link href="/admin/forms">
                <FileText className="w-4 h-4 mr-2" />
                Admin Submissions
              </Link>
            </Button>
            <Button  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white">
              <Link href="/admin/form-builder">
                Form Builder
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Tab Selection */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full max-w-2xl mx-auto p-1.5 h-auto bg-muted/60 rounded-2xl border">
            <TabsTrigger
              value="contact"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm font-semibold text-xs sm:text-sm"
            >
              <MessageSquare className="w-4 h-4 text-primary" />
              Contact
            </TabsTrigger>
            <TabsTrigger
              value="booking"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm font-semibold text-xs sm:text-sm"
            >
              <Calendar className="w-4 h-4 text-accent" />
              Booking
            </TabsTrigger>
            <TabsTrigger
              value="subscribe"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm font-semibold text-xs sm:text-sm"
            >
              <BellRing className="w-4 h-4 text-secondary" />
              Subscribe
            </TabsTrigger>
            <TabsTrigger
              value="feedback"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm font-semibold text-xs sm:text-sm"
            >
              <Star className="w-4 h-4 text-muted-foreground" />
              Feedback
            </TabsTrigger>
          </TabsList>

          {/* Contact Tab */}
          <TabsContent value="contact" className="focus-visible:outline-none">
            <FormBlock
              formType="contact"
              layout="split"
              title="Get in Touch with Us"
              subtitle="Have questions, ideas, or feedback? Send us a note and we'll reply right away."
              badgeText="Contact Us"
              submitText="Send Message"
            />
          </TabsContent>

          {/* Booking Tab */}
          <TabsContent value="booking" className="focus-visible:outline-none">
            <FormBlock
              formType="booking"
              layout="split"
              title="Schedule an Appointment"
              subtitle="Choose a session and pick your preferred time slot. Our specialists will synchronize and confirm."
              badgeText="Easy Booking"
              submitText="Confirm Booking Request"
            />
          </TabsContent>

          {/* Subscribe Tab */}
          <TabsContent value="subscribe" className="focus-visible:outline-none">
            <div className="space-y-8">
              <FormBlock
                formType="subscribe"
                layout="banner"
                title="Never Miss an Industry Breakthrough"
                subtitle="Join our weekly newsletter read by forward-thinking developers and founders. Curated insights, zero noise."
                badgeText="Insider Newsletter"
                submitText="Subscribe Free"
              />

              <div className="max-w-md mx-auto">
                <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  Also available as a Card Block:
                </p>
                <FormBlock
                  formType="subscribe"
                  layout="card"
                  title="Subscribe via Card"
                  subtitle="Get product updates straight to your inbox."
                  submitText="Join List"
                />
              </div>
            </div>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="focus-visible:outline-none">
            <FormBlock
              formType="feedback"
              layout="card"
              title="Share Your Honest Feedback"
              subtitle="Rate your overall experience and let us know what features or improvements you'd like to see next."
              badgeText="User Review"
              submitText="Submit Feedback"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
