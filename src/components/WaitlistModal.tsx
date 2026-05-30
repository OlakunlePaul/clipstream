"use client";

import { useState, useEffect, useRef } from "react";
import { X, Loader2, CheckCircle2 } from "lucide-react";

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: "free" | "pro" | "lifetime" | null;
}

export function WaitlistModal({ isOpen, onClose, tier }: WaitlistModalProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [spotsLeft, setSpotsLeft] = useState<number>(47);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Esc key closes modal & handle focus trapping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent background scroll
      setTimeout(() => inputRef.current?.focus(), 100);
      
      // Fetch dynamic spots left for lifetime waitlist
      if (tier === "lifetime") {
        fetch("/api/waitlist?countOnly=true")
          .then(res => res.json())
          .then(data => { if (data.count) setSpotsLeft(200 - (data.count % 200)); })
          .catch(() => {});
      }
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = ""; // Re-enable scroll
    };
  }, [isOpen, onClose, tier]);

  if (!isOpen || !tier) return null;

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: `pricing_${tier}` }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Failed to connect to the server.");
    }
  };

  // Dynamic Tier-specific Text Configuration
  const tierConfigs = {
    free: {
      tag: "// free tier waitlist",
      title: "Join the Developer Free list.",
      desc: "Get access to fast local syncing, 50 clips per day, and full CLI & VS Code extension support. Absolutely zero ads, bloatware, or privacy tracking.",
      buttonText: "Join Free Waitlist",
    },
    pro: {
      tag: "// pro tier waitlist",
      title: "Secure ClipStream Pro Access.",
      desc: "Get unlimited syncs, 10 devices, searchable 90-day history, under 50ms peer-to-peer network sync, and images/formatted text sync. No credit card required to secure your spot.",
      buttonText: "Request Pro Invitation",
    },
    lifetime: {
      tag: "// lifetime founding access waitlist",
      title: "Claim Founding Member Waitlist.",
      desc: "Get all Pro features permanently with a single, one-off payment of $59 at launch. All future updates included forever, plus a founding developer badge in Discord.",
      buttonText: "Reserve Lifetime Spot",
    },
  };

  const config = tierConfigs[tier];

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/85 backdrop-blur-md transition-opacity duration-300"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="w-full max-w-lg bg-bg2 border border-border rounded-xl p-8 relative shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-1 rounded-md text-muted hover:text-text hover:bg-bg3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Section */}
        <div className="mb-6">
          <div className="font-mono text-xs text-accent mb-2">{config.tag}</div>
          <h3 id="modal-title" className="text-xl md:text-2xl font-semibold tracking-[-0.02em] text-text mb-3">
            {config.title}
          </h3>
          <p className="text-sm text-muted leading-relaxed">
            {config.desc}
          </p>
          
          {tier === "lifetime" && (
            <div className="mt-3 text-xs text-red font-mono font-semibold animate-pulse">
              ⚡ {spotsLeft} early access spots remaining
            </div>
          )}
        </div>

        {/* Form / States */}
        {status === "success" ? (
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-5 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-accent text-sm mb-1">Reservation Confirmed!</h4>
              <p className="text-xs text-muted leading-relaxed">
                You're in. We've logged your preferred plan intent ({tier.toUpperCase()}) and will prioritize your invitation when the launch doors open. Follow along on <a href="https://github.com/OlakunlePaul/clipstream" target="_blank" className="text-text hover:underline">GitHub</a>!
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-1.5 border border-accent text-accent hover:bg-accent/10 font-semibold text-xs rounded-md transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="modal-email" className="sr-only">Email address</label>
              <input
                ref={inputRef}
                id="modal-email"
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-bg3 border border-border2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md px-4 py-3 text-sm text-text transition-colors"
              />
            </div>

            {status === "error" && (
              <p role="alert" className="text-xs text-red font-medium">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-accent text-black font-semibold py-3 rounded-md text-sm transition-transform hover:-translate-y-[1px] disabled:opacity-70 disabled:hover:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-bg flex items-center justify-center gap-2"
            >
              {status === "loading" ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Reserving spot...</>
              ) : (
                config.buttonText
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
