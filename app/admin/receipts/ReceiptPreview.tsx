"use client";

import React, { useState, useEffect } from "react";
import { getOrganization } from "@/app/actions/organization";
import { CorporateDocumentViewer } from "@/components/documents/CorporateDocumentViewer";
import { NormalizedDocument } from "@/components/documents/document-types";

interface ReceiptPreviewProps {
  receipt?: any;
  clients?: any[];
  invoices?: any[];
  open: boolean;
  onClose: () => void;
}

export function ReceiptPreview({
  receipt,
  clients = [],
  invoices = [],
  open,
  onClose,
}: ReceiptPreviewProps) {
  const [organization, setOrganization] = useState<any>(null);

  useEffect(() => {
    async function fetchOrg() {
      try {
        const org = await getOrganization();
        setOrganization(org);
      } catch (error) {
        console.error("Failed to fetch organization:", error);
      }
    }
    if (open) {
      fetchOrg();
    }
  }, [open]);

  if (!receipt || !open) return null;

  // Resolve client and invoice
  const client =
    receipt.client ||
    clients.find((c) => c._id === receipt.clientId) || {
      name: "Valued Customer",
    };

  const invoice =
    receipt.invoice ||
    invoices.find((inv) => inv._id === receipt.invoiceId);

  const normalizedDocument: NormalizedDocument = {
    type: "receipt",
    id: receipt._id,
    documentNumber: receipt.receiptNumber || "RCP-0001",
    date: receipt.receiptDate || Date.now(),
    status: "paid",
    client: {
      _id: client._id,
      name: client.name || "Customer Name",
      companyName: client.companyName,
      email: client.email,
      phone: client.phone,
      address: client.address,
      city: client.city,
      state: client.state,
      country: client.country,
      postalCode: client.postalCode,
      taxId: client.taxId,
    },
    items: [
      {
        id: "1",
        description: invoice?.invoiceNumber
          ? `Settlement of Invoice #${invoice.invoiceNumber}`
          : "Payment for professional services / goods rendered",
        quantity: 1,
        unitPrice: receipt.amount || "0.00",
        total: receipt.amount || "0.00",
      },
    ],
    subtotal: receipt.amount || "0.00",
    total: receipt.amount || "0.00",
    paidAmount: receipt.amount || "0.00",
    paymentMethod: receipt.paymentMethod || "cash",
    paymentReference: receipt.paymentReference,
    invoiceNumber: invoice?.invoiceNumber,
    notes: receipt.notes,
  };

  return (
    <CorporateDocumentViewer
      document={normalizedDocument}
      organization={organization}
      open={open}
      onClose={onClose}
      defaultStyle="corporate"
    />
  );
}
