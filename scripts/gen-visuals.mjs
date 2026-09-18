import ZAI from "z-ai-web-dev-sdk";
import fs from "fs";

const OUT = "/home/z/my-project/public/images";

/**
 * INDICATIVE VISUALS ONLY — clearly labeled in the UI as
 * "Indicative Visual" (not official Grand Orchard photographs).
 * Styled to a warm, editorial, premium architectural mood.
 */
const jobs = [
  {
    out: `${OUT}/ri-1.png`,
    size: "1344x768",
    prompt:
      "Photorealistic interior architectural visualization of a premium open-plan apartment living room, floor-to-ceiling windows with a green hill valley view and terrace beyond, warm neutral beige and off-white palette, oak wood floor, minimal elegant furniture, soft natural daylight, editorial real-estate photography style, no people, no text, no logos",
  },
  {
    out: `${OUT}/ri-2.png`,
    size: "1344x768",
    prompt:
      "Photorealistic interior architectural visualization of a premium apartment bedroom opening onto a private terrace with city view at golden hour, warm neutral palette, linen textures, minimal styling, editorial real-estate photography, no people, no text, no logos",
  },
  {
    out: `${OUT}/ci-1.png`,
    size: "1344x768",
    prompt:
      "Photorealistic interior architectural visualization of a modern premium commercial retail unit, glass storefront, warm stone and brass details, minimal luxury boutique atmosphere, soft lighting, editorial real-estate photography, no people, no text, no logos",
  },
  {
    out: `${OUT}/fac-1.png`,
    size: "1344x768",
    prompt:
      "Photorealistic architectural visualization of a premium indoor swimming pool area in a luxury residential building, calm turquoise water, warm stone deck, floor-to-ceiling windows, beige loungers, soft evening light, editorial style, no people, no text, no logos",
  },
  {
    out: `${OUT}/fac-2.png`,
    size: "1344x768",
    prompt:
      "Photorealistic interior architectural visualization of a premium fitness center, modern equipment in neat rows, warm wood and dark stone finishes, large windows with greenery view, soft morning light, editorial style, no people, no text, no logos",
  },
];

async function run() {
  const zai = await ZAI.create();
  for (const job of jobs) {
    let done = false;
    for (let i = 1; i <= 2 && !done; i++) {
      try {
        const res = await zai.images.generations.create({
          prompt: job.prompt,
          size: job.size,
        });
        const b = Buffer.from(res.data[0].base64, "base64");
        fs.writeFileSync(job.out, b);
        console.log(`OK  ${job.out} (${(b.length / 1024).toFixed(0)} KB)`);
        done = true;
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
