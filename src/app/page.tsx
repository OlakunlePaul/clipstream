import { HeroSection } from "@/components/HeroSection";
import { ProblemSection } from "@/components/ProblemSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { WaitlistSection } from "@/components/WaitlistSection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="flex-1">
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <WaitlistSection />
      <Footer />
    </main>
  );
}
