"use client";

import React from "react";
import {
  NormalizedDocument,
  OrganizationData,
  DocumentCustomization,
} from "./document-types";
import { DocumentStamp } from "./DocumentStamp";
import { DocumentSignature } from "./DocumentSignature";
import { DocumentQrCode } from "./DocumentQrCode";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  CreditCard,
  FileCheck2,
  Calendar,
  Clock,
  Landmark,
  BadgeAlert,
  Hash,
} from "lucide-react";

interface A4DocumentSheetProps {
  document: NormalizedDocument;
  organization?: OrganizationData | null;
  customization: DocumentCustomization;
  forwardedRef?: React.Ref<HTMLDivElement>;
}

export const A4DocumentSheet = React.forwardRef<HTMLDivElement, A4DocumentSheetProps>(
  function A4DocumentSheet({ document, organization, customization }, ref) {
    const {
      style = "corporate",
      showLogo = true,
      logoUrl,
      logoSource = "organization",
      showStamp = true,
      stampType = "seal",
      customStampUrl,
      stampSource = "url",
      showSignature = true,
      signatureType = "cursive",
      customSignatureUrl,
      signatureSource = "url",
      signatoryName,
      signatoryTitle,
      showClientSignature = false,
      showPaymentDetails = true,
      showTerms = true,
      showNotes = true,
      showQrCode = true,
      primaryColor = "#0f172a",
      secondaryColor = "#1e3a8a",
      accentColor = "#0284c7",
      fontFamily = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    } = customization;

    const orgLogo = logoSource === "organization" ? organization?.logo : logoUrl;
    const orgName = organization?.name || "Corporate Enterprise Ltd.";
    const client = document.client;

    const formattedDate = document.date
      ? new Date(document.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
      : "—";

    const formattedDueDate = document.dueDate
      ? new Date(document.dueDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
      : document.validUntil
        ? new Date(document.validUntil).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
        : undefined;

    const dueDateLabel = document.type === "quotation" ? "Valid Until" : "Due Date";

    // Format currency amount safely
    const formatCurrency = (val: string | number | undefined) => {
      if (val === undefined || val === null || val === "") return "Ksh 0.00";
      const num = typeof val === "number" ? val : parseFloat(String(val).replace(/[^0-9.-]+/g, ""));
      const formatted = isNaN(num) ? String(val) : num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return `Ksh ${formatted}`;
    };

    // Document Title
    const documentTitle =
      document.type === "invoice"
        ? "INVOICE"
        : document.type === "quotation"
          ? "FORMAL QUOTATION"
          : "PAYMENT RECEIPT";

    // Status styling with AAA contrast
    const getStatusBadge = () => {
      const s = (document.status || "draft").toLowerCase();
      if (s === "paid" || s === "accepted") {
        return {
          bg: "bg-emerald-100 text-emerald-950 border-emerald-400",
          text: s === "paid" ? "PAID IN FULL" : "ACCEPTED",
        };
      }
      if (s === "sent") {
        return {
          bg: "bg-blue-100 text-blue-950 border-blue-400",
          text: "ISSUED / SENT",
        };
      }
      if (s === "overdue" || s === "rejected") {
        return {
          bg: "bg-rose-100 text-rose-950 border-rose-400",
          text: s === "overdue" ? "OVERDUE" : "REJECTED",
        };
      }
      return {
        bg: "bg-slate-100 text-slate-900 border-slate-300",
        text: s.toUpperCase(),
      };
    };

    const statusBadge = getStatusBadge();

    // ==========================================
    // TEMPLATE 1: CORPORATE EXECUTIVE (Default)
    // ==========================================
    const renderCorporateTemplate = () => (
      <div className="flex flex-col justify-between h-full min-h-[267mm]">
        <div>
          {/* Top Decorative Brand Stripe */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b-2 border-slate-900">
            {/* Logo and Company Details */}
            <div className="flex items-start gap-4">
              {showLogo && (
                orgLogo ? (
                  <img
                    src={orgLogo}
                    alt={orgName}
                    className="h-16 max-w-[190px] object-contain shrink-0"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xl tracking-wider shadow-sm">
                    {orgName.substring(0, 2).toUpperCase()}
                  </div>
                )
              )}
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-950 leading-tight">
                  {orgName}
                </h2>
                {organization?.address && (
                  <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                    <span>{organization.address}</span>
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-slate-600 mt-1">
                  {organization?.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                      {organization.phone}
                    </span>
                  )}
                  {organization?.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                      {organization.email}
                    </span>
                  )}
                  {organization?.taxId && (
                    <span className="font-semibold text-slate-800">
                      Tax/VAT: {organization.taxId}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Document Header Coordinates */}
            <div className="text-right">
              <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Official Document
              </span>
              <h1 className="text-3xl font-black tracking-tight text-slate-950 mt-0.5">
                {documentTitle}
              </h1>
              <div className="flex items-center justify-end gap-2 mt-2">
                <span className="font-mono text-sm font-black text-slate-900 px-2 py-0.5 bg-slate-100 rounded border border-slate-300">
                  #{document.documentNumber}
                </span>
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded border ${statusBadge.bg}`}>
                  {statusBadge.text}
                </span>
              </div>
            </div>
          </div>

          {/* Meta Grid: Client vs Dates */}
          <div className="grid grid-cols-12 gap-6 mb-8">
            {/* Bill To / Recipient */}
            <div className="col-span-7 bg-slate-50/80 p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                {document.type === "receipt" ? "Payment Received From:" : "Recipient / Billed To:"}
              </span>
              <h3 className="text-base font-bold text-slate-950">
                {client?.name || "Client Name"}
              </h3>
              {client?.companyName && (
                <p className="text-xs font-semibold text-slate-800 mt-0.5">
                  {client.companyName}
                </p>
              )}
              {client?.address && (
                <p className="text-xs text-slate-600 mt-1 leading-snug">
                  {client.address}
                  {(client.city || client.state) && `, ${[client.city, client.state, client.postalCode].filter(Boolean).join(" ")}`}
                  {client.country && `, ${client.country}`}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs text-slate-600 mt-2 pt-2 border-t border-slate-200/60">
                {client?.email && <span>{client.email}</span>}
                {client?.phone && <span>{client.phone}</span>}
                {client?.taxId && <span className="font-medium text-slate-800">Tax ID: {client.taxId}</span>}
              </div>
            </div>

            {/* Document Dates & Reference */}
            <div className="col-span-5 bg-slate-50/80 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Document Details:
                </span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Issue Date:</span>
                    <span className="font-bold text-slate-900">{formattedDate}</span>
                  </div>
                  {formattedDueDate && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">{dueDateLabel}:</span>
                      <span className="font-bold text-slate-900">{formattedDueDate}</span>
                    </div>
                  )}
                  {document.invoiceNumber && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">Linked Invoice:</span>
                      <span className="font-mono font-bold text-slate-900">#{document.invoiceNumber}</span>
                    </div>
                  )}
                  {document.paymentMethod && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">Payment Mode:</span>
                      <span className="font-bold text-slate-900 capitalize">
                        {document.paymentMethod.replace(/_/g, " ")}
                      </span>
                    </div>
                  )}
                  {document.paymentReference && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">Payment Ref:</span>
                      <span className="font-mono font-medium text-slate-800">{document.paymentReference}</span>
                    </div>
                  )}
                </div>
              </div>

              {showQrCode && (
                <div className="mt-3 pt-2 border-t border-slate-200/60">
                  <DocumentQrCode
                    documentNumber={document.documentNumber}
                    documentType={document.type}
                    date={document.date}
                    size={48}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Precision Itemized Table */}
          <div className="mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-wider font-bold">
                  <th className="py-2.5 px-3 text-left w-10 rounded-tl-lg">#</th>
                  <th className="py-2.5 px-4 text-left">Description / Specification</th>
                  <th className="py-2.5 px-3 text-center w-20">Qty</th>
                  <th className="py-2.5 px-4 text-right w-28">Rate</th>
                  <th className="py-2.5 px-4 text-right w-32 rounded-tr-lg">Amount</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-200 border-x border-b border-slate-200">
                {document.items && document.items.length > 0 ? (
                  document.items.map((item, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-slate-50/70"}
                    >
                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {item.description}
                      </td>
                      <td className="py-3 px-3 text-center text-slate-700 font-mono">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-700 font-mono">
                        ${formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-950 font-mono">
                        ${formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500 italic">
                      No line items specified.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown & Totals Grid */}
          <div className="grid grid-cols-12 gap-6 mb-6">
            {/* Payment Modes & Wire Transfer Coordinates */}
            <div className="col-span-7 space-y-4">
              {showPaymentDetails && organization && (
                <div className="bg-slate-50/90 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    <Landmark className="w-3.5 h-3.5 text-blue-700" />
                    <span>Payment Coordinates & Wire Instructions</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Bank Name</span>
                      <span className="font-semibold text-slate-900">{organization.bankName || "Authorized Bank"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Account Number</span>
                      <span className="font-mono font-semibold text-slate-900">{organization.accountNumber || "—"}</span>
                    </div>
                    {organization.accountName && (
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">Account Name</span>
                        <span className="font-semibold text-slate-900">{organization.accountName}</span>
                      </div>
                    )}
                    {organization.branch && (
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">Branch</span>
                        <span className="font-semibold text-slate-900">{organization.branch}</span>
                      </div>
                    )}
                    {organization.iban && (
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">IBAN</span>
                        <span className="font-mono font-semibold text-slate-900">{organization.iban}</span>
                      </div>
                    )}
                    {organization.swiftCode && (
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">SWIFT / BIC</span>
                        <span className="font-mono font-semibold text-slate-900">{organization.swiftCode}</span>
                      </div>
                    )}
                    {organization.routingNumber && (
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">Routing Number</span>
                        <span className="font-mono font-semibold text-slate-900">{organization.routingNumber}</span>
                      </div>
                    )}
                  </div>
                  {organization.bankAddress && (
                    <div className="mt-2 pt-2 border-t border-slate-200/60">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Bank Address</span>
                      <span className="text-slate-700">{organization.bankAddress}</span>
                    </div>
                  )}
                  {(organization.mpesaPhoneNumber || organization.mpesaBusinessNumber || organization.mpesaTillNumber) && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-green-700 uppercase tracking-wider mb-2">
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>M-Pesa Payment</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {organization.mpesaPhoneNumber && (
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Phone Number</span>
                            <span className="font-mono font-semibold text-slate-900">{organization.mpesaPhoneNumber}</span>
                          </div>
                        )}
                        {organization.mpesaBusinessNumber && (
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Paybill Number</span>
                            <span className="font-mono font-semibold text-slate-900">{organization.mpesaBusinessNumber}</span>
                          </div>
                        )}
                        {organization.mpesaAccountName && (
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Account Name</span>
                            <span className="font-semibold text-slate-900">{organization.mpesaAccountName}</span>
                          </div>
                        )}
                        {organization.mpesaTillNumber && (
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Till Number</span>
                            <span className="font-mono font-semibold text-slate-900">{organization.mpesaTillNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              {showNotes && document.notes && (
                <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200/80 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block mb-0.5">
                    Important Notes:
                  </span>
                  <p className="text-amber-950 leading-relaxed">{document.notes}</p>
                </div>
              )}
            </div>

            {/* Calculations Card */}
            <div className="col-span-5">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between py-1 text-slate-700">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-mono font-semibold text-slate-900">
                    ${formatCurrency(document.subtotal)}
                  </span>
                </div>

                {document.taxAmount && parseFloat(String(document.taxAmount)) > 0 && (
                  <div className="flex justify-between py-1 text-slate-700">
                    <span className="font-medium">
                      Tax {document.taxRate ? `(${document.taxRate}%)` : ""}
                    </span>
                    <span className="font-mono font-semibold text-slate-900">
                      ${formatCurrency(document.taxAmount)}
                    </span>
                  </div>
                )}

                {document.discountAmount && parseFloat(String(document.discountAmount)) > 0 && (
                  <div className="flex justify-between py-1 text-emerald-700 font-medium">
                    <span>Discount</span>
                    <span className="font-mono font-bold">
                      -${formatCurrency(document.discountAmount)}
                    </span>
                  </div>
                )}

                {/* Grand Total Bar */}
                <div className="pt-2 mt-2 border-t-2 border-slate-900 flex justify-between items-baseline">
                  <span className="text-sm font-black text-slate-950 uppercase tracking-wider">
                    {document.type === "receipt" ? "Amount Received" : "Total Due"}
                  </span>
                  <span className="text-2xl font-black font-mono text-slate-950">
                    ${formatCurrency(document.total)}
                  </span>
                </div>

                {/* Paid & Balance due (for invoices) */}
                {document.type === "invoice" && document.paidAmount !== undefined && (
                  <div className="pt-2 border-t border-slate-200/80 space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>Paid to Date:</span>
                      <span className="font-mono font-semibold text-emerald-700">
                        ${formatCurrency(document.paidAmount)}
                      </span>
                    </div>
                    {document.balanceDue !== undefined && (
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>Balance Due:</span>
                        <span className="font-mono text-rose-700 font-black">
                          ${formatCurrency(document.balanceDue)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          {showTerms && document.terms && (
            <div className="mb-6 p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 text-[11px] text-slate-700 leading-relaxed">
              <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider block mb-1">
                Terms & Conditions:
              </span>
              <p>{document.terms}</p>
            </div>
          )}
        </div>

        {/* Authorization & Signature Section */}
        <div className="pt-6 border-t-2 border-slate-200 mt-6 relative">
          <div className="flex items-end justify-between">
            {/* Official Stamp Placement - positioned over date area */}
            <div className="w-48 relative min-h-[90px] flex items-center justify-start">
              {showStamp && (
                <DocumentStamp
                  type={stampType}
                  customStampUrl={customStampUrl}
                  stampSource={stampSource}
                  organizationStampUrl={organization?.stampUrl}
                  companyName={orgName}
                  date={document.date}
                  referenceNumber={document.documentNumber}
                  color="#dc2626"
                />
              )}
            </div>

            {/* Signature Block */}
            <div className="flex-1 max-w-lg">
              {showSignature && (
                <DocumentSignature
                  signatoryName={signatoryName || organization?.signatoryName || "Authorized Representative"}
                  signatoryTitle={signatoryTitle || organization?.signatoryTitle || "Executive Director"}
                  signatureType={signatureType}
                  customSignatureUrl={customSignatureUrl}
                  signatureSource={signatureSource}
                  organizationSignatureUrl={organization?.signatureUrl}
                  date={document.date}
                  showClientSignature={showClientSignature}
                  clientName={client?.name}
                  clientCompanyName={client?.companyName}
                />
              )}
            </div>
          </div>

          {/* Legal Certification Footer */}
          <div className="mt-6 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
            <span>Official Computer-Generated & Sealed Document • {orgName}</span>
            <span>Page 1 of 1</span>
          </div>
        </div>
      </div>
    );

    // ==========================================
    // TEMPLATE 2: MODERN SLEEK (Tech / Minimalist)
    // ==========================================
    const renderModernTemplate = () => (
      <div className="flex flex-col justify-between h-full min-h-[267mm]">
        <div>
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              {showLogo && orgLogo ? (
                <img
                  src={orgLogo}
                  alt={orgName}
                  className="h-14 max-w-[200px] object-contain mb-4"
                />
              ) : (
                <div className="text-2xl font-black tracking-tight text-slate-900 mb-2">
                  {orgName}
                </div>
              )}
              <h1 className="text-4xl font-black tracking-tight text-slate-950">
                {documentTitle}
              </h1>
              <p className="text-slate-600 font-mono text-sm font-bold mt-1">
                Ref: #{document.documentNumber}
              </p>
            </div>

            <div className="text-right">
              <span className={`inline-block text-xs font-bold uppercase px-3 py-1 rounded-full border mb-3 ${statusBadge.bg}`}>
                {statusBadge.text}
              </span>
              <div className="space-y-1 text-xs text-slate-600">
                <div>
                  <span className="font-semibold text-slate-800">Date: </span>
                  {formattedDate}
                </div>
                {formattedDueDate && (
                  <div>
                    <span className="font-semibold text-slate-800">{dueDateLabel}: </span>
                    {formattedDueDate}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2-column Client / Issuer Modern Cards */}
          <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-slate-200">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 block mb-1">
                BILLED TO
              </span>
              <h3 className="text-lg font-bold text-slate-900">{client?.name}</h3>
              {client?.companyName && (
                <p className="text-xs font-semibold text-slate-700 mt-0.5">{client.companyName}</p>
              )}
              {client?.address && (
                <p className="text-xs text-slate-600 mt-1 leading-snug">{client.address}</p>
              )}
              {client?.email && <p className="text-xs text-slate-600 mt-1">{client.email}</p>}
            </div>

            <div className="text-right">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 block mb-1">
                ISSUED BY
              </span>
              <h3 className="text-lg font-bold text-slate-900">{orgName}</h3>
              {organization?.address && (
                <p className="text-xs text-slate-600 mt-0.5">{organization.address}</p>
              )}
              {organization?.email && (
                <p className="text-xs text-slate-600 mt-0.5">{organization.email}</p>
              )}
              {organization?.taxId && (
                <p className="text-xs font-semibold text-slate-800 mt-1">Tax ID: {organization.taxId}</p>
              )}
            </div>
          </div>

          {/* Minimalist Line Items */}
          <div className="mb-8">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b-2 border-slate-900 text-slate-900 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 text-left w-10">#</th>
                  <th className="py-3 text-left">Description</th>
                  <th className="py-3 text-center w-20">Qty</th>
                  <th className="py-3 text-right w-28">Price</th>
                  <th className="py-3 text-right w-32">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {document.items && document.items.length > 0 ? (
                  document.items.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="py-3 text-slate-400 font-mono">{i + 1}</td>
                      <td className="py-3 font-semibold text-slate-900">{item.description}</td>
                      <td className="py-3 text-center font-mono text-slate-600">{item.quantity}</td>
                      <td className="py-3 text-right font-mono text-slate-600">${formatCurrency(item.unitPrice)}</td>
                      <td className="py-3 text-right font-mono font-bold text-slate-900">${formatCurrency(item.total)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400 italic">No line items.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Modern Totals Section */}
          <div className="flex justify-end mb-8">
            <div className="w-72 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono font-semibold">${formatCurrency(document.subtotal)}</span>
              </div>
              {document.taxAmount && parseFloat(String(document.taxAmount)) > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Tax ({document.taxRate || 0}%)</span>
                  <span className="font-mono font-semibold">${formatCurrency(document.taxAmount)}</span>
                </div>
              )}
              {document.discountAmount && parseFloat(String(document.discountAmount)) > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount</span>
                  <span className="font-mono font-semibold">-${formatCurrency(document.discountAmount)}</span>
                </div>
              )}
              <div className="border-t-2 border-slate-900 pt-3 flex justify-between items-baseline">
                <span className="text-base font-black text-slate-950">TOTAL</span>
                <span className="text-2xl font-black font-mono text-blue-700">${formatCurrency(document.total)}</span>
              </div>
            </div>
          </div>

          {/* Wire details & Notes */}
          <div className="grid grid-cols-2 gap-6 mb-8 text-xs">
            {showPaymentDetails && organization && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <h4 className="font-bold text-slate-900 mb-2">Wire Payment Coordinates</h4>
                <p className="text-slate-600"><span className="font-medium text-slate-800">Bank:</span> {organization.bankName || "Authorized Bank"}</p>
                <p className="text-slate-600 font-mono mt-0.5"><span className="font-medium text-slate-800 font-sans">Account:</span> {organization.accountNumber || "—"}</p>
                {organization.accountName && (
                  <p className="text-slate-600 mt-0.5"><span className="font-medium text-slate-800">Account Name:</span> {organization.accountName}</p>
                )}
                {organization.branch && (
                  <p className="text-slate-600 mt-0.5"><span className="font-medium text-slate-800">Branch:</span> {organization.branch}</p>
                )}
                {organization.swiftCode && (
                  <p className="text-slate-600 font-mono mt-0.5"><span className="font-medium text-slate-800 font-sans">SWIFT:</span> {organization.swiftCode}</p>
                )}
                {organization.iban && (
                  <p className="text-slate-600 font-mono mt-0.5"><span className="font-medium text-slate-800 font-sans">IBAN:</span> {organization.iban}</p>
                )}
                {organization.routingNumber && (
                  <p className="text-slate-600 font-mono mt-0.5"><span className="font-medium text-slate-800 font-sans">Routing:</span> {organization.routingNumber}</p>
                )}
                {(organization.mpesaPhoneNumber || organization.mpesaBusinessNumber || organization.mpesaTillNumber) && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <h5 className="font-bold text-green-700 mb-2">M-Pesa Payment</h5>
                    {organization.mpesaPhoneNumber && (
                      <p className="text-slate-600"><span className="font-medium text-slate-800">Phone:</span> {organization.mpesaPhoneNumber}</p>
                    )}
                    {organization.mpesaBusinessNumber && (
                      <p className="text-slate-600"><span className="font-medium text-slate-800">Paybill:</span> {organization.mpesaBusinessNumber}</p>
                    )}
                    {organization.mpesaAccountName && (
                      <p className="text-slate-600"><span className="font-medium text-slate-800">Account:</span> {organization.mpesaAccountName}</p>
                    )}
                    {organization.mpesaTillNumber && (
                      <p className="text-slate-600"><span className="font-medium text-slate-800">Till:</span> {organization.mpesaTillNumber}</p>
                    )}
                  </div>
                )}
              </div>
            )}
            {showQrCode && (
              <div className="flex items-center justify-end">
                <DocumentQrCode
                  documentNumber={document.documentNumber}
                  documentType={document.type}
                  date={document.date}
                  size={56}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer with Stamp & Signatures */}
        <div className="pt-6 border-t border-slate-200">
          <div className="flex items-end justify-between">
            <div className="w-48">
              {showStamp && (
                <DocumentStamp
                  type={stampType}
                  customStampUrl={customStampUrl}
                  stampSource={stampSource}
                  organizationStampUrl={organization?.stampUrl}
                  companyName={orgName}
                  date={document.date}
                  referenceNumber={document.documentNumber}
                  color="#dc2626"
                />
              )}
            </div>
            <div className="flex-1 max-w-md">
              {showSignature && (
                <DocumentSignature
                  signatoryName={signatoryName || organization?.signatoryName || "Authorized Representative"}
                  signatoryTitle={signatoryTitle || organization?.signatoryTitle || "Executive Officer"}
                  signatureType={signatureType}
                  customSignatureUrl={customSignatureUrl}
                  signatureSource={signatureSource}
                  organizationSignatureUrl={organization?.signatureUrl}
                  date={document.date}
                  showClientSignature={showClientSignature}
                  clientName={client?.name}
                  clientCompanyName={client?.companyName}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );

    // ==========================================
    // TEMPLATE 3: CLASSIC FORMAL (Traditional)
    // ==========================================
    const renderClassicTemplate = () => (
      <div className="flex flex-col justify-between h-full min-h-[267mm] border-2 border-slate-900 p-6">
        <div>
          {/* Formal Letterhead */}
          <div className="text-center pb-6 border-b-2 border-slate-900 mb-6">
            <h2 className="text-2xl font-serif font-black tracking-wider text-slate-950 uppercase">
              {orgName}
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              {[organization?.address, organization?.phone, organization?.email].filter(Boolean).join(" • ")}
            </p>
            {organization?.taxId && (
              <p className="text-xs font-serif font-semibold text-slate-800 mt-0.5">
                REGISTRATION / TAX ID: {organization.taxId}
              </p>
            )}
            <div className="inline-block mt-4 px-6 py-1.5 border-2 border-slate-900 text-base font-serif font-black tracking-widest uppercase">
              {documentTitle}
            </div>
          </div>

          {/* Formal Details Grid */}
          <div className="grid grid-cols-2 border border-slate-900 mb-6 text-xs font-serif">
            <div className="p-3 border-r border-slate-900">
              <span className="font-bold uppercase text-[10px] text-slate-600 block mb-1">RECIPIENT / DEBTOR:</span>
              <p className="font-bold text-sm text-slate-950">{client?.name}</p>
              {client?.companyName && <p className="font-medium text-slate-800">{client.companyName}</p>}
              {client?.address && <p className="text-slate-600 mt-0.5">{client.address}</p>}
              {client?.taxId && <p className="mt-1 font-mono font-medium">TAX ID: {client.taxId}</p>}
            </div>
            <div className="p-3 space-y-1">
              <div className="flex justify-between">
                <span className="font-bold text-slate-600">NUMBER:</span>
                <span className="font-mono font-bold text-slate-950">#{document.documentNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-600">DATE:</span>
                <span>{formattedDate}</span>
              </div>
              {formattedDueDate && (
                <div className="flex justify-between">
                  <span className="font-bold text-slate-600">{dueDateLabel.toUpperCase()}:</span>
                  <span>{formattedDueDate}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-bold text-slate-600">STATUS:</span>
                <span className="font-bold uppercase">{document.status}</span>
              </div>
            </div>
          </div>

          {/* Formal Boxed Table */}
          <table className="w-full border-collapse border border-slate-900 text-xs mb-6 font-serif">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-900 font-bold uppercase text-[11px]">
                <th className="p-2 border-r border-slate-900 w-10 text-center">ITEM</th>
                <th className="p-2 border-r border-slate-900 text-left">DESCRIPTION</th>
                <th className="p-2 border-r border-slate-900 w-16 text-center">QTY</th>
                <th className="p-2 border-r border-slate-900 w-24 text-right">UNIT PRICE</th>
                <th className="p-2 text-right w-28">AMOUNT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {document.items && document.items.length > 0 ? (
                document.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-2 border-r border-slate-900 text-center font-mono">{idx + 1}</td>
                    <td className="p-2 border-r border-slate-900 font-medium">{item.description}</td>
                    <td className="p-2 border-r border-slate-900 text-center font-mono">{item.quantity}</td>
                    <td className="p-2 border-r border-slate-900 text-right font-mono">${formatCurrency(item.unitPrice)}</td>
                    <td className="p-2 text-right font-mono font-bold">${formatCurrency(item.total)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-4 text-center italic text-slate-400">No items.</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Formal Totals and Payment Box */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="border border-slate-900 p-3 text-xs font-serif space-y-1">
              <span className="font-bold uppercase text-[10px] block mb-1">REMITTANCE INSTRUCTIONS:</span>
              <p><span className="font-bold">Payee Bank:</span> {organization?.bankName || "Authorized Bank"}</p>
              <p><span className="font-bold">Account No:</span> {organization?.accountNumber || "—"}</p>
              {organization?.accountName && <p><span className="font-bold">Account Name:</span> {organization.accountName}</p>}
              {organization?.branch && <p><span className="font-bold">Branch:</span> {organization.branch}</p>}
              {organization?.swiftCode && <p><span className="font-bold">SWIFT/BIC:</span> {organization.swiftCode}</p>}
              {organization?.iban && <p><span className="font-bold">IBAN:</span> {organization.iban}</p>}
              {organization?.routingNumber && <p><span className="font-bold">Routing:</span> {organization.routingNumber}</p>}
              {(organization?.mpesaPhoneNumber || organization?.mpesaBusinessNumber || organization?.mpesaTillNumber) && (
                <div className="mt-2 pt-2 border-t border-slate-300">
                  <span className="font-bold uppercase text-[10px] block mb-1 text-green-800">M-PESA:</span>
                  {organization.mpesaPhoneNumber && <p><span className="font-bold">Phone:</span> {organization.mpesaPhoneNumber}</p>}
                  {organization.mpesaBusinessNumber && <p><span className="font-bold">Paybill:</span> {organization.mpesaBusinessNumber}</p>}
                  {organization.mpesaAccountName && <p><span className="font-bold">Account:</span> {organization.mpesaAccountName}</p>}
                  {organization.mpesaTillNumber && <p><span className="font-bold">Till:</span> {organization.mpesaTillNumber}</p>}
                </div>
              )}
              {document.paymentMethod && <p className="capitalize"><span className="font-bold">Method:</span> {document.paymentMethod.replace(/_/g, " ")}</p>}
            </div>

            <div className="border border-slate-900 p-3 text-xs font-serif space-y-1.5">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono font-bold">${formatCurrency(document.subtotal)}</span>
              </div>
              {document.taxAmount && (
                <div className="flex justify-between">
                  <span>Tax Amount:</span>
                  <span className="font-mono">${formatCurrency(document.taxAmount)}</span>
                </div>
              )}
              {document.discountAmount && (
                <div className="flex justify-between text-emerald-800">
                  <span>Discount:</span>
                  <span className="font-mono">-${formatCurrency(document.discountAmount)}</span>
                </div>
              )}
              <div className="border-t border-slate-900 pt-1.5 flex justify-between font-black text-sm">
                <span>TOTAL DUE:</span>
                <span className="font-mono text-base">${formatCurrency(document.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dual Signatures and Seal */}
        <div className="border-t-2 border-slate-900 pt-4">
          <div className="flex items-end justify-between">
            <div className="w-44">
              {showStamp && (
                <DocumentStamp
                  type={stampType}
                  customStampUrl={customStampUrl}
                  stampSource={stampSource}
                  organizationStampUrl={organization?.stampUrl}
                  companyName={orgName}
                  date={document.date}
                  referenceNumber={document.documentNumber}
                  color="#dc2626"
                />
              )}
            </div>
            <div className="flex-1 max-w-md">
              {showSignature && (
                <DocumentSignature
                  signatoryName={signatoryName || organization?.signatoryName || "Authorized Representative"}
                  signatoryTitle={signatoryTitle || organization?.signatoryTitle || "Executive Officer"}
                  signatureType={signatureType}
                  customSignatureUrl={customSignatureUrl}
                  signatureSource={signatureSource}
                  organizationSignatureUrl={organization?.signatureUrl}
                  date={document.date}
                  showClientSignature={showClientSignature}
                  clientName={client?.name}
                  clientCompanyName={client?.companyName}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <div
        ref={ref}
        id="a4-document-printable-sheet"
        className="bg-white text-slate-950 shadow-2xl relative select-text"
        style={{
          width: "210mm",
          minHeight: "297mm",
          boxSizing: "border-box",
          padding: "16mm",
          margin: "0 auto",
          fontFamily,
          backgroundColor: "#ffffff",
          color: "#0f172a",
        }}
      >
        {style === "corporate" && renderCorporateTemplate()}
        {style === "modern" && renderModernTemplate()}
        {style === "classic" && renderClassicTemplate()}
      </div>
    );
  }
);
