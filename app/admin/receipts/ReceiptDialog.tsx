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
import { Loader2, Plus } from "lucide-react";
import { ReceiptRow } from "./columns";
import {
    generateReceiptNumberAction,
    createReceiptAction,
    updateReceiptAction,
} from "@/app/actions/documents";
import { toast } from "sonner";

interface ReceiptDialogProps {
    receipt?: ReceiptRow | null;
    clients: any[];
    invoices: any[];
    open: boolean;
    onClose: () => void;
    isCreating?: boolean;
}

export function ReceiptDialog({ receipt, clients, invoices, open, onClose, isCreating }: ReceiptDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingNumber, setIsGeneratingNumber] = useState(false);
    const [formData, setFormData] = useState({
        receiptNumber: "",
        invoiceId: "",
        clientId: "",
        receiptDate: new Date().toISOString().split('T')[0],
        amount: "",
        paymentMethod: "bank_transfer" as "cash" | "bank_transfer" | "credit_card" | "debit_card" | "check" | "other",
        paymentReference: "",
        notes: "",
    });

    useEffect(() => {
        if (receipt && !isCreating) {
            setFormData({
                receiptNumber: receipt.receiptNumber,
                invoiceId: receipt.invoiceId,
                clientId: receipt.clientId,
                receiptDate: new Date(receipt.receiptDate).toISOString().split('T')[0],
                amount: receipt.amount,
                paymentMethod: receipt.paymentMethod as "cash" | "bank_transfer" | "credit_card" | "debit_card" | "check" | "other",
                paymentReference: receipt.paymentReference || "",
                notes: receipt.notes || "",
            });
        } else {
            setFormData({
                receiptNumber: "",
                invoiceId: "",
                clientId: "",
                receiptDate: new Date().toISOString().split('T')[0],
                amount: "",
                paymentMethod: "bank_transfer",
                paymentReference: "",
                notes: "",
            });
        }
    }, [receipt, isCreating, open]);

    const generateNumber = async () => {
        setIsGeneratingNumber(true);
        try {
            const result = await generateReceiptNumberAction();
            if (result.success && result.number) {
                setFormData({ ...formData, receiptNumber: result.number });
            }
        } catch (error) {
            toast.error("Failed to generate receipt number");
        } finally {
            setIsGeneratingNumber(false);
        }
    };

    const handleInvoiceChange = (invoiceId: string | null) => {
        if (!invoiceId) return;
        const invoice = invoices.find(inv => inv._id === invoiceId);
        if (invoice) {
            setFormData({
                ...formData,
                invoiceId,
                clientId: invoice.clientId,
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const submitData = {
                ...formData,
                invoiceId: formData.invoiceId as any,
                clientId: formData.clientId as any,
                receiptDate: new Date(formData.receiptDate).getTime(),
            };

            if (isCreating) {
                const result = await createReceiptAction(submitData);
                if (result.error) {
                    toast.error(result.error);
                } else {
                    toast.success("Receipt created successfully");
                    onClose();
                }
            } else if (receipt) {
                const result = await updateReceiptAction(receipt._id, submitData);
                if (result.error) {
                    toast.error(result.error);
                } else {
                    toast.success("Receipt updated successfully");
                    onClose();
                }
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const unpaidInvoices = invoices.filter(inv => {
        const balance = parseFloat(inv.balanceDue || inv.total);
        return balance > 0;
    });

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-h-[80vh] overflow-hidden mx-auto my-4 !max-w-[50%] w-[80%] md:!w-1/2 sm:!max-w-[50%] flex flex-col">
                <DialogHeader>
                    <DialogTitle>
                        {isCreating ? "Create New Receipt" : "Edit Receipt"}
                    </DialogTitle>
                    <DialogDescription>
                        {isCreating
                            ? "Record a payment for an invoice."
                            : "Update the receipt details."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-5 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="receiptNumber" className="text-[10px]">Receipt Number *</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="receiptNumber"
                                        value={formData.receiptNumber}
                                        onChange={(e) =>
                                            setFormData({ ...formData, receiptNumber: e.target.value })
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
                                <Label htmlFor="receiptDate" className="text-[10px]">Receipt Date *</Label>
                                <Input
                                    id="receiptDate"
                                    type="date"
                                    value={formData.receiptDate}
                                    onChange={(e) =>
                                        setFormData({ ...formData, receiptDate: e.target.value })
                                    }
                                    required
                                    className="h-7 text-xs"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="invoiceId" className="text-[10px]">Invoice *</Label>
                            <Select
                                value={formData.invoiceId}
                                onValueChange={handleInvoiceChange}
                                required
                            >
                                <SelectTrigger className="h-7 text-xs">
                                    <SelectValue placeholder="Select an invoice" />
                                </SelectTrigger>
                                <SelectContent>
                                    {unpaidInvoices.length === 0 ? (
                                        <SelectItem value="" disabled>
                                            No unpaid invoices
                                        </SelectItem>
                                    ) : (
                                        unpaidInvoices.map((invoice) => (
                                            <SelectItem key={invoice._id} value={invoice._id}>
                                                {invoice.invoiceNumber} - {invoice.client?.name} (Balance: ${invoice.balanceDue || invoice.total})
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="clientId" className="text-[10px]">Client</Label>
                            <Input
                                id="clientId"
                                value={clients.find(c => c._id === formData.clientId)?.name || ""}
                                readOnly
                                className="bg-muted h-7 text-xs"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="amount" className="text-[10px]">Amount *</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) =>
                                        setFormData({ ...formData, amount: e.target.value })
                                    }
                                    required
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="h-7 text-xs"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="paymentMethod" className="text-[10px]">Payment Method *</Label>
                                <Select
                                    value={formData.paymentMethod}
                                    onValueChange={(value: any) =>
                                        setFormData({ ...formData, paymentMethod: value })
                                    }
                                    required
                                >
                                    <SelectTrigger className="h-7 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="credit_card">Credit Card</SelectItem>
                                        <SelectItem value="debit_card">Debit Card</SelectItem>
                                        <SelectItem value="check">Check</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="paymentReference" className="text-[10px]">Payment Reference</Label>
                            <Input
                                id="paymentReference"
                                value={formData.paymentReference}
                                onChange={(e) =>
                                    setFormData({ ...formData, paymentReference: e.target.value })
                                }
                                placeholder="Transaction ID, check number, etc."
                                className="h-7 text-xs"
                            />
                        </div>

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
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                            {isCreating ? "Create Receipt" : "Update Receipt"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
