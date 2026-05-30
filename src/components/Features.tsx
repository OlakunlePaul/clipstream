import { Lock, Zap, Brain, Laptop, Terminal, ClipboardList } from "lucide-react";

export function Features() {
  return (
    <section id="features" className="py-24 px-6 max-w-7xl mx-auto border-t border-border">
      <div className="text-center mb-16">
        <div className="font-mono text-xs text-accent mb-4">// features</div>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] mb-4">
          Built for the cross-platform developer stack.
        </h2>
        <p className="text-muted text-sm md:text-base max-w-[560px] mx-auto leading-relaxed">
          Not a general clipboard tool with a developer skin. Every feature exists because of a real workflow problem.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Row 1 */}
        <div className="md:col-span-2 bg-bg3 border border-border rounded-xl p-8 flex flex-col justify-center transition-all duration-200 hover:border-border2 hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 group-hover:bg-accent/10 transition-colors duration-500"></div>
          <h3 className="flex items-center gap-3 font-semibold text-lg mb-3 text-text relative z-10">
            <div className="p-2 bg-bg2 rounded-lg border border-border2"><Lock className="w-5 h-5 text-accent shrink-0" /></div>
            Zero-knowledge encryption
          </h3>
          <p className="text-base text-muted leading-relaxed max-w-[500px] relative z-10">
            Your keys. Your device. Full stop. Encryption keys are generated on your device and never transmitted. ClipStream's servers only ever see encrypted bytes. Not your connection strings. Not your API keys. Not your code.
          </p>
        </div>

        <div className="md:col-span-1 bg-bg3 border border-border rounded-xl p-8 flex flex-col justify-center transition-all duration-200 hover:border-border2 hover:-translate-y-1">
          <h3 className="flex items-center gap-3 font-semibold text-lg mb-3 text-text">
            <div className="p-2 bg-bg2 rounded-lg border border-border2"><Zap className="w-5 h-5 text-accent shrink-0" /></div>
            &lt;50ms local sync
          </h3>
          <p className="text-sm text-muted leading-relaxed">
            When devices are on the same network, ClipStream syncs peer-to-peer. No cloud hop. Cloud fallback available when needed.
          </p>
        </div>

        {/* Row 2 */}
        <div className="md:col-span-1 bg-bg3 border border-border rounded-xl p-8 flex flex-col justify-center transition-all duration-200 hover:border-border2 hover:-translate-y-1">
          <h3 className="flex items-center gap-3 font-semibold text-lg mb-3 text-text">
            <div className="p-2 bg-bg2 rounded-lg border border-border2"><Brain className="w-5 h-5 text-accent shrink-0" /></div>
            Content-aware
          </h3>
          <p className="text-sm text-muted leading-relaxed">
            It knows what you copied. API keys are masked in your history (sk-••••••••f3a9) and never appear in notification banners.
          </p>
        </div>

        <div className="md:col-span-2 bg-bg3 border border-border rounded-xl p-8 flex flex-col justify-center transition-all duration-200 hover:border-border2 hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl translate-y-1/2 translate-x-1/4 group-hover:bg-accent/10 transition-colors duration-500"></div>
          <h3 className="flex items-center gap-3 font-semibold text-lg mb-3 text-text relative z-10">
            <div className="p-2 bg-bg2 rounded-lg border border-border2"><Laptop className="w-5 h-5 text-accent shrink-0" /></div>
            VS Code integration
          </h3>
          <p className="text-base text-muted leading-relaxed max-w-[500px] relative z-10">
            Paste from history without leaving your editor. <code className="text-xs bg-bg2 px-1.5 py-0.5 rounded border border-border2">Cmd+Shift+V</code> opens a searchable history picker inside VS Code. Every clip from every device, right where you're already working.
          </p>
        </div>

        {/* Row 3 */}
        <div className="md:col-span-2 bg-bg3 border border-border rounded-xl p-8 flex flex-col justify-center transition-all duration-200 hover:border-border2 hover:-translate-y-1">
          <h3 className="flex items-center gap-3 font-semibold text-lg mb-3 text-text">
            <div className="p-2 bg-bg2 rounded-lg border border-border2"><Terminal className="w-5 h-5 text-accent shrink-0" /></div>
            Terminal-native CLI
          </h3>
          <p className="text-base text-muted leading-relaxed max-w-[500px]">
            <code className="text-xs text-accent">cs copy</code> and <code className="text-xs text-accent">cs paste</code>. That's it. Pipe-friendly: <code className="text-xs bg-bg2 px-1.5 py-0.5 rounded border border-border2 text-text">echo $SECRET | cs copy</code>. Shell completion for bash and zsh. Works on macOS, Linux, and Windows.
          </p>
        </div>

        <div className="md:col-span-1 bg-bg3 border border-border rounded-xl p-8 flex flex-col justify-center transition-all duration-200 hover:border-border2 hover:-translate-y-1">
          <h3 className="flex items-center gap-3 font-semibold text-lg mb-3 text-text">
            <div className="p-2 bg-bg2 rounded-lg border border-border2"><ClipboardList className="w-5 h-5 text-accent shrink-0" /></div>
            90-day history
          </h3>
          <p className="text-sm text-muted leading-relaxed">
            Encrypted, searchable, and stored per-device. Never in plaintext on our servers.
          </p>
        </div>
      </div>
    </section>
  );
}
