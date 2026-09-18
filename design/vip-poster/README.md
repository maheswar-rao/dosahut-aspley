# VIP Club A3 poster

## Print master

**`print/dosahut-vip-poster-a3.pdf`** — send this to the printer.

- Exactly **297 × 420 mm**, single page
- All text is real vector type; Oswald, Cormorant Garamond and Nunito are
  embedded, so no substitution at the print shop
- QR code is live, decodes to `https://aspley.dosahut.net.au/vip`,
  and prints at **60 mm** — above the size needed to scan from across a room
- Checked in greyscale: every element still separates without colour

## Rebuilding it

```
node build-poster.mjs
```

`poster.html` is the source. The build inlines the fonts and images as data
URIs, renders through headless Chrome so the type stays vector, then trims the
page box to exactly A3 (Chrome rounds to whole pixels and otherwise leaves it
0.2 mm tall). Nothing is fetched from the network, so the output is identical
every time.

Change the design by editing `poster.html` and re-running the build. Do not
hand-edit the PDF — it will be overwritten on the next build.

## Files

| File | What it is |
|---|---|
| `poster.html` | The design. Everything is authored in mm for print. |
| `build-poster.mjs` | HTML → print-ready PDF |
| `logo.png` | Brand mark, from `public/images/logo.png` |
| `qr.png` | The live QR, upscaled 4× with nearest-neighbour so the module edges stay razor sharp at print size |
| `print/` | Build output |

## Still outstanding before the print run

1. **The logo is low resolution.** It comes from the website asset (272 × 182 px)
   and prints at roughly 147 dpi at its current size. It will look soft on A3.
   Girish needs to supply a high-resolution original — drop it in as `logo.png`
   and rebuild, nothing else changes.
2. **Prize wording is placeholder** pending the owner's sign-off.
3. **No Instagram handle yet** — it was dropped from this version rather than
   printed as a visible gap. Add it to the footer once Girish confirms it.

## Copy

Approved wording lives in `docs/vip-poster-copy.md`. Keep the two in step.
