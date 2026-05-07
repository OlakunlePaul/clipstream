export function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-white/5 bg-bg-base">
      <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="space-y-4 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-lg">C</div>
            <span className="text-xl font-bold text-white tracking-tighter">ClipStream</span>
          </div>
          <p className="text-sm text-text-muted max-w-xs">
            The bridge for your clipboard. Secure, fast, and universal.
          </p>
        </div>
        
        <div className="flex gap-8 text-sm text-text-secondary">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="mailto:hello@clipstream.io" className="hover:text-white transition-colors">Contact</a>
          <a href="https://twitter.com/clipstream" className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">Twitter</a>
        </div>
        
        <div className="text-sm text-text-muted">
          © {new Date().getFullYear()} ClipStream. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
