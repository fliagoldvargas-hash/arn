const fs = require("node:fs/promises");
const path = require("node:path");
const { chromium } = require("playwright");

async function main() {
  const root = process.cwd();
  const dir = path.join(root, "docs", "design-references", "local");
  await fs.mkdir(dir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await page.goto("http://127.0.0.1:3000/#marketplace", { waitUntil: "networkidle", timeout: 60000 });
  await page.getByRole("button", { name: /Explore the marketplace/i }).click();
  await page.screenshot({ path: path.join(dir, "marketplace-modal.png"), fullPage: false });
  await browser.close();
  console.log("marketplace modal screenshot saved");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
