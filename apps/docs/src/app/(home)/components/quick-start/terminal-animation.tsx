import { BlurFade } from "@/components/ui/blur-fade";
import {
  AnimatedSpan,
  Terminal,
  TypingAnimation,
} from "@/components/ui/terminal";

const TerminalAnimation = () => (
  <BlurFade delay={1} inView>
    <Terminal className="w-full max-w-5xl text-muted-foreground">
      <TypingAnimation className="text-primary" duration={50}>
        npm install promptsmith-ts
      </TypingAnimation>
      <TypingAnimation delay={10_000}>Install dependencies...</TypingAnimation>
      <AnimatedSpan delay={5000}>✔ Preflight checks.</AnimatedSpan>
      <AnimatedSpan delay={5000}>✔ Validating Tailwind CSS setup.</AnimatedSpan>
      <AnimatedSpan delay={5000}>
        ✔ Checking TypeScript configuration.
      </AnimatedSpan>
      <TypingAnimation duration={50}>
        ★ Success! Promptsmith ready to craft your next prompt!
      </TypingAnimation>
    </Terminal>
  </BlurFade>
);

export default TerminalAnimation;
