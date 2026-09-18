"use client";

import { useEffect, useLayoutEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * useLayoutEffect on the client (runs synchronously after the hydration
 * commit, BEFORE the browser paints, so a reduced-motion preference is applied
 * without any flash of animated state) and useEffect on the server
 * (useLayoutEffect is a client-only primitive and would trigger React's
 * "useLayoutEffect does nothing on the server" warning during SSR).
 */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Hydration-safe `prefers-reduced-motion` detection.
 *
 * Why not framer-motion's `useReducedMotion()`:
 * It initializes its state from a module-global (`prefersReducedMotion`) that
 * is populated by a synchronous `window.matchMedia(...)` read during the first
 * client render. On the server that global stays `null`, so SSR renders with
 * "animations enabled" while the first client render of a visitor with reduced
 * motion enabled renders with "animations disabled" — a guaranteed hydration
 * mismatch (different classNames, and different inline
 * opacity/transform/clip-path initial styles) on every component that branches
 * on the value.
 *
 * Contract of this hook:
 *  1. SSR AND the first client render always return `false` — a stable,
 *     browser-independent value — so the server HTML and the first client
 *     HTML are identical and hydration succeeds.
 *  2. The real browser preference is read inside an effect (after hydration)
 *     and applied synchronously before paint via the isomorphic layout
 *     effect. For reduced-motion visitors the animated markup is then swapped
 *     for static markup — the same end state as before, without the mismatch.
 *  3. A media-query `change` listener keeps the value live (covers the user
 *     toggling the OS/browser reduced-motion setting mid-session), preserving
 *     the existing accessibility behavior.
 */
export function usePrefersReducedMotion(): boolean {
  // Stable initial value: identical on the server and on the client.
  const [reduce, setReduce] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const mq = window.matchMedia(QUERY);
    const update = () => setReduce(mq.matches);
    // Sync with the real preference now that hydration is complete. When the
    // value is unchanged this is a no-op (React bails out of the re-render).
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduce;
}
