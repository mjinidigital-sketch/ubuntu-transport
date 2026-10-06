"use client";

import React from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";

interface DocumentSignatureProps {
  signatoryName: string;
  signatoryTitle: string;
  signatureType?: "cursive" | "custom";
  customSignatureUrl?: string;
  signatureSource?: "organization" | "url" | "upload";
  organizationSignatureUrl?: string;
  date?: string | number;
  showClientSignature?: boolean;
  clientName?: string;
  clientCompanyName?: string;
  primaryColor?: string;
}

export function DocumentSignature({
  signatoryName,
  signatoryTitle,
  signatureType = "cursive",
  customSignatureUrl,
  signatureSource = "url",
  organizationSignatureUrl,
  date,
  showClientSignature = false,
  clientName = "Client Representative",
  clientCompanyName,
  primaryColor = "#0f172a",
}: DocumentSignatureProps) {
  const signatureImageUrl = signatureSource === "organization" ? organizationSignatureUrl : customSignatureUrl;

  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="w-full">
      <div className={`grid ${showClientSignature ? "grid-cols-2 gap-10" : "grid-cols-1 md:w-72 ml-auto"} items-end`}>
        {/* Client Acceptance Block (if applicable) */}
        {showClientSignature && (
          <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/60">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Client Acceptance & Confirmation</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug mb-6">
              I hereby approve and accept the terms, scope, and pricing detailed within this document.
            </p>

            {/* Signature line */}
            <div className="border-b-2 border-dashed border-slate-300 h-12 flex items-end pb-1 mb-2">
              <span className="text-[10px] text-slate-400 font-mono tracking-wider italic">
                Sign above line / Affix Company Stamp
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-700">
                <span className="text-slate-500 font-medium">Authorized Name:</span>
                <span className="font-semibold">{clientName}</span>
              </div>
              {clientCompanyName && (
                <div className="flex justify-between text-slate-700">
                  <span className="text-slate-500 font-medium">Organization:</span>
                  <span className="font-medium text-slate-800">{clientCompanyName}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-700">
                <span className="text-slate-500 font-medium">Date:</span>
                <span className="text-slate-400">____ / ____ / 202___</span>
              </div>
            </div>
          </div>
        )}

        {/* Primary Authorized Signatory Block */}
        <div className="flex flex-col items-end text-right">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Authorized Signatory
          </span>

          {/* Signature Rendering Area */}
          <div className="h-16 w-52 flex items-center justify-end relative overflow-hidden my-1">
            {signatureType === "custom" && signatureImageUrl ? (
              <img
                src={signatureImageUrl}
                alt="Authorized Signature"
                className="max-h-16 max-w-full object-contain filter contrast-125"
                crossOrigin="anonymous"
              />
            ) : (
              /* Realistic Ink Calligraphy Vector Signature */
              <svg
                viewBox="0 0 240 70"
                className="w-52 h-16 text-slate-900 drop-shadow-sm"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 48 C 30 20, 42 12, 55 35 C 68 58, 62 18, 85 24 C 108 30, 95 62, 118 40 C 135 24, 142 38, 155 32 C 168 26, 175 48, 192 36 C 205 28, 218 34, 230 28"
                  stroke="#1e3a8a"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M28 55 C 65 52, 130 50, 215 47"
                  stroke="#1e3a8a"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeDasharray="160"
                  strokeDashoffset="10"
                />
                <path
                  d="M48 22 C 45 42, 52 62, 50 68"
                  stroke="#1e3a8a"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <path
                  d="M125 15 C 138 25, 145 45, 138 52"
                  stroke="#1e3a8a"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>

          {/* Underline separator */}
          <div className="w-52 border-b-2 border-slate-900 mb-2" />
        </div>
      </div>
    </div>
  );
}
