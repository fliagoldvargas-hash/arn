"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { ryuxConfig } from "@/config/ryux";

const processSteps = [
  {
    number: "01",
    title: "Launch a Token",
    body: "Drop a token on Solana through Pump.fun using the RYUX launchpad. Traders and community show up instantly.",
  },
  {
    number: "02",
    title: "Pair with AI Infrastructure",
    body: "Connect the token to AI agent infrastructure. Bring your own setup or buy cloud deployment directly through RYUX.",
  },
  {
    number: "03",
    title: "Agent Makes Money",
    body: "Trading fees go straight into the agent wallet. It pays for its own operations, upgrades, and keeps growing.",
  },
  {
    number: "04",
    title: "Scale and Evolve",
    body: "Builders manage everything from their dashboard. Investors track performance and trade tokens on the live market.",
  },
];

const skills = [
  ["Digital Business Ops", "Run online stores, process orders, talk to customers. All on autopilot."],
  ["Asset Trading", "DCA, arbitrage, multi-DEX routing, and advanced strategies that execute automatically."],
  ["Social Media", "Post content, engage communities, grow audiences across platforms at scale."],
  ["Analytics and Intel", "On-chain data, sentiment tracking, and market reports that actually help you trade."],
  ["Revenue Generation", "Affiliate deals, content monetization, freelancing. Real income streams."],
  ["Custom Automation", "Scraping, API calls, email flows. Whatever digital work needs to get done."],
];

const builderItems = ["Full Agent Dashboard", "One-Click Cloud Deploy", "Bring Your Own Agent", "Built-In Funding Network"];
const investorItems = ["Verified Marketplace", "Live Market Data", "Portfolio Tracking", "Trade Directly"];

type WalletLike = {
  isPhantom?: boolean;
  isSolflare?: boolean;
  connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>;
};

export function RyuxDocsPage() {
  const [scrolled, setScrolled] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletStatus, setWalletStatus] = useState<"idle" | "connecting" | "missing">("idle");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const provider = getSolanaProvider();
    provider
      ?.connect({ onlyIfTrusted: true })
      .then((response) => setWalletAddress(response.publicKey.toString()))
      .catch(() => undefined);
  }, []);

  const connectWallet = async () => {
    const provider = getSolanaProvider();
    if (!provider) {
      setWalletStatus("missing");
      window.open("https://phantom.app/", "_blank", "noopener,noreferrer");
      return;
    }

    try {
      setWalletStatus("connecting");
      const response = await provider.connect();
      setWalletAddress(response.publicKey.toString());
      setWalletStatus("idle");
    } catch {
      setWalletStatus("idle");
    }
  };

  const walletLabel = walletAddress
    ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
    : walletStatus === "connecting"
      ? "Connecting"
      : walletStatus === "missing"
        ? "Install Wallet"
        : "Connect Wallet";

  return (
    <main className="docs-shell">
      <nav className={`nav ${scrolled ? "nav--scrolled" : ""}`} aria-label="Primary navigation">
        <a className="brand" href="/">
          <Image src="/images/ryux/ryux-logo.png" alt="RYUX" width={28} height={28} />
          <span>RYUX</span>
        </a>
        <div className="nav__links">
          <a href="/#platform">Build</a>
          <a href="/#marketplace">Marketplace</a>
          <a href="/docs">Docs</a>
        </div>
        <div className="nav__actions">
          <a className="social-link" href={ryuxConfig.xUrl} target="_blank" rel="noreferrer" aria-label="RYUX on X">
            X
          </a>
          <a
            className={`social-link social-link--image ${ryuxConfig.pumpFunUrl ? "" : "social-link--disabled"}`}
            href={ryuxConfig.pumpFunUrl || "#"}
            target={ryuxConfig.pumpFunUrl ? "_blank" : undefined}
            rel={ryuxConfig.pumpFunUrl ? "noreferrer" : undefined}
            aria-disabled={!ryuxConfig.pumpFunUrl}
            aria-label="RYUX on Pump.fun"
          >
            <Image src="/images/ryux/pumplogo.png" alt="" width={15} height={15} />
          </a>
          <button className="connect" onClick={connectWallet}>
            <Wallet size={13} />
            <span>{walletLabel}</span>
          </button>
        </div>
      </nav>

      <section className="docs-hero">
        <span className="docs-eyebrow">DOCUMENTATION - 2026</span>
        <h1>
          The AI Agent
          <span>Economy Platform</span>
        </h1>
        <p>Where builders launch tokenized AI agents and investors back autonomous businesses that make real money on Solana.</p>
        <div className="hero__buttons">
          <a className="button button--primary" href="/#marketplace">Explore Market</a>
          <a className="button button--ghost" href="/#platform">Launch Agent</a>
        </div>
      </section>

      <DocsSection eyebrow="THE PROBLEM & SOLUTION" title="What is RYUX?">
        <div className="docs-two-grid">
          <DocCard label="THE PROBLEM">
            AI agents are going to run the internet. But right now there&apos;s nowhere to launch one as an actual investable
            business and nowhere for investors to find and fund them.
          </DocCard>
          <DocCard label="THE SOLUTION">
            RYUX connects tokens to AI agent infrastructure, creating <strong>tokenized autonomous agents.</strong> Think
            of each one as a digital company that does real work, makes real money, and grows on its own. The token is
            your ownership.
          </DocCard>
        </div>
      </DocsSection>

      <DocsSection eyebrow="PROCESS" title="How It Works">
        <div className="process-list">
          {processSteps.map((step) => (
            <article className="process-row" key={step.number}>
              <span>{step.number}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </article>
          ))}
        </div>
      </DocsSection>

      <DocsSection eyebrow="CAPABILITIES" title="The Skill Market">
        <p className="docs-lede">
          Agents buy skills from the RYUX marketplace. These are modular tools that give agents real capabilities and turn
          tokens into working businesses.
        </p>
        <div className="skill-grid">
          {skills.map(([title, body]) => (
            <article className="skill-card" key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </DocsSection>

      <DocsSection eyebrow="WHO IT'S FOR" title="Built for Builders & Investors">
        <div className="docs-two-grid">
          <FeatureList title="For Builders" items={builderItems} />
          <FeatureList title="For Investors" items={investorItems} />
        </div>
      </DocsSection>

      <section className="vision-panel">
        <span className="docs-eyebrow">THE VISION</span>
        <p>
          Software that doesn&apos;t just follow orders. It <strong>runs itself, earns money, and gets better over time.</strong>{" "}
          RYUX is where these agents get built, funded, and turned into real businesses.
        </p>
        <div className="vision-metrics">
          <div><strong>Token - Agent</strong><span>EVERY TOKEN BECOMES A BUSINESS</span></div>
          <div><strong>Self-Funded</strong><span>REVENUE FROM TRADING FEES</span></div>
          <div><strong>Autonomous</strong><span>AI OPERATES INDEPENDENTLY</span></div>
        </div>
      </section>

      <DocsSection eyebrow="TRUST & SAFETY" title="Security & Verification">
        <p className="docs-lede">
          Every launch follows strict security rules. Only the original creator wallet can link an agent to its token.
          Everything is verifiable on-chain.
        </p>
        <div className="safety-pills">
          <span>x PREVENTED: IMPERSONATION</span>
          <span>x PREVENTED: FAKE LISTINGS</span>
          <span>x PREVENTED: UNAUTHORIZED CLAIMS</span>
        </div>
      </DocsSection>

      <section className="technical-panel">
        <h2>Technical Documentation</h2>
        <p>Full API docs, SDK guides, and deployment walkthroughs. Dropping when agent infrastructure goes live.</p>
        <span>COMING SOON</span>
      </section>

      <section className="disclaimer">
        <span className="docs-eyebrow">DISCLAIMER</span>
        <p>
          RYUX is a platform for launching and discovering AI agent projects. Nothing here is financial advice. Always do
          your own research. We don&apos;t guarantee the performance or legitimacy of any token launched through the platform.
        </p>
      </section>

      <footer className="footer docs-footer">
        <p>&copy; 2026 RYUX</p>
        <div className="footer__links">
          <a href="/#marketplace">Marketplace</a>
          <a href="/roadmap">Roadmap</a>
          <a href="/docs">Docs</a>
          <a href={ryuxConfig.xUrl} target="_blank" rel="noreferrer">
            X
          </a>
        </div>
      </footer>
    </main>
  );
}

function getSolanaProvider() {
  if (typeof window === "undefined") return undefined;
  const walletWindow = window as typeof window & { solana?: WalletLike; solflare?: WalletLike };
  return walletWindow.solana?.isPhantom ? walletWindow.solana : walletWindow.solflare ?? walletWindow.solana;
}

function DocsSection({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="docs-section">
      <span className="docs-eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function DocCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <article className="doc-card">
      <span>{label}</span>
      <p>{children}</p>
    </article>
  );
}

function FeatureList({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="feature-list">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </article>
  );
}
