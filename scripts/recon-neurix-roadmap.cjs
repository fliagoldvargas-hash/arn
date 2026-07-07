const fs = require("node:fs/promises");
const path = require("node:path");
const { chromium } = require("playwright");

const root = process.cwd();
const out = (...parts) => path.join(root, ...parts);

async function main() {
  await fs.mkdir(out("docs", "research", "neurix-roadmap"), { recursive: true });
  await fs.mkdir(out("docs", "design-references", "neurix-roadmap", "sections"), { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1 });
  await page.goto("https://www.neurix.sh/roadmap", { waitUntil: "networkidle", timeout: 60000 });
  await page.screenshot({
    path: out("docs", "design-references", "neurix-roadmap", "desktop-full.png"),
    fullPage: true,
  });

  const recon = await page.evaluate(() => {
    const pick = (el) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        tag: el.tagName.toLowerCase(),
        cls: String(el.className || "").slice(0, 180),
        text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 500),
        rect: { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) },
        fontFamily: cs.fontFamily,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        lineHeight: cs.lineHeight,
        color: cs.color,
        background: cs.background,
        border: cs.border,
        padding: cs.padding,
        margin: cs.margin,
      };
    };
    return {
      title: document.title,
      url: location.href,
      height: document.documentElement.scrollHeight,
      bodyText: document.body.innerText,
      landmarks: [...document.querySelectorAll("body > *, main > *, section, article, nav, footer")]
        .map((el, i) => ({ i, ...pick(el) }))
        .filter((item) => item.rect.height > 10 || item.text),
      textNodes: [...document.querySelectorAll("h1,h2,h3,h4,p,a,button,li,span")]
        .filter((el) => (el.textContent || "").trim())
        .slice(0, 500)
        .map(pick),
      images: [...document.querySelectorAll("img")].map((img) => ({
        src: img.currentSrc || img.src,
        alt: img.alt,
        width: img.naturalWidth,
        height: img.naturalHeight,
      })),
    };
  });

  await fs.writeFile(out("docs", "research", "neurix-roadmap", "recon.json"), JSON.stringify(recon, null, 2));

  for (const [name, y] of [
    ["hero", 0],
    ["timeline-1", 850],
    ["timeline-2", 1600],
    ["footer", 2400],
  ]) {
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
    await page.waitForTimeout(800);
    await page.screenshot({
      path: out("docs", "design-references", "neurix-roadmap", "sections", `${name}.png`),
      fullPage: false,
    });
  }

  await page.setViewportSize({ width: 390, height: 1200 });
  await page.goto("https://www.neurix.sh/roadmap", { waitUntil: "networkidle", timeout: 60000 });
  await page.screenshot({
    path: out("docs", "design-references", "neurix-roadmap", "mobile-full.png"),
    fullPage: true,
  });

  await browser.close();
  console.log(JSON.stringify({
    title: recon.title,
    height: recon.height,
    landmarks: recon.landmarks.length,
    images: recon.images.length,
    textSample: recon.bodyText.slice(0, 1200),
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
