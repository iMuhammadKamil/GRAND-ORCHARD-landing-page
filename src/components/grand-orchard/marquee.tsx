import Image from "next/image";

const MARQUEE_IMAGES = [
  { src: "/images/hero-elevation.png", alt: "Grand Orchard elevation — front view" },
  { src: "/images/elevation-night.png", alt: "Grand Orchard elevation at night" },
  { src: "/images/ri-1.png", alt: "Indicative residential interior visual" },
  { src: "/images/elevation-dusk.png", alt: "Grand Orchard elevation at dusk" },
  { src: "/images/construction-update.jpg", alt: "Grand Orchard construction update — basement works" },
  { src: "/images/fac-1.png", alt: "Indicative swimming pool visual" },
  { src: "/images/hilton-signing.jpg", alt: "Hilton Garden Inn signing ceremony for Grand Orchard DHA" },
];

/**
 * Infinite horizontal marquee. Pure CSS animation (duplicated track,
 * -50% loop), pauses on hover/focus, disabled under reduced motion.
 */
export function Marquee() {
  return (
    <section aria-label="Grand Orchard in pictures" className="border-y border-line-dark bg-ink-soft/60 py-10 sm:py-12">
      <div
        className="go-marquee relative overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        }}
      >
        <ul className="go-marquee-track flex w-max gap-4 pr-4 motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-4 sm:gap-5 sm:pr-5">
          {[...MARQUEE_IMAGES, ...MARQUEE_IMAGES].map((img, i) => (
            <li
              key={`${img.src}-${i}`}
              aria-hidden={i >= MARQUEE_IMAGES.length}
              className="relative h-44 w-72 shrink-0 overflow-hidden border border-paper/10 sm:h-52 sm:w-85 lg:h-60 lg:w-96"
            >
              <Image
                src={img.src}
                alt={i < MARQUEE_IMAGES.length ? img.alt : ""}
                fill
                sizes="384px"
                className="object-cover"
                quality={75}
                loading="lazy"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
