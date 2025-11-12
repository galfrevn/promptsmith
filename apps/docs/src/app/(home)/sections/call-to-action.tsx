import { BlurFade } from "@/components/ui/blur-fade";
import { CallToActionBanner } from "@/components/ui/cta-3";

const CallToAction = () => (
  <section
    className="@container mx-auto max-w-5xl space-y-12 px-6 py-16 md:py-32"
    id="call-to-action"
  >
    <BlurFade delay={1} inView>
      <CallToActionBanner
        text="Stop fighting messy strings and start building production-ready prompts with a fluent, type-safe API."
        title="Build smarter prompts today"
      />
    </BlurFade>
  </section>
);

export default CallToAction;
