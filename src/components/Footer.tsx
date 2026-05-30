import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-border bg-bg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-6 flex-wrap justify-center md:justify-start">
          <Link href="/docs" className="text-sm font-medium text-muted hover:text-text transition-colors">Docs</Link>
          <a href="https://github.com/OlakunlePaul/clipstream" className="text-sm font-medium text-muted hover:text-text transition-colors">GitHub</a>
          <Link href="/privacy" className="text-sm font-medium text-muted hover:text-text transition-colors">Privacy</Link>
          <Link href="/security" className="text-sm font-medium text-muted hover:text-text transition-colors">Security</Link>
          <a href="#" className="text-sm font-medium text-muted hover:text-text transition-colors">Twitter / X</a>
          <a href="#" className="text-sm font-medium text-muted hover:text-text transition-colors">Discord</a>
        </div>
        
        <div className="text-sm text-muted text-center md:text-right">
          Built by developers, for developers.<br className="hidden md:block" />
          Open-source encryption. Transparent pricing. No VC pressure.
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto text-center md:text-left text-xs text-muted/60">
        © {new Date().getFullYear()} ClipStream Inc.
      </div>
    </footer>
  );
}
