const fs = require("node:fs/promises");
const path = require("node:path");
const { chromium } = require("playwright");

const root = process.cwd();
const out = (...parts) => path.join(root, ...parts);

async function ensureDirs() {
  await fs.mkdir(out("docs", "research", "components"), { recursive: true });
  await fs.mkdir(out("docs", "design-references", "neurix.sh"), { recursive: true });
  await fs.mkdir(out("public", "images", "neurix"), { recursive: true });
  await fs.mkdir(out("public", "seo"), { recursive: true });
}

async function main() {
  await ensureDirs();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1400 },
    deviceScaleFactor: 1,
  });

  await page.goto("https://www.neurix.sh", {
    waitUntil: "networkidle",
    timeout: 60000,
  });

  await page.screenshot({
    path: out("docs", "design-references", "neurix.sh", "desktop-full.png"),
    fullPage: true,
  });

  const recon = await page.evaluate(() => {
    const pickStyles = (el) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        tag: el.tagName.toLowerCase(),
        cls: String(el.className || "").slice(0, 180),
        id: el.id || null,
        text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 300),
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
        borderRadius: cs.borderRadius,
        border: cs.border,
        boxShadow: cs.boxShadow,
        transform: cs.transform,
        transition: cs.transition,
        opacity: cs.opacity,
        zIndex: cs.zIndex,
      };
    };

    const all = [...document.querySelectorAll("body *")];
    const landmarks = [
      ...document.querySelectorAll("main > *, body > *, section, header, footer, nav"),
    ]
      .map((el, i) => ({ i, ...pickStyles(el) }))
      .filter((x) => x.rect.height > 20 || x.text);
    const textNodes = [...document.querySelectorAll("h1,h2,h3,h4,p,a,button,span,li")]
      .filter((el) => (el.textContent || "").trim())
      .slice(0, 420)
      .map(pickStyles);
    const images = [...document.querySelectorAll("img")].map((img) => ({
      src: img.currentSrc || img.src,
      alt: img.alt,
      width: img.naturalWidth,
      height: img.naturalHeight,
      className: String(img.className || ""),
      parent: String(img.parentElement?.className || ""),
    }));
    const videos = [...document.querySelectorAll("video")].map((v) => ({
      src: v.currentSrc || v.src || v.querySelector("source")?.src,
      poster: v.poster,
      autoplay: v.autoplay,
      loop: v.loop,
      muted: v.muted,
    }));
    const backgroundImages = all
      .map((el) => ({
        element:
          el.tagName.toLowerCase() +
          "." +
          String(el.className || "").split(" ").slice(0, 3).join("."),
        text: (el.textContent || "").trim().slice(0, 90),
        backgroundImage: getComputedStyle(el).backgroundImage,
      }))
      .filter((x) => x.backgroundImage && x.backgroundImage !== "none")
      .slice(0, 180);
    const svgs = [...document.querySelectorAll("svg")]
      .map((s, i) => ({
        i,
        html: s.outerHTML.slice(0, 1800),
        cls: s.getAttribute("class"),
        width: s.getAttribute("width"),
        height: s.getAttribute("height"),
        parent: String(s.parentElement?.className || "").slice(0, 180),
      }))
      .slice(0, 120);
    const meta = [...document.querySelectorAll("link[rel], meta[property], meta[name]")]
      .map((el) => el.outerHTML)
      .slice(0, 180);
    const colors = [
      ...new Set(
        all.slice(0, 1200).flatMap((el) => {
          const cs = getComputedStyle(el);
          return [cs.color, cs.backgroundColor, cs.borderColor].filter(Boolean);
        }),
      ),
    ];

    return {
      title: document.title,
      url: location.href,
      htmlClass: document.documentElement.className,
      bodyClass: document.body.className,
      height: document.documentElement.scrollHeight,
      bodyText: document.body.innerText,
      landmarks,
      textNodes,
      images,
      videos,
      backgroundImages,
      svgs,
      meta,
      colors,
    };
  });

  const scrollSnapshots = [];
  for (const y of [0, 300, 900, 1600, 2600, 3800, 5200]) {
    await page.evaluate((pos) => window.scrollTo(0, pos), y);
    await page.waitForTimeout(350);
    scrollSnapshots.push(
      await page.evaluate(() => ({
        y: window.scrollY,
        header: document.querySelector("header, nav")?.outerHTML.slice(0, 1000),
        visibleText: document.body.innerText.slice(0, 1000),
      })),
    );
  }

  await fs.writeFile(
    out("docs", "research", "neurix-recon.json"),
    JSON.stringify({ ...recon, scrollSnapshots }, null, 2),
  );

  await page.setViewportSize({ width: 390, height: 1200 });
  await page.goto("https://www.neurix.sh", {
    waitUntil: "networkidle",
    timeout: 60000,
  });
  await page.screenshot({
    path: out("docs", "design-references", "neurix.sh", "mobile-full.png"),
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
        videos: recon.videos.length,
        svgs: recon.svgs.length,
        textSample: recon.bodyText.slice(0, 700),
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
