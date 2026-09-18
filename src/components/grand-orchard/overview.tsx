import Image from "next/image";
import { FACTS, DESCRIPTION_PARAGRAPHS, PROJECT } from "@/lib/grand-orchard";
import { SectionHeader } from "./section-header";
import { Reveal, ImageReveal, ScaleIn } from "./reveal";

export function Overview() {
  return (
    <section id="overview" className="bg-paper text-ink" aria-label="Project overview">
      <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-36">
        <SectionHeader number="01" label="Project Overview" lines={["Grand Orchard", "at DHA Orchard"]} />

        <div className="mt-14 grid grid-cols-1 gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-16">
          {/* Editorial image */}
          <div className="lg:col-span-7">
            <ImageReveal>
              <ScaleIn className="relative aspect-[4/3] overflow-hidden sm:aspect-[16/10]">
                <Image
                  src="/images/elevation-dusk.png"
                  alt={`Grand Orchard elevation at dusk — terraced apartments with landscaped boulevard, ${PROJECT.location}`}
                  fill
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="object-cover"
                  quality={85}
                />
              </ScaleIn>
            </ImageReveal>
            <Reveal delay={0.15}>
              <p className="label-caps mt-4 text-ink/50">
                Orchard Boulevard · DHA Phase I, Islamabad
              </p>
            </Reveal>
          </div>

          {/* Description */}
          <div className="flex flex-col justify-between lg:col-span-5">
            <div className="space-y-6">
              {DESCRIPTION_PARAGRAPHS.map((p) => (
                <Reveal key={p.slice(0, 24)} delay={0.1}>
                  <p className="text-[1.0625rem] leading-relaxed text-ink-soft sm:text-lg">
                    {p}
                  </p>
                </Reveal>
              ))}
            </div>

            {/* Facts grid */}
            <dl className="mt-12 grid grid-cols-1 border-t border-line sm:grid-cols-2">
              {FACTS.map((f, i) => (
                <Reveal
                  key={f.term}
                  delay={0.06 * i}
                  className="border-b border-line py-5 pr-4 sm:odd:border-r sm:odd:pr-8 sm:even:pl-8"
                >
                  <dt className="label-caps text-ink/50">{f.term}</dt>
                  <dd className="mt-2 text-[0.9375rem] font-medium leading-snug text-ink">
                    {f.value}
                  </dd>
                </Reveal>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
