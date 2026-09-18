"use client";

import { NAV_LINKS, PROJECT } from "@/lib/grand-orchard";
import { useReducedMotion } from "framer-motion";

export function Footer() {
  const reduce = useReducedMotion();
  const year = new Date().getFullYear();

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", href);
  };

  const links = [...NAV_LINKS, { label: "Enquire", href: "#enquire" }] as const;

  return (
    <footer className="mt-auto border-t border-line-dark bg-ink text-paper" role="contentinfo">
      <div className="mx-auto max-w-[1440px] px-5 pb-8 pt-16 sm:px-8 lg:px-12 lg:pt-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          {/* Brand + address */}
          <div className="md:col-span-5">
            <p className="font-display text-3xl font-semibold tracking-[0.06em] sm:text-4xl">
              GRAND ORCHARD
            </p>
            <p className="label-caps mt-3 text-paper/50">
              by {PROJECT.developer}
            </p>
            <address className="mt-8 text-[0.9375rem] not-italic leading-relaxed text-paper/65">
              DHA Orchard
              <br />
              DHA Phase I
              <br />
              Islamabad
            </address>
            <p className="mt-4 text-sm leading-relaxed text-paper/45">{PROJECT.address}</p>
          </div>

          {/* Links */}
          <nav className="md:col-span-4" aria-label="Footer">
            <p className="label-caps text-paper/50">Explore</p>
            <ul className="mt-5 grid grid-cols-2 gap-x-6">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={(e) => handleNav(e, l.href)}
                    className="inline-block py-2 text-[0.9375rem] text-paper/75 transition-colors hover:text-paper"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Status */}
          <div className="md:col-span-3">
            <p className="label-caps text-paper/50">Project Status</p>
            <p className="mt-5 inline-flex items-center gap-2.5 border border-paper/25 px-4 py-2.5 text-sm text-paper/80">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-beige" />
              {PROJECT.status}
            </p>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-paper/45">
              Commercial &amp; Residential · {PROJECT.area} project area ·{" "}
              {PROJECT.structure}
            </p>
          </div>
        </div>

        {/* Base line */}
        <div className="mt-14 flex flex-col gap-3 border-t border-line-dark pt-6 text-xs text-paper/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {PROJECT.name} · {PROJECT.developer}. All rights reserved.</p>
          <p>Official information only. Visuals marked “Indicative” are illustrative renders.</p>
        </div>
      </div>
    </footer>
  );
}
