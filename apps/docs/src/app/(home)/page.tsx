import FeaturesSection from "./sections/features";
import HeroSection from "./sections/hero";
import PromptComparisonSection from "./sections/prompt-comparison";
import QuickStartSection from "./sections/quick-start";

export default function Home() {
  return (
    <div className="bg-zinc-50 font-sans dark:bg-black">
      <HeroSection />
      <FeaturesSection />
      <QuickStartSection />
      <PromptComparisonSection />
    </div>
  );
}
