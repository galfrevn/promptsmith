"use client";

import { motion } from "motion/react";
import { BlurFade } from "@/components/ui/blur-fade";
import FeatureCard from "../components/features/feature-card";
import { features } from "../utils/features";

const FeaturesSection = () => (
  <section
    aria-labelledby="features-title"
    className="py-16 md:py-32"
    id="features"
  >
    <div className="@container mx-auto max-w-5xl px-6">
      <div className="flex w-full px-12 text-start">
        <BlurFade delay={0.5} inView>
          <h2
            className="text-balance font-normal text-4xl tracking-normal lg:text-5xl"
            id="features-title"
          >
            The complete stack to build smarter prompts
          </h2>
        </BlurFade>
        <BlurFade delay={0.5} inView>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to build, organize, and scale your prompts.
          </p>
        </BlurFade>
      </div>

      <BlurFade delay={0.5} inView>
        <div className="mx-auto mt-8 grid @min-4xl:max-w-full max-w-sm @min-4xl:grid-cols-3 gap-6 *:text-center md:mt-16">
          {features.map((feature, index) => (
            <motion.article
              initial={{ opacity: 0, y: 10 }}
              key={feature.id}
              transition={{ duration: 1.2, type: "tween", delay: index }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <FeatureCard {...feature} />
            </motion.article>
          ))}
        </div>
      </BlurFade>
    </div>
  </section>
);

export default FeaturesSection;
