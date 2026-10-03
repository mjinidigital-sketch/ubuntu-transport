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
import { ServiceRow } from "./columns";
import {
    createServiceAction,
    updateServiceAction,
} from "@/app/actions/documents";
import { toast } from "sonner";

interface ServiceDialogProps {
    service?: ServiceRow | null;
    open: boolean;
    onClose: () => void;
    isCreating?: boolean;
}

export function ServiceDialog({ service, open, onClose, isCreating }: ServiceDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        pricingType: "hourly" as "hourly" | "project" | "per_item" | "subscription",
        category: "",
        duration: "",
        features: [] as string[],
        imageUrl: "",
        icon: "",
        active: true,
        order: 0,
    });

    useEffect(() => {
        if (service && !isCreating) {
            setFormData({
                name: service.name,
                description: service.description || "",
                price: service.price,
                pricingType: service.pricingType,
                category: service.category || "",
                duration: service.duration || "",
                features: service.features || [],
                imageUrl: service.imageUrl || "",
                icon: service.icon || "",
                active: service.active,
                order: service.order || 0,
            });
        } else {
            setFormData({
                name: "",
                description: "",
                price: "",
                pricingType: "hourly",
                category: "",
                duration: "",
                features: [],
                imageUrl: "",
                icon: "",
                active: true,
                order: 0,
            });
        }
    }, [service, isCreating, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isCreating) {
                const result = await createServiceAction(formData);
                if (result.error) {
                    toast.error(result.error);
                } else {
                    toast.success("Service created successfully");
                    onClose();
                }
            } else if (service) {
                const result = await updateServiceAction(service._id, formData);
                if (result.error) {
                    toast.error(result.error);
                } else {
                    toast.success("Service updated successfully");
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
                        {isCreating ? "Create New Service" : "Edit Service"}
                    </DialogTitle>
                    <DialogDescription>
                        {isCreating
                            ? "Add a new service to your catalogue."
                            : "Update the service details."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Service Name *</Label>
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
                                <Label htmlFor="price">Price *</Label>
                                <Input
                                    id="price"
                                    value={formData.price}
                                    onChange={(e) =>
                                        setFormData({ ...formData, price: e.target.value })
                                    }
                                    placeholder="e.g., $100"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="pricingType">Pricing Type *</Label>
                                <Select
                                    value={formData.pricingType}
                                    onValueChange={(value: any) =>
                                        setFormData({ ...formData, pricingType: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="hourly">Hourly</SelectItem>
                                        <SelectItem value="project">Project</SelectItem>
                                        <SelectItem value="per_item">Per Item</SelectItem>
                                        <SelectItem value="subscription">Subscription</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    value={formData.category}
                                    onChange={(e) =>
                                        setFormData({ ...formData, category: e.target.value })
                                    }
                                    placeholder="e.g., consulting"
                                />
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
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="duration">Duration</Label>
                                <Input
                                    id="duration"
                                    value={formData.duration}
                                    onChange={(e) =>
                                        setFormData({ ...formData, duration: e.target.value })
                                    }
                                    placeholder="e.g., 2 hours, 1 week"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="order">Display Order</Label>
                                <Input
                                    id="order"
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) =>
                                        setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="imageUrl">Image URL</Label>
                                <Input
                                    id="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={(e) =>
                                        setFormData({ ...formData, imageUrl: e.target.value })
                                    }
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="icon">Icon</Label>
                                <Input
                                    id="icon"
                                    value={formData.icon}
                                    onChange={(e) =>
                                        setFormData({ ...formData, icon: e.target.value })
                                    }
                                    placeholder="icon name or emoji"
                                />
                            </div>
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
                            {isCreating ? "Create Service" : "Update Service"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
