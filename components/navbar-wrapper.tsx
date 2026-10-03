"use client";

import { usePathname } from "next/navigation";
import { Navbar1 } from "@/components/navbar1";
import { Footer } from "@/components/footer";

export function NavbarWrapper() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return null;
  }

  return <Navbar1 />;
}

export function FooterWrapper() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return null;
  }

  return <Footer />;
}
