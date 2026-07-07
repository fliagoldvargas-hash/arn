const fs = require("node:fs/promises");
const path = require("node:path");

const root = process.cwd();
const assets = [
  ["https://www.neurix.sh/logo.png", "public/images/neurix/logo.png"],
  ["https://www.neurix.sh/neurix-new-logo.jpg", "public/images/neurix/neurix-new-logo.jpg"],
  ["https://www.neurix.sh/pumplogo.png", "public/images/neurix/pumplogo.png"],
  ["https://www.neurix.sh/juplogo.png", "public/images/neurix/juplogo.png"],
  ["https://www.neurix.sh/icon.png?icon.6ff855c0.png", "public/seo/icon.png"],
  ["https://www.neurix.sh/apple-icon.png?apple-icon.40c87d98.png", "public/seo/apple-icon.png"],
];

async function download(url, dest) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed ${response.status} for ${url}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  const file = path.join(root, dest);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, buffer);
  return { url, dest, bytes: buffer.length };
}

Promise.all(assets.map(([url, dest]) => download(url, dest)))
  .then((results) => console.log(JSON.stringify(results, null, 2)))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
