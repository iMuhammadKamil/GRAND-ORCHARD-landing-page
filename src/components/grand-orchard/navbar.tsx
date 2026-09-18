"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { NAV_LINKS } from "@/lib/grand-orchard";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Highlight section in view
  useEffect(() => {
    const ids = NAV_LINKS.map((l) => l.href.slice(1));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(`#${e.target.id}`);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const close = useCallback(() => setOpen(false), []);

  const handleNav = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault();
      close();
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({
          behavior: reduce ? "auto" : "smooth",
          block: "start",
        });
        history.replaceState(null, "", href);
      }
    },
    [close, reduce]
  );

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-line-dark bg-ink/90 backdrop-blur-md supports-[backdrop-filter]:bg-ink/75"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 sm:h-[4.5rem] sm:px-8 lg:px-12"
      >
        {/* Wordmark */}
        <a
          href="#hero"
          onClick={(e) => handleNav(e, "#hero")}
          className="group flex flex-col leading-none text-paper"
          aria-label="Grand Orchard — back to top"
        >
          <span className="font-display text-[1.35rem] font-semibold tracking-[0.08em] sm:text-2xl">
            GRAND ORCHARD
          </span>
          <span className="label-caps mt-1 text-[0.5rem] text-paper/60 transition-colors group-hover:text-paper/85 sm:text-[0.5625rem]">
            Premier Choice International
          </span>
        </a>

        {/* Desktop links */}
        <ul className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={(e) => handleNav(e, link.href)}
                aria-current={active === link.href ? "true" : undefined}
                className={cn(
                  "label-caps relative py-2 text-paper/75 transition-colors duration-300 hover:text-paper",
                  active === link.href && "text-paper"
                )}
              >
                {link.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute -bottom-0.5 left-0 h-px bg-paper transition-all duration-300",
                    active === link.href ? "w-full" : "w-0"
                  )}
                />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          {/* Desktop CTA */}
          <a
            href="#enquire"
            onClick={(e) => handleNav(e, "#enquire")}
            className="label-caps group hidden items-center gap-2 border border-paper/40 px-5 py-2.5 text-paper transition-all duration-300 hover:border-paper hover:bg-paper hover:text-ink sm:inline-flex"
          >
            Enquire Now
            <ArrowUpRight
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </a>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex h-11 w-11 items-center justify-center border border-paper/30 text-paper transition-colors hover:bg-paper/10 lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 1 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 top-16 z-40 flex flex-col overflow-y-auto border-t border-line-dark bg-ink lg:hidden"
          >
            <ul className="flex flex-col px-6 pt-6">
              {NAV_LINKS.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={reduce ? {} : { opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.35 }}
                  className="border-b border-line-dark"
                >
                  <a
                    href={link.href}
                    onClick={(e) => handleNav(e, link.href)}
                    className="font-display flex items-center justify-between py-5 text-3xl text-paper"
                  >
                    {link.label}
                    <span className="label-caps text-paper/40 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </a>
                </motion.li>
              ))}
            </ul>
            <div className="px-6 pb-10 pt-8">
              <a
                href="#enquire"
                onClick={(e) => handleNav(e, "#enquire")}
                className="label-caps flex w-full items-center justify-center gap-2 bg-paper px-6 py-4 text-ink"
              >
                Enquire Now
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <p className="mt-6 text-center text-xs leading-relaxed text-paper/50">
                DHA Orchard, DHA Phase I, Islamabad
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
