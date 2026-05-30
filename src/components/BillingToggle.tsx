"use client";

export function BillingToggle({ isAnnual, setIsAnnual }: { isAnnual: boolean; setIsAnnual: (val: boolean) => void }) {
  return (
    <div className="flex justify-center items-center gap-2 mb-10">
      <button 
        onClick={() => setIsAnnual(false)}
        className={`text-xs px-3 py-1.5 rounded-full transition-colors ${!isAnnual ? "bg-bg3 text-text border border-border" : "text-muted hover:text-text border border-transparent"} focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg`}
      >
        Monthly
      </button>
      <button 
        onClick={() => setIsAnnual(true)}
        className={`text-xs px-3 py-1.5 rounded-full transition-colors ${isAnnual ? "bg-accent/10 text-accent border border-accent/20" : "text-muted hover:text-text border border-transparent"} focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg`}
      >
        Annual · save 33%
      </button>
    </div>
  );
}
