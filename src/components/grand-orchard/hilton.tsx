import Image from "next/image";
import { Reveal, ImageReveal, ScaleIn } from "./reveal";

/**
 * Hilton Garden Inn — announced for Grand Orchard Tower A.
 * Wording is deliberately careful: the hotel is SCHEDULED, not operational.
 * No opening dates, floors, pricing or facilities are stated anywhere.
 */
export function Hilton() {
  return (
    <section className="bg-ink text-paper" aria-label="Hilton Garden Inn at Grand Orchard">
      <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-32">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="overline-rule text-paper/60">Hospitality</p>
              <h2 className="font-display mt-6 text-[2.25rem] font-medium leading-[1.06] sm:text-5xl lg:text-[3.5rem]">
                Hilton Garden Inn
                <br />
                <em className="font-light italic text-beige">at Tower A.</em>
              </h2>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-8 max-w-lg text-[1.0625rem] leading-relaxed text-paper/70">
                Hilton Garden Inn is scheduled to be located in Grand Orchard Tower A.
              </p>
              <p className="mt-5 max-w-lg text-sm leading-relaxed text-paper/50">
                For further details about the hotel, contact our team.
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <ImageReveal>
              <ScaleIn className="relative aspect-[3/2] overflow-hidden">
                <Image
                  src="/images/hilton-signing.jpg"
                  alt="Signing ceremony between Premier Choice and Hilton Garden Inn for Grand Orchard DHA"
                  fill
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="object-cover"
                  quality={85}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
              </ScaleIn>
            </ImageReveal>
            <Reveal delay={0.2}>
              <p className="label-caps mt-4 text-paper/50">
                Premier Choice × Hilton Garden Inn — Signing Ceremony · Grand Orchard DHA
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
