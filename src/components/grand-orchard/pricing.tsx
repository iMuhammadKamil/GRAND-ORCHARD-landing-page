import { PRICING, PRICING_GROUPS } from "@/lib/grand-orchard";
import { SectionHeader } from "./section-header";
import { Reveal } from "./reveal";
import { ArrowUpRight } from "lucide-react";

function Price({ value }: { value: string }) {
  return (
    <span className="whitespace-nowrap">
      <span className="text-ink/45">PKR</span>{" "}
      <span className="tabular-nums">{value}</span>
      <span className="text-ink/45"> / SQ.FT</span>
    </span>
  );
}

export function Pricing() {
  return (
    <section id="pricing" className="bg-paper text-ink" aria-label="Official pricing">
      <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-36">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeader number="04" label="Pricing" lines={["Official", "Pricing"]} />
          <Reveal delay={0.15} className="lg:pb-3">
            <p className="label-caps inline-flex items-center gap-3 border border-line bg-cream px-4 py-2.5 text-ink/70">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-wine" />
              Officially Listed Rates
            </p>
          </Reveal>
        </div>

        {/* Desktop table */}
        <Reveal delay={0.1} className="mt-14 hidden lg:mt-20 lg:block">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">
              Officially listed Grand Orchard rates per square foot, by category and floor
            </caption>
            <thead>
              <tr className="border-y border-ink/80">
                <th scope="col" className="label-caps py-4 pr-4 font-medium text-ink/60">
                  Category
                </th>
                <th scope="col" className="label-caps py-4 pr-4 font-medium text-ink/60">
                  Floor
                </th>
                <th scope="col" className="label-caps py-4 text-right font-medium text-ink/60">
                  Price / SQ.FT
                </th>
              </tr>
            </thead>
            <tbody>
              {PRICING.map((row, i) => {
                const newGroup = i === 0 || PRICING[i - 1].category !== row.category;
                return (
                  <tr
                    key={`${row.category}-${row.floor}`}
                    className="border-b border-line transition-colors duration-300 hover:bg-cream"
                  >
                    <td className="py-5 pr-4">
                      {newGroup ? (
                        <span className="font-display text-xl font-medium leading-tight sm:text-2xl">
                          {row.category}
                        </span>
                      ) : (
                        <span className="text-sm text-ink/40" aria-hidden="true">
                          ↳
                        </span>
                      )}
                    </td>
                    <td className="py-5 pr-4 text-[0.9375rem] text-ink-soft">{row.floor}</td>
                    <td className="py-5 text-right text-[1.0625rem] font-semibold">
                      <Price value={row.price} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Reveal>

        {/* Mobile cards */}
        <div className="mt-12 space-y-6 lg:hidden">
          {PRICING_GROUPS.map((group, gi) => (
            <Reveal key={`${group.name}-${group.note}-${gi}`} delay={0.05 * gi}>
              <div className="border border-line bg-cream">
                <div className="border-b border-line px-5 py-4">
                  <h3 className="font-display text-xl font-medium leading-tight">
                    {group.name}
                    {group.note ? (
                      <span className="label-caps ml-2 align-middle text-wine">{group.note}</span>
                    ) : null}
                  </h3>
                </div>
                <ul>
                  {group.rows.map((r) => (
                    <li
                      key={`${group.name}-${group.note}-${r.floor}`}
                      className="flex items-baseline justify-between gap-3 border-b border-line px-5 py-3.5 last:border-b-0"
                    >
                      <span className="text-sm text-ink-soft">{r.floor}</span>
                      <span className="text-right text-sm font-semibold">
                        <Price value={r.price} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <p className="mt-8 max-w-2xl text-sm leading-relaxed text-ink/55">
            These are officially listed rates for Grand Orchard and do not constitute a
            market valuation. Unit availability changes over time — contact our team for
            current availability.
          </p>
        </Reveal>

        {/* Payment plan CTA */}
        <Reveal delay={0.15}>
          <div className="mt-14 flex flex-col items-start justify-between gap-8 border border-line bg-ink px-7 py-10 text-paper sm:px-10 lg:mt-20 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <p className="label-caps text-beige">Payment Plan</p>
              <h3 className="font-display mt-4 text-3xl font-medium leading-tight sm:text-4xl">
                Request the Official Payment Plan
              </h3>
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-paper/65">
                Contact our team for the latest payment plan, availability, and booking
                information.
              </p>
            </div>
            <a
              href="#enquire"
              className="label-caps group inline-flex shrink-0 items-center gap-2.5 bg-paper px-7 py-4 text-ink transition-colors duration-300 hover:bg-beige"
            >
              Request Details
              <ArrowUpRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
