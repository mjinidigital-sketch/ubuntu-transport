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
import { Loader2, Plus, Trash2 } from "lucide-react";
import { InvoiceRow } from "./columns";
import {
    generateInvoiceNumberAction,
    createInvoiceAction,
    updateInvoiceAction,
} from "@/app/actions/documents";
import { toast } from "sonner";

interface InvoiceDialogProps {
    invoice?: InvoiceRow | null;
    clients: any[];
    services: any[];
    quotations: any[];
    templates: any[];
    open: boolean;
    onClose: () => void;
    isCreating?: boolean;
}

interface LineItem {
    serviceId?: string;
    description: string;
    quantity: number;
    unitPrice: string;
    total: string;
}

export function InvoiceDialog({ invoice, clients, services, quotations, templates, open, onClose, isCreating }: InvoiceDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingNumber, setIsGeneratingNumber] = useState(false);
    const [formData, setFormData] = useState({
        invoiceNumber: "",
        clientId: "" as string,
        quotationId: "" as string,
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: "",
        status: "draft" as "draft" | "sent" | "paid" | "overdue" | "cancelled",
        items: [] as LineItem[],
        taxRate: 0,
        discountAmount: "0",
        notes: "",
        terms: "",
        templateId: "" as string,
    });

    useEffect(() => {
        if (invoice && !isCreating) {
            setFormData({
                invoiceNumber: invoice.invoiceNumber,
                clientId: invoice.clientId,
                quotationId: invoice.quotationId || "",
                invoiceDate: new Date(invoice.invoiceDate).toISOString().split('T')[0],
                dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : "",
                status: invoice.status,
                items: invoice.items as LineItem[],
                taxRate: invoice.taxRate || 0,
                discountAmount: invoice.discountAmount || "0",
                notes: invoice.notes || "",
                terms: invoice.terms || "",
                templateId: invoice.templateId || "",
            });
        } else {
            setFormData({
                invoiceNumber: "",
                clientId: "",
                quotationId: "",
                invoiceDate: new Date().toISOString().split('T')[0],
                dueDate: "",
                status: "draft",
                items: [],
                taxRate: 0,
                discountAmount: "0",
                notes: "",
                terms: "",
                templateId: "",
            });
        }
    }, [invoice, isCreating, open]);

    const generateNumber = async () => {
        setIsGeneratingNumber(true);
        try {
            const result = await generateInvoiceNumberAction();
            if (result.success && result.number) {
                setFormData({ ...formData, invoiceNumber: result.number });
            }
        } catch (error) {
            toast.error("Failed to generate invoice number");
        } finally {
            setIsGeneratingNumber(false);
        }
    };

    const loadFromQuotation = async (quotationId: string) => {
        const quotation = quotations.find(q => q._id === quotationId);
        if (quotation) {
            setFormData({
                ...formData,
                clientId: quotation.clientId,
                items: quotation.items,
                terms: quotation.terms || "",
            });
        }
    };

    const addLineItem = () => {
        setFormData({
            ...formData,
            items: [
                ...formData.items,
                {
                    description: "",
                    quantity: 1,
                    unitPrice: "0",
                    total: "0",
                },
            ],
        });
    };

    const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };

        // Calculate total if quantity or unit price changes
        if (field === "quantity" || field === "unitPrice") {
            const quantity = parseFloat(String(newItems[index].quantity)) || 0;
            const unitPrice = parseFloat(newItems[index].unitPrice) || 0;
            newItems[index].total = (quantity * unitPrice).toFixed(2);
        }

        setFormData({ ...formData, items: newItems });
    };

    const removeLineItem = (index: number) => {
        setFormData({
            ...formData,
            items: formData.items.filter((_, i) => i !== index),
        });
    };

    const calculateTotals = () => {
        const subtotal = formData.items.reduce((sum, item) => sum + parseFloat(item.total || "0"), 0);
        const taxAmount = (subtotal * (formData.taxRate / 100)).toFixed(2);
        const discount = parseFloat(formData.discountAmount) || 0;
        const total = (subtotal + parseFloat(taxAmount) - discount).toFixed(2);
        return {
            subtotal: subtotal.toFixed(2),
            taxAmount,
            total,
        };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const totals = calculateTotals();
            const submitData = {
                ...formData,
                clientId: formData.clientId as any,
                quotationId: formData.quotationId || undefined,
                invoiceDate: new Date(formData.invoiceDate).getTime(),
                dueDate: formData.dueDate ? new Date(formData.dueDate).getTime() : undefined,
                templateId: formData.templateId || undefined,
                ...totals,
            };

            if (isCreating) {
                const result = await createInvoiceAction(submitData);
                if (result.error) {
                    toast.error(result.error);
                } else {
                    toast.success("Invoice created successfully");
                    onClose();
                }
            } else if (invoice) {
                const result = await updateInvoiceAction(invoice._id, submitData);
                if (result.error) {
                    toast.error(result.error);
                } else {
                    toast.success("Invoice updated successfully");
                    onClose();
                }
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const totals = calculateTotals();

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="mx-auto my-4 !max-w-[50%] w-[80%] md:!w-1/2 sm:!max-w-[50%] flex flex-col">
                <DialogHeader>
                    <DialogTitle>
                        {isCreating ? "Create New Invoice" : "Edit Invoice"}
                    </DialogTitle>
                    <DialogDescription>
                        {isCreating
                            ? "Create a new invoice for a client."
                            : "Update the invoice details."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto grid gap-5 py-4 pr-2">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="invoiceNumber" className="text-[10px]">Invoice Number *</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="invoiceNumber"
                                        value={formData.invoiceNumber}
                                        onChange={(e) =>
                                            setFormData({ ...formData, invoiceNumber: e.target.value })
                                        }
                                        required
                                        className="h-7 text-xs"
                                    />
                                    {isCreating && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={generateNumber}
                                            disabled={isGeneratingNumber}
                                            className="h-7 w-7"
                                        >
                                            {isGeneratingNumber ? (
                                                <Loader2 className="size-2.5 animate-spin" />
                                            ) : (
                                                <Plus className="size-2.5" />
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="clientId" className="text-[10px]">Client *</Label>
                                <Select
                                    value={formData.clientId || ""}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, clientId: value || "" })
                                    }
                                >
                                    <SelectTrigger className="h-7 text-xs">
                                        <SelectValue placeholder="Select a client" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clients.map((client) => (
                                            <SelectItem key={client._id} value={client._id}>
                                                {client.name} {client.companyName && `(${client.companyName})`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="quotationId" className="text-[10px]">From Quotation</Label>
                                <Select
                                    value={formData.quotationId || ""}
                                    onValueChange={(value) => {
                                        setFormData({ ...formData, quotationId: value || "" });
                                        if (value) loadFromQuotation(value);
                                    }}
                                >
                                    <SelectTrigger className="h-7 text-xs">
                                        <SelectValue placeholder="Optional" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">None</SelectItem>
                                        {quotations.map((quotation) => (
                                            <SelectItem key={quotation._id} value={quotation._id}>
                                                {quotation.quotationNumber} - {quotation.client?.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status" className="text-[10px]">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value: any) =>
                                        setFormData({ ...formData, status: value })
                                    }
                                >
                                    <SelectTrigger className="h-7 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="sent">Sent</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="overdue">Overdue</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="invoiceDate" className="text-[10px]">Invoice Date *</Label>
                                <Input
                                    id="invoiceDate"
                                    type="date"
                                    value={formData.invoiceDate}
                                    onChange={(e) =>
                                        setFormData({ ...formData, invoiceDate: e.target.value })
                                    }
                                    required
                                    className="h-7 text-xs"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dueDate" className="text-[10px]">Due Date</Label>
                                <Input
                                    id="dueDate"
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) =>
                                        setFormData({ ...formData, dueDate: e.target.value })
                                    }
                                    className="h-7 text-xs"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="templateId" className="text-[10px]">Invoice Template</Label>
                                <Select
                                    value={formData.templateId || ""}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, templateId: value || "" })
                                    }
                                >
                                    <SelectTrigger className="h-7 text-xs">
                                        <SelectValue placeholder="Select template" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Default</SelectItem>
                                        {templates.map((template) => (
                                            <SelectItem key={template._id} value={template._id}>
                                                {template.name} ({template.style})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="taxRate" className="text-[10px]">Tax Rate (%)</Label>
                                <Input
                                    id="taxRate"
                                    type="number"
                                    value={formData.taxRate}
                                    onChange={(e) =>
                                        setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })
                                    }
                                    min="0"
                                    step="0.1"
                                    className="h-7 text-xs"
                                />
                            </div>
                        </div>

                        {/* Line Items */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs">Line Items</Label>
                                <Button type="button" variant="outline" size="sm" onClick={addLineItem} className="h-7 text-[10px]">
                                    <Plus className="size-2.5 mr-1" />
                                    Add Item
                                </Button>
                            </div>

                            {formData.items.map((item, index) => (
                                <div key={index} className="grid grid-cols-12 gap-3 items-start p-4 border rounded-lg">
                                    <div className="col-span-4 space-y-2">
                                        <Label className="text-[10px]">Description</Label>
                                        <Input
                                            value={item.description}
                                            onChange={(e) => updateLineItem(index, "description", e.target.value)}
                                            placeholder="Item description"
                                            className="h-7 text-xs"
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <Label className="text-[10px]">Quantity</Label>
                                        <Input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => updateLineItem(index, "quantity", parseFloat(e.target.value) || 0)}
                                            min="0"
                                            className="h-7 text-xs"
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <Label className="text-[10px]">Unit Price</Label>
                                        <Input
                                            type="number"
                                            value={item.unitPrice}
                                            onChange={(e) => updateLineItem(index, "unitPrice", e.target.value)}
                                            min="0"
                                            step="0.01"
                                            className="h-7 text-xs"
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <Label className="text-[10px]">Total</Label>
                                        <Input
                                            value={item.total}
                                            readOnly
                                            className="bg-muted h-7 text-xs"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeLineItem(index)}
                                            className="h-7 w-7 mt-6"
                                        >
                                            <Trash2 className="size-2.5 text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            {formData.items.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground border rounded-lg text-xs">
                                    No line items added. Click "Add Item" to get started.
                                </div>
                            )}
                        </div>

                        {/* Totals */}
                        <div className="grid grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                            <div>
                                <Label className="text-[10px]">Subtotal</Label>
                                <p className="text-base font-bold">${totals.subtotal}</p>
                            </div>
                            <div>
                                <Label className="text-[10px]">Tax ({formData.taxRate}%)</Label>
                                <p className="text-base font-bold">${totals.taxAmount}</p>
                            </div>
                            <div>
                                <Label className="text-[10px]">Discount</Label>
                                <Input
                                    type="number"
                                    value={formData.discountAmount}
                                    onChange={(e) =>
                                        setFormData({ ...formData, discountAmount: e.target.value })
                                    }
                                    min="0"
                                    step="0.01"
                                    className="h-7 text-xs"
                                />
                            </div>
                            <div>
                                <Label className="text-[10px]">Total</Label>
                                <p className="text-lg font-bold">${totals.total}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="notes" className="text-[10px]">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) =>
                                        setFormData({ ...formData, notes: e.target.value })
                                    }
                                    rows={3}
                                    className="text-xs resize-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="terms" className="text-[10px]">Terms</Label>
                                <Textarea
                                    id="terms"
                                    value={formData.terms}
                                    onChange={(e) =>
                                        setFormData({ ...formData, terms: e.target.value })
                                    }
                                    rows={3}
                                    className="text-xs resize-none"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={onClose} className="h-7 text-xs">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || formData.items.length === 0} className="h-7 text-xs">
                            {isLoading && <Loader2 className="mr-2 size-2.5 animate-spin" />}
                            {isCreating ? "Create Invoice" : "Update Invoice"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
