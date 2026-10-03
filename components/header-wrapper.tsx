"use client";

import { useState, useEffect } from "react";
import { Navbar1 } from "@/components/navbar1";

export function HeaderWrapper() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="relative">
      {/* Navbar - sticky when scrolled */}
      <div
        className={`transition-all duration-300 ${
          isScrolled ? "fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm shadow-md" : "relative"
        }`}
      >
        <Navbar1 />
      </div>
    </header>
  );
}
