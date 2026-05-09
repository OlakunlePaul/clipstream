"use client";

import { motion } from "framer-motion";
import { FaApple, FaAndroid, FaWindows, FaLinux } from "react-icons/fa";
import { WaitlistForm } from "./WaitlistForm";

export function WaitlistSection() {
  return (
    <section id="waitlist" className="py-32 px-6">
      <div className="w-full max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="glass-card p-12 md:p-24 text-center space-y-10 relative overflow-hidden border-accent/20 bg-accent/5 rounded-3xl"
        >
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-accent/10 blur-[120px] -z-10 rounded-full" />
          
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight text-balance">
              Ready to bridge your devices?
            </h2>
            <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto text-balance">
              Join the waitlist today and be the first to experience the future of clipboard synchronization.
            </p>
          </div>
          
          <div className="pt-6">
            <WaitlistForm />
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
            className="pt-12 flex flex-col items-center justify-center space-y-6"
          >
            <p className="text-sm text-text-muted uppercase tracking-widest font-semibold">Available Soon On</p>
            <div className="flex items-center gap-8 text-3xl text-text-muted opacity-70 hover:opacity-100 transition-opacity duration-500">
              <FaApple className="hover:text-white transition-colors" />
              <FaAndroid className="hover:text-green-500 transition-colors" />
              <FaWindows className="hover:text-blue-400 transition-colors" />
              <FaLinux className="hover:text-yellow-500 transition-colors" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
