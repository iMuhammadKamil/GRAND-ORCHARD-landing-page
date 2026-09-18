"use client";

import { ArrowUpRight } from "lucide-react";
import { Reveal } from "./reveal";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export function FinalCta() {
  const reduce = usePrefersReducedMotion();
  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", href);
  };

  return (
    <section className="relative overflow-hidden bg-ink text-paper" aria-label="Final call to action">
      {/* Backdrop image, heavily dimmed */}
      <div className="absolute inset-0" aria-hidden="true">
        <ImageBg />
        <div className="absolute inset-0 bg-ink/85" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-transparent to-ink" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1440px] px-5 py-24 text-center sm:px-8 sm:py-36 lg:py-44">
        <Reveal>
          <p className="overline-rule justify-center text-paper/60">Grand Orchard</p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-display mx-auto mt-8 max-w-4xl text-[2.6rem] font-medium leading-[1.05] sm:text-6xl lg:text-7xl">
            Make Grand Orchard
            <br />
            <em className="font-light italic text-beige">your next address.</em>
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-7 max-w-xl text-[0.9375rem] leading-relaxed text-paper/65 sm:text-base">
            Explore Grand Orchard at DHA Orchard, DHA Phase I, Islamabad.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#enquire"
              onClick={(e) => scrollTo(e, "#enquire")}
              className="label-caps group inline-flex items-center gap-2.5 bg-paper px-8 py-4 text-ink transition-colors duration-300 hover:bg-beige"
            >
              Enquire Now
              <ArrowUpRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </a>
            <a
              href="#pricing"
              onClick={(e) => scrollTo(e, "#pricing")}
              className="label-caps inline-flex items-center gap-2.5 border border-paper/50 px-8 py-4 text-paper transition-all duration-300 hover:border-paper hover:bg-paper/10"
            >
              Request Details
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ImageBg() {
  return (
    <div className="absolute inset-0 bg-[url('/images/elevation-night.png')] bg-cover bg-center motion-reduce:static" />
  );
}
