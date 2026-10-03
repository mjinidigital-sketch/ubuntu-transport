"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { FormWizard } from "@/components/admin/forms/FormWizard";
import { InlineClientCreator } from "@/components/admin/forms/InlineClientCreator";
import { ReceiptPreview } from "./ReceiptPreview";

interface ReceiptFormSheetProps {
  receipt?: ReceiptRow | null;
  clients: any[];
  invoices: any[];
  open: boolean;
  onClose: () => void;
  isCreating?: boolean;
}

export function ReceiptFormSheet({
  receipt,
  clients,
  invoices,
  open,
  onClose,
  isCreating,
}: ReceiptFormSheetProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingNumber, setIsGeneratingNumber] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [localClients, setLocalClients] = useState(clients);
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
        paymentMethod: receipt.paymentMethod,
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
    setCurrentStep(0);
    setShowPreview(false);
    setLocalClients(clients);
  }, [receipt, isCreating, open, clients]);

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
        amount: invoice.balanceDue || invoice.total,
      });
    }
  };

  const handleSubmit = async () => {
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

  const canProceedFromStep1 = () => {
    return !!formData.receiptNumber && !!formData.invoiceId && !!formData.receiptDate;
  };

  const canProceedFromStep2 = () => {
    return formData.amount && formData.paymentMethod;
  };

  const handleNext = () => {
    if (currentStep === 2) {
      setShowPreview(true);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (showPreview) {
      setShowPreview(false);
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepCanNext = () => {
    if (currentStep === 0) return canProceedFromStep1();
    if (currentStep === 1) return canProceedFromStep2();
    if (currentStep === 2) return true;
    return false;
  };

  const previewReceipt = {
    ...formData,
    invoice: invoices.find(inv => inv._id === formData.invoiceId),
    client: localClients.find(c => c._id === formData.clientId),
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="right" className="overflow-hidden max-w-[90vw] md:!max-w-[50%] w-[80%] md:!w-1/2">
          <SheetHeader>
            <SheetTitle>
              {isCreating ? "Create New Receipt" : "Edit Receipt"}
            </SheetTitle>
            <SheetDescription>
              {isCreating
                ? "Record a payment for an invoice."
                : "Update the receipt details."}
            </SheetDescription>
          </SheetHeader>

          <FormWizard
            currentStep={currentStep}
            totalSteps={3}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSubmit={handleSubmit}
            isLastStep={Boolean(currentStep === 2 && !showPreview)}
            canNext={Boolean(currentStepCanNext())}
            isLoading={isLoading}
          >
            {/* Step 1: Basic Information */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="receiptNumber" className="text-xs">Receipt Number *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="receiptNumber"
                        value={formData.receiptNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, receiptNumber: e.target.value })
                        }
                        required
                        className="h-8 text-sm"
                      />
                      {isCreating && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={generateNumber}
                          disabled={isGeneratingNumber}
                          className="h-8 w-8"
                        >
                          {isGeneratingNumber ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            <Plus className="size-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="receiptDate" className="text-xs">Receipt Date *</Label>
                    <Input
                      id="receiptDate"
                      type="date"
                      value={formData.receiptDate}
                      onChange={(e) =>
                        setFormData({ ...formData, receiptDate: e.target.value })
                      }
                      required
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="invoiceId" className="text-xs">Invoice *</Label>
                  <Select
                    value={formData.invoiceId}
                    onValueChange={(value) => handleInvoiceChange(value)}
                    required
                  >
                    <SelectTrigger className="h-8 text-sm">
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

                <div className="space-y-1.5">
                  <Label htmlFor="clientId" className="text-xs">Client</Label>
                  <div className="flex gap-2">
                    <Input
                      id="clientId"
                      value={localClients.find(c => c._id === formData.clientId)?.name || ""}
                      readOnly
                      className="bg-muted flex-1 h-8 text-sm"
                    />
                    <InlineClientCreator
                      onClientCreated={(client) => {
                        setLocalClients([...localClients, client]);
                        setFormData({ ...formData, clientId: client._id });
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Payment Details */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="amount" className="text-xs">Amount *</Label>
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
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="paymentMethod" className="text-xs">Payment Method *</Label>
                    <Select
                      value={formData.paymentMethod}
                      onValueChange={(value) =>
                        setFormData({ ...formData, paymentMethod: value as any })
                      }
                      required
                    >
                      <SelectTrigger className="h-8 text-sm">
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

                <div className="space-y-1.5">
                  <Label htmlFor="paymentReference" className="text-xs">Payment Reference</Label>
                  <Input
                    id="paymentReference"
                    value={formData.paymentReference}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentReference: e.target.value })
                    }
                    placeholder="Transaction ID, check number, etc."
                    className="h-8 text-sm"
                  />
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2 text-sm">Payment Summary</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>Invoice:</span>
                      <span className="font-medium">
                        {invoices.find(inv => inv._id === formData.invoiceId)?.invoiceNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-bold">${formData.amount || "0.00"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Method:</span>
                      <span className="font-medium capitalize">
                        {formData.paymentMethod.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Notes */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="notes" className="text-xs">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={6}
                    placeholder="Add any additional notes about this payment..."
                    className="text-sm resize-none"
                  />
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2 text-sm">Receipt Summary</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>Receipt Number:</span>
                      <span className="font-medium">{formData.receiptNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Invoice:</span>
                      <span className="font-medium">
                        {invoices.find(inv => inv._id === formData.invoiceId)?.invoiceNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Client:</span>
                      <span className="font-medium">
                        {clients.find(c => c._id === formData.clientId)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-bold">${formData.amount || "0.00"}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </FormWizard>
        </SheetContent>
      </Sheet>

      {/* Preview Dialog */}
      <ReceiptPreview
        receipt={previewReceipt as any}
        open={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </>
  );
}
