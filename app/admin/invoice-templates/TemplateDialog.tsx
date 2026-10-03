"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { TemplateRow } from "./columns";
import {
    createInvoiceTemplateAction,
    updateInvoiceTemplateAction,
} from "@/app/actions/documents";
import { toast } from "sonner";

interface TemplateDialogProps {
    template?: TemplateRow | null;
    open: boolean;
    onClose: () => void;
    isCreating?: boolean;
}

export function TemplateDialog({ template, open, onClose, isCreating }: TemplateDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        style: "modern" as "modern" | "classic" | "minimal",
        primaryColor: "#2563eb",
        secondaryColor: "#1e40af",
        logoPosition: "left" as "left" | "center" | "right",
        showLogo: true,
        showStamps: true,
        showCompanyDetails: true,
        showPaymentDetails: true,
        showTerms: true,
        defaultTerms: "",
        active: true,
    });

    useEffect(() => {
        if (template && !isCreating) {
            setFormData({
                name: template.name,
                description: template.description || "",
                style: template.style,
                primaryColor: template.primaryColor || "#2563eb",
                secondaryColor: template.secondaryColor || "#1e40af",
                logoPosition: template.logoPosition,
                showLogo: template.showLogo,
                showStamps: template.showStamps,
                showCompanyDetails: template.showCompanyDetails,
                showPaymentDetails: template.showPaymentDetails,
                showTerms: template.showTerms,
                defaultTerms: template.defaultTerms || "",
                active: template.active,
            });
        } else {
            setFormData({
                name: "",
                description: "",
                style: "modern",
                primaryColor: "#2563eb",
                secondaryColor: "#1e40af",
                logoPosition: "left",
                showLogo: true,
                showStamps: true,
                showCompanyDetails: true,
                showPaymentDetails: true,
                showTerms: true,
                defaultTerms: "",
                active: true,
            });
        }
    }, [template, isCreating, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isCreating) {
                const result = await createInvoiceTemplateAction(formData);
                if (result.error) {
                    toast.error(result.error);
                } else {
                    toast.success("Template created successfully");
                    onClose();
                }
            } else if (template) {
                const result = await updateInvoiceTemplateAction(template._id, formData);
                if (result.error) {
                    toast.error(result.error);
                } else {
                    toast.success("Template updated successfully");
                    onClose();
                }
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isCreating ? "Create New Template" : "Edit Template"}
                    </DialogTitle>
                    <DialogDescription>
                        {isCreating
                            ? "Create a new invoice template with custom styling."
                            : "Update the template details."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Template Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="style">Style *</Label>
                                <Select
                                    value={formData.style}
                                    onValueChange={(value: any) =>
                                        setFormData({ ...formData, style: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="modern">Modern</SelectItem>
                                        <SelectItem value="classic">Classic</SelectItem>
                                        <SelectItem value="minimal">Minimal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                rows={2}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="primaryColor">Primary Color</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="primaryColor"
                                        type="color"
                                        value={formData.primaryColor}
                                        onChange={(e) =>
                                            setFormData({ ...formData, primaryColor: e.target.value })
                                        }
                                        className="w-20 h-10"
                                    />
                                    <Input
                                        value={formData.primaryColor}
                                        onChange={(e) =>
                                            setFormData({ ...formData, primaryColor: e.target.value })
                                        }
                                        placeholder="#2563eb"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="secondaryColor">Secondary Color</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="secondaryColor"
                                        type="color"
                                        value={formData.secondaryColor}
                                        onChange={(e) =>
                                            setFormData({ ...formData, secondaryColor: e.target.value })
                                        }
                                        className="w-20 h-10"
                                    />
                                    <Input
                                        value={formData.secondaryColor}
                                        onChange={(e) =>
                                            setFormData({ ...formData, secondaryColor: e.target.value })
                                        }
                                        placeholder="#1e40af"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="logoPosition">Logo Position</Label>
                            <Select
                                value={formData.logoPosition}
                                onValueChange={(value: any) =>
                                    setFormData({ ...formData, logoPosition: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="left">Left</SelectItem>
                                    <SelectItem value="center">Center</SelectItem>
                                    <SelectItem value="right">Right</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Display Options */}
                        <div className="space-y-4 p-4 border rounded-lg">
                            <Label className="font-semibold">Display Options</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="showLogo"
                                        checked={formData.showLogo}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, showLogo: checked as boolean })
                                        }
                                    />
                                    <Label htmlFor="showLogo">Show Logo</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="showStamps"
                                        checked={formData.showStamps}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, showStamps: checked as boolean })
                                        }
                                    />
                                    <Label htmlFor="showStamps">Show Stamps</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="showCompanyDetails"
                                        checked={formData.showCompanyDetails}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, showCompanyDetails: checked as boolean })
                                        }
                                    />
                                    <Label htmlFor="showCompanyDetails">Show Company Details</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="showPaymentDetails"
                                        checked={formData.showPaymentDetails}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, showPaymentDetails: checked as boolean })
                                        }
                                    />
                                    <Label htmlFor="showPaymentDetails">Show Payment Details</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="showTerms"
                                        checked={formData.showTerms}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, showTerms: checked as boolean })
                                        }
                                    />
                                    <Label htmlFor="showTerms">Show Terms</Label>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="defaultTerms">Default Terms</Label>
                            <Textarea
                                id="defaultTerms"
                                value={formData.defaultTerms}
                                onChange={(e) =>
                                    setFormData({ ...formData, defaultTerms: e.target.value })
                                }
                                rows={3}
                                placeholder="Payment due within 30 days..."
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="active"
                                checked={formData.active}
                                onCheckedChange={(checked) =>
                                    setFormData({ ...formData, active: checked as boolean })
                                }
                            />
                            <Label htmlFor="active">Active</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                            {isCreating ? "Create Template" : "Update Template"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
