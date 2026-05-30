"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export function FooterCTA() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

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
    <section className="py-32 px-6 bg-bg2 border-t border-border">
      <div className="max-w-3xl mx-auto text-center">
        <div className="font-mono text-xs text-accent mb-4">// get early access</div>
        <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.02em] mb-4 text-text">
          Your clipboard. Every device.<br />Zero trust.
        </h2>
        <p className="text-muted text-sm md:text-lg mb-10 leading-relaxed">
          Join 847 developers who are done with the workarounds.
        </p>

        {status === "success" ? (
          <div className="bg-accent/10 border border-accent/20 text-accent px-4 py-3 rounded-md text-sm mb-4 inline-block">
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-[440px] mx-auto mb-4">
            <input 
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
        
        {status === "error" && <p className="text-red text-xs mb-4">{message}</p>}

        <div className="text-xs text-muted">
          No credit card. No spam. Unsubscribe any time.
        </div>
      </div>
    </section>
  );
}
