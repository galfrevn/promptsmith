import { after, before } from "@/(home)/utils/comparison";
import { PromptsmithIcons } from "@/components/icons";
import { BGPattern } from "@/components/ui/bg-pattern";
import { BlurFade } from "@/components/ui/blur-fade";
import ComparisonCard from "./comparison-card";

const CodeComparison = () => (
  <BlurFade delay={1} inView>
    <div className="flex w-full flex-col justify-between gap-24 md:flex-row">
      <ComparisonCard
        code={before.code}
        icon={<PromptsmithIcons.Close aria-hidden="true" className="size-3" />}
        items={before.desadvantages}
        title={before.title}
      />

      <ComparisonCard
        code={after.code}
        icon={<PromptsmithIcons.Check aria-hidden="true" className="size-3" />}
        items={after.advantages}
        title={after.title}
      />
    </div>

    <BGPattern className="text-muted" mask="fade-edges" variant="dots" />
  </BlurFade>
);

export default CodeComparison;
