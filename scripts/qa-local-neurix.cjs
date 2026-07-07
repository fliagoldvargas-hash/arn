const fs = require("node:fs/promises");
const path = require("node:path");
const { chromium } = require("playwright");

async function main() {
  const root = process.cwd();
  const dir = path.join(root, "docs", "design-references", "local");
  await fs.mkdir(dir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1400 }, deviceScaleFactor: 1 });
  await desktop.goto("http://127.0.0.1:3000", { waitUntil: "networkidle", timeout: 60000 });
  await desktop.screenshot({ path: path.join(dir, "desktop-full.png"), fullPage: true });
  const mobile = await browser.newPage({ viewport: { width: 390, height: 1200 }, deviceScaleFactor: 1 });
  await mobile.goto("http://127.0.0.1:3000", { waitUntil: "networkidle", timeout: 60000 });
  await mobile.screenshot({ path: path.join(dir, "mobile-full.png"), fullPage: true });
  await browser.close();
  console.log("local qa screenshots saved");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
