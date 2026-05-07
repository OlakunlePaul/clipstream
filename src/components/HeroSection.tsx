"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { WaitlistForm } from "./WaitlistForm";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-32 px-6 overflow-hidden">
      {/* Mesh Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-accent/20 blur-[120px] animate-pulse duration-[10s]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-accent-secondary/15 blur-[100px] animate-pulse duration-[8s]" />
        
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.03]"
             style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />
      </div>

      <div className="w-full max-w-7xl mx-auto z-10">
        <div className="flex flex-col items-center pt-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center space-y-8 max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-accent-secondary mx-auto mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              Early Access Open
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1] text-balance">
              Copy anywhere. <br />
              <span className="bg-linear-to-r from-accent to-accent-secondary bg-clip-text text-transparent">
                Paste everywhere.
              </span> <br />
              Instantly.
            </h1>
            
            <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed text-balance">
              Secure, end-to-end encrypted cross-device clipboard sync. Bridge your phone, tablet, and computer with a seamless bridge.
            </p>

            <div className="pt-6 max-w-md mx-auto w-full">
              <WaitlistForm variant="hero" />
              <p className="mt-4 text-xs text-text-muted">
                Join 2,000+ people waiting for the bridge. Free during beta.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="relative mt-20 w-full max-w-3xl mx-auto"
          >
            <div className="relative z-10 flex justify-center">
              <Image 
                src="/hero-iphone-solid.png" 
                alt="ClipStream iPhone Preview" 
                width={800} 
                height={1000} 
                className="drop-shadow-[0_20px_100px_rgba(37,99,235,0.4)] object-contain w-full h-auto max-h-[600px]"
                priority
              />
            </div>
            {/* Background decorative elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-accent/15 blur-[120px] -z-10 rounded-full opacity-60" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
