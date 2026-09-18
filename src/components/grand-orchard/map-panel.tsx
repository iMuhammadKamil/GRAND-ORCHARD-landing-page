"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { MAP } from "@/lib/grand-orchard";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Location map panel.
 *
 * The self-hosted static map (stitched from OpenStreetMap tiles for the
 * project bbox) is always rendered as the base layer, so the panel never
 * shows an empty white box — not without JavaScript, and not when the
 * OpenStreetMap embed is unreachable (blocked network, sandboxed preview,
 * tile outages). The live interactive embed fades in on top only once a
 * reachability probe confirms it can load. Same panel design in all cases.
 */
export function MapPanel() {
  const [live, setLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // no-cors: resolves (opaque) when the host is reachable, rejects on
        // network/DNS failure — enough to decide whether the embed will load.
        await fetch(MAP.embedUrl, {
          mode: "no-cors",
          signal: AbortSignal.timeout(6000),
        });
        if (!cancelled) setLive(true);
      } catch {
        // Embed unreachable — keep the static map.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative h-full min-h-[320px] overflow-hidden border border-line bg-cream sm:min-h-[420px]">
      {/* Static base map — self-hosted, always visible */}
      <Image
        src="/images/map-dha.jpg"
        alt="Map of DHA Orchard, DHA Phase I, Islamabad — Grand Orchard location on Main Link Road"
        fill
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-cover grayscale-[35%] contrast-[1.02]"
        quality={80}
      />

      {/* Live OpenStreetMap embed — shown only when reachable */}
      <iframe
        title="OpenStreetMap — DHA Phase I, Islamabad, near Grand Orchard"
        src={MAP.embedUrl}
        loading="eager"
        referrerPolicy="no-referrer-when-downgrade"
        className={cn(
          "absolute inset-0 h-full w-full grayscale-[35%] contrast-[1.02] transition-opacity duration-700",
          live ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Attribution (OSM tile policy) */}
      <p className="pointer-events-none absolute right-3 top-3 z-10 border border-line bg-paper/90 px-2 py-1 text-[0.5625rem] tracking-wide text-ink/50">
        © OpenStreetMap contributors
      </p>

      {/* Address plate */}
      <div className="pointer-events-none absolute bottom-4 left-4 right-4 z-10 sm:right-auto sm:max-w-xs">
        <div className="pointer-events-auto border border-line bg-paper/95 p-4 backdrop-blur-sm sm:p-5">
          <p className="label-caps flex items-center gap-2 text-wine">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            Find Grand Orchard
          </p>
          <p className="mt-2 text-sm font-medium leading-snug text-ink">
            Grand Orchard — DHA Phase I
            <br />
            Islamabad, Pakistan
          </p>
        </div>
      </div>
    </div>
  );
}
