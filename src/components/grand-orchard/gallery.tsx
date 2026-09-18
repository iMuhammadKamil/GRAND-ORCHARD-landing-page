"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { SectionHeader } from "./section-header";
import { Reveal, ImageReveal, ScaleIn } from "./reveal";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

type Category =
  | "Elevations"
  | "Residential Interiors"
  | "Commercial Interiors"
  | "Facilities"
  | "Project Status";

type Item = {
  src: string;
  alt: string;
  category: Category;
  featured?: boolean;
  /** true = AI-generated indicative visual, not an official photograph */
  indicative?: boolean;
};

const ITEMS: Item[] = [
  {
    src: "/images/hero-elevation.png",
    alt: "Grand Orchard front elevation — terraced residential floors above the retail podium",
    category: "Elevations",
    featured: true,
  },
  {
    src: "/images/elevation-dusk.png",
    alt: "Grand Orchard elevation at dusk with landscaped boulevard",
    category: "Elevations",
  },
  {
    src: "/images/elevation-night.png",
    alt: "Grand Orchard elevation at night with warm podium lighting",
    category: "Elevations",
  },
  {
    src: "/images/ri-1.png",
    alt: "Indicative interior visual — open-plan living space with terrace view",
    category: "Residential Interiors",
    indicative: true,
  },
  {
    src: "/images/ri-2.png",
    alt: "Indicative interior visual — bedroom opening to a terrace",
    category: "Residential Interiors",
    indicative: true,
  },
  {
    src: "/images/ci-1.png",
    alt: "Indicative visual — commercial retail unit interior",
    category: "Commercial Interiors",
    indicative: true,
  },
  {
    src: "/images/fac-1.png",
    alt: "Indicative visual — swimming pool area",
    category: "Facilities",
    indicative: true,
  },
  {
    src: "/images/fac-2.png",
    alt: "Indicative visual — fitness center",
    category: "Facilities",
    indicative: true,
  },
  {
    src: "/images/construction-update.jpg",
    alt: "Construction update at Grand Orchard — Basement 01 & 02, Zone B, December 2025",
    category: "Project Status",
  },
];

const FILTERS: Array<"All" | Category> = [
  "All",
  "Elevations",
  "Residential Interiors",
  "Commercial Interiors",
  "Facilities",
  "Project Status",
];

export function Gallery() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const reduce = usePrefersReducedMotion();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  const visible = useMemo(
    () => (filter === "All" ? ITEMS : ITEMS.filter((i) => i.category === filter)),
    [filter]
  );

  const openAt = useCallback(
    (idx: number) => {
      lastFocused.current = document.activeElement as HTMLElement;
      setLightbox(idx);
    },
    []
  );

  const close = useCallback(() => {
    setLightbox(null);
    lastFocused.current?.focus?.();
  }, []);

  const step = useCallback(
    (dir: 1 | -1) => {
      setLightbox((cur) =>
        cur === null ? cur : (cur + dir + visible.length) % visible.length
      );
    },
    [visible.length]
  );

  // Keyboard controls + scroll lock for lightbox
  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, close, step]);

  const current = lightbox !== null ? visible[lightbox] : null;

  return (
    <section id="gallery" className="bg-ink text-paper" aria-label="Gallery">
      <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-36">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeader
            number="05"
            label="Gallery"
            lines={["A Closer Look", "at Grand Orchard."]}
          />
          <Reveal delay={0.15} className="lg:pb-3">
            <p className="max-w-sm text-[0.9375rem] leading-relaxed text-paper/60 lg:text-right">
              Elevations and construction photographs of the project. Interior and
              facility visuals marked <em className="not-italic text-beige">“Indicative”</em> are
              illustrative renders, not official photographs.
            </p>
          </Reveal>
        </div>

        {/* Filters */}
        <Reveal delay={0.1}>
          <div
            role="tablist"
            aria-label="Gallery categories"
            className="thin-scroll mt-12 flex gap-2 overflow-x-auto pb-1 lg:mt-16"
          >
            {FILTERS.map((f) => (
              <button
                key={f}
                role="tab"
                aria-selected={filter === f}
                onClick={() => {
                  setFilter(f);
                  setLightbox(null);
                }}
                className={cn(
                  "label-caps shrink-0 border px-4 py-2.5 transition-all duration-300",
                  filter === f
                    ? "border-paper bg-paper text-ink"
                    : "border-paper/25 text-paper/65 hover:border-paper/60 hover:text-paper"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Grid */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-10 lg:grid-cols-4 lg:gap-5">
          {visible.map((item, idx) => (
            <motion.button
              layout={!reduce}
              key={item.src}
              type="button"
              onClick={() => openAt(idx)}
              aria-label={`Open image: ${item.alt}`}
              className={cn(
                "group relative overflow-hidden border border-paper/10",
                item.featured ? "sm:col-span-2 sm:row-span-2" : "",
                reduce ? "" : "motion-safe:transition-colors"
              )}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ duration: 0.8, delay: 0.05 * (idx % 4), ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className={cn(
                  "relative w-full",
                  item.featured
                    ? "aspect-[4/3] sm:aspect-auto sm:h-full sm:min-h-[480px]"
                    : "aspect-[4/3]"
                )}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes={
                    item.featured
                      ? "(min-width: 1024px) 50vw, 100vw"
                      : "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  }
                  className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  quality={82}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
                  <div className="text-left">
                    <p className="label-caps text-beige">{item.category}</p>
                    {item.indicative ? (
                      <p className="label-caps mt-1 text-[0.5625rem] text-paper/60">
                        Indicative Visual
                      </p>
                    ) : null}
                  </div>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-paper/40 text-paper opacity-0 transition-all duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                    <Expand className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {current && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={current.alt}
            initial={reduce ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[70] flex flex-col bg-ink/95 backdrop-blur-sm"
            onClick={close}
          >
            <div className="flex items-center justify-between px-5 py-4 sm:px-8">
              <p className="label-caps text-paper/60">{current.category}</p>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={close}
                aria-label="Close image viewer"
                className="flex h-11 w-11 items-center justify-center border border-paper/30 text-paper transition-colors hover:bg-paper hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div
              className="relative flex flex-1 items-center justify-center px-4 pb-4 sm:px-16"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                key={current.src}
                initial={reduce ? {} : { opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative h-full w-full"
              >
                <Image
                  src={current.src}
                  alt={current.alt}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  quality={90}
                  priority
                />
              </motion.div>

              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-paper/25 bg-ink/60 text-paper transition-colors hover:bg-paper hover:text-ink sm:left-6"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next image"
                className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-paper/25 bg-ink/60 text-paper transition-colors hover:bg-paper hover:text-ink sm:right-6"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div
              className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="max-w-3xl text-sm leading-relaxed text-paper/70">{current.alt}</p>
              <p className="label-caps shrink-0 text-paper/50 tabular-nums">
                {String((lightbox ?? 0) + 1).padStart(2, "0")} / {String(visible.length).padStart(2, "0")}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
