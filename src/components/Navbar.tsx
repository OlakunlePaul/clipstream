"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4 ${
        isScrolled ? "bg-bg-base/80 backdrop-blur-md border-b border-white/5 py-3" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-lg shadow-glow-sm">C</div>
          <span className="text-xl font-bold text-white tracking-tighter">ClipStream</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
          <a href="#problems" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
          <a href="#waitlist" className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all">
            Join Waitlist
          </a>
        </div>
      </div>
    </motion.nav>
  );
}
