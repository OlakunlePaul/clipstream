import Image from "next/image";

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Copy",
      description: "Hit copy on any device. Text, links, or code snippets—it doesn't matter.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>
      )
    },
    {
      number: "02",
      title: "Sync",
      description: "Your data is end-to-end encrypted and synced across all your devices instantly.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M16 16h5v5"></path></svg>
      )
    },
    {
      number: "03",
      title: "Paste",
      description: "Pick up your other device and just hit paste. It's already there waiting for you.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect></svg>
      )
    }
  ];

  return (
    <section id="how-it-works" className="py-24 px-6 overflow-hidden relative">
      {/* Subtle Background Image */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none mix-blend-screen">
        <Image 
          src="/cross-device.png" 
          alt="Background pattern" 
          width={800} 
          height={800} 
          className="object-cover"
        />
      </div>

      <div className="w-full max-w-6xl mx-auto relative z-10">
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Magical cross-device sync</h2>
          <p className="text-text-secondary text-lg">ClipStream runs quietly in the background, making sure your clipboard is always where you need it.</p>
        </div>

        <div className="relative">
          {/* Connecting line (Desktop only) */}
          <div className="absolute top-1/2 left-0 w-full h-px bg-linear-to-r from-transparent via-white/10 to-transparent -translate-y-1/2 hidden md:block" />
          
          <div className="grid md:grid-cols-3 gap-12 md:gap-8 relative z-10">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-bg-elevated border border-white/10 flex items-center justify-center text-accent shadow-glow-sm">
                    {step.icon}
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center border-4 border-bg-base">
                    {step.number}
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">{step.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed max-w-[250px] mx-auto">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
