"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function ProblemSection() {
  const painPoints = [
    {
      title: "Switching devices is a hassle",
      description: "Stop emailing yourself links or using 'Saved Messages' just to move a snippet of text from your phone to your laptop.",
    },
    {
      title: "Context switching kills focus",
      description: "Every time you break your workflow to manually transfer data, you lose momentum. It should just be there.",
    },
    {
      title: "Platform lock-in restricts you",
      description: "Apple Universal Clipboard is great—until you need to paste to Windows or Android. ClipStream works everywhere, seamlessly.",
    }
  ];

  return (
    <section id="problems" className="py-32 px-6 bg-bg-surface relative overflow-hidden">
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="space-y-10"
          >
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                The old way is broken.
              </h2>
              <p className="text-lg text-text-secondary leading-relaxed">
                Moving text between devices shouldn&apos;t feel like a chore. We&apos;ve all been there, and it&apos;s time for a better, universal solution.
              </p>
            </div>

            <div className="space-y-8 pt-4">
              {painPoints.map((point, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="flex gap-4"
                >
                  <div className="shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30 text-accent">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{point.title}</h3>
                    <p className="text-text-secondary leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative lg:h-[600px] flex items-center justify-center rounded-2xl bg-bg-elevated/30 border border-white/5 p-8 overflow-hidden glass-card"
          >
            {/* Background glow for the image */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-accent/20 blur-[80px] -z-10 rounded-full" />
            
            <Image 
              src="/cross-device.png" 
              alt="Seamless Cross-Device Sync" 
              width={600} 
              height={600} 
              className="object-contain drop-shadow-2xl z-10"
            />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
