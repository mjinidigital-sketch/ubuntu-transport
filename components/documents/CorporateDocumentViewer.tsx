"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  NormalizedDocument,
  OrganizationData,
  DocumentCustomization,
  TemplateStyle,
  StampType,
} from "./document-types";
import { A4DocumentSheet } from "./A4DocumentSheet";
import { exportElementToPdf } from "./pdf-export";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Download,
  Printer,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  SlidersHorizontal,
  FileText,
  Building,
  Stamp as StampIcon,
  PenLine,
  Landmark,
  QrCode,
  Check,
  RotateCcw,
  Sparkles,
  Loader2,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";

interface CorporateDocumentViewerProps {
  document: NormalizedDocument;
  organization?: OrganizationData | null;
  open: boolean;
  onClose: () => void;
  defaultStyle?: TemplateStyle;
}

export function CorporateDocumentViewer({
  document,
  organization,
  open,
  onClose,
  defaultStyle = "corporate",
}: CorporateDocumentViewerProps) {
  const [zoom, setZoom] = useState<number>(0.85);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [showCustomizeDialog, setShowCustomizeDialog] = useState<boolean>(false);

  // Initialize customization state
  const [customization, setCustomization] = useState<DocumentCustomization>({
    style: defaultStyle,
    primaryColor: organization?.primaryColor || "#0f172a",
    secondaryColor: organization?.secondaryColor || "#1e3a8a",
    accentColor: organization?.accentColor || "#0284c7",
    fontFamily: organization?.fontFamily || "Inter, -apple-system, sans-serif",
    showLogo: true,
    logoUrl: organization?.logo,
    logoSource: "organization",
    logoPosition: "left",
    showStamp: true,
    stampType: "custom",
    customStampUrl: organization?.stampUrl || "/stamp-ubuntu.webp",
    stampSource: organization?.stampUrl ? "organization" : "url",
    showSignature: true,
    signatureType: organization?.signatureUrl ? "custom" : "cursive",
    customSignatureUrl: organization?.signatureUrl,
    signatureSource: "organization",
    signatoryName: organization?.signatoryName || "Authorized Representative",
    signatoryTitle: organization?.signatoryTitle || "Executive Director",
    showClientSignature: document.type === "quotation",
    showPaymentDetails: true,
    showTerms: true,
    showNotes: true,
    showQrCode: false,
  });

  const sheetRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut for ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Adjust default zoom based on window width
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 768) {
        setZoom(0.45);
      } else if (window.innerWidth < 1200) {
        setZoom(0.68);
      } else {
        setZoom(0.85);
      }
    }
  }, [open]);

  // Handle Download PDF with high resolution and clean margins
  const handleDownloadPDF = async () => {
    if (!sheetRef.current) return;
    setIsDownloading(true);

    try {
      const filename = `${document.type}_${document.documentNumber || "document"}.pdf`;
      await exportElementToPdf(sheetRef.current, filename);
      toast.success("Document PDF downloaded successfully!");
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error("PDF generation failed:", error);
      toast.error(`PDF export failed: ${msg}. Try the Print → Save as PDF option.`);
    } finally {
      setIsDownloading(false);
    }
  };

  // High-fidelity Native Print handler
  const handlePrint = () => {
    if (!sheetRef.current) return;

    const printContents = sheetRef.current.innerHTML;
    const printFrame = window.open("", "_blank", "width=900,height=1100");

    if (printFrame) {
      printFrame.document.open();
      printFrame.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${document.type.toUpperCase()} #${document.documentNumber}</title>
            <meta charset="utf-8" />
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet">
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              @page {
                size: A4 portrait;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
                background-color: #ffffff;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                font-family: 'Inter', sans-serif;
              }
              #print-container {
                width: 210mm;
                min-height: 297mm;
                padding: 16mm;
                box-sizing: border-box;
                margin: 0 auto;
                background: #ffffff !important;
              }
            </style>
          </head>
          <body>
            <div id="print-container">
              ${printContents}
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.focus();
                  window.print();
                  window.close();
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printFrame.document.close();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-between p-0 animate-in fade-in-0 duration-200">
      {/* ======================================= */}
      {/* TOP CONTROL BAR - PRODUCTION GRADE      */}
      {/* ======================================= */}
      <header className="w-full bg-slate-900 border-b border-slate-800 text-white px-6 py-3 flex items-center justify-between z-10 shrink-0 shadow-lg">
        {/* Document Identifier & Status */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm tracking-wide text-white capitalize">
                {document.type} Preview
              </h2>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-bold">
                #{document.documentNumber}
              </span>
              <Badge
                variant="outline"
                className={`text-[10px] uppercase font-bold px-2 py-0 border ${
                  document.status === "paid" || document.status === "accepted"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : document.status === "sent"
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                    : document.status === "overdue"
                    ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                    : "bg-slate-700/40 text-slate-300 border-slate-600"
                }`}
              >
                {document.status}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400">
              Client: <span className="text-slate-200 font-medium">{document.client?.name || "Client"}</span>
            </p>
          </div>
        </div>

        {/* Center: Template Switcher & Quick Customization */}
        <div className="hidden md:flex items-center gap-2 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setCustomization((prev) => ({ ...prev, style: "corporate" }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              customization.style === "corporate"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Corporate Executive</span>
          </button>
          <button
            onClick={() => setCustomization((prev) => ({ ...prev, style: "modern" }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              customization.style === "modern"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Modern Sleek</span>
          </button>
          <button
            onClick={() => setCustomization((prev) => ({ ...prev, style: "classic" }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              customization.style === "classic"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Classic Formal</span>
          </button>
        </div>

        {/* Right Action Tools: Customize, Zoom, Print, Download, Close */}
        <div className="flex items-center gap-3">
          {/* Customize Sheet Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCustomizeDialog(true)}
            className="border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Stamps & Options</span>
          </Button>

          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5">
            <button
              onClick={() => setZoom((z) => Math.max(0.4, Number((z - 0.1).toFixed(2))))}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-2 text-slate-300 select-none min-w-[42px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(1.5, Number((z + 0.1).toFixed(2))))}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(0.85)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition ml-0.5 border-l border-slate-700"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Print Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white text-xs gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden sm:inline">Print</span>
          </Button>

          {/* Download PDF Button */}
          <Button
            size="sm"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md gap-1.5 min-w-[120px]"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </>
            )}
          </Button>

          {/* Close Modal */}
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Close Preview (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ======================================= */}
      {/* MAIN DOCUMENT CANVAS WITH A4 PROPORTIONS*/}
      {/* ======================================= */}
      <main className="flex-1 w-full overflow-auto flex items-start justify-center p-6 md:p-10 relative">
        <div
          className="transition-transform duration-150 origin-top flex justify-center drop-shadow-2xl"
          style={{
            transform: `scale(${zoom})`,
          }}
        >
          <A4DocumentSheet
            ref={sheetRef}
            document={document}
            organization={organization}
            customization={customization}
          />
        </div>
      </main>

      {/* ======================================= */}
      {/* CUSTOMIZATION DIALOG / MODAL            */}
      {/* ======================================= */}
      <Dialog open={showCustomizeDialog} onOpenChange={setShowCustomizeDialog}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-400" />
              Document Customization & Attachments
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-2 text-sm">
            {/* Template Selection */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Document Style Template
              </Label>
              <Select
                value={customization.style}
                onValueChange={(val) =>
                  setCustomization((prev) => ({ ...prev, style: val as TemplateStyle }))
                }
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectItem value="corporate">Corporate Executive (Authoritative Enterprise)</SelectItem>
                  <SelectItem value="modern">Modern Sleek (Tech & Minimalist)</SelectItem>
                  <SelectItem value="classic">Classic Formal (Accounting Traditional)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Logo Settings */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-400" />
                  <span className="font-semibold text-white">Company Logo</span>
                </div>
                <Switch
                  checked={customization.showLogo}
                  onCheckedChange={(checked) =>
                    setCustomization((prev) => ({ ...prev, showLogo: checked }))
                  }
                />
              </div>
              {customization.showLogo && (
                <div className="space-y-3 pt-2">
                  <div>
                    <Label className="text-xs text-slate-300">Logo Source</Label>
                    <Select
                      value={customization.logoSource || "organization"}
                      onValueChange={(val) =>
                        setCustomization((prev) => ({ ...prev, logoSource: val as "organization" | "url" | "upload" }))
                      }
                    >
                      <SelectTrigger className="bg-slate-900 border-slate-700 text-white text-xs mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        <SelectItem value="organization">Use Organization Settings</SelectItem>
                        <SelectItem value="url">Custom URL</SelectItem>
                        <SelectItem value="upload">Upload File</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {customization.logoSource === "url" && (
                    <div>
                      <Label className="text-xs text-slate-300">Custom Logo Image URL</Label>
                      <Input
                        placeholder="https://example.com/logo.png"
                        value={customization.logoUrl || ""}
                        onChange={(e) =>
                          setCustomization((prev) => ({ ...prev, logoUrl: e.target.value }))
                        }
                        className="bg-slate-900 border-slate-700 text-white text-xs mt-1"
                      />
                    </div>
                  )}

                  {customization.logoSource === "upload" && (
                    <div>
                      <Label className="text-xs text-slate-300">Upload Logo Image</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setCustomization((prev) => ({ ...prev, logoUrl: reader.result as string }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="bg-slate-900 border-slate-700 text-white text-xs mt-1"
                      />
                    </div>
                  )}

                  {customization.logoUrl && customization.logoSource !== "organization" && (
                    <div className="flex items-center gap-2 pt-2">
                      <img
                        src={customization.logoUrl}
                        alt="Logo preview"
                        className="h-12 max-w-[120px] object-contain rounded border border-slate-600"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCustomization((prev) => ({ ...prev, logoUrl: "" }))}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Official Stamp & Seal Settings */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StampIcon className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-white">Official Stamp & Seal</span>
                </div>
                <Switch
                  checked={customization.showStamp}
                  onCheckedChange={(checked) =>
                    setCustomization((prev) => ({ ...prev, showStamp: checked }))
                  }
                />
              </div>

              {customization.showStamp && (
                <div className="space-y-3 pt-2">
                  <div>
                    <Label className="text-xs text-slate-300">Stamp Design / Seal Type</Label>
                    <Select
                      value={customization.stampType}
                      onValueChange={(val) =>
                        setCustomization((prev) => ({ ...prev, stampType: val as StampType }))
                      }
                    >
                      <SelectTrigger className="bg-slate-900 border-slate-700 text-white text-xs mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        <SelectItem value="custom">🖼️ Ubuntu Official Stamp (Image)</SelectItem>
                        <SelectItem value="seal">Official Corporate Circular Seal</SelectItem>
                        <SelectItem value="paid">"PAID IN FULL" Verified Stamp</SelectItem>
                        <SelectItem value="received">"PAYMENT RECEIVED" Receipt Stamp</SelectItem>
                        <SelectItem value="approved">"APPROVED FOR PAYMENT" Stamp</SelectItem>
                        <SelectItem value="authorized">&quot;AUTHORIZED &amp; SECURED&quot; Stamp</SelectItem>
                        <SelectItem value="quotation">"OFFICIAL QUOTATION" Stamp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {customization.stampType === "custom" && (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-slate-300">Stamp Source</Label>
                        <Select
                          value={customization.stampSource || "url"}
                          onValueChange={(val) =>
                            setCustomization((prev) => ({ ...prev, stampSource: val as "organization" | "url" | "upload" }))
                          }
                        >
                          <SelectTrigger className="bg-slate-900 border-slate-700 text-white text-xs mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700 text-white">
                            <SelectItem value="organization">Use Organization Settings</SelectItem>
                            <SelectItem value="url">Custom URL</SelectItem>
                            <SelectItem value="upload">Upload File</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {customization.stampSource === "url" && (
                        <div>
                          <Label className="text-xs text-slate-300">Stamp Image URL (or public path)</Label>
                          <Input
                            placeholder="/stamp-ubuntu.webp"
                            value={customization.customStampUrl || ""}
                            onChange={(e) =>
                              setCustomization((prev) => ({ ...prev, customStampUrl: e.target.value }))
                            }
                            className="bg-slate-900 border-slate-700 text-white text-xs mt-1"
                          />
                          <p className="text-[10px] text-slate-500 mt-1">Default: /stamp-ubuntu.webp (Ubuntu official stamp)</p>
                        </div>
                      )}

                      {customization.stampSource === "upload" && (
                        <div>
                          <Label className="text-xs text-slate-300">Upload Stamp Image</Label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setCustomization((prev) => ({ ...prev, customStampUrl: reader.result as string }));
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="bg-slate-900 border-slate-700 text-white text-xs mt-1"
                          />
                        </div>
                      )}

                      {customization.customStampUrl && (
                        <div className="flex items-center gap-2 pt-2">
                          <img
                            src={customization.customStampUrl}
                            alt="Stamp preview"
                            className="h-16 max-w-[120px] object-contain rounded border border-slate-600"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCustomization((prev) => ({ ...prev, customStampUrl: "" }))}
                            className="text-xs text-red-400 hover:text-red-300"
                          >
                            Clear
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Signature Settings */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PenLine className="w-4 h-4 text-purple-400" />
                  <span className="font-semibold text-white">Authorized Signature</span>
                </div>
                <Switch
                  checked={customization.showSignature}
                  onCheckedChange={(checked) =>
                    setCustomization((prev) => ({ ...prev, showSignature: checked }))
                  }
                />
              </div>

              {customization.showSignature && (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-slate-300">Signatory Full Name</Label>
                      <Input
                        value={customization.signatoryName}
                        onChange={(e) =>
                          setCustomization((prev) => ({ ...prev, signatoryName: e.target.value }))
                        }
                        className="bg-slate-900 border-slate-700 text-white text-xs mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-300">Signatory Title / Designation</Label>
                      <Input
                        value={customization.signatoryTitle}
                        onChange={(e) =>
                          setCustomization((prev) => ({ ...prev, signatoryTitle: e.target.value }))
                        }
                        className="bg-slate-900 border-slate-700 text-white text-xs mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-slate-300">Signature Stroke Style</Label>
                    <Select
                      value={customization.signatureType}
                      onValueChange={(val) =>
                        setCustomization((prev) => ({ ...prev, signatureType: val as "cursive" | "custom" }))
                      }
                    >
                      <SelectTrigger className="bg-slate-900 border-slate-700 text-white text-xs mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        <SelectItem value="cursive">Authentic Vector Calligraphy (Fountain Pen)</SelectItem>
                        <SelectItem value="custom">Custom Signature Image URL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {customization.signatureType === "custom" && (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-slate-300">Signature Source</Label>
                        <Select
                          value={customization.signatureSource || "url"}
                          onValueChange={(val) =>
                            setCustomization((prev) => ({ ...prev, signatureSource: val as "organization" | "url" | "upload" }))
                          }
                        >
                          <SelectTrigger className="bg-slate-900 border-slate-700 text-white text-xs mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700 text-white">
                            <SelectItem value="organization">Use Organization Settings</SelectItem>
                            <SelectItem value="url">Custom URL</SelectItem>
                            <SelectItem value="upload">Upload File</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {customization.signatureSource === "url" && (
                        <div>
                          <Label className="text-xs text-slate-300">Custom Signature Image URL</Label>
                          <Input
                            placeholder="https://example.com/signature.png (Transparent PNG)"
                            value={customization.customSignatureUrl || ""}
                            onChange={(e) =>
                              setCustomization((prev) => ({ ...prev, customSignatureUrl: e.target.value }))
                            }
                            className="bg-slate-900 border-slate-700 text-white text-xs mt-1"
                          />
                        </div>
                      )}

                      {customization.signatureSource === "upload" && (
                        <div>
                          <Label className="text-xs text-slate-300">Upload Signature Image</Label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setCustomization((prev) => ({ ...prev, customSignatureUrl: reader.result as string }));
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="bg-slate-900 border-slate-700 text-white text-xs mt-1"
                          />
                        </div>
                      )}

                      {customization.customSignatureUrl && (
                        <div className="flex items-center gap-2 pt-2">
                          <img
                            src={customization.customSignatureUrl}
                            alt="Signature preview"
                            className="h-12 max-w-[200px] object-contain rounded border border-slate-600"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCustomization((prev) => ({ ...prev, customSignatureUrl: "" }))}
                            className="text-xs text-red-400 hover:text-red-300"
                          >
                            Clear
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Client acceptance counter-signature toggle */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">
                        Client Acceptance Signature Block
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Adds formal acceptance line for client confirmation
                      </span>
                    </div>
                    <Switch
                      checked={customization.showClientSignature}
                      onCheckedChange={(checked) =>
                        setCustomization((prev) => ({ ...prev, showClientSignature: checked }))
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Additional Section Toggles */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Additional Sections & Elements
              </span>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Bank & Remittance Details</span>
                  <Switch
                    checked={customization.showPaymentDetails}
                    onCheckedChange={(checked) =>
                      setCustomization((prev) => ({ ...prev, showPaymentDetails: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Terms & Conditions</span>
                  <Switch
                    checked={customization.showTerms}
                    onCheckedChange={(checked) =>
                      setCustomization((prev) => ({ ...prev, showTerms: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Special Notes</span>
                  <Switch
                    checked={customization.showNotes}
                    onCheckedChange={(checked) =>
                      setCustomization((prev) => ({ ...prev, showNotes: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">QR Code Electronic Verification</span>
                  <Switch
                    checked={customization.showQrCode}
                    onCheckedChange={(checked) =>
                      setCustomization((prev) => ({ ...prev, showQrCode: checked }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCustomizeDialog(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
