const fs = require("node:fs/promises");
const path = require("node:path");
const { chromium } = require("playwright");

async function main() {
  const root = process.cwd();
  const dir = path.join(root, "docs", "design-references", "neurix-docs", "sections");
  await fs.mkdir(dir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  await page.goto("https://www.neurix.sh/docs", { waitUntil: "networkidle", timeout: 60000 });

  for (const [name, y] of [
    ["hero", 0],
    ["problem", 920],
    ["process", 1650],
    ["stakeholders", 2350],
    ["revenue", 3050],
    ["launchpad", 3750],
    ["cta-footer", 4550],
  ]) {
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
    await page.waitForTimeout(900);
    await page.screenshot({ path: path.join(dir, `${name}.png`), fullPage: false });
  }
  await browser.close();
  console.log("docs section screenshots saved");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
