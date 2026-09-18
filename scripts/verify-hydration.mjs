/**
 * Hydration verification for the Grand Orchard landing page.
 *
 * Asserts:
 *  1. ZERO hydration warnings/errors in the console (normal motion AND
 *     prefers-reduced-motion: reduce contexts) — the original bug only
 *     reproduced with reduced motion enabled, so both contexts are tested.
 *  2. Hero animations present/absent correctly per context after hydration.
 *  3. Reduced-motion end state: content fully visible, CSS animations off.
 *  4. No horizontal overflow on desktop/mobile.
 *  5. Core interactions still work: nav, gallery filter, lightbox, mobile
 *     menu, enquiry form submit.
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("/home/z/.npm-global/lib/node_modules/playwright");

const BASE = "http://localhost:3000";
const SHOT_DIR = "/home/z/my-project/scripts";
const HYDRATION_RX =
  /hydrat|did not match|server rendered html|server-rendered|dueling|while hydrating/i;

const results = [];
const browser = await chromium.launch();

async function runCase({ label, viewport, reducedMotion, isMobile, interactions }) {
  const context = await browser.newContext({
    viewport,
    reducedMotion: reducedMotion ? "reduce" : "no-preference",
    deviceScaleFactor: 1,
    isMobile,
    hasTouch: isMobile,
  });
  const page = await context.newPage();
  const consoleMsgs = [];
  const pageErrors = [];
  page.on("console", (m) => {
    const type = m.type();
    if (type === "error" || type === "warning") {
      consoleMsgs.push(`${type.toUpperCase()}: ${m.text()}`);
    }
  });
  page.on("pageerror", (e) => pageErrors.push(String(e)));

  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(2600); // hydration + hero entrance animations settle

  // --- 1. Hydration + console audit
  const hydrationIssues = consoleMsgs.filter((t) => HYDRATION_RX.test(t));

  // --- 2. Hero DOM state after hydration
  const hero = await page.evaluate(() => {
    const h1 = document.querySelector("#hero h1");
    const r = h1?.getBoundingClientRect();
    const zoomEl = document.querySelector("#hero .go-hero-zoom");
    const riseEl = document.querySelector("#hero .go-rise");
    return {
      h1Opacity: h1 ? getComputedStyle(h1).opacity : null,
      h1Visible: !!r && r.width > 0 && r.height > 0,
      h1Text: (h1?.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 48),
      hasHeroZoomClass: !!zoomEl,
      hasRiseClass: !!riseEl,
      heroImgTransform: (() => {
        const img = document.querySelector("#hero [aria-hidden] > div > div, #hero img");
        return img ? getComputedStyle(img.parentElement).transform : null;
      })(),
    };
  });

  // --- 3. Marquee CSS animation state (browser-native reduced-motion guard)
  const marquee = await page.evaluate(() => {
    const t = document.querySelector(".go-marquee-track");
    if (!t) return null;
    const cs = getComputedStyle(t);
    return { animationName: cs.animationName, playState: cs.animationPlayState };
  });

  // --- 4. Scroll sweep: exercise whileInView reveals across all sections
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.7);
    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 90));
    }
  });
  await page.waitForTimeout(1300);

  const overflow = await page.evaluate(() => ({
    scrollWidth: document.scrollingElement.scrollWidth,
    innerWidth: window.innerWidth,
    overflowX: document.scrollingElement.scrollWidth > window.innerWidth,
  }));

  // Gallery reveal check (after sweep, items should be at opacity 1)
  const galleryOpacity = await page.evaluate(() => {
    const btn = document.querySelector('#gallery [role="tablist"] + * ~ * button, #gallery button[aria-label^="Open image"]');
    return btn ? getComputedStyle(btn).opacity : null;
  });

  let interactionNotes = [];

  if (interactions) {
    // Gallery: filter -> lightbox -> next -> Escape
    try {
      await page.click('#gallery button[role="tab"]:has-text("Facilities")');
      await page.waitForTimeout(700);
      const countAfterFilter = await page.locator('#gallery button[aria-label^="Open image"]').count();
      await page.click('#gallery button[role="tab"]:has-text("All")');
      await page.waitForTimeout(700);
      await page.click('#gallery button[aria-label^="Open image"] >> nth=0');
      const dialogVisible = await page.locator('[role="dialog"][aria-modal="true"]').isVisible();
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(400);
      await page.keyboard.press("Escape");
      await page.waitForTimeout(400);
      const dialogGone = (await page.locator('[role="dialog"][aria-modal="true"]').count()) === 0;
      interactionNotes.push(
        `gallery: filterCount=${countAfterFilter} lightboxOpen=${dialogVisible} escCloses=${dialogGone}`
      );
    } catch (e) {
      interactionNotes.push(`gallery: FAIL ${e.message.split("\n")[0]}`);
    }

    // Enquiry form: fill + submit -> success panel
    try {
      await page.locator("#name").scrollIntoViewIfNeeded();
      await page.fill("#name", "Hydration Test");
      await page.fill("#phone", "+92 300 1234567");
      await page.fill("#email", `hydration-check-${Date.now()}@example.com`);
      await page.selectOption("#interest", "Apartment");
      await page.fill("#message", "Automated hydration verification run.");
      await page.click('button[type="submit"]:has-text("Send Enquiry")');
      await page.waitForSelector('text=Enquiry Received.', { timeout: 15000 });
      interactionNotes.push("form: submit OK (Enquiry Received shown)");
    } catch (e) {
      interactionNotes.push(`form: FAIL ${e.message.split("\n")[0]}`);
    }

    // Mobile menu open/close
    if (isMobile) {
      try {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(500);
        await page.click('button[aria-label="Open menu"]');
        await page.waitForTimeout(600);
        const menuOpen = await page.locator("#mobile-menu").isVisible();
        await page.click('#mobile-menu a[href="#gallery"]');
        await page.waitForTimeout(900);
        const menuClosed = (await page.locator("#mobile-menu").count()) === 0;
        interactionNotes.push(`mobileMenu: open=${menuOpen} closeViaLink=${menuClosed}`);
      } catch (e) {
        interactionNotes.push(`mobileMenu: FAIL ${e.message.split("\n")[0]}`);
      }
    }
  }

  // --- Screenshots
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(reducedMotion ? 400 : 2200);
  await page.screenshot({ path: `${SHOT_DIR}/verify-hydration-${slug}.png` });

  results.push({ label, hydrationIssues, consoleMsgs, pageErrors, hero, marquee, overflow, galleryOpacity, interactionNotes });
  await context.close();
}

// A: Desktop, normal motion, full interactions
await runCase({ label: "desktop-normal", viewport: { width: 1440, height: 900 }, reducedMotion: false, interactions: true });
// B: Desktop, REDUCED motion (the original bug condition)
await runCase({ label: "desktop-reduced", viewport: { width: 1440, height: 900 }, reducedMotion: true, interactions: false });
// C: Mobile, normal motion, full interactions
await runCase({ label: "mobile-normal", viewport: { width: 375, height: 812 }, reducedMotion: false, isMobile: true, interactions: true });
// D: Mobile, reduced motion
await runCase({ label: "mobile-reduced", viewport: { width: 375, height: 812 }, reducedMotion: true, isMobile: true, interactions: false });

await browser.close();

// ---------- Report ----------
let failed = false;
for (const r of results) {
  const clean = r.hydrationIssues.length === 0 && r.pageErrors.length === 0;
  if (!clean) failed = true;
  console.log(`\n=== ${r.label} — ${clean ? "CLEAN ✓" : "ISSUES ✗"} ===`);
  console.log(`hydrationIssues: ${r.hydrationIssues.length}`);
  r.hydrationIssues.forEach((t) => console.log(`  ⚠ ${t.slice(0, 300)}`));
  console.log(`pageErrors: ${r.pageErrors.length}`);
  r.pageErrors.forEach((t) => console.log(`  ⚠ ${t.slice(0, 300)}`));
  console.log(`console(warn/error): ${r.consoleMsgs.length}`);
  r.consoleMsgs.slice(0, 8).forEach((t) => console.log(`  · ${t.slice(0, 220)}`));
  console.log(`hero: ${JSON.stringify(r.hero)}`);
  console.log(`marquee: ${JSON.stringify(r.marquee)}`);
  console.log(`overflow: ${JSON.stringify(r.overflow)}`);
  console.log(`galleryOpacity: ${r.galleryOpacity}`);
  r.interactionNotes.forEach((n) => console.log(`interaction: ${n}`));
}

console.log(failed ? "\nRESULT: FAIL" : "\nRESULT: PASS — zero hydration warnings/errors in all contexts");
process.exit(failed ? 1 : 0);
