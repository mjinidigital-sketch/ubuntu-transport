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
import { ClientRow } from "./columns";
import {
    createClientAction,
    updateClientAction,
} from "@/app/actions/documents";
import { toast } from "sonner";

interface ClientDialogProps {
    client?: ClientRow | null;
    users: any[];
    open: boolean;
    onClose: () => void;
    isCreating?: boolean;
}

export function ClientDialog({ client, users, open, onClose, isCreating }: ClientDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        userId: "" as string | undefined,
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",
        companyName: "",
        taxId: "",
        notes: "",
        active: true,
    });

    useEffect(() => {
        if (client && !isCreating) {
            setFormData({
                name: client.name,
                userId: client.userId || "",
                email: client.email || "",
                phone: client.phone || "",
                address: client.address || "",
                city: client.city || "",
                state: client.state || "",
                country: client.country || "",
                postalCode: client.postalCode || "",
                companyName: client.companyName || "",
                taxId: client.taxId || "",
                notes: client.notes || "",
                active: client.active,
            });
        } else {
            setFormData({
                name: "",
                userId: "",
                email: "",
                phone: "",
                address: "",
                city: "",
                state: "",
                country: "",
                postalCode: "",
                companyName: "",
                taxId: "",
                notes: "",
                active: true,
            });
        }
    }, [client, isCreating, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const submitData = {
                ...formData,
                userId: formData.userId || undefined,
            };

            if (isCreating) {
                const result = await createClientAction(submitData);
                if (result.error) {
                    toast.error(result.error);
                } else {
                    toast.success("Client created successfully");
                    onClose();
                }
            } else if (client) {
                const result = await updateClientAction(client._id, submitData);
                if (result.error) {
                    toast.error(result.error);
                } else {
                    toast.success("Client updated successfully");
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
                        {isCreating ? "Create New Client" : "Edit Client"}
                    </DialogTitle>
                    <DialogDescription>
                        {isCreating
                            ? "Add a new client. You can link to an existing user or create a standalone client."
                            : "Update the client details."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Client Name *</Label>
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
                                <Label htmlFor="userId">Link to User (Optional)</Label>
                                <Select
                                    value={formData.userId}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, userId: value || "" })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a user" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">No user linked</SelectItem>
                                        {users.map((user) => (
                                            <SelectItem key={user._id} value={user._id}>
                                                {user.name || user.email} ({user.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="companyName">Company Name (Optional)</Label>
                                <Input
                                    id="companyName"
                                    value={formData.companyName}
                                    onChange={(e) =>
                                        setFormData({ ...formData, companyName: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="taxId">Tax ID (Optional)</Label>
                                <Input
                                    id="taxId"
                                    value={formData.taxId}
                                    onChange={(e) =>
                                        setFormData({ ...formData, taxId: e.target.value })
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email (Optional)</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone (Optional)</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) =>
                                        setFormData({ ...formData, phone: e.target.value })
                                    }
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address (Optional)</Label>
                            <Input
                                id="address"
                                value={formData.address}
                                onChange={(e) =>
                                    setFormData({ ...formData, address: e.target.value })
                                }
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">City (Optional)</Label>
                                <Input
                                    id="city"
                                    value={formData.city}
                                    onChange={(e) =>
                                        setFormData({ ...formData, city: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">State/Province (Optional)</Label>
                                <Input
                                    id="state"
                                    value={formData.state}
                                    onChange={(e) =>
                                        setFormData({ ...formData, state: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="postalCode">Postal Code (Optional)</Label>
                                <Input
                                    id="postalCode"
                                    value={formData.postalCode}
                                    onChange={(e) =>
                                        setFormData({ ...formData, postalCode: e.target.value })
                                    }
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="country">Country (Optional)</Label>
                            <Input
                                id="country"
                                value={formData.country}
                                onChange={(e) =>
                                    setFormData({ ...formData, country: e.target.value })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) =>
                                    setFormData({ ...formData, notes: e.target.value })
                                }
                                rows={3}
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
                            {isCreating ? "Create Client" : "Update Client"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
