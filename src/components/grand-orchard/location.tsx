import { ArrowUpRight, ExternalLink } from "lucide-react";
import { MAP, PROJECT } from "@/lib/grand-orchard";
import { SectionHeader } from "./section-header";
import { Reveal, ImageReveal } from "./reveal";
import { MapPanel } from "./map-panel";

export function Location() {
  return (
    <>
      {/* 03 — LOCATION */}
      <section id="location" className="bg-paper text-ink" aria-label="Location">
        <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-36">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <SectionHeader
                number="03"
                label="Location"
                lines={["Connected to", "the Right Address."]}
                tone="dark"
              />

              <Reveal delay={0.15}>
                <address className="mt-10 not-italic">
                  <p className="font-display text-2xl font-medium leading-snug sm:text-3xl">
                    Grand Orchard
                    <br />
                    DHA Orchard
                    <br />
                    DHA Phase I
                    <br />
                    Islamabad
                  </p>
                  <p className="mt-5 max-w-md text-[0.9375rem] leading-relaxed text-ink-soft">
                    {PROJECT.address}
                  </p>
                </address>
              </Reveal>

              <Reveal delay={0.25}>
                <div className="mt-10 border-l-2 border-wine bg-cream p-6 sm:p-7">
                  <p className="label-caps text-wine">Official Location Statement</p>
                  <p className="mt-3 text-[1.0625rem] leading-relaxed text-ink">
                    Approximately a one-minute drive from GT Road and Fauji Foundation,
                    at the newest commercial hub of the Twin Cities.
                  </p>
                </div>
              </Reveal>
            </div>

            {/* Map panel */}
            <div className="lg:col-span-6">
              <div className="flex h-full flex-col">
                <ImageReveal className="flex-1">
                  <MapPanel />
                </ImageReveal>
                <Reveal delay={0.2}>
                  <a
                    href={MAP.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="label-caps group mt-4 inline-flex items-center gap-2 text-ink/70 transition-colors hover:text-wine"
                  >
                    Open in OpenStreetMap
                    <ExternalLink
                      className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5"
                      aria-hidden="true"
                    />
                  </a>
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/** Editorial strip explaining the commercial + residential mix. */
export function ResidentialCommercial() {
  return (
    <section className="bg-cream text-ink" aria-label="Residential and commercial mix">
      <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-32">
        <Reveal>
          <p className="overline-rule text-ink/60">The Project</p>
          <h2 className="font-display mt-6 max-w-3xl text-[2.25rem] font-medium leading-[1.06] sm:text-5xl lg:text-[3.5rem]">
            Commercial &amp; Residential,
            <em className="font-light italic text-wine"> one composition.</em>
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-px border border-line bg-line md:grid-cols-2 lg:mt-20">
          {/* Residential */}
          <Reveal className="bg-cream">
            <article className="flex h-full flex-col p-7 sm:p-10">
              <p className="label-caps text-wine">Residential</p>
              <ul className="mt-6 space-y-4">
                {["Open-plan apartments", "Terrace views", "Modern vertical living"].map((item) => (
                  <li
                    key={item}
                    className="flex items-baseline gap-4 border-b border-line pb-4 text-lg font-medium sm:text-xl"
                  >
                    <span aria-hidden="true" className="h-px w-6 shrink-0 translate-y-[-4px] bg-wine" />
                    {item}
                  </li>
                ))}
              </ul>
              <dl className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="bg-paper p-5">
                  <dt className="label-caps text-ink/50">Apartment Size</dt>
                  <dd className="mt-2 text-sm font-semibold text-ink">
                    516.23 <span aria-hidden="true">—</span> 4,191.9 SQ.FT
                  </dd>
                </div>
                <div className="bg-paper p-5">
                  <dt className="label-caps text-ink/50">Official Views</dt>
                  <dd className="mt-2 text-sm font-semibold text-ink">
                    Hill · Valley · River · Pool
                  </dd>
                </div>
              </dl>
            </article>
          </Reveal>

          {/* Commercial */}
          <Reveal delay={0.12} className="bg-cream">
            <article className="flex h-full flex-col p-7 sm:p-10">
              <p className="label-caps text-wine">Commercial</p>
              <ul className="mt-6 space-y-4">
                <li className="flex items-baseline gap-4 border-b border-line pb-4 text-lg font-medium sm:text-xl">
                  <span aria-hidden="true" className="h-px w-6 shrink-0 translate-y-[-4px] bg-wine" />
                  4 Commercial Floors
                </li>
                <li className="flex items-baseline gap-4 border-b border-line pb-4 text-lg font-medium sm:text-xl">
                  <span aria-hidden="true" className="h-px w-6 shrink-0 translate-y-[-4px] bg-wine" />
                  Retail podium within the development
                </li>
                <li className="flex items-baseline gap-4 border-b border-line pb-4 text-lg font-medium sm:text-xl">
                  <span aria-hidden="true" className="h-px w-6 shrink-0 translate-y-[-4px] bg-wine" />
                  4 Basement Parking Floors — Grade AAA
                </li>
              </ul>
              <dl className="mt-8">
                <div className="bg-paper p-5">
                  <dt className="label-caps text-ink/50">Commercial Unit Size</dt>
                  <dd className="mt-2 text-sm font-semibold text-ink">
                    88 <span aria-hidden="true">—</span> 517 SQ.FT
                  </dd>
                </div>
              </dl>
            </article>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <a
            href="#pricing"
            className="label-caps group mt-10 inline-flex items-center gap-2 text-ink transition-colors hover:text-wine"
          >
            View Official Pricing
            <ArrowUpRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
