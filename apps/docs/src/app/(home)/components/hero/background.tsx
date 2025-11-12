import { motion } from "motion/react";
import PixelBlast from "@/components/PixelBlast";

export const HeroBackground = () => (
  <motion.div
    className="absolute inset-0 z-0"
    initial={{ opacity: 0, backdropFilter: "blur(20px)" }}
    transition={{ duration: 1.5, type: "spring", delay: 0.25 }}
    whileInView={{ opacity: 1, backdropFilter: "blur(0px)" }}
  >
    <PixelBlast
      className="opacity-50"
      color="#dddddd"
      edgeFade={0.7}
      patternDensity={0.6}
      pixelSize={4}
      speed={0.3}
    />
  </motion.div>
);
