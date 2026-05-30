"use client";

import { useState, useEffect } from "react";
import { BillingToggle } from "./BillingToggle";
import { WaitlistModal } from "./WaitlistModal";

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [spotsLeft, setSpotsLeft] = useState<number | string>("47");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<"free" | "pro" | "lifetime" | null>(null);

  const openWaitlist = (tier: "free" | "pro" | "lifetime") => {
    setSelectedTier(tier);
    setModalOpen(true);
  };

  useEffect(() => {
    fetch("/api/waitlist?countOnly=true")
      .then(res => res.json())
      .then(data => { if (data.count) setSpotsLeft(200 - (data.count % 200)); }) // Fake scarcity logic based on waitlist count
      .catch(() => {});
  }, []);

  return (
    <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto border-t border-border">
      <div className="text-center mb-10">
        <div className="font-mono text-xs text-accent mb-4">// pricing</div>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] mb-4">
          Transparent pricing.<br />No "contact sales."
        </h2>
        <p className="text-muted text-sm md:text-base max-w-[560px] mx-auto leading-relaxed">
          Pay for what you use. Upgrade or cancel any time. We'll never hide limits in the fine print.
        </p>
      </div>

      <BillingToggle isAnnual={isAnnual} setIsAnnual={setIsAnnual} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Free Tier */}
        <div className="bg-bg3 border border-border rounded-xl p-8 flex flex-col transition-transform duration-200 hover:-translate-y-1">
          <div className="font-mono text-[10px] text-muted tracking-[0.08em] uppercase mb-6">Free</div>
          <div className="text-4xl font-bold tracking-[-0.02em] text-text mb-8">$0</div>
          
          <div className="flex-1">
            <div className="text-sm text-text py-2 border-b border-border">50 syncs / day</div>
            <div className="text-sm text-text py-2 border-b border-border">3 devices</div>
            <div className="text-sm text-text py-2 border-b border-border">7-day history</div>
            <div className="text-sm text-text py-2 border-b border-border">CLI & VS Code extension</div>
            <div className="text-sm text-muted py-2">Text & code only (no images)</div>
          </div>
          
          <button 
            onClick={() => openWaitlist("free")}
            className="w-full mt-8 py-2.5 border border-border2 text-text rounded-md text-sm font-medium transition-colors hover:border-text hover:bg-bg2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Get started free
          </button>
        </div>

        {/* Pro Tier */}
        <div className="bg-bg3 border border-accent rounded-xl p-8 flex flex-col relative transition-transform duration-200 hover:-translate-y-1 shadow-[0_0_30px_rgba(0,214,143,0.05)]">
          <div className="bg-accent text-black font-semibold text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-[3px] self-start mb-4">
            MOST POPULAR
          </div>
          <div className="font-mono text-[10px] text-muted tracking-[0.08em] uppercase mb-2">Pro</div>
          
          <div className="flex items-baseline gap-1 mb-2 relative h-[48px] overflow-hidden">
            <div className={`text-4xl font-bold tracking-[-0.02em] text-text absolute transition-all duration-300 ${isAnnual ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full"}`}>
              $6<span className="text-sm font-normal text-muted">/mo</span>
            </div>
            <div className={`text-4xl font-bold tracking-[-0.02em] text-text absolute transition-all duration-300 ${!isAnnual ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"}`}>
              $9<span className="text-sm font-normal text-muted">/mo</span>
            </div>
          </div>
          
          <div className="text-[10px] text-muted mb-6 h-[15px] transition-opacity duration-300">
            {isAnnual ? "billed $72/year" : "billed $9/month"}
          </div>
          
          <div className="flex-1">
            <div className="text-sm text-text py-2 border-b border-border">Unlimited syncs</div>
            <div className="text-sm text-text py-2 border-b border-border">10 devices</div>
            <div className="text-sm text-text py-2 border-b border-border">90-day history, searchable</div>
            <div className="text-sm text-text py-2 border-b border-border">Local network sync (&lt;50ms)</div>
            <div className="text-sm text-text py-2 border-b border-border">CLI + VS Code extension</div>
            <div className="text-sm text-text py-2 border-b border-border">Images + formatted text</div>
            <div className="text-sm text-text py-2">Priority support</div>
          </div>
          
          <button 
            onClick={() => openWaitlist("pro")}
            className="w-full mt-8 py-2.5 bg-accent text-black rounded-md text-sm font-semibold transition-transform hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            {isAnnual ? "Get Pro — $72/year" : "Get Pro — $9/month"}
          </button>
        </div>

        {/* Lifetime Tier */}
        <div className="bg-bg3 border border-border2 rounded-xl p-8 flex flex-col transition-transform duration-200 hover:-translate-y-1">
          <div className="font-mono text-[10px] text-muted tracking-[0.08em] uppercase mb-6">Lifetime · Early access</div>
          
          <div className="text-4xl font-bold tracking-[-0.02em] text-text mb-2">
            $59<span className="text-sm font-normal text-muted"> once</span>
          </div>
          
          <div className="text-[10px] text-red mb-6 flex items-center gap-1">
            <span className="animate-pulse">⚡</span> {spotsLeft} of 200 spots left
          </div>
          
          <div className="flex-1">
            <div className="text-sm text-text py-2 border-b border-border">Everything in Pro</div>
            <div className="text-sm text-text py-2 border-b border-border">All future updates included</div>
            <div className="text-sm text-text py-2 border-b border-border">Founding user badge in Discord</div>
            <div className="text-sm text-text py-2 border-b border-border">Direct access to the roadmap</div>
            <div className="text-sm text-text py-2">Price locks forever</div>
          </div>
          
          <button 
            onClick={() => openWaitlist("lifetime")}
            className="w-full mt-8 py-2.5 border border-accent text-accent rounded-md text-sm font-semibold transition-colors hover:bg-accent/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Claim lifetime access
          </button>
        </div>
      </div>
      
      {/* FAQ */}
      <div className="mt-24 max-w-2xl mx-auto">
        <p className="text-center text-sm text-muted mb-8">
          Questions? Read the FAQ or email <a href="mailto:founders@clipstream.dev" className="text-text hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm">founders@clipstream.dev</a><br />
          We reply within 24 hours. No sales team — just the people who built it.
        </p>
        
        <div className="space-y-4">
          <FAQItem 
            q="Is the encryption really zero-knowledge?" 
            a="Yes. Your private keys are generated locally and never leave your device. We can't read your clipboard even if we wanted to. The shared-crypto package is open source — you can verify this yourself." 
          />
          <FAQItem 
            q="What happens when devices aren't on the same network?" 
            a="ClipStream falls back to our encrypted cloud relay automatically. Still end-to-end encrypted. Typically 100–300ms depending on location." 
          />
          <FAQItem 
            q="Does it work on Linux?" 
            a="Yes — the CLI works on any Linux distro. Chrome extension on any Chromium browser. Linux desktop app (Electron) is coming in Phase 2." 
          />
          <FAQItem 
            q="Can I self-host it?" 
            a="Not yet. On the roadmap for Enterprise. The encryption architecture is designed for it." 
          />
        </div>
      </div>
      
      <WaitlistModal isOpen={modalOpen} onClose={() => setModalOpen(false)} tier={selectedTier} />
    </section>
  );
}

function FAQItem({ q, a }: { q: string, a: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border border-border rounded-lg bg-bg2 overflow-hidden transition-colors hover:border-border2">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-medium text-text">{q}</span>
        <svg className={`w-4 h-4 text-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div 
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? "200px" : "0", opacity: isOpen ? 1 : 0 }}
      >
        <div className="p-4 pt-0 text-sm text-muted leading-relaxed">
          {a}
        </div>
      </div>
    </div>
  );
}
