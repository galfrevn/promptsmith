import { InstallCommand } from "@/components/install-command-button";
import { BlurFade } from "@/components/ui/blur-fade";
import TerminalAnimation from "../components/quick-start/terminal-animation";

const QuickStartSection = () => (
  <section
    aria-labelledby="quick-start-title"
    className="py-16 md:py-32"
    id="quick-start"
  >
    <div className="@container mx-auto max-w-5xl space-y-12 px-6">
      <header>
        <BlurFade delay={0.5} inView>
          <h2
            className="text-balance font-normal text-4xl tracking-normal lg:text-5xl"
            id="quick-start-title"
          >
            Get started in seconds
          </h2>
        </BlurFade>
        <BlurFade delay={0.5} inView>
          <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
            Install Promptsmith and start building production-ready AI prompts —
            with validation, templates, and type safety built in.
          </p>
        </BlurFade>
      </header>

      <div className="space-y-6">
        <TerminalAnimation />
        <InstallCommand />
      </div>
    </div>
  </section>
);

export default QuickStartSection;
