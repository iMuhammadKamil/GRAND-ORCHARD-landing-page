"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import {
  useArmedAfterHydration,
  usePrefersReducedMotion,
} from "@/hooks/use-prefers-reduced-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Scroll-reveal primitives.
 *
 * Progressive enhancement: server HTML (and the first client render) is fully
 * visible — nothing is hidden behind JavaScript. `useArmedAfterHydration`
 * flips true right after hydration, the hidden start state is applied
 * instantly (duration 0), and whileInView then plays the entrance animation
 * exactly as designed. If JavaScript never runs, visitors simply see the
 * finished sections instead of blank areas. Reduced-motion visitors get the
 * plain static markup, as before.
 */

/** Fade-up entrance on scroll. Respects prefers-reduced-motion. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  as = "div",
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article" | "figure";
  once?: boolean;
}) {
  const reduce = usePrefersReducedMotion();
  const armed = useArmedAfterHydration();

  if (reduce) {
    const Tag = motion[as];
    return <Tag className={className}>{children}</Tag>;
  }

  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={false}
      animate={
        armed
          ? { opacity: 0, y, transition: { duration: 0 } }
          : { opacity: 1, y: 0 }
      }
      whileInView={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.9, delay, ease: EASE },
      }}
      viewport={{ once, margin: "-12% 0px" }}
    >
      {children}
    </Tag>
  );
}

/** Image reveal: container clip-wipe + inner scale settle. */
export function ImageReveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = usePrefersReducedMotion();
  const armed = useArmedAfterHydration();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={false}
      animate={
        armed
          ? {
              clipPath: "inset(8% 4% 8% 4%)",
              opacity: 0.4,
              transition: { duration: 0 },
            }
          : { clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }
      }
      whileInView={{
        clipPath: "inset(0% 0% 0% 0%)",
        opacity: 1,
        transition: { duration: 1.2, delay, ease: EASE },
      }}
      viewport={{ once: true, margin: "-10% 0px" }}
    >
      {children}
    </motion.div>
  );
}

/** Slow settle scale for images inside an ImageReveal. */
export function ScaleIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = usePrefersReducedMotion();
  const armed = useArmedAfterHydration();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={false}
      animate={
        armed
          ? { scale: 1.08, transition: { duration: 0 } }
          : { scale: 1 }
      }
      whileInView={{
        scale: 1,
        transition: { duration: 1.6, delay, ease: EASE },
      }}
      viewport={{ once: true, margin: "-10% 0px" }}
    >
      {children}
    </motion.div>
  );
}

export { EASE };
