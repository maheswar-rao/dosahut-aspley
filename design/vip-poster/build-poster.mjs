/**
 * Builds the A3 in-store poster as a print-ready PDF.
 *
 * poster.html -> (fonts + logo inlined) -> Chrome --print-to-pdf
 *
 * Chrome is used rather than a PDF library because it keeps the text as real
 * vector glyphs and embeds the font subsets, which is what the printer needs.
 * Fonts and the logo are inlined as data URIs so the build never depends on
 * the network and always produces the identical file.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const FS = "../../node_modules/@fontsource";

const FONTS = {
  CORMORANT_700_ITALIC: `${FS}/cormorant-garamond/files/cormorant-garamond-latin-700-italic.woff2`,
  CORMORANT_700: `${FS}/cormorant-garamond/files/cormorant-garamond-latin-700-normal.woff2`,
  OSWALD_500: `${FS}/oswald/files/oswald-latin-500-normal.woff2`,
  OSWALD_600: `${FS}/oswald/files/oswald-latin-600-normal.woff2`,
  OSWALD_700: `${FS}/oswald/files/oswald-latin-700-normal.woff2`,
  NUNITO_200: `${FS}/nunito/files/nunito-latin-200-normal.woff2`,
  NUNITO_400: `${FS}/nunito/files/nunito-latin-400-normal.woff2`,
  NUNITO_600: `${FS}/nunito/files/nunito-latin-600-normal.woff2`,
};

const b64 = (p) => readFileSync(resolve(p)).toString("base64");

let html = readFileSync("poster.html", "utf8");
for (const [token, path] of Object.entries(FONTS)) {
  html = html.replaceAll(`{{${token}}}`, `data:font/woff2;base64,${b64(path)}`);
}
html = html.replaceAll("{{LOGO}}", `data:image/png;base64,${b64("logo.png")}`);
html = html.replaceAll("{{QR}}", `data:image/png;base64,${b64("qr.png")}`);

writeFileSync("/tmp/poster-build.html", html);

execFileSync(CHROME, [
  "--headless",
  "--disable-gpu",
  "--no-sandbox",
  "--no-pdf-header-footer",
  "--virtual-time-budget=8000",
  "--print-to-pdf=print/dosahut-vip-poster-a3.pdf",
  "file:///tmp/poster-build.html",
], { stdio: ["ignore", "ignore", "pipe"] });

// Chrome rounds the page to whole CSS pixels, which leaves A3 about 0.2 mm
// tall. Trim the page box back to exactly 297 x 420 mm — the maroon bands
// bleed to the edge, so nothing meaningful is lost.
execFileSync("python3", ["-c", `
import pymupdf
doc = pymupdf.open("print/dosahut-vip-poster-a3.pdf")
doc[0].set_mediabox(pymupdf.Rect(0, 0, 841.8898, 1190.5512))
doc.save("print/dosahut-vip-poster-a3.pdf", incremental=True, encryption=0)
`], { stdio: ["ignore", "ignore", "pipe"] });

console.log("built print/dosahut-vip-poster-a3.pdf");
