import { Key, Smartphone, MessageSquare } from "lucide-react";

export function Problem() {
  return (
    <section id="problem" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <div className="font-mono text-xs text-accent mb-4">// the problem</div>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] mb-4">
          Your clipboard stops at the OS boundary.
        </h2>
        <p className="text-muted text-sm md:text-base max-w-[480px] mx-auto leading-relaxed">
          Every developer on a mixed stack hits the same wall. The workarounds are embarrassing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-bg3 border border-border rounded-xl p-6 transition-all duration-200 hover:border-border2 hover:-translate-y-1">
          <div className="text-accent mb-4"><Key className="w-7 h-7" /></div>
          <h3 className="font-medium text-base mb-2">Emailing API keys to yourself</h3>
          <p className="text-sm text-muted leading-relaxed">
            You copy a secret from your terminal. You need it on your phone. You open Gmail. You type it in the subject line because it's faster. You send it to yourself. You hate yourself a little. You do it again tomorrow.
          </p>
        </div>

        <div className="bg-bg3 border border-border rounded-xl p-6 transition-all duration-200 hover:border-border2 hover:-translate-y-1">
          <div className="text-accent mb-4"><Smartphone className="w-7 h-7" /></div>
          <h3 className="font-medium text-base mb-2">Typing error messages by hand</h3>
          <p className="text-sm text-muted leading-relaxed">
            Your Android test device shows a stack trace at line 847. Your laptop has the debugger open. You squint at the phone. You type it out. Character. By. Character.
          </p>
        </div>

        <div className="bg-bg3 border border-border rounded-xl p-6 transition-all duration-200 hover:border-border2 hover:-translate-y-1">
          <div className="text-accent mb-4"><MessageSquare className="w-7 h-7" /></div>
          <h3 className="font-medium text-base mb-2">Slack as your clipboard</h3>
          <p className="text-sm text-muted leading-relaxed">
            You've sent connection strings, env vars, SSH keys, and JWT tokens to yourself on Slack. We all have. Every one of those messages is sitting in Slack's servers right now. That's a security incident waiting to happen.
          </p>
        </div>
      </div>
    </section>
  );
}
