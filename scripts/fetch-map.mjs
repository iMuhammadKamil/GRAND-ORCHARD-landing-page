/**
 * Builds a self-hosted static map image for the Grand Orchard location panel.
 * Stitches OpenStreetMap tiles for the project bbox (attribution is rendered
 * in the UI next to the panel). Output: public/images/map-dha.jpg
 */
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public/images/map-dha.jpg");

// Same bbox as MAP in src/lib/grand-orchard.ts (minLon, minLat, maxLon, maxLat)
const BBOX = { left: 73.0613, bottom: 33.5079, right: 73.1413, top: 33.5679 };
const CENTER = { lat: 33.5379275, lon: 73.101301 };
const Z = 14;
const N = 2 ** Z;

const lonToX = (lon) => ((lon + 180) / 360) * N;
const latToY = (lat) => {
  const rad = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * N;
};

const x0 = lonToX(BBOX.left);
const x1 = lonToX(BBOX.right);
const y0 = latToY(BBOX.top);
const y1 = latToY(BBOX.bottom);
const tx0 = Math.floor(x0);
const tx1 = Math.floor(x1);
const ty0 = Math.floor(y0);
const ty1 = Math.floor(y1);
const cols = tx1 - tx0 + 1;
const rows = ty1 - ty0 + 1;
console.log(`z${Z} tiles: ${cols}x${rows} (x ${tx0}..${tx1}, y ${ty0}..${ty1})`);

const TILE = 256;
const UA =
  "GrandOrchardLandingPageBuilder/1.0 (contact: project owner) static-map-oneoff";

const tiles = [];
for (let tx = tx0; tx <= tx1; tx++) {
  for (let ty = ty0; ty <= ty1; ty++) {
    tiles.push({ tx, ty });
  }
}

const bufs = await Promise.all(
  tiles.map(async ({ tx, ty }) => {
    const url = `https://tile.openstreetmap.org/${Z}/${tx}/${ty}.png`;
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) throw new Error(`tile ${tx}/${ty} -> HTTP ${res.status}`);
    return { tx, ty, buf: Buffer.from(await res.arrayBuffer()) };
  })
);
console.log(`fetched ${bufs.length} tiles`);

// Stitch full tile canvas
const canvas = sharp({
  create: {
    width: cols * TILE,
    height: rows * TILE,
    channels: 3,
    background: { r: 233, g: 228, b: 228 },
  },
});
canvas.composite(
  bufs.map(({ tx, ty, buf }) => ({
    input: buf,
    left: (tx - tx0) * TILE,
    top: (ty - ty0) * TILE,
  }))
);
const stitched = await canvas.png().toBuffer();

// Crop to exact bbox pixel bounds
const left = Math.round((x0 - tx0) * TILE);
const top = Math.round((y0 - ty0) * TILE);
const width = Math.round((x1 - x0) * TILE);
const height = Math.round((y1 - y0) * TILE);
console.log(`crop: ${width}x${height} at (${left},${top})`);

// Marker: wine dot + ring at the project coordinates (matches site palette)
const mx = (lonToX(CENTER.lon) - x0) * TILE - left;
const my = (latToY(CENTER.lat) - y0) * TILE - top;
const marker = Buffer.from(
  `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
     <circle cx="${mx}" cy="${my}" r="26" fill="none" stroke="#6f2232" stroke-width="3" opacity="0.55"/>
     <circle cx="${mx}" cy="${my}" r="11" fill="#6f2232"/>
     <circle cx="${mx}" cy="${my}" r="4.5" fill="#f4f1ea"/>
   </svg>`
);

await mkdirSync(dirname(OUT), { recursive: true });
await sharp(stitched)
  .extract({ left, top, width, height })
  .composite([{ input: marker, top: 0, left: 0 }])
  .resize({ width: 1280, withoutEnlargement: false })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(OUT);

console.log(`WROTE ${OUT}`);
