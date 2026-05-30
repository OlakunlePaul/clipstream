"use client";

import { useState, useEffect } from "react";
import { TerminalDemo } from "./TerminalDemo";
import { Loader2 } from "lucide-react";

export function Hero() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [waitlistCount, setWaitlistCount] = useState<number | string>("847+");

  useEffect(() => {
    fetch("/api/waitlist?countOnly=true")
      .then(res => res.json())
      .then(data => { if (data.count) setWaitlistCount(data.count); })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to join waitlist");
      
      setStatus("success");
      setMessage("✓ You're on the list. We'll email you when ClipStream launches.");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  };

  return (
    <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
      <div className="flex-1 text-center lg:text-left w-full">
        <div className="inline-block border border-border2 text-muted font-mono text-[10px] sm:text-xs px-3 py-1 rounded-full mb-6 whitespace-nowrap">
          ↳ Early access · 200 lifetime spots at $59
        </div>
        <h1 className="font-mono text-4xl sm:text-5xl lg:text-[64px] font-semibold leading-[1.1] tracking-[-0.03em] mb-6">
          Stop emailing yourself<br />
          <span className="text-accent">API keys.</span>
        </h1>
        <p className="text-muted text-base sm:text-lg max-w-[520px] mx-auto lg:mx-0 mb-8 leading-relaxed">
          ClipStream syncs your clipboard across Mac, Linux, and Android — end-to-end encrypted, under 50ms on local network. Built for developers who don't live on one OS.
        </p>
        
        {status === "success" ? (
          <div className="bg-accent/10 border border-accent/20 text-accent px-4 py-3 rounded-md text-sm mb-4 inline-block text-left">
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-[440px] mx-auto lg:mx-0 mb-4">
            <input 
              id="hero-email"
              type="email" 
              required
              aria-label="Email address"
              placeholder="your@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-bg3 border border-border2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md px-4 py-3 text-sm text-text transition-colors"
            />
            <button 
              type="submit" 
              disabled={status === "loading"}
              className="bg-accent text-black font-semibold px-6 py-3 rounded-md text-sm whitespace-nowrap transition-transform hover:-translate-y-[1px] disabled:opacity-70 disabled:hover:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-bg flex items-center justify-center gap-2"
            >
              {status === "loading" ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Joining...</>
              ) : (
                "Join waitlist →"
              )}
            </button>
          </form>
        )}
        
        {status === "error" && <p className="text-red text-xs mb-4 text-left max-w-[440px] mx-auto lg:mx-0">{message}</p>}
        
        <div className="text-muted text-xs">
          <span className="text-text font-semibold">{waitlistCount}</span> developers on the waitlist · No spam, ever.
        </div>
      </div>
      
      <div className="flex-1 w-full max-w-[500px]">
        <TerminalDemo />
      </div>
    </section>
  );
}
