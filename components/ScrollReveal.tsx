"use client";

import React from "react";
import { motion, type HTMLMotionProps } from "motion/react";

interface ScrollRevealProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  yOffset?: number;
  duration?: number;
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  yOffset = 36,
  ...props
}: ScrollRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        type: "spring",
        damping: 24,
        stiffness: 90,
        mass: 0.85,
        delay,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export default ScrollReveal;
