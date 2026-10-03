import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["html2pdf.js", "html2canvas", "jspdf"],

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "outstanding-seahorse-956.eu-west-1.convex.cloud",
      },
    ],
  },
};

export default nextConfig;
