"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQS } from "@/lib/grand-orchard";
import { SectionHeader } from "./section-header";
import { Reveal } from "./reveal";

export function Faq() {
  return (
    <section id="faq" className="bg-paper text-ink" aria-label="Frequently asked questions">
      <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-36">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeader
              number="06"
              label="FAQ"
              lines={["Questions,", "Answered Simply."]}
            />
            <Reveal delay={0.15}>
              <p className="mt-8 max-w-md text-[0.9375rem] leading-relaxed text-ink-soft">
                Every answer below reflects only officially published Grand Orchard
                information. For anything not published here, our team is one enquiry away.
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal delay={0.1}>
              <Accordion type="single" collapsible className="border-t border-line">
                {FAQS.map((f, i) => (
                  <AccordionItem key={f.q} value={`q-${i}`} className="border-b border-line">
                    <AccordionTrigger className="py-6 text-left font-display text-xl font-medium hover:no-underline hover:text-wine sm:text-[1.35rem] [&>svg]:text-ink/40">
                      <span className="flex items-baseline gap-4">
                        <span
                          className="label-caps shrink-0 text-wine/70 tabular-nums"
                          aria-hidden="true"
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {f.q}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pl-0 text-[0.9375rem] leading-relaxed text-ink-soft sm:pl-10">
                      {f.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
