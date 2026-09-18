import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("/home/z/.npm-global/lib/node_modules/playwright");

const BASE = "http://localhost:3000";
const browser = await chromium.launch();

async function probe(label, { javaScriptEnabled = true, blockOSM = false }) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    javaScriptEnabled,
  });
  if (blockOSM) {
    await context.route(/openstreetmap/, (r) => r.abort());
  }
  const page = await context.newPage();
  try {
    await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 30000 });
  } catch (e) {
    console.log(`${label}: goto issue ${e.message.split("\n")[0]}`);
  }
  await page.waitForTimeout(2500);

  const audit = await page.evaluate(() => {
    const pick = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return "MISSING";
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const visible = cs.opacity !== "0" && cs.visibility !== "hidden" && r.height > 0;
      return visible ? "visible" : `INVISIBLE(op=${cs.opacity},h=${Math.round(r.height)})`;
    };
    return {
      heroH1: pick("#hero h1"),
      amenitiesCard: pick("#amenities ul li"),
      locationMapIframe: pick("#location iframe"),
      locationAddress: pick("#location address"),
      pricingTable: pick("#pricing table"),
      faqTrigger: pick("#faq button"),
      formNameInput: pick("#enquire input#name"),
      overviewImg: pick("#overview img"),
    };
  }).catch((e) => ({ error: e.message.split("\n")[0] }));

  console.log(`\n=== ${label} ===`);
  if (audit.error) console.log(`  ERROR: ${audit.error}`);
  Object.entries(audit).forEach(([k, v]) => k !== "error" && console.log(`  ${k}: ${v}`));

  // Section screenshots (viewport-size, scrolled into view)
  const shots = [["amenities", "#amenities"], ["location", "#location"], ["pricing", "#pricing"], ["enquire", "#enquire"]];
  for (const [name, sel] of shots) {
    try {
      const el = page.locator(sel).first();
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      await page.screenshot({ path: `/home/z/my-project/scripts/repro-${label}-${name}.png` });
    } catch {}
  }
  await context.close();
}

await probe("nojs", { javaScriptEnabled: false });
await probe("osm-blocked", { blockOSM: true });
await browser.close();
console.log("\nDONE");
