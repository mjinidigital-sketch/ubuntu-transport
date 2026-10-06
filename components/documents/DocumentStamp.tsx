"use client";

import React from "react";
import { StampType } from "./document-types";

interface DocumentStampProps {
  type: StampType;
  customStampUrl?: string;
  stampSource?: "organization" | "url" | "upload";
  organizationStampUrl?: string;
  companyName?: string;
  date?: string | number;
  referenceNumber?: string;
  color?: string;
  className?: string;
  useLogoAsWatermark?: boolean;
  logoUrl?: string;
}

export function DocumentStamp({
  type,
  customStampUrl,
  stampSource = "url",
  organizationStampUrl,
  companyName = "COMPANY SEAL",
  date,
  referenceNumber,
  color,
  className = "",
  useLogoAsWatermark = false,
  logoUrl,
}: DocumentStampProps) {
  const stampImageUrl = stampSource === "organization" ? organizationStampUrl : customStampUrl;

  if (type === "custom" && stampImageUrl) {
    return (
      <div className={`relative inline-block transform -rotate-6 select-none ${className}`}>
        {useLogoAsWatermark && logoUrl && (
          <img
            src={logoUrl}
            alt="Watermark"
            className="absolute inset-0 w-24 h-24 object-contain opacity-20 mx-auto"
            crossOrigin="anonymous"
          />
        )}
        <img
          src={stampImageUrl}
          alt="Official Stamp"
          className="w-32 h-32 object-contain opacity-90 drop-shadow-sm filter contrast-125"
          crossOrigin="anonymous"
        />
      </div>
    );
  }

  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  const upperCompany = (companyName || "OFFICIAL SEAL").toUpperCase().slice(0, 24);

  // PAID STAMP (Emerald Green / Crimson / Custom)
  if (type === "paid") {
    const stampColor = color || "#059669"; // emerald-600
    return (
      <div
        className={`relative inline-flex flex-col items-center justify-center p-2 rounded-xl transform -rotate-12 select-none border-4 border-dashed tracking-wider ${className}`}
        style={{
          borderColor: stampColor,
          color: stampColor,
          width: "150px",
          height: "85px",
          backgroundColor: `${stampColor}0a`,
          boxShadow: `0 0 0 2px ${stampColor}33 inset`,
        }}
      >
        <div className="absolute inset-0 rounded-lg border-2 border-solid opacity-60 pointer-events-none" style={{ borderColor: stampColor }} />
        <span className="text-[10px] font-black uppercase tracking-widest leading-none">★ VERIFIED ★</span>
        <span className="text-2xl font-black uppercase tracking-tight my-0.5 leading-none">PAID IN FULL</span>
        <span className="text-[10px] font-bold tracking-normal opacity-90 leading-none mt-1 font-mono text-red-600">{formattedDate}</span>
        {referenceNumber && (
          <span className="text-[8px] font-mono opacity-80 mt-0.5 uppercase tracking-tighter">REF: {referenceNumber}</span>
        )}
      </div>
    );
  }

  // PAYMENT RECEIVED STAMP (For receipts)
  if (type === "received") {
    const stampColor = color || "#0284c7"; // sky-600
    return (
      <div
        className={`relative inline-flex flex-col items-center justify-center p-2 rounded-xl transform -rotate-6 select-none border-4 border-dashed tracking-wider ${className}`}
        style={{
          borderColor: stampColor,
          color: stampColor,
          width: "155px",
          height: "88px",
          backgroundColor: `${stampColor}0a`,
          boxShadow: `0 0 0 2px ${stampColor}33 inset`,
        }}
      >
        <div className="absolute inset-0 rounded-lg border-2 border-solid opacity-60 pointer-events-none" style={{ borderColor: stampColor }} />
        <span className="text-[9px] font-black uppercase tracking-widest leading-none">ACCOUNTS DEPT</span>
        <span className="text-xl font-black uppercase tracking-tight my-0.5 leading-none">RECEIVED</span>
        <span className="text-[10px] font-bold tracking-normal opacity-90 leading-none mt-1 font-mono text-red-600">{formattedDate}</span>
        {referenceNumber && (
          <span className="text-[8px] font-mono opacity-80 mt-0.5 uppercase tracking-tighter">TRANS ID: {referenceNumber}</span>
        )}
      </div>
    );
  }

  // APPROVED / AUTHORIZED STAMP
  if (type === "approved" || type === "authorized") {
    const stampColor = color || "#1e40af"; // blue-800
    const text = type === "approved" ? "APPROVED" : "AUTHORIZED";
    return (
      <div
        className={`relative inline-flex flex-col items-center justify-center p-2 rounded-lg transform -rotate-8 select-none border-4 border-double tracking-wider ${className}`}
        style={{
          borderColor: stampColor,
          color: stampColor,
          width: "155px",
          height: "85px",
          backgroundColor: `${stampColor}0a`,
        }}
      >
        <span className="text-[9px] font-black uppercase tracking-widest leading-none">EXECUTIVE BOARD</span>
        <span className="text-2xl font-black uppercase tracking-tight my-0.5 leading-none">{text}</span>
        <span className="text-[9px] font-bold tracking-normal opacity-90 leading-none mt-1">FOR PAYMENT & RELEASE</span>
        <span className="text-[8px] font-mono opacity-80 mt-0.5">{formattedDate}</span>
      </div>
    );
  }

  // OFFICIAL QUOTATION STAMP
  if (type === "quotation") {
    const stampColor = color || "#d97706"; // amber-600
    return (
      <div
        className={`relative inline-flex flex-col items-center justify-center p-2 rounded-lg transform -rotate-6 select-none border-4 border-dashed tracking-wider ${className}`}
        style={{
          borderColor: stampColor,
          color: stampColor,
          width: "155px",
          height: "85px",
          backgroundColor: `${stampColor}0a`,
        }}
      >
        <span className="text-[9px] font-black uppercase tracking-widest leading-none">OFFICIAL ESTIMATE</span>
        <span className="text-xl font-black uppercase tracking-tight my-0.5 leading-none">QUOTATION</span>
        <span className="text-[9px] font-bold tracking-normal opacity-90 leading-none mt-1">VALID & CERTIFIED</span>
        <span className="text-[8px] font-mono opacity-80 mt-0.5">{formattedDate}</span>
      </div>
    );
  }

  // OFFICIAL CIRCULAR CORPORATE SEAL (Canvas/html2canvas 100% compatible - no textPath)
  const sealColor = color || "#1e3a8a"; // navy blue
  return (
    <div className={`relative inline-block select-none transform rotate-3 ${className}`}>
      <svg
        width="130"
        height="130"
        viewBox="0 0 160 160"
        className="drop-shadow-sm opacity-90"
        style={{ color: sealColor }}
      >
        {/* Outer notched concentric rings */}
        <circle cx="80" cy="80" r="76" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="5 2.5" />
        <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="80" cy="80" r="54" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 1.5" />
        <circle cx="80" cy="80" r="50" fill="none" stroke="currentColor" strokeWidth="1" />

        {/* Company Name Header Top */}
        <text
          x="80"
          y="35"
          fill="currentColor"
          fontSize="8"
          fontWeight="900"
          letterSpacing="1.5"
          textAnchor="middle"
        >
          ★ {upperCompany} ★
        </text>

        {/* Horizontal Center Banner Bar */}
        <rect x="24" y="66" width="112" height="28" rx="4" fill="currentColor" opacity="0.12" />
        <line x1="24" y1="66" x2="136" y2="66" stroke="currentColor" strokeWidth="1.5" />
        <line x1="24" y1="94" x2="136" y2="94" stroke="currentColor" strokeWidth="1.5" />

        <text
          x="80"
          y="83"
          fill="currentColor"
          fontSize="11"
          fontWeight="900"
          letterSpacing="1.5"
          textAnchor="middle"
        >
          OFFICIAL SEAL
        </text>

        {/* Subtitle inside seal */}
        <text
          x="80"
          y="56"
          fill="currentColor"
          fontSize="7"
          fontWeight="800"
          letterSpacing="1"
          textAnchor="middle"
        >
          CORPORATE VERIFIED
        </text>

        {/* Date and Security Bottom */}
        <text
          x="80"
          y="108"
          fill="#dc2626"
          fontSize="8"
          fontWeight="700"
          letterSpacing="0.5"
          textAnchor="middle"
          fontFamily="monospace"
        >
          {formattedDate}
        </text>

        <text
          x="80"
          y="126"
          fill="currentColor"
          fontSize="7.5"
          fontWeight="800"
          letterSpacing="1.5"
          textAnchor="middle"
        >
          ★ REGISTERED & SECURED ★
        </text>
      </svg>
    </div>
  );
}
