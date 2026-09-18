import {
  Store,
  ShieldCheck,
  UtensilsCrossed,
  CreditCard,
  ShoppingCart,
  Volleyball,
  SquareParking,
  Sparkles,
  Waves,
  Leaf,
  Utensils,
  Fence,
  Dumbbell,
  type LucideIcon,
} from "lucide-react";
import { AMENITIES } from "@/lib/grand-orchard";
import { SectionHeader } from "./section-header";
import { Reveal } from "./reveal";

const ICONS: Record<string, LucideIcon> = {
  store: Store,
  shield: ShieldCheck,
  foodcourt: UtensilsCrossed,
  card: CreditCard,
  cart: ShoppingCart,
  tennis: Volleyball,
  parking: SquareParking,
  cleaning: Sparkles,
  pool: Waves,
  leaf: Leaf,
  dining: Utensils,
  gate: Fence,
  fitness: Dumbbell,
};

export function Amenities() {
  return (
    <section id="amenities" className="bg-ink text-paper" aria-label="Amenities">
      <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-36">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeader number="02" label="Amenities" lines={["Designed for", "Modern Living."]} />
          <Reveal delay={0.15} className="max-w-sm lg:pb-3 lg:text-right">
            <p className="text-[0.9375rem] leading-relaxed text-paper/60">
              The officially announced amenities of Grand Orchard — planned around
              everyday convenience, wellbeing and security.
            </p>
          </Reveal>
        </div>

        <ul className="mt-14 grid grid-cols-1 gap-px bg-line-dark sm:grid-cols-2 lg:mt-20 lg:grid-cols-3 xl:grid-cols-4">
          {AMENITIES.map((a, i) => {
            const Icon = ICONS[a.icon] ?? Store;
            return (
              <Reveal as="li" key={a.title} delay={0.04 * (i % 8)} className="group bg-ink">
                <div className="flex h-full flex-col gap-5 p-6 transition-colors duration-500 group-hover:bg-ink-soft/40 sm:p-8">
                  <Icon
                    className="h-6 w-6 text-beige transition-transform duration-500 group-hover:-translate-y-1"
                    strokeWidth={1.25}
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="font-display text-xl font-medium leading-snug text-paper sm:text-[1.35rem]">
                      {a.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-paper/55">{a.description}</p>
                  </div>
                  <span
                    aria-hidden="true"
                    className="mt-auto block h-px w-8 bg-wine transition-all duration-500 group-hover:w-full group-hover:bg-wine/80"
                  />
                </div>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
