import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("/home/z/.npm-global/lib/node_modules/playwright");
const URL = "http://localhost:3000";
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  const fails = [];
  page.on("response", (r) => { if (r.status() >= 400) fails.push(`${r.status()} ${r.url()}`); });
  await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1500);
  for (const step of [400]) {
    await page.evaluate(async (s) => {
      const h = document.body.scrollHeight;
      for (let y = 0; y <= h; y += s) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 50)); }
    }, step);
    await page.waitForTimeout(1500);
  }
  for (const sel of ["#overview", "#amenities", "#location", "#pricing", "#gallery", "#faq", "#enquire"]) {
    await page.evaluate((s) => document.querySelector(s)?.scrollIntoView({ block: "start" }), sel);
    await page.waitForTimeout(1600);
  }
  const broken = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll("img").forEach((img) => {
      if (!(img.complete && img.naturalWidth > 0) && img.getClientRects().length > 0)
        out.push((img.currentSrc || img.src || "").split("/").pop());
    });
    // horizontal overflow check
    return { broken: out, overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 };
  });
  console.log("MOBILE 375 broken visible images:", broken.broken.length, broken.broken.slice(0,5));
  console.log("MOBILE 375 horizontal overflow:", broken.overflowX);
  console.log("MOBILE 375 failed requests:", fails.length, fails.slice(0,5));
  await browser.close();
})();
