"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Activity, Search, Share2, Wallet } from "lucide-react";
import { ryuxConfig } from "@/config/ryux";
import { useRyuxMotion } from "@/components/useRyuxMotion";

type WalletLike = {
  isPhantom?: boolean;
  isSolflare?: boolean;
  connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>;
};

type DemoAgent = {
  name: string;
  ticker: string;
  description: string;
  price: string;
  change: string;
  mcap: string;
  volume: string;
  ca: string;
  tone: "blue" | "green" | "violet";
  chart: string;
};

const demoAgents: DemoAgent[] = [
  {
    name: "Signal",
    ticker: "$SIGNAL",
    description: "Market-intel agent that monitors narratives, liquidity shifts, and early Solana opportunities.",
    price: "$0.0000824",
    change: "4.8%",
    mcap: "$82.4K",
    volume: "$1.2K",
    ca: "8sGNq2...pump",
    tone: "blue",
    chart: "M0 58 C30 48 48 64 74 42 C102 18 126 34 150 24 C180 10 206 32 238 18",
  },
  {
    name: "Vector",
    ticker: "$VECTOR",
    description: "Execution agent for automated treasury actions, DCA strategies, and portfolio routing.",
    price: "$0.000137",
    change: "2.1%",
    mcap: "$137.0K",
    volume: "$3.8K",
    ca: "4vCTR9...pump",
    tone: "green",
    chart: "M0 54 C28 58 48 44 70 48 C96 54 106 20 134 28 C162 36 184 16 238 24",
  },
  {
    name: "Relay",
    ticker: "$RELAY",
    description: "Community ops agent that publishes updates, answers holders, and turns signals into content.",
    price: "$0.0000591",
    change: "6.3%",
    mcap: "$59.1K",
    volume: "$860",
    ca: "7rLYk4...pump",
    tone: "violet",
    chart: "M0 44 C24 22 42 50 68 36 C92 22 112 60 138 42 C170 18 202 46 238 30",
  },
];

const stats = [
  ["3", "Demo Agents"],
  ["$278.5K", "Demo Value"],
  ["$5.8K", "24h Activity"],
  ["$91.2K", "Total Liquidity"],
];

export function RyuxMarketplacePage() {
  const pageRef = useRef<HTMLElement | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletStatus, setWalletStatus] = useState<"idle" | "connecting" | "missing">("idle");

  useRyuxMotion(pageRef);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
    <main className="marketplace-demo-shell" ref={pageRef}>
      <nav className={`nav ${scrolled ? "nav--scrolled" : ""}`} aria-label="Primary navigation">
        <a className="brand" href="/">
          <Image src="/images/ryux/ryux-logo.png" alt="RYUX" width={28} height={28} />
          <span>RYUX</span>
        </a>
        <div className="nav__links">
          <a href="/#platform">Build</a>
          <a href="/marketplace">Marketplace</a>
          <a href="/docs">Docs</a>
          <a href="/roadmap">Roadmap</a>
        </div>
        <div className="nav__actions">
          <a className="social-link" href={ryuxConfig.xUrl} target="_blank" rel="noreferrer" aria-label="RYUX on X">
            X
          </a>
          <button className="connect" onClick={connectWallet}>
            <Wallet size={13} />
            <span>{walletLabel}</span>
          </button>
        </div>
      </nav>

      <section className="marketplace-demo-hero">
        <div className="marketplace-demo-mark">
          <Image src="/images/ryux/ryux-logo.png" alt="" width={42} height={42} />
        </div>
        <span className="docs-eyebrow">THE RYUX COLLECTION</span>
        <h1>Agent Library</h1>
        <p>
          Browse a demo catalog of autonomous AI agent projects for the RYUX ecosystem.
          Each card is placeholder data for investor previews.
        </p>

        <div className="marketplace-demo-stats">
          {stats.map(([value, label]) => (
            <div key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>

        <label className="marketplace-demo-search">
          <Search size={15} />
          <input placeholder="Search the catalog..." />
        </label>
      </section>

      <section className="marketplace-demo-library" aria-label="RYUX demo marketplace">
        <div className="marketplace-demo-toolbar">
          <div className="marketplace-demo-tabs">
            {["All Entries", "Trending", "Recently Added", "Top Valued"].map((tab, index) => (
              <button className={index === 0 ? "is-active" : ""} key={tab}>
                {tab}
              </button>
            ))}
          </div>
          <select aria-label="Sort demo agents">
            <option>Newest First</option>
            <option>By Market Cap</option>
            <option>By Volume</option>
          </select>
        </div>

        <div className="marketplace-demo-grid">
          {demoAgents.map((agent) => (
            <article className={`marketplace-demo-card marketplace-demo-card--${agent.tone}`} key={agent.name}>
              <div className="marketplace-demo-card__head">
                <div className="marketplace-demo-orb">
                  <Activity size={18} />
                </div>
                <div>
                  <h2>{agent.name}</h2>
                  <span>{agent.ticker}</span>
                </div>
              </div>
              <p>{agent.description}</p>
              <svg className="marketplace-demo-chart" viewBox="0 0 238 78" role="img" aria-label={`${agent.name} demo price chart`}>
                <path d={agent.chart} />
              </svg>
              <div className="marketplace-demo-price">
                <strong>{agent.price}</strong>
                <span>{agent.change}</span>
              </div>
              <div className="marketplace-demo-metrics">
                <div>
                  <span>MCAP</span>
                  <strong>{agent.mcap}</strong>
                </div>
                <div>
                  <span>VOL</span>
                  <strong>{agent.volume}</strong>
                </div>
              </div>
              <div className="marketplace-demo-card__foot">
                <span>{agent.ca}</span>
                <Share2 size={14} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="footer docs-footer">
        <p>&copy; 2026 RYUX Demo</p>
        <div className="footer__links">
          <a href="/">Home</a>
          <a href="/marketplace">Library</a>
          <a href="/#platform">Build</a>
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
