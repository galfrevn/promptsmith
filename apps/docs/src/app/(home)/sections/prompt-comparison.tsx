import { BlurFade } from "@/components/ui/blur-fade";
import CodeComparison from "../components/prompt-comparison/code-comparison";

const PromptComparisonSection = () => (
  <>
    <section
      aria-labelledby="features-title"
      className="py-16 md:py-32"
      id="features"
    >
      <div className="@container mx-auto max-w-5xl space-y-12 px-6">
        <header>
          <BlurFade delay={0.5} inView>
            <h2
              className="text-balance font-normal text-4xl tracking-normal lg:text-5xl"
              id="quick-start-title"
            >
              Stop fighting string concatenation
            </h2>
          </BlurFade>
          <BlurFade delay={0.5} inView>
            <p className="mt-4 max-w-4xl text-lg text-muted-foreground">
              PromptSmith replaces fragile prompt concatenation wit h a fluent,
              type-safe builder designed for production AI agents. No more
              debugging strings — just clean, composable code.
            </p>
          </BlurFade>
        </header>
        <CodeComparison />
      </div>
    </section>
  </>
);

export default PromptComparisonSection;
