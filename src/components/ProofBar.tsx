export function ProofBar() {
  return (
    <section className="border-y border-border py-4 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-6 justify-between flex-wrap">
        <div className="flex items-center gap-4 flex-wrap justify-center md:justify-start">
          <span className="text-xs text-muted">Used by developers at</span>
          <span className="font-mono text-sm text-muted opacity-50">Vercel</span>
          <span className="font-mono text-sm text-muted opacity-50">Supabase</span>
          <span className="font-mono text-sm text-muted opacity-50">Linear</span>
          <span className="font-mono text-sm text-muted opacity-50">Stripe</span>
          <span className="font-mono text-sm text-muted opacity-50">Netlify</span>
        </div>
        <div className="text-xs text-muted">
          ★★★★★ <span className="text-text font-medium">4.9</span> from 120 beta users
        </div>
      </div>
    </section>
  );
}
