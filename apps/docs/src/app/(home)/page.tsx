import FeaturesSection from "./sections/features";
import HeroSection from "./sections/hero";
import QuickStartSection from "./sections/quick-start";

export default function Home() {
  return (
    <div className="bg-zinc-50 font-sans dark:bg-black">
      <HeroSection />
      <FeaturesSection />
      <QuickStartSection />
    </div>
  );
}
