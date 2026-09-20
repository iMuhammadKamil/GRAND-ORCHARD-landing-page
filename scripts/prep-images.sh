#!/bin/bash
# Prepare Grand Orchard visual assets
# Real images: clean promo overlays off official renders (building content preserved)
set -u
OUT=/home/z/my-project/public/images
SRC=/home/z/my-project/scripts/imgcheck
mkdir -p "$OUT"

echo "=== [1/8] Cleaning elevation render 1 (day) ==="
timeout 240 z-ai image-edit \
  -p "Remove all logo overlays, watermarks and text graphics from this architectural rendering (the white logo card top-left, the small logos at the bottom podium, and any icon/text overlays). Fill the removed areas naturally with surrounding sky and building content. Keep the buildings, trees, road, lighting and overall composition exactly the same. Photorealistic architectural visualization, clean, no text anywhere." \
  -i "$SRC/f-render2.jpg" -o "$OUT/hero-elevation.png" -s 1440x720
echo "exit: $?"

echo "=== [2/8] Cleaning elevation render 2 (dusk) ==="
timeout 240 z-ai image-edit \
  -p "Remove all logo overlays, watermark logos and text/icon graphics from this architectural rendering (the logo card at top-left, the two feature icons with text at the top, and the small logo near the bottom podium). Fill removed areas naturally with sky and building content. Keep the buildings, landscaped road, warm dusk lighting and composition exactly the same. Photorealistic architectural visualization, clean, no text anywhere." \
  -i "$SRC/d-render-text.jpg" -o "$OUT/elevation-dusk.png" -s 1440x720
echo "exit: $?"

echo "=== [3/8] Cleaning night render (launch banner) ==="
timeout 240 z-ai image-edit \
  -p "Remove ALL text, banners, logos and graphic overlays from this real-estate advertisement image, including the top headline text, the date badges on the left, the venue text on the right, the center logo card, and the small logo at the bottom. Keep only the photorealistic building render, trees, street lights, road and sky, filling removed areas naturally. Photorealistic architectural night scene, clean, no text anywhere." \
  -i "$SRC/a-launch-banner.jpg" -o "$OUT/elevation-night.png" -s 1440x720
echo "exit: $?"

echo "=== [4/8] Construction photo (real, keep authentic) ==="
cp "$SRC/b-construction.jpg" "$OUT/construction-update.jpg"

echo "=== [5/8] Hilton signing (real, keep authentic) ==="
cp "$SRC/c-hilton.jpg" "$OUT/hilton-signing.jpg"

echo "ALL DONE"
ls -la "$OUT"
