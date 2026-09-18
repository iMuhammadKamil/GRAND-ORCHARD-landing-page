/**
 * Grand Orchard — FULL PAGE AUDIT (read-only, before any fix)
 *
 * 1. TEXT CONTRAST: walks every element with direct text nodes, computes the
 *    effective text color (incl. ancestor opacity compositing) vs the
 *    effective background (alpha-composited ancestor stack), and reports the
 *    WCAG contrast ratio. Flags < 4.5 (normal) / < 3.0 (large text).
 * 2. IMAGES: every <img> must have naturalWidth > 0; failed image network
 *    responses logged.
 * 3. Screenshots of key sections for visual confirmation.
 */
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("/home/z/.npm-global/lib/node_modules/playwright");

const URL = "http://localhost:3000";

async function audit(page) {
  return page.evaluate(() => {
    // ---- WCAG contrast helpers ----
    const srgbToLinear = (c) => {
      c /= 255;
      return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    const lum = ([r, g, b]) =>
      0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
    const contrast = (fg, bg) => {
      const [l1, l2] = [lum(fg), lum(bg)].sort((a, b) => b - a);
      return (l1 + 0.05) / (l2 + 0.05);
    };
    const parseColor = (str) => {
      const m = String(str).match(
        /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/
      );
      if (!m) return null;
      return [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]];
    };
    const composite = (top, bottom) => {
      const a = top[3] + bottom[3] * (1 - top[3]);
      if (a === 0) return [0, 0, 0, 0];
      return [0, 1, 2]
        .map((i) => (top[i] * top[3] + bottom[i] * bottom[3] * (1 - top[3])) / a)
        .concat([a]);
    };

    const results = { contrastFails: [], contrastWarns: [], images: [] };
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const seen = new Set();
    let node;
    while ((node = walker.nextNode())) {
      const text = node.textContent.trim();
      if (!text) continue;
      const el = node.parentElement;
      if (!el || seen.has(el)) continue;
      seen.add(el);
      const st = getComputedStyle(el);
      if (st.display === "none" || st.visibility === "hidden") continue;
      // skip non-rendered subtrees (e.g. mobile-only cards inside lg:hidden)
      if (el.getClientRects().length === 0) continue;

      // effective text color (composite ancestor opacity into alpha)
      let color = parseColor(st.color);
      if (!color) continue;
      let op = 1;
      let p = el;
      while (p && p !== document.body) {
        op *= parseFloat(getComputedStyle(p).opacity || "1");
        p = p.parentElement;
      }
      color[3] *= op;
      // blend text alpha onto white for a conservative fg estimate
      const fgSolid = color[3] >= 0.99 ? color.slice(0, 3) : composite(color, [255, 255, 255, 1]).slice(0, 3);

      // effective background: alpha-composited ancestor stack down to body
      const stack = [];
      let opaque = false;
      let bgImageEl = null;
      p = el;
      while (p) {
        const s = getComputedStyle(p);
        if (s.backgroundImage !== "none" && !bgImageEl) bgImageEl = p;
        const c = parseColor(s.backgroundColor);
        if (c && c[3] > 0) {
          stack.push(c);
          if (c[3] >= 1) {
            opaque = true;
            break;
          }
        }
        p = p.parentElement;
      }
      const base =
        parseColor(getComputedStyle(document.body).backgroundColor) || [244, 241, 234, 1];
      let eff = base;
      for (let i = stack.length - 1; i >= 0; i--) eff = composite(stack[i], eff);

      const ratio = contrast(fgSolid, eff.slice(0, 3));
      const fs = parseFloat(st.fontSize);
      const fw = parseInt(st.fontWeight) >= 600;
      const large = fs >= 24 || (fs >= 18.66 && fw);
      const entry = {
        text: text.slice(0, 60),
        color: st.color,
        bg: `rgb(${eff.slice(0, 3).map(Math.round).join(",")})`,
        ratio: Math.round(ratio * 100) / 100,
        fs: Math.round(fs * 10) / 10,
        section:
          el.closest("section,footer")?.getAttribute("aria-label") ||
          el.closest("header")?.getAttribute("aria-label") ||
          "page",
        overImage: !!bgImageEl,
      };
      if (ratio < (large ? 3 : 4.5)) results.contrastFails.push(entry);
      else if (ratio < 4.5 && !large && !entry.overImage) results.contrastWarns.push(entry);
    }

    document.querySelectorAll("img").forEach((img) => {
      results.images.push({
        src: (img.currentSrc || img.src || "").split("/").pop().split("?")[0],
        alt: (img.alt || "").slice(0, 60),
        ok: img.complete && img.naturalWidth > 0,
        inAmenities: !!img.closest("#amenities"),
      });
    });
    return results;
  });
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const failedRequests = [];
  page.on("response", (res) => {
    if (res.status() >= 400) failedRequests.push(`${res.status()} ${res.url()}`);
  });
  const consoleIssues = [];
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning")
      consoleIssues.push(`${m.type()}: ${m.text().slice(0, 150)}`);
  });

  await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1500);

  // scroll through entire page (twice) to trigger whileInView + lazy images
  for (const step of [500, 400]) {
    await page.evaluate(async (s) => {
      const h = document.body.scrollHeight;
      for (let y = 0; y <= h; y += s) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 50));
      }
    }, step);
    await page.waitForTimeout(1500);
  }
  // settle pass: visit every section, wait for its reveal animations to finish
  for (const sel of ["#overview", "#amenities", "#location", "#pricing", "#gallery", "#faq", "#enquire"]) {
    await page.evaluate((s) => document.querySelector(s)?.scrollIntoView({ block: "start" }), sel);
    await page.waitForTimeout(1800);
  }
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1000);

  const res = await audit(page);

  console.log("=== CONTRAST FAILS (unreadable) ===");
  res.contrastFails.forEach((f) =>
    console.log(
      `[${f.section}] ratio=${f.ratio} fs=${f.fs} ${f.color} on ${f.bg}${f.overImage ? " (over image)" : ""} :: "${f.text}"`
    )
  );
  console.log(`Total fails: ${res.contrastFails.length}\n`);

  console.log("=== LOW-CONTRAST WARNS (muted text, review) ===");
  res.contrastWarns.forEach((f) =>
    console.log(
      `[${f.section}] ratio=${f.ratio} fs=${f.fs} ${f.color} on ${f.bg} :: "${f.text}"`
    )
  );
  console.log(`Total warns: ${res.contrastWarns.length}\n`);

  console.log(`=== IMAGES (${res.images.length}) ===`);
  res.images.forEach((i) =>
    console.log(`${i.ok ? "OK     " : "BROKEN "} ${i.inAmenities ? "[AMENITY] " : ""}${i.src} :: ${i.alt}`)
  );

  console.log(`\n=== FAILED REQUESTS (${failedRequests.length}) ===`);
  failedRequests.slice(0, 20).forEach((r) => console.log(r));
  console.log(`\n=== CONSOLE (${consoleIssues.length}) ===`);
  consoleIssues.slice(0, 20).forEach((c) => console.log(c));

  // section screenshots
  for (const [name, sel] of [
    ["location", "#location"],
    ["amenities", "#amenities"],
    ["overview", "#overview"],
    ["pricing", "#pricing"],
    ["faq", "#faq"],
  ]) {
    const el = await page.$(sel);
    if (el) {
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1400);
      await el
        .screenshot({ path: `/home/z/my-project/scripts/audit-${name}.png` })
        .catch(() => {});
    }
  }

  await browser.close();
  console.log("\nAUDIT DONE");
})();
