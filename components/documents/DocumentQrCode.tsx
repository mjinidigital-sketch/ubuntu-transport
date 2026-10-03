"use client";

import React from "react";
import { QrCode } from "lucide-react";

interface DocumentQrCodeProps {
  documentNumber: string;
  documentType: string;
  date?: string | number;
  total?: string | number;
  issuer?: string;
  size?: number;
  className?: string;
}

export function DocumentQrCode({
  documentNumber,
  documentType,
  date,
  total,
  issuer = "Corporate Verification",
  size = 76,
  className = "",
}: DocumentQrCodeProps) {
  return (
    <div className={`flex items-center gap-3 p-2 rounded-lg border border-slate-200 bg-white shadow-2xs select-none ${className}`}>
      {/* High-contrast stylized QR Code SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="text-slate-900 shrink-0"
        fill="currentColor"
      >
        {/* Top-Left Finder */}
        <rect x="5" y="5" width="28" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="5" />
        <rect x="12" y="12" width="14" height="14" rx="2" fill="currentColor" />

        {/* Top-Right Finder */}
        <rect x="67" y="5" width="28" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="5" />
        <rect x="74" y="12" width="14" height="14" rx="2" fill="currentColor" />

        {/* Bottom-Left Finder */}
        <rect x="5" y="67" width="28" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="5" />
        <rect x="12" y="74" width="14" height="14" rx="2" fill="currentColor" />

        {/* Dynamic Matrix Simulation Data Dots */}
        <rect x="38" y="8" width="5" height="5" />
        <rect x="48" y="8" width="5" height="5" />
        <rect x="58" y="8" width="5" height="5" />

        <rect x="38" y="18" width="5" height="5" />
        <rect x="52" y="18" width="8" height="5" />

        <rect x="42" y="28" width="6" height="6" />
        <rect x="54" y="28" width="6" height="6" />

        {/* Center matrix */}
        <rect x="8" y="38" width="5" height="5" />
        <rect x="18" y="42" width="8" height="5" />
        <rect x="28" y="38" width="5" height="8" />
        <rect x="38" y="38" width="10" height="10" />
        <rect x="52" y="42" width="8" height="8" />
        <rect x="64" y="38" width="6" height="6" />
        <rect x="76" y="42" width="8" height="6" />
        <rect x="88" y="38" width="6" height="6" />

        {/* Bottom matrix */}
        <rect x="38" y="52" width="8" height="6" />
        <rect x="52" y="56" width="6" height="6" />
        <rect x="64" y="52" width="8" height="8" />
        <rect x="78" y="54" width="8" height="6" />
        <rect x="90" y="52" width="5" height="8" />

        <rect x="38" y="68" width="6" height="6" />
        <rect x="48" y="64" width="8" height="6" />
        <rect x="60" y="68" width="8" height="6" />
        <rect x="74" y="68" width="8" height="8" />
        <rect x="88" y="68" width="6" height="6" />

        <rect x="38" y="82" width="8" height="6" />
        <rect x="52" y="82" width="8" height="8" />
        <rect x="66" y="82" width="8" height="6" />
        <rect x="78" y="84" width="6" height="8" />
        <rect x="88" y="80" width="6" height="10" />
      </svg>

      <div className="flex flex-col justify-center">
        <span className="text-[10px] font-black uppercase text-slate-900 tracking-wider flex items-center gap-1">
          <QrCode className="w-3 h-3 text-blue-600" />
          <span>E-Verification</span>
        </span>
        <span className="text-[10px] font-mono text-slate-700 font-bold mt-0.5">
          {documentNumber}
        </span>
        <span className="text-[9px] text-slate-500 leading-tight mt-0.5">
          Scan to verify electronic authenticity & validity.
        </span>
      </div>
    </div>
  );
}
