"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { HERO_STATS } from "@/lib/grand-orchard";
import { useReducedMotion } from "framer-motion";

export function Hero() {
  const reduce = useReducedMotion();

  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el)
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", href);
  };

  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] flex-col overflow-hidden bg-ink"
      aria-label="Grand Orchard introduction"
    >
      {/* Cinematic background */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className={reduce ? "absolute inset-0" : "go-hero-zoom absolute inset-0"}>
          <Image
            src="/images/hero-elevation.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_38%]"
            quality={88}
          />
        </div>
        {/* Layered overlays for legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/35 to-ink/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-transparent to-ink/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-end px-5 pb-10 pt-32 sm:px-8 sm:pb-14 lg:px-12 lg:pb-16">
        <div className="max-w-4xl">
          <p
            className={`label-caps text-paper/70 ${reduce ? "" : "go-rise"}`}
            style={{ animationDelay: "0.15s" }}
          >
            <span>Grand Orchard</span>
          </p>

          <h1 className="font-display mt-5 text-[2.9rem] font-medium leading-[1.02] tracking-[-0.01em] text-paper sm:text-7xl lg:text-[5.5rem]">
            <span className={`block ${reduce ? "" : "go-rise"}`} style={{ animationDelay: "0.3s" }}>
              <span>A Premium Address</span>
            </span>
            <span className={`block ${reduce ? "" : "go-rise"}`} style={{ animationDelay: "0.45s" }}>
              <span>
                for Modern <em className="font-light italic text-beige">Vertical</em> Living.
              </span>
            </span>
          </h1>

          <div
            className={`mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-paper/80 ${reduce ? "" : "go-rise"}`}
            style={{ animationDelay: "0.6s" }}
          >
            <span className="text-sm sm:text-base">Commercial &amp; Residential</span>
            <span aria-hidden="true" className="hidden h-4 w-px bg-paper/40 sm:block" />
            <span className="text-sm sm:text-base">DHA Orchard, DHA Phase I, Islamabad</span>
          </div>

          <div
            className={`mt-9 flex flex-wrap items-center gap-4 ${reduce ? "" : "go-rise"}`}
            style={{ animationDelay: "0.75s" }}
          >
            <a
              href="#overview"
              onClick={(e) => scrollTo(e, "#overview")}
              className="label-caps group inline-flex items-center gap-2.5 bg-paper px-7 py-4 text-ink transition-colors duration-300 hover:bg-beige"
            >
              Explore Project
              <ArrowUpRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </a>
            <a
              href="#enquire"
              onClick={(e) => scrollTo(e, "#enquire")}
              className="label-caps inline-flex items-center gap-2.5 border border-paper/50 px-7 py-4 text-paper transition-all duration-300 hover:border-paper hover:bg-paper/10"
            >
              Enquire Now
            </a>
            <p className="label-caps inline-flex items-center gap-2.5 text-paper/70">
              <span aria-hidden="true" className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-beige opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-beige" />
              </span>
              Under Construction
            </p>
          </div>
        </div>

        {/* Stats strip */}
        <dl
          className={`mt-12 grid grid-cols-1 gap-px border-t border-paper/25 pt-8 sm:grid-cols-3 sm:gap-6 lg:mt-16 ${reduce ? "" : "go-rise"}`}
          style={{ animationDelay: "0.9s" }}
        >
          {HERO_STATS.map((s) => (
            <div key={s.label} className="flex items-baseline gap-3 sm:flex-col sm:gap-1">
              <dd className="font-display order-2 text-4xl font-medium text-paper sm:order-1 sm:text-5xl">
                {s.value}
                {s.unit ? (
                  <span className="label-caps ml-2 align-middle text-paper/60">{s.unit}</span>
                ) : null}
              </dd>
              <dt className="label-caps order-1 text-paper/60 sm:order-2">{s.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
