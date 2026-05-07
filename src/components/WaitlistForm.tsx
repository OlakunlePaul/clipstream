"use client";

import { useState } from "react";

export function WaitlistForm({ variant = "default" }: { variant?: "default" | "hero" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "duplicate">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setEmail("");
      } else if (response.status === 409) {
        setStatus("duplicate");
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please check your connection.");
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 p-4 glass-card border-green-500/20 bg-green-500/5 animate-in fade-in zoom-in duration-300">
        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <p className="text-lg font-medium text-white">You&apos;re on the list!</p>
        <p className="text-sm text-text-secondary text-center">We&apos;ll notify you as soon as early access begins.</p>
        <button 
          onClick={() => setStatus("idle")}
          className="text-xs text-accent hover:underline mt-2"
        >
          Join with another email
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <label htmlFor={`email-${variant}`} className="sr-only">Email address</label>
          <input
            id={`email-${variant}`}
            type="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading"}
            className="w-full px-4 py-3 rounded-md bg-white/5 border border-white/10 text-white placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading" || !email}
          className="glow-btn whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "loading" ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Joining...
            </span>
          ) : "Join Waitlist"}
        </button>
      </form>
      
      {status === "duplicate" && (
        <p className="mt-3 text-sm text-accent-secondary animate-in slide-in-from-top-1 duration-200">
          You&apos;re already on the waitlist! We&apos;ll be in touch.
        </p>
      )}
      
      {status === "error" && (
        <p className="mt-3 text-sm text-red-400 animate-in slide-in-from-top-1 duration-200">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
