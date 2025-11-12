"use client";

import { motion } from "motion/react";
import { PromptsmithIcons } from "@/components/icons";
import { BlurFade } from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
import HeroBadge from "@/components/ui/hero-badge";
import { HeroBackground } from "../components/hero/background";

const HeroSection = () => (
  <section
    aria-labelledby="hero-title"
    className="relative flex min-h-screen w-full flex-col items-center justify-center text-center"
  >
    <div className="relative z-10 space-y-6">
      <HeroBadge
        className="mb-6 backdrop-blur-xl"
        href="/docs"
        icon={
          <PromptsmithIcons.Flashlight aria-hidden="true" className="size-4" />
        }
        text="New! Built for creators & developers"
      />
      <BlurFade delay={0.5}>
        <h1
          className="font-medium font-sans text-4xl tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl"
          id="hero-title"
        >
          The smartest way to craft <br />
          <span className="text-primary">AI prompts</span>
        </h1>
      </BlurFade>
      <BlurFade delay={0.8}>
        <p className="mx-auto max-w-md text-muted-foreground sm:max-w-lg md:max-w-xl md:text-md lg:max-w-2xl lg:text-lg">
          Promptsmith is your all-in-one workspace to design, refine and manage
          prompts, helping teams build smarter, faster and with clarity.
        </p>
      </BlurFade>
      <motion.div
        aria-label="Actions button hero"
        className="flex items-center space-x-4 justify-self-center"
        initial={{ opacity: 0, backdropFilter: "blur(20px)", y: 10 }}
        role="group"
        transition={{ duration: 1.5, type: "spring", delay: 1 }}
        viewport={{ once: true }}
        whileInView={{ opacity: 1, backdropFilter: "blur(0px)", y: 0 }}
      >
        <Button
          asChild
          className="rounded-sm bg-foreground/90 text-black backdrop-blur-2xl"
        >
          <a
            href="https://www.npmjs.com/package/promptsmith-ts"
            rel="noopener noreferrer"
          >
            Get started
          </a>
        </Button>
        <Button
          asChild
          className="flex items-center gap-2 rounded-sm border border-primary bg-transparent transition-colors duration-300 hover:bg-foreground/10"
        >
          <a
            href="https://github.com/galfrevn/promptsmith"
            rel="noopener noreferrer"
          >
            View docs{" "}
            <PromptsmithIcons.ArrowRight
              aria-hidden="true"
              className="size-4"
            />
          </a>
        </Button>
      </motion.div>
    </div>

    <HeroBackground />
  </section>
);

export default HeroSection;
