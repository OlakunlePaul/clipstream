"use client";

import { useEffect, useState } from "react";

export function TerminalDemo() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="bg-[#0a0b0c] border border-border rounded-lg p-4 font-mono text-xs sm:text-sm text-[#c0cad4] shadow-2xl overflow-hidden relative mt-8 lg:mt-0">
      <div className="flex gap-1.5 mb-4">
        <div className="w-2.5 h-2.5 rounded-full bg-red"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-amber"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-accent"></div>
      </div>
      
      {mounted ? (
        <div className="space-y-1.5 min-h-[140px]">
          <div className="opacity-0 animate-[fadeIn_0.3s_ease_forwards_0.5s]">
            <span className="text-[#3e4a54]">~/project</span> <span className="text-accent">$</span> echo "postgres://prod:5432/db" | cs copy
          </div>
          <div className="text-[#8aafc8] opacity-0 animate-[fadeIn_0.3s_ease_forwards_1.2s]">
            ✓ Copied [CONNECTION_STRING] to ClipStream (3 devices)
          </div>
          
          <div className="pt-2 opacity-0 animate-[fadeIn_0.3s_ease_forwards_2.0s]">
            <span className="text-[#3e4a54]">— 1.2 seconds later, on Android —</span>
          </div>
          <div className="text-[#8aafc8] opacity-0 animate-[fadeIn_0.3s_ease_forwards_2.8s]">
            📋 ClipStream · Connection string received from MacBook Pro
          </div>
          <div className="text-muted text-[11px] opacity-0 animate-[fadeIn_0.3s_ease_forwards_3.5s]">
            [Tap to copy]
          </div>
          
          <div className="pt-2 opacity-0 animate-[fadeIn_0.3s_ease_forwards_4.2s]">
            <span className="text-[#3e4a54]">~/project</span> <span className="text-accent">$</span> <span className="animate-pulse">_</span>
          </div>
        </div>
      ) : (
        <div className="min-h-[140px]"></div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
