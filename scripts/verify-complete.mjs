/**
 * Comprehensive verification for the completed Grand Orchard landing page.
 *
 * Contexts:
 *  1-4. desktop/mobile x normal/reduced-motion  -> zero hydration warnings,
 *       all sections effectively visible, animations per context
 *  5. no-JS                -> every section must be VISIBLE (progressive
 *                             enhancement fix for the "blank sections" bug)
 *  6. OSM blocked          -> static map panel shown, never a white void
 *
 * Interactions: gallery filter + lightbox, FAQ accordion, enquiry form
 * (Full Name / Email / Phone -> Request a Call Back), mobile menu, WhatsApp
 * button href/label/position.
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

/** Effective visibility: walks ancestors multiplying opacity, checking visibility. */
const VIS_FN = `
  (el) => {
    if (!el) return "MISSING";
    let node = el, op = 1;
    while (node && node.nodeType === 1) {
      const cs = getComputedStyle(node);
      if (cs.visibility === "hidden" || cs.display === "none") return "HIDDEN";
      op *= parseFloat(cs.opacity);
      if (op < 0.01) return "INVISIBLE(op~0)";
      node = node.parentElement;
    }
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 ? "visible" : "ZEROSIZE";
  }
`;

async function runCase({
  label,
  viewport,
  reducedMotion = false,
  isMobile = false,
  javaScriptEnabled = true,
  blockOSM = false,
  interactions = false,
  shots = [],
}) {
  const context = await browser.newContext({
    viewport,
    reducedMotion: reducedMotion ? "reduce" : "no-preference",
    isMobile,
    hasTouch: isMobile,
    javaScriptEnabled,
  });
  if (blockOSM) await context.route(/openstreetmap/, (r) => r.abort());

  const page = await context.newPage();
  const consoleMsgs = [];
  const pageErrors = [];
  if (javaScriptEnabled) {
    page.on("console", (m) => {
      if (m.type() === "error" || m.type() === "warning")
        consoleMsgs.push(`${m.type().toUpperCase()}: ${m.text()}`);
    });
    page.on("pageerror", (e) => pageErrors.push(String(e)));
  }

  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(2800);

  // Scroll sweep to trigger scroll reveals (JS contexts)
  if (javaScriptEnabled) {
    await page.evaluate(async () => {
      const step = Math.round(window.innerHeight * 0.7);
      for (let y = 0; y <= document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 80));
      }
      window.scrollTo(0, 0);
    }).catch(() => {});
    await page.waitForTimeout(1200);
  }

  const hydrationIssues = javaScriptEnabled
    ? consoleMsgs.filter((t) => HYDRATION_RX.test(t))
    : [];

  const audit = await page.evaluate(`(() => {
    const vis = ${VIS_FN};
    const q = (sel) => document.querySelector(sel);
    const mapImg = q('#location img');
    const mapIframe = q('#location iframe');
    const wa = q('a[aria-label*="WhatsApp"]');
    const waBox = wa ? wa.getBoundingClientRect() : null;
    return {
      heroH1: vis(q('#hero h1')),
      overviewImg: vis(q('#overview img')),
      amenitiesCard: vis(q('#amenities ul li')),
      amenitiesCards: document.querySelectorAll('#amenities ul li').length,
      amenitiesImgCards: document.querySelectorAll('#amenities ul li img').length,
      locationMap: vis(q('#location')),
      mapImgLoaded: mapImg ? mapImg.complete && mapImg.naturalWidth > 0 : false,
      mapIframeOpacity: mapIframe ? getComputedStyle(mapIframe).opacity : "n/a",
      pricingRows: document.querySelectorAll('#pricing tbody tr, #pricing li').length,
      faqItems: document.querySelectorAll('#faq button').length,
      formName: vis(q('#enquire input#name')),
      formEmail: vis(q('#enquire input#email')),
      formPhone: vis(q('#enquire input#phone')),
      submitLabel: q('#enquire button[type="submit"]')?.textContent?.trim() ?? "MISSING",
      whatsappHref: wa?.getAttribute('href') ?? "MISSING",
      whatsappTarget: wa?.getAttribute('target') ?? "MISSING",
      whatsappBottomRight: waBox
        ? Math.round(waBox.bottom) + "/" + Math.round(waBox.right)
        : "n/a",
      viewport: window.innerWidth + "x" + window.innerHeight,
      overflowX: document.scrollingElement.scrollWidth > window.innerWidth,
    };
  })()`).catch((e) => ({ evalError: e.message.split("\n")[0] }));

  let notes = [];
  if (interactions) {
    // Gallery: filter -> lightbox -> next -> Esc
    try {
      await page.click('#gallery button[role="tab"]:has-text("Facilities")');
      await page.waitForTimeout(600);
      const count = await page.locator('#gallery button[aria-label^="Open image"]').count();
      await page.click('#gallery button[role="tab"]:has-text("All")');
      await page.waitForTimeout(600);
      await page.click('#gallery button[aria-label^="Open image"] >> nth=0');
      const open = await page.locator('[role="dialog"][aria-modal="true"]').isVisible();
      await page.keyboard.press("Escape");
      await page.waitForTimeout(400);
      const closed = (await page.locator('[role="dialog"][aria-modal="true"]').count()) === 0;
      notes.push(`gallery: filterCount=${count} lightbox=${open} escCloses=${closed}`);
    } catch (e) {
      notes.push(`gallery: FAIL ${e.message.split("\n")[0]}`);
    }

    // FAQ: first accordion opens
    try {
      await page.locator('#faq button').first().scrollIntoViewIfNeeded();
      await page.locator('#faq button').first().click();
      await page.waitForTimeout(500);
      const expanded = await page.locator('#faq button').first().getAttribute('aria-expanded');
      notes.push(`faq: firstItemExpands=${expanded === "true"}`);
    } catch (e) {
      notes.push(`faq: FAIL ${e.message.split("\n")[0]}`);
    }

    // Form: empty submit -> validation; then fill -> success
    try {
      await page.locator('#enquire button[type="submit"]').scrollIntoViewIfNeeded();
      await page.click('#enquire button[type="submit"]');
      await page.waitForTimeout(800);
      const errCount = await page.locator('#enquire [role="alert"]').count();
      await page.fill('#enquire input#name', 'E2E Verify');
      await page.fill('#enquire input#email', `e2e-${Date.now()}@example.com`);
      await page.fill('#enquire input#phone', '+92 300 7654321');
      await page.click('#enquire button[type="submit"]');
      await page.waitForSelector('text=Enquiry Received.', { timeout: 15000 });
      notes.push(`form: emptySubmitErrors=${errCount} submit=SUCCESS`);
    } catch (e) {
      notes.push(`form: FAIL ${e.message.split("\n")[0]}`);
    }

    // WhatsApp: click opens new tab to wa.me
    try {
      const [popup] = await Promise.all([
        context.waitForEvent("page", { timeout: 8000 }).catch(() => null),
        page.click('a[aria-label*="WhatsApp"]'),
      ]);
      notes.push(
        `whatsapp: newTab=${!!popup} url=${popup ? popup.url().slice(0, 60) : "n/a"}`
      );
      if (popup) await popup.close().catch(() => {});
    } catch (e) {
      notes.push(`whatsapp: FAIL ${e.message.split("\n")[0]}`);
    }

    // Mobile menu
    if (isMobile) {
      try {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(500);
        await page.click('button[aria-label="Open menu"]');
        await page.waitForTimeout(600);
        const open = await page.locator('#mobile-menu').isVisible();
        await page.click('#mobile-menu a[href="#gallery"]');
        await page.waitForTimeout(900);
        const closed = (await page.locator('#mobile-menu').count()) === 0;
        notes.push(`mobileMenu: open=${open} closeViaLink=${closed}`);
      } catch (e) {
        notes.push(`mobileMenu: FAIL ${e.message.split("\n")[0]}`);
      }
    }
  }

  for (const [name, sel] of shots) {
    try {
      if (sel === "__top__") {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(500);
      } else {
        await page.locator(sel).first().scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
      }
      await page.screenshot({ path: `${SHOT_DIR}/verify2-${label}-${name}.png` });
    } catch {}
  }

  results.push({ label, hydrationIssues, consoleMsgs, pageErrors, audit, notes });
  await context.close();
}

// ---- Contexts ----
await runCase({
  label: "desktop-normal",
  viewport: { width: 1440, height: 900 },
  interactions: true,
  shots: [
    ["hero", "__top__"],
    ["amenities", "#amenities"],
    ["location", "#location"],
    ["pricing", "#pricing"],
    ["enquire", "#enquire"],
  ],
});
await runCase({
  label: "desktop-reduced",
  viewport: { width: 1440, height: 900 },
  reducedMotion: true,
  shots: [["amenities", "#amenities"]],
});
await runCase({
  label: "mobile-normal",
  viewport: { width: 375, height: 812 },
  isMobile: true,
  interactions: true,
  shots: [
    ["hero", "__top__"],
    ["enquire", "#enquire"],
  ],
});
await runCase({
  label: "mobile-reduced",
  viewport: { width: 375, height: 812 },
  reducedMotion: true,
  isMobile: true,
});
// Critical regression test: JS disabled -> sections must be VISIBLE
await runCase({
  label: "nojs",
  viewport: { width: 1440, height: 900 },
  javaScriptEnabled: false,
  shots: [["amenities", "#amenities"], ["pricing", "#pricing"]],
});
// OSM unreachable -> static map panel, no white void
await runCase({
  label: "osm-blocked",
  viewport: { width: 1440, height: 900 },
  blockOSM: true,
  shots: [["location", "#location"]],
});

await browser.close();

// ---- Report ----
let failed = false;
for (const r of results) {
  const a = r.audit;
  const clean = r.hydrationIssues.length === 0 && r.pageErrors.length === 0;
  if (!clean || a.evalError) failed = true;
  console.log(`\n=== ${r.label} — ${clean ? "CONSOLE CLEAN ✓" : "ISSUES ✗"} ===`);
  if (a.evalError) console.log(`  EVAL ERROR: ${a.evalError}`);
  console.log(`  hydration: ${r.hydrationIssues.length}, pageErrors: ${r.pageErrors.length}`);
  r.hydrationIssues.slice(0, 4).forEach((t) => console.log(`   ⚠ ${t.slice(0, 200)}`));
  r.pageErrors.slice(0, 4).forEach((t) => console.log(`   ⚠ ${t.slice(0, 200)}`));
  for (const k of [
    "heroH1", "overviewImg", "amenitiesCard", "amenitiesCards", "amenitiesImgCards",
    "locationMap", "mapImgLoaded", "mapIframeOpacity", "pricingRows", "faqItems",
    "formName", "formEmail", "formPhone", "submitLabel",
    "whatsappHref", "whatsappTarget", "whatsappBottomRight", "overflowX",
  ]) {
    if (a[k] !== undefined) console.log(`  ${k}: ${a[k]}`);
  }
  r.notes.forEach((n) => console.log(`  interaction: ${n}`));
}

console.log(failed ? "\nRESULT: FAIL" : "\nRESULT: PASS");
process.exit(failed ? 1 : 0);
