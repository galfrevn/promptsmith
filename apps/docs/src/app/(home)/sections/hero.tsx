"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { PrompsmithIcons } from "@/components/icons";
import PixelBlast from "@/components/PixelBlast";
import { BlurFade } from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
import HeroBadge from "@/components/ui/hero-badge";

const HeroSection = () => (
  <section
    aria-labelledby="hero-title"
    className="relative flex min-h-screen w-full flex-col items-center justify-center text-center"
  >
    <div className="relative z-10 space-y-6">
      <HeroBadge
        className="mb-6 backdrop-blur-xl"
        href="/docs"
        icon={<PrompsmithIcons.Flashlight className="size-4" />}
        text="New! Built for creators & developers"
      />
      <BlurFade delay={0.25}>
        <h1
          className="font-medium font-sans text-7xl tracking-tighter"
          id="hero-title"
        >
          The smartest way to craft <br />
          <span className="text-primary">AI prompts</span>
        </h1>
      </BlurFade>
      <BlurFade delay={0.5}>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Promptsmith is your all-in-one workspace to design, refine and manage
          prompts, helping teams build smarter, faster and with clarity.
        </p>
      </BlurFade>
      <motion.div
        className="flex items-center space-x-4 justify-self-center"
        initial={{ opacity: 0, backdropFilter: "blur(20px)", y: 10 }}
        transition={{ duration: 1, type: "spring", delay: 0.8 }}
        viewport={{ once: true }}
        whileInView={{ opacity: 1, backdropFilter: "blur(0px)", y: 0 }}
      >
        <Button
          asChild
          className="rounded-sm bg-foreground/90 text-black backdrop-blur-2xl"
        >
          <a href="#features">Get started</a>
        </Button>
        <Button
          asChild
          className="flex items-center gap-2 rounded-sm border border-primary bg-transparent transition-colors duration-300 hover:bg-foreground/10"
        >
          <Link href="/docs">
            View docs <PrompsmithIcons.ArrowRight className="size-4" />
          </Link>
        </Button>
      </motion.div>
    </div>

    <motion.div
      className="absolute inset-0 z-0"
      initial={{ opacity: 0, backdropFilter: "blur(20px)" }}
      transition={{ duration: 1, type: "spring", delay: 0.25 }}
      whileInView={{ opacity: 1, backdropFilter: "blur(0px)" }}
    >
      <PixelBlast
        className="opacity-50"
        color="#f5c125"
        edgeFade={0.8}
        patternDensity={0.6}
        pixelSize={4}
        speed={0.3}
      />
    </motion.div>
  </section>
);

export default HeroSection;
