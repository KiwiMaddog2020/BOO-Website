# BOO Merch Artwork

Print-ready artwork for the **Bunch of Others** wordmark. Everything here is generated
from the band logo raster and re-drawn as vector curves, so the SVGs are
resolution-independent and the PNGs can be re-exported at any size.

Nothing in this folder is used by the website — it is production art for garment,
cap and sticker vendors.

---

## Files

| File | Size | DPI | Use |
|------|------|-----|-----|
| `boo-logo-black.svg` | viewBox 2402.4 x 2189.2 | vector | Master vector, black fill, transparent background. Light garments, print, one-colour separations. |
| `boo-logo-white.svg` | viewBox 2402.4 x 2189.2 | vector | Same paths, white fill. Dark garments. |
| `boo-logo-front-white-4500x5400.png` | 4500 x 5400 px (15 x 18 in) | 300 | DTG / DTF **full front**, white ink. Transparent background. |
| `boo-logo-front-black-4500x5400.png` | 4500 x 5400 px (15 x 18 in) | 300 | DTG / DTF **full front**, black ink. Transparent background. |
| `boo-logo-leftchest-white-1200.png` | 1200 x 1200 px (4 x 4 in) | 300 | **Left chest** print, white ink. Transparent background. |
| `boo-logo-leftchest-black-1200.png` | 1200 x 1200 px (4 x 4 in) | 300 | **Left chest** print, black ink. Transparent background. |
| `boo-hat-embroidery.svg` | viewBox 2402.4 x 2189.2 | vector | **Cap front** embroidery master (single colour white). Simplified — see below. |
| `boo-hat-embroidery-white-1600.png` | 1600 x 1600 px | 300 | Raster proof of the cap art, transparent background. |
| `boo-sticker-diecut.png` | 900 x 900 px (3 x 3 in) | 300 | **Die-cut sticker**, black logo on white rounded-square backing. Outside the die shape is transparent. |
| `boo-sticker-diecut-dark.png` | 900 x 900 px (3 x 3 in) | 300 | Same sticker, white logo on black backing. |

All PNGs are RGBA with a fully transparent background (alpha 0) and carry
300 DPI metadata (PNG stores this as 11811 pixels/metre, which every RIP reads as 300).

---

## Placement geometry

**Full front (4500 x 5400):** the mark is 4048 x 3690 px — 90% of the canvas width —
horizontally centred, sitting from y=270 to y=3960 (5% to 73% of the canvas height).

> Deviation worth knowing: the mark is almost square (1.097 : 1), so at 90% of a
> 4500 px width it is 3690 px tall — taller than the top 60% of a 5400 px canvas.
> Centring it inside the top 60% would clip it. Print width was treated as the
> hard requirement, so the mark is pinned 5% down from the top of the print area
> instead, which is the normal chest position for a 15 x 18 in DTG file.

> Scale note: 4050 px at 300 DPI is a **13.5 in wide** print. That is at the top of what
> most adult DTG platens take (12–14 in). If the vendor caps the print at 12 in, hand them
> `boo-logo-black.svg` / `boo-logo-white.svg` and let them scale the vector, or re-export
> this PNG at 3600 px wide.

**Left chest (1200 x 1200):** mark is 1080 x 984 px — 90% of the canvas width,
centred both ways. At 300 DPI the canvas is exactly 4 x 4 in and the mark is 3.6 in wide.

**Cap front (`boo-hat-embroidery.*`):** sized for a 4 x 2.25 in cap-front area.
Because the mark is near-square, height is the binding dimension: run it at
2.25 in tall / 2.47 in wide, centred in the 4 in area.

**Sticker (900 x 900):** full-bleed rounded square (90 px / 0.3 in corner radius) as
the die line. The logo sits inside a 0.125 in (38 px) safe margin — measured margins
are 39 px left, 38 px right, 75 px top, 74 px bottom.

---

## How these were generated

Source raster: **`Images/BOO_LogoTransparent.png`** (1590 x 1590, actually a WebP
despite the extension; RGBA with a hard-keyed transparent background). This is the
largest and cleanest of the four available logo rasters
(`Images/BOO_Logo.webp` 1092 px, `mobile/resources/icon.png` 1024 px,
`Images/Favicon/favicon.svg` is only a PNG wrapped in SVG).

Pipeline (Python: Pillow, NumPy, SciPy, `potracer`, CairoSVG):

1. **Flatten** — luminance of the RGB channels, with alpha < 128 forced to white, so
   the keyed-out background becomes clean paper rather than black.
2. **Upscale 2x** with Lanczos (1590 -> 3180 px), then **threshold at 128** to a 1-bit mask.
   Upscaling before thresholding gives potrace sub-pixel edge information and noticeably
   smoother curves.
3. **Crop** to the tight ink bounding box: 2310 x 2105 units — this is the SVG coordinate space.
4. **Trace** with potrace: `turdsize=24`, `turnpolicy=minority`, `alphamax=1.0`,
   `opticurve=true`, `opttolerance=0.2`. `turdsize=24` drops two threshold specks
   (7 px and 17 px) that were not part of the drawing; every real detail survives.
   Output: 30 subpaths in a single `<path>` with `fill-rule="evenodd"`, so all letter
   counters and the star interiors stay open.
5. **viewBox** = ink box plus 2% padding per side, with the paths shifted by a
   `<g transform="translate(...)">` so the viewBox origin is 0,0.
6. **PNGs** rendered from those exact vectors with CairoSVG at the target pixel size,
   composited onto a transparent canvas by Pillow, saved with `dpi=(300,300)`.

Re-rasterising the vector back to 2310 x 2105 and comparing to the source mask gives a
1.08% pixel difference — i.e. the vector deviates from the original artwork by about
one edge pixel, nothing structural.

---

## Cap embroidery: what was changed and why

The wordmark carries hairline detail — eyelash strokes and star spikes about
0.4–0.7 mm wide when the mark is run at 2.25 in tall, and internal splits in
H / T / N / O only 0.4 mm across. Embroidery cannot hold detail below roughly 1 mm,
so `boo-hat-embroidery.svg` is a deliberately simplified cut:

- **The two eye / star glyphs are removed.** They are the thinnest elements in the mark
  and the only *long* hairline strokes. Thickening them to a stitchable width was tested
  and turns them into unreadable blobs (their interiors fill in and the lashes merge),
  so dropping them was the better of the two options. The result is a clean three-line
  `BUNCH / OF / OTHERS` lockup, which also reads better at cap size.
- **Uniform +0.15 mm outward offset** on the remaining letterforms (0.3 mm added stroke
  weight), which is standard bold-up for satin stitch.
- Enclosed gaps and ink specks below 0.6 mm are filled / removed, then a light Gaussian
  smoothing pass (sigma 5 px) removes the scalloped edges the offset creates.
- Re-traced with the same potrace settings; 18 subpaths.

**Compromise to flag:** a literal "1 mm minimum stroke everywhere" cannot be met by this
artwork at 4 x 2.25 in — enforcing it grows the ink by 40–80% and closes the counters,
destroying the mark. The file above is as close as the design gets while still looking
like the logo. The tapered letter terminals still come to a point, which is normal for
satin-stitch lettering and is handled by the digitiser. If the cap vendor pushes back,
the fix is a larger sew-out (3 in tall+) or a purpose-drawn single-line wordmark, not
more dilation.

For screen print, DTG and stickers use the full mark (`boo-logo-black.svg` /
`boo-logo-white.svg`) — it has no such limitation.
