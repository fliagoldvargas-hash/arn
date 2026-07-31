const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

const root = process.cwd();
const outDir = path.join(root, "docs", "social", "assets");
const logoPath = path.join(root, "public", "images", "ryux", "ryux-logo.png");

const WIDTH = 2048;
const HEIGHT = 1024;

const cards = [
  {
    file: "ryux-minimal-01-agents.png",
    layout: "markText",
    title: "AGENTS",
    subtitle: "that earn.",
  },
  {
    file: "ryux-minimal-02-tokenized.png",
    layout: "center",
    title: "TOKENIZED",
    subtitle: "AUTONOMOUS AGENTS",
  },
  {
    file: "ryux-minimal-03-onchain.png",
    layout: "markText",
    title: "ON-CHAIN",
    subtitle: "agent economy.",
  },
  {
    file: "ryux-minimal-04-build.png",
    layout: "stack",
    lines: ["BUILD", "CONNECT", "EARN"],
  },
  {
    file: "ryux-minimal-05-treasury.png",
    layout: "center",
    title: "TREASURIES",
    subtitle: "owned on-chain.",
  },
  {
    file: "ryux-minimal-06-marketplace.png",
    layout: "center",
    title: "MARKETPLACE",
    subtitle: "coming soon.",
  },
  {
    file: "ryux-minimal-07-solana.png",
    layout: "markText",
    title: "BUILT",
    subtitle: "on Solana.",
  },
  {
    file: "ryux-minimal-08-no-black-boxes.png",
    layout: "center",
    title: "NO BLACK",
    subtitle: "BOXES.",
  },
  {
    file: "ryux-minimal-09-website-building.png",
    layout: "center",
    title: "WEBSITE",
    subtitle: "in progress.",
  },
  {
    file: "ryux-minimal-10-website-live.png",
    layout: "center",
    title: "WEBSITE",
    subtitle: "now live.",
  },
  {
    file: "ryux-minimal-11-prelaunch.png",
    layout: "center",
    title: "LAUNCH",
    subtitle: "approaching.",
  },
  {
    file: "ryux-minimal-12-launch-live.png",
    layout: "center",
    title: "RYUX",
    subtitle: "now live on Pump.fun.",
  },
  {
    file: "ryux-minimal-13-skills.png",
    layout: "center",
    title: "SKILLS",
    subtitle: "for autonomous agents.",
  },
  {
    file: "ryux-minimal-14-treasury-layer.png",
    layout: "center",
    title: "TREASURY",
    subtitle: "layer.",
  },
  {
    file: "ryux-minimal-15-discovery.png",
    layout: "center",
    title: "DISCOVERY",
    subtitle: "for agent projects.",
  },
  {
    file: "ryux-minimal-16-builders.png",
    layout: "center",
    title: "BUILDERS",
    subtitle: "launch agents.",
  },
  {
    file: "ryux-minimal-17-verifiable.png",
    layout: "center",
    title: "VERIFIABLE",
    subtitle: "on-chain activity.",
  },
  {
    file: "ryux-minimal-18-community-allocation.png",
    layout: "center",
    title: "COMMUNITY",
    subtitle: "allocation.",
  },
  {
    file: "ryux-minimal-19-official-links.png",
    layout: "center",
    title: "OFFICIAL",
    subtitle: "links only.",
  },
  {
    file: "ryux-minimal-20-roadmap-next.png",
    layout: "center",
    title: "ROADMAP",
    subtitle: "next layers.",
  },
  {
    file: "ryux-minimal-21-use-cases.png",
    layout: "center",
    title: "USE CASES",
    subtitle: "for agents.",
  },
  {
    file: "ryux-minimal-22-agent-ideas.png",
    layout: "center",
    title: "AGENT IDEAS",
    subtitle: "wanted.",
  },
  {
    file: "ryux-minimal-23-proof.png",
    layout: "center",
    title: "PROOF",
    subtitle: "before promises.",
  },
  {
    file: "ryux-minimal-24-buybacks.png",
    layout: "center",
    title: "BUYBACKS",
    subtitle: "from creator rewards.",
  },
  {
    file: "ryux-minimal-25-qa-open.png",
    layout: "center",
    title: "Q&A OPEN",
    subtitle: "ask anything.",
    softGlow: true,
  },
  {
    file: "ryux-minimal-26-why-tokens.png",
    layout: "center",
    title: "WHY TOKENS",
    subtitle: "coordination layer.",
  },
  {
    file: "ryux-minimal-27-agent-profiles.png",
    layout: "center",
    title: "AGENT PROFILES",
    subtitle: "public by design.",
    titleSize: 130,
  },
  {
    file: "ryux-minimal-28-modular-skills.png",
    layout: "center",
    title: "MODULAR SKILLS",
    subtitle: "agent capabilities.",
    titleSize: 124,
  },
  {
    file: "ryux-minimal-29-visible-treasury.png",
    layout: "center",
    title: "VISIBLE TREASURY",
    subtitle: "on-chain context.",
    titleSize: 114,
  },
  {
    file: "ryux-minimal-30-market-signals.png",
    layout: "center",
    title: "MARKET SIGNALS",
    subtitle: "for agent discovery.",
    titleSize: 132,
  },
  {
    file: "ryux-minimal-31-continuous-buybacks.png",
    layout: "center",
    title: "CONTINUOUS",
    subtitle: "buybacks.",
  },
  {
    file: "ryux-minimal-32-your-take.png",
    layout: "center",
    title: "YOUR TAKE",
    subtitle: "shape the thesis.",
  },
  {
    file: "ryux-minimal-33-ship-next.png",
    layout: "center",
    title: "SHIP NEXT",
    subtitle: "choose the layer.",
  },
  {
    file: "ryux-minimal-34-one-agent.png",
    layout: "center",
    title: "ONE AGENT",
    subtitle: "what would it do?",
  },
  {
    file: "ryux-minimal-35-more-tomorrow.png",
    layout: "center",
    title: "MORE TOMORROW",
    subtitle: "marketplace updates.",
    titleSize: 130,
  },
  {
    file: "ryux-minimal-36-early-holders.png",
    layout: "center",
    title: "EARLY HOLDERS",
    subtitle: "22 and building.",
    titleSize: 130,
  },
  {
    file: "ryux-minimal-37-july-15.png",
    layout: "center",
    title: "15/07",
    subtitle: "marketplace access.",
  },
  {
    file: "ryux-minimal-38-reward-round.png",
    layout: "center",
    title: "REWARD ROUND",
    subtitle: "agent ideas.",
    titleSize: 132,
  },
  {
    file: "ryux-minimal-39-tag-a-project.png",
    layout: "center",
    title: "TAG A PROJECT",
    subtitle: "partner preview.",
    titleSize: 128,
  },
  {
    file: "ryux-minimal-40-ask-before-launch.png",
    layout: "center",
    title: "ASK BEFORE",
    subtitle: "marketplace launch.",
    titleSize: 138,
  },
  {
    file: "ryux-minimal-41-why-hold.png",
    layout: "center",
    title: "WHY HOLD",
    subtitle: "ecosystem access.",
  },
  {
    file: "ryux-minimal-42-proof-of-work.png",
    layout: "center",
    title: "PROOF OF WORK",
    subtitle: "public updates.",
    titleSize: 128,
  },
  {
    file: "ryux-minimal-43-rewards-back.png",
    layout: "center",
    title: "REWARDS BACK",
    subtitle: "into RYUX.",
    titleSize: 134,
  },
  {
    file: "ryux-minimal-44-first-50.png",
    layout: "center",
    title: "FIRST 50",
    subtitle: "holder push.",
  },
  {
    file: "ryux-minimal-45-official-ca.png",
    layout: "center",
    title: "OFFICIAL CA",
    subtitle: "verify first.",
    titleSize: 138,
  },
  {
    file: "ryux-minimal-46-demo-tomorrow.png",
    layout: "center",
    title: "DEMO TOMORROW",
    subtitle: "marketplace preview.",
    titleSize: 122,
  },
  {
    file: "ryux-minimal-47-three-percent.png",
    layout: "center",
    title: "3% DISTRIBUTION",
    subtitle: "holder rewards.",
    titleSize: 116,
  },
  {
    file: "ryux-minimal-48-choose-next.png",
    layout: "center",
    title: "CHOOSE NEXT",
    subtitle: "shape the demo.",
    titleSize: 136,
  },
  {
    file: "ryux-minimal-49-not-chatbots.png",
    layout: "center",
    title: "NOT CHATBOTS",
    subtitle: "autonomous businesses.",
    titleSize: 132,
  },
  {
    file: "ryux-minimal-50-partner-preview.png",
    layout: "center",
    title: "PARTNER PREVIEW",
    subtitle: "tag projects.",
    titleSize: 118,
  },
  {
    file: "ryux-minimal-51-quality-or-open.png",
    layout: "center",
    title: "QUALITY OR OPEN",
    subtitle: "community decides.",
    titleSize: 114,
  },
  {
    file: "ryux-minimal-52-in-public.png",
    layout: "center",
    title: "IN PUBLIC",
    subtitle: "progress visible.",
  },
  {
    file: "ryux-minimal-53-discovery-layer.png",
    layout: "center",
    title: "DISCOVERY LAYER",
    subtitle: "for agents.",
    titleSize: 120,
  },
  {
    file: "ryux-minimal-54-holder-signal.png",
    layout: "center",
    title: "HOLDER SIGNAL",
    subtitle: "why RYUX?",
    titleSize: 130,
  },
  {
    file: "ryux-minimal-55-next-preview.png",
    layout: "center",
    title: "NEXT PREVIEW",
    subtitle: "coming tomorrow.",
    titleSize: 134,
  },
  {
    file: "ryux-minimal-56-marketplace-matters.png",
    layout: "center",
    title: "MARKETPLACE",
    subtitle: "why it matters.",
    titleSize: 138,
  },
  {
    file: "ryux-minimal-57-holder-votes.png",
    layout: "center",
    title: "HOLDER VOTES",
    subtitle: "community-led.",
    titleSize: 128,
  },
  {
    file: "ryux-minimal-58-token-lock.png",
    layout: "center",
    title: "TOKEN LOCK",
    subtitle: "trust first.",
    titleSize: 138,
  },
  {
    file: "ryux-minimal-59-major-update.png",
    layout: "center",
    title: "MAJOR UPDATE",
    subtitle: "trust structure.",
    titleSize: 126,
  },
];

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function serifText(text, x, y, size, options = {}) {
  const {
    anchor = "middle",
    opacity = 0.96,
    weight = 700,
    spacing = 10,
    filter = "url(#textGlow)",
  } = options;

  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Georgia, Times New Roman, serif" font-size="${size}" font-weight="${weight}" letter-spacing="${spacing}" fill="#ffffff" opacity="${opacity}" filter="${filter}">${escapeXml(text)}</text>`;
}

function smallText(text, x, y, size, options = {}) {
  const {
    anchor = "middle",
    opacity = 0.72,
    weight = 400,
    spacing = 1,
    filter = "url(#softGlow)",
    italic = false,
  } = options;

  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Georgia, Times New Roman, serif" font-size="${size}" font-weight="${weight}" font-style="${italic ? "italic" : "normal"}" letter-spacing="${spacing}" fill="#ffffff" opacity="${opacity}" filter="${filter}">${escapeXml(text)}</text>`;
}

function renderLogo(x, y, size, logoData) {
  return `
    <image href="data:image/png;base64,${logoData}" x="${x}" y="${y}" width="${size}" height="${size}" opacity=".98" filter="url(#logoGlow)"/>
  `;
}

function renderCard(card, logoData) {
  const titleFilter = card.softGlow ? "url(#textGlowSubtle)" : "url(#textGlow)";
  const subtitleFilter = card.softGlow ? "url(#softGlowSubtle)" : "url(#softGlow)";
  const bg = `
    <rect width="${WIDTH}" height="${HEIGHT}" fill="#000"/>
    <ellipse cx="1024" cy="512" rx="650" ry="210" fill="#ffffff" opacity=".012" filter="url(#blur)"/>
  `;

  let content = "";

  if (card.layout === "markText") {
    content = `
      ${renderLogo(430, 333, 350, logoData)}
      ${serifText(card.title, 885, 497, 190, { anchor: "start", spacing: 14 })}
      ${smallText(card.subtitle, 895, 605, 70, { anchor: "start", italic: true, opacity: 0.74 })}
    `;
  }

  if (card.layout === "center") {
    content = `
      ${renderLogo(894, 185, 260, logoData)}
      ${serifText(card.title, 1024, 589, card.titleSize || 158, { spacing: 14, filter: titleFilter })}
      ${smallText(card.subtitle, 1024, 696, 62, { italic: card.subtitle.includes("."), filter: subtitleFilter })}
    `;
  }

  if (card.layout === "stack") {
    content = `
      ${renderLogo(894, 115, 260, logoData)}
      ${serifText(card.lines[0], 1024, 498, 140, { spacing: 12 })}
      ${serifText(card.lines[1], 1024, 642, 140, { spacing: 12 })}
      ${serifText(card.lines[2], 1024, 786, 140, { spacing: 12 })}
    `;
  }

  return `
    <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="textGlow" x="-35%" y="-80%" width="170%" height="260%">
          <feGaussianBlur stdDeviation="4" result="b1"/>
          <feGaussianBlur stdDeviation="13" result="b2"/>
          <feMerge>
            <feMergeNode in="b2"/>
            <feMergeNode in="b1"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="textGlowSubtle" x="-25%" y="-55%" width="150%" height="210%">
          <feGaussianBlur stdDeviation="2" result="b1"/>
          <feGaussianBlur stdDeviation="6" result="b2"/>
          <feMerge>
            <feMergeNode in="b2"/>
            <feMergeNode in="b1"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="softGlow" x="-35%" y="-80%" width="170%" height="260%">
          <feGaussianBlur stdDeviation="5" result="b1"/>
          <feMerge>
            <feMergeNode in="b1"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="softGlowSubtle" x="-25%" y="-55%" width="150%" height="210%">
          <feGaussianBlur stdDeviation="2" result="b1"/>
          <feMerge>
            <feMergeNode in="b1"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="logoGlow" x="-70%" y="-70%" width="240%" height="240%">
          <feGaussianBlur stdDeviation="12" result="b1"/>
          <feGaussianBlur stdDeviation="24" result="b2"/>
          <feMerge>
            <feMergeNode in="b2"/>
            <feMergeNode in="b1"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="blur"><feGaussianBlur stdDeviation="80"/></filter>
      </defs>
      ${bg}
      ${content}
    </svg>
  `;
}

async function main() {
  await fs.mkdir(outDir, { recursive: true });
  const logoData = (await fs.readFile(logoPath)).toString("base64");

  for (const card of cards) {
    const svg = renderCard(card, logoData);
    const outPath = path.join(outDir, card.file);
    await sharp(Buffer.from(svg)).png({ quality: 96 }).toFile(outPath);
    console.log(`saved ${path.relative(root, outPath)}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
