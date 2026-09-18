import ZAI from "z-ai-web-dev-sdk";
import fs from "fs";

const SRC = "/home/z/my-project/scripts/imgcheck";
const OUT = "/home/z/my-project/public/images";

const jobs = [
  {
    in: `${SRC}/f-render2.jpg`,
    out: `${OUT}/hero-elevation.png`,
    prompt:
      "Remove all logo overlays, watermarks and text graphics from this architectural rendering (white logo card top-left, small logos on the bottom podium). Fill removed areas naturally with sky and building content. Keep the buildings, trees, road, lighting and composition exactly the same. Photorealistic architectural visualization, clean, no text anywhere.",
  },
  {
    in: `${SRC}/d-render-text.jpg`,
    out: `${OUT}/elevation-dusk.png`,
    prompt:
      "Remove all logo overlays, watermark logos, icon graphics and text from this architectural rendering (logo card at top-left, two icons with text at top, small logo near bottom podium). Fill removed areas naturally with sky and building content. Keep buildings, landscaped road, warm dusk lighting and composition identical. Photorealistic architectural visualization, clean, no text anywhere.",
  },
  {
    in: `${SRC}/a-launch-banner.jpg`,
    out: `${OUT}/elevation-night.png`,
    prompt:
      "Remove ALL text, date badges, banners, logos and graphic overlays from this real-estate advertisement image (top headline, left date badges, right venue text, center logo card, small bottom logo). Keep only the photorealistic buildings, trees, street lights, road and sky, filling removed areas naturally. Photorealistic night architectural scene, clean, no text anywhere.",
  },
];

async function run() {
  const zai = await ZAI.create();
  for (const job of jobs) {
    const attempt = async () => {
      const b64 = fs.readFileSync(job.in).toString("base64");
      const dataUrl = `data:image/jpeg;base64,${b64}`;
      const res = await zai.images.generations.edit({
        prompt: job.prompt,
        images: [{ url: dataUrl }],
        size: "1440x720",
      });
      const b = Buffer.from(res.data[0].base64, "base64");
      fs.writeFileSync(job.out, b);
      console.log(`OK  ${job.out} (${(b.length / 1024).toFixed(0)} KB)`);
    };
    for (let i = 1; i <= 2; i++) {
      try {
        await attempt();
        break;
      } catch (e) {
        console.error(`FAIL(${i}) ${job.out}: ${e.message}`);
        if (i === 2) console.error(`GIVEUP ${job.out}`);
        else await new Promise((r) => setTimeout(r, 3000));
      }
    }
  }
}

run().catch((e) => {
  console.error("FATAL", e);
  process.exit(1);
});
