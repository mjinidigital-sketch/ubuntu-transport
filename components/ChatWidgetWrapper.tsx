"use client";

import { usePathname } from "next/navigation";
import { FloatingChatWidget } from "@/components/FloatingChatWidget";

export function ChatWidgetWrapper() {
  const pathname = usePathname();

  // Don't show widget on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return <FloatingChatWidget />;
}
