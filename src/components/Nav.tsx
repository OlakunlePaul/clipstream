"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const focusWaitlist = () => {
    const input = document.getElementById("hero-email");
    if (input) {
      input.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => input.focus(), 500);
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${scrolled ? "bg-bg2/90 backdrop-blur-md border-b border-border" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-mono text-accent font-semibold tracking-tight">clipstream/</Link>
        <div className="hidden md:flex items-center gap-6">
          <a href="#how-it-works" onClick={(e) => scrollToSection(e, "how-it-works")} className="text-sm font-medium text-muted hover:text-text transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm">How it works</a>
          <a href="#pricing" onClick={(e) => scrollToSection(e, "pricing")} className="text-sm font-medium text-muted hover:text-text transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm">Pricing</a>
          <Link href="/docs" className="text-sm font-medium text-muted hover:text-text transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm">Docs</Link>
          <a href="https://github.com/OlakunlePaul/clipstream" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-muted hover:text-text transition-colors flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm">
            GitHub <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </a>
        </div>
        <button onClick={focusWaitlist} className="hidden md:block px-4 py-2 bg-accent text-black font-semibold text-sm rounded-md transition-transform hover:-translate-y-[1px] hover:shadow-[0_0_15px_rgba(0,214,143,0.3)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-bg">
          Join waitlist
        </button>
      </div>
    </nav>
  );
}
