import { after, before } from "@/(home)/utils/comparison";
import { PrompsmithIcons } from "@/components/icons";
import { BGPattern } from "@/components/ui/bg-pattern";
import { BlurFade } from "@/components/ui/blur-fade";
import ComparisonCard from "./comparison-card";

const CodeComparison = () => (
  <BlurFade delay={1} inView>
    <div className="flex w-full justify-between gap-24">
      <ComparisonCard
        code={before.code}
        icon={<PrompsmithIcons.Close className="size-3" />}
        items={before.desadvantages}
        title={before.title}
      />

      <ComparisonCard
        code={after.code}
        icon={<PrompsmithIcons.Check className="size-3" />}
        items={after.advantages}
        title={after.title}
      />
    </div>

    <BGPattern className="text-muted" mask="fade-edges" variant="dots" />
  </BlurFade>
);

export default CodeComparison;
