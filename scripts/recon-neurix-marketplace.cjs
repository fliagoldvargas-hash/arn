const fs = require("node:fs/promises");
const path = require("node:path");
const { chromium } = require("playwright");

const root = process.cwd();
const out = (...parts) => path.join(root, ...parts);

async function ensureDirs() {
  await fs.mkdir(out("docs", "research", "neurix-marketplace"), { recursive: true });
  await fs.mkdir(out("docs", "research", "components"), { recursive: true });
  await fs.mkdir(out("docs", "design-references", "neurix-marketplace", "sections"), { recursive: true });
}

async function extract(page) {
  return page.evaluate(() => {
    const props = [
      "fontSize",
      "fontWeight",
      "fontFamily",
      "lineHeight",
      "letterSpacing",
      "color",
      "background",
      "backgroundColor",
      "border",
      "borderRadius",
      "padding",
      "margin",
      "width",
      "height",
      "display",
      "gridTemplateColumns",
      "gap",
      "position",
      "top",
      "left",
      "right",
      "bottom",
      "opacity",
      "transform",
      "transition",
    ];
    const pick = (el) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const styles = {};
      props.forEach((p) => {
        const value = cs[p];
        if (value && value !== "none" && value !== "normal" && value !== "auto") styles[p] = value;
      });
      return {
        tag: el.tagName.toLowerCase(),
        cls: String(el.className || "").slice(0, 180),
        text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 700),
        rect: { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) },
        styles,
      };
    };

    const candidates = [
      ...document.querySelectorAll("nav, header, main, section, article, footer, button, a, h1, h2, h3, p"),
    ];

    return {
      title: document.title,
      url: location.href,
      height: document.documentElement.scrollHeight,
      bodyText: document.body.innerText,
      elements: candidates.map(pick).filter((item) => item.rect.height > 0 || item.text),
      images: [...document.querySelectorAll("img")].map((img) => ({
        src: img.currentSrc || img.src,
        alt: img.alt,
        width: img.naturalWidth,
        height: img.naturalHeight,
      })),
      svgs: [...document.querySelectorAll("svg")].map((svg) => ({
        text: svg.outerHTML.slice(0, 1200),
        parentText: (svg.parentElement?.textContent || "").trim().replace(/\s+/g, " ").slice(0, 200),
      })),
      links: [...document.querySelectorAll("a")].map((a) => ({
        text: (a.textContent || "").trim(),
        href: a.href,
      })),
    };
  });
}

async function main() {
  await ensureDirs();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1 });
  await page.goto("https://www.neurix.sh/marketplace", { waitUntil: "networkidle", timeout: 60000 });
  await page.screenshot({ path: out("docs", "design-references", "neurix-marketplace", "desktop-full.png"), fullPage: true });

  const recon = await extract(page);
  await fs.writeFile(out("docs", "research", "neurix-marketplace", "recon.json"), JSON.stringify(recon, null, 2));

  for (const [name, y] of [
    ["hero", 0],
    ["cards", 520],
    ["lower", 1100],
  ]) {
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
    await page.waitForTimeout(700);
    await page.screenshot({
      path: out("docs", "design-references", "neurix-marketplace", "sections", `${name}.png`),
      fullPage: false,
    });
  }

  await page.setViewportSize({ width: 390, height: 1200 });
  await page.goto("https://www.neurix.sh/marketplace", { waitUntil: "networkidle", timeout: 60000 });
  await page.screenshot({ path: out("docs", "design-references", "neurix-marketplace", "mobile-full.png"), fullPage: true });

  await browser.close();
  console.log("neurix marketplace recon saved");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
