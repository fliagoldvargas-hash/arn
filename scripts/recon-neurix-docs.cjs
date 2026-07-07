const fs = require("node:fs/promises");
const path = require("node:path");
const { chromium } = require("playwright");

const root = process.cwd();
const out = (...parts) => path.join(root, ...parts);

async function main() {
  await fs.mkdir(out("docs", "research", "neurix-docs"), { recursive: true });
  await fs.mkdir(out("docs", "research", "components"), { recursive: true });
  await fs.mkdir(out("docs", "design-references", "neurix-docs"), { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1 });
  await page.goto("https://www.neurix.sh/docs", { waitUntil: "networkidle", timeout: 60000 });
  await page.screenshot({
    path: out("docs", "design-references", "neurix-docs", "desktop-full.png"),
    fullPage: true,
  });

  const recon = await page.evaluate(() => {
    const pick = (el) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        tag: el.tagName.toLowerCase(),
        id: el.id || null,
        cls: String(el.className || "").slice(0, 180),
        text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 500),
        rect: {
          x: Math.round(r.x),
          y: Math.round(r.y),
          width: Math.round(r.width),
          height: Math.round(r.height),
          top: Math.round(r.top),
          bottom: Math.round(r.bottom),
        },
        fontFamily: cs.fontFamily,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        lineHeight: cs.lineHeight,
        letterSpacing: cs.letterSpacing,
        color: cs.color,
        background: cs.background,
        backgroundColor: cs.backgroundColor,
        display: cs.display,
        position: cs.position,
        padding: cs.padding,
        margin: cs.margin,
        gap: cs.gap,
        border: cs.border,
        borderRadius: cs.borderRadius,
        boxShadow: cs.boxShadow,
      };
    };

    const all = [...document.querySelectorAll("body *")];
    return {
      title: document.title,
      url: location.href,
      height: document.documentElement.scrollHeight,
      bodyText: document.body.innerText,
      landmarks: [...document.querySelectorAll("body > *, main > *, aside, nav, header, section, article")]
        .map((el, i) => ({ i, ...pick(el) }))
        .filter((item) => item.rect.height > 10 || item.text),
      textNodes: [...document.querySelectorAll("h1,h2,h3,h4,p,a,button,li,code,pre,span")]
        .filter((el) => (el.textContent || "").trim())
        .slice(0, 500)
        .map(pick),
      images: [...document.querySelectorAll("img")].map((img) => ({
        src: img.currentSrc || img.src,
        alt: img.alt,
        width: img.naturalWidth,
        height: img.naturalHeight,
        className: String(img.className || ""),
      })),
      svgs: [...document.querySelectorAll("svg")]
        .map((svg, i) => ({
          i,
          width: svg.getAttribute("width"),
          height: svg.getAttribute("height"),
          cls: svg.getAttribute("class"),
          parent: String(svg.parentElement?.className || "").slice(0, 160),
          html: svg.outerHTML.slice(0, 1400),
        }))
        .slice(0, 80),
      colors: [
        ...new Set(
          all.slice(0, 1200).flatMap((el) => {
            const cs = getComputedStyle(el);
            return [cs.color, cs.backgroundColor, cs.borderColor].filter(Boolean);
          }),
        ),
      ],
    };
  });
  await fs.writeFile(out("docs", "research", "neurix-docs", "recon.json"), JSON.stringify(recon, null, 2));

  await page.setViewportSize({ width: 390, height: 1200 });
  await page.goto("https://www.neurix.sh/docs", { waitUntil: "networkidle", timeout: 60000 });
  await page.screenshot({
    path: out("docs", "design-references", "neurix-docs", "mobile-full.png"),
    fullPage: true,
  });

  await browser.close();
  console.log(
    JSON.stringify(
      {
        title: recon.title,
        height: recon.height,
        landmarks: recon.landmarks.length,
        images: recon.images.length,
        svgs: recon.svgs.length,
        textSample: recon.bodyText.slice(0, 1000),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
