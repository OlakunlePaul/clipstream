export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 max-w-7xl mx-auto border-t border-border">
      <div className="text-center mb-16">
        <div className="font-mono text-xs text-accent mb-4">// how it works</div>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] mb-4">
          Copy on any device.<br className="hidden sm:block" />
          Paste on all of them.
        </h2>
        <p className="text-muted text-sm md:text-base max-w-[560px] mx-auto leading-relaxed">
          Works from the terminal, editor, browser, and phone. ClipStream never sees your clipboard contents — only encrypted bytes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border border border-border rounded-xl overflow-hidden">
        <div className="p-6 md:p-8 bg-bg2">
          <div className="font-mono text-xs text-accent mb-4">01 / install</div>
          <h3 className="font-medium text-base mb-4 text-text">One command setup</h3>
          <div className="bg-bg border border-border2 rounded-md p-3 mb-4 font-mono text-[11px] text-accent">
            npm install -g clipstream-cli
          </div>
          <p className="text-sm text-muted leading-relaxed">
            Install the Chrome extension and Android app. Sign in once with Google. All devices linked automatically. No pairing codes. No QR scanning. Just works.
          </p>
        </div>

        <div className="p-6 md:p-8 bg-bg2">
          <div className="font-mono text-xs text-accent mb-4">02 / copy</div>
          <h3 className="font-medium text-base mb-4 text-text">Copy from anywhere</h3>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center text-[11px]">
              <span className="bg-bg border border-border2 rounded-md px-2 py-1 font-mono text-accent">echo $DB_URL | cs copy</span>
              <span className="text-muted">← terminal</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="bg-bg border border-border2 rounded-md px-2 py-1 font-mono text-accent">Cmd+C</span>
              <span className="text-muted">← browser / VS Code</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="bg-bg border border-border2 rounded-md px-2 py-1 font-mono text-accent">[Send] button</span>
              <span className="text-muted">← Android app</span>
            </div>
          </div>
          <p className="text-sm text-muted leading-relaxed">
            ClipStream detects what you copied: CODE · COMMAND · URL · API_KEY · FILE_PATH · ERROR_TRACE. API keys are masked automatically — in history and in notifications.
          </p>
        </div>

        <div className="p-6 md:p-8 bg-bg2">
          <div className="font-mono text-xs text-accent mb-4">03 / paste</div>
          <h3 className="font-medium text-base mb-4 text-text">Paste anywhere else</h3>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center text-[11px]">
              <span className="bg-bg border border-border2 rounded-md px-2 py-1 font-mono text-accent">cs paste | pbcopy</span>
              <span className="text-muted">← pipe to macOS</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="bg-bg border border-border2 rounded-md px-2 py-1 font-mono text-accent">Cmd+Shift+V</span>
              <span className="text-muted">← VS Code history</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="bg-bg border border-border2 rounded-md px-2 py-1 font-mono text-accent">📋 notification</span>
              <span className="text-muted">← one tap to copy</span>
            </div>
          </div>
          <p className="text-sm text-muted leading-relaxed">
            Local network? Under 50ms. Cloud fallback? Still faster than your current workaround.
          </p>
        </div>
      </div>
    </section>
  );
}
