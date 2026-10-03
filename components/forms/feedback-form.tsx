"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Star } from "lucide-react";

export function FeedbackForm() {
    const [formData, setFormData] = useState({
        rating: "5",
        category: "general",
        feedback: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitForm = useMutation(api.forms.submitForm);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await submitForm({
                formId: "feedback",
                formData,
            });
            toast.success("Thank you for your feedback!");
            setFormData({ rating: "5", category: "general", feedback: "" });
        } catch (error) {
            console.error("Failed to submit form:", error);
            toast.error("Failed to submit feedback. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData({
            ...formData,
            [field]: value,
        });
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Send Feedback</CardTitle>
                <CardDescription>
                    Help us improve by sharing your thoughts and suggestions.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="rating">How would you rate your experience?</Label>
                        <Select
                            value={formData.rating}
                            onValueChange={(value) => handleChange("rating", value || "5")}
                        >
                            <SelectTrigger id="rating">
                                <SelectValue placeholder="Select a rating" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">⭐⭐⭐⭐⭐ - Excellent</SelectItem>
                                <SelectItem value="4">⭐⭐⭐⭐ - Good</SelectItem>
                                <SelectItem value="3">⭐⭐⭐ - Average</SelectItem>
                                <SelectItem value="2">⭐⭐ - Poor</SelectItem>
                                <SelectItem value="1">⭐ - Very Poor</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Feedback Category</Label>
                        <Select
                            value={formData.category}
                            onValueChange={(value) => handleChange("category", value || "general")}
                        >
                            <SelectTrigger id="category">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="general">General</SelectItem>
                                <SelectItem value="bug">Bug Report</SelectItem>
                                <SelectItem value="feature">Feature Request</SelectItem>
                                <SelectItem value="ui">UI/UX</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="feedback">Your Feedback</Label>
                        <Textarea
                            id="feedback"
                            value={formData.feedback}
                            onChange={(e) => handleChange("feedback", e.target.value)}
                            required
                            placeholder="Tell us more about your experience..."
                            rows={6}
                        />
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? "Submitting..." : "Submit Feedback"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
