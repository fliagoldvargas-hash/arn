const fs = require("node:fs/promises");
const path = require("node:path");
const { chromium } = require("playwright");

async function main() {
  const root = process.cwd();
  const dir = path.join(root, "docs", "design-references", "neurix.sh", "sections");
  await fs.mkdir(dir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  await page.goto("https://www.neurix.sh", { waitUntil: "networkidle", timeout: 60000 });
  for (const [name, y] of [
    ["hero", 0],
    ["platform", 1180],
    ["marketplace", 2100],
    ["labs", 2700],
    ["ecosystem", 3180],
    ["cta-footer", 3650],
  ]) {
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
    await page.waitForTimeout(900);
    await page.screenshot({ path: path.join(dir, `${name}.png`), fullPage: false });
  }
  await browser.close();
  console.log("section screenshots saved");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
