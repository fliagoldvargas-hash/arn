"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Box,
  Copy,
  Sparkles,
  Star,
  Users,
  Wallet,
  WalletCards,
} from "lucide-react";
import { getContractLabel, ryuxConfig } from "@/config/ryux";
import { LightRays } from "@/components/LightRays";
import { SpecularButton } from "@/components/SpecularButton";
import { useRyuxMotion } from "@/components/useRyuxMotion";
import type { Metric, PlatformCard } from "@/types/ryux";

type SolanaWalletProvider = {
  isPhantom?: boolean;
  isSolflare?: boolean;
  publicKey?: { toString: () => string };
  connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>;
  disconnect?: () => Promise<void>;
};

type TokenStats = {
  change24h: string;
  changeTone: "positive" | "negative" | "neutral";
  marketCap: string;
  volume24h: string;
};

type DexScreenerPair = {
  url?: string;
  volume?: { h24?: number };
  priceChange?: { h24?: number };
  marketCap?: number;
  fdv?: number;
  liquidity?: { usd?: number };
};

declare global {
  interface Window {
    solana?: SolanaWalletProvider;
    solflare?: SolanaWalletProvider;
  }
}

const platformCards: PlatformCard[] = [
  {
    number: "01",
    title: "Build Your Agent",
    body:
      "Use the ORBIS framework to create autonomous agents from scratch. Define behaviors, set strategies, connect to on-chain protocols. Your agent runs 24/7 on Solana infrastructure.",
    icon: Star,
    cta: "View documentation",
    wide: true,
  },
  {
    number: "02",
    title: "Tokenize, If You Want",
    body:
      "Tokenization is now optional. Launch your agent with its own token on Pump.fun or Meteora to enable community ownership and trading. Or keep it private and focus purely on performance.",
    icon: WalletCards,
    badges: ["Pump.fun", "Meteora"],
    wide: true,
  },
  {
    number: "03",
    title: "On-Chain Treasury",
    body: "Every agent can manage its own treasury. Revenue flows directly on-chain with full transparency.",
    icon: Box,
  },
  {
    number: "04",
    title: "Community Signals",
    body: "Community feedback helps shape how agents evolve, which tools get prioritized, and what the ecosystem builds next.",
    icon: Users,
  },
  {
    number: "05",
    title: "Creator Rewards",
    body: "Earn revenue every time your agent's token is traded. Aligned incentives from day one.",
    icon: BarChart3,
  },
];

const labMetrics: Metric[] = [
  { value: "v2.0", label: "AGENT FRAMEWORK", note: "In development" },
  { value: "12+", label: "PROTOCOL INTEGRATIONS", note: "Solana ecosystem" },
  { value: "Growing", label: "AGENTS DEPLOYED", note: "And counting" },
];

const defaultTokenStats: TokenStats = {
  change24h: "SOON",
  changeTone: "neutral",
  marketCap: "SOON",
  volume24h: "SOON",
};

export function RyuxLanding() {
  const pageRef = useRef<HTMLElement | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletStatus, setWalletStatus] = useState<"idle" | "connecting" | "missing">("idle");
  const [activeModal, setActiveModal] = useState<"building" | "marketplace" | null>(null);
  const [tokenStats, setTokenStats] = useState<TokenStats>(defaultTokenStats);

  useRyuxMotion(pageRef);

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

  useEffect(() => {
    if (!activeModal) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveModal(null);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeModal]);

  useEffect(() => {
    let cancelled = false;
    const ca = ryuxConfig.contractAddress.trim();

    if (!ca || ca === "SOON") {
      setTokenStats(defaultTokenStats);
      return undefined;
    }

    const loadTokenStats = async () => {
      try {
        const response = await fetch(`https://api.dexscreener.com/tokens/v1/solana/${encodeURIComponent(ca)}`);
        if (!response.ok) throw new Error("Token stats unavailable");

        const pairs = (await response.json()) as DexScreenerPair[];
        const pair = selectBestPair(pairs, ryuxConfig.pumpFunUrl);
        if (!pair || cancelled) return;

        const change = pair.priceChange?.h24;
        setTokenStats({
          change24h: formatPercent(change),
          changeTone: getChangeTone(change),
          marketCap: formatUsd(pair.marketCap ?? pair.fdv),
          volume24h: formatUsd(pair.volume?.h24),
        });
      } catch {
        if (!cancelled) setTokenStats(defaultTokenStats);
      }
    };

    void loadTokenStats();
    const interval = window.setInterval(loadTokenStats, 30_000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const copyAddress = async () => {
    await navigator.clipboard?.writeText(ryuxConfig.contractAddress);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

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

  return (
    <main className="site-shell" ref={pageRef}>
      <div className="light-rays-bg" aria-hidden="true">
        <LightRays
          raysOrigin="top-center"
          raysColor="#00ffff"
          raysSpeed={1.5}
          lightSpread={1}
          rayLength={1.2}
          saturation={1}
          followMouse
          mouseInfluence={0}
          noiseAmount={0.1}
          distortion={0.05}
        />
      </div>
      <Navigation
        scrolled={scrolled}
        walletAddress={walletAddress}
        walletStatus={walletStatus}
        onConnectWallet={connectWallet}
        onMarketplaceClick={() => setActiveModal("marketplace")}
      />
      <Hero
        copied={copied}
        onCopy={copyAddress}
        onStartBuilding={() => setActiveModal("building")}
        tokenStats={tokenStats}
      />
      <Platform />
      <Marketplace />
      <Labs />
      <Cta onStartBuilding={() => setActiveModal("building")} />
      <Footer />
      {activeModal ? (
        <SystemUpdateModal
          eyebrow={activeModal === "building" ? "System Update" : "Marketplace"}
          title={activeModal === "building" ? "We're upgrading." : "Coming soon."}
          message={
            activeModal === "building"
              ? "Wallet features are being updated. New updates and the dashboard will release soon."
              : "The marketplace is being finished and will launch to the public on 03/08."
          }
          onClose={() => setActiveModal(null)}
        />
      ) : null}
    </main>
  );
}

function getSolanaProvider() {
  if (typeof window === "undefined") return undefined;
  return window.solana?.isPhantom ? window.solana : window.solflare ?? window.solana;
}

function shortenAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function selectBestPair(pairs: DexScreenerPair[], pumpFunUrl: string) {
  const pumpPair = pairs.find((pair) => pumpFunUrl && pair.url === pumpFunUrl);
  if (pumpPair) return pumpPair;

  return [...pairs].sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];
}

function formatUsd(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "SOON";

  return new Intl.NumberFormat("en-US", {
    compactDisplay: "short",
    currency: "USD",
    maximumFractionDigits: value >= 1000 ? 1 : 2,
    notation: "compact",
    style: "currency",
  }).format(value);
}

function formatPercent(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "SOON";

  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)}%`;
}

function getChangeTone(value?: number): TokenStats["changeTone"] {
  if (typeof value !== "number" || !Number.isFinite(value) || value === 0) return "neutral";
  return value > 0 ? "positive" : "negative";
}

function Navigation({
  scrolled,
  walletAddress,
  walletStatus,
  onConnectWallet,
  onMarketplaceClick,
}: {
  scrolled: boolean;
  walletAddress: string;
  walletStatus: "idle" | "connecting" | "missing";
  onConnectWallet: () => void;
  onMarketplaceClick: () => void;
}) {
  const walletLabel = walletAddress
    ? shortenAddress(walletAddress)
    : walletStatus === "connecting"
      ? "Connecting"
      : walletStatus === "missing"
        ? "Install Wallet"
        : "Connect Wallet";

  return (
    <nav className={`nav ${scrolled ? "nav--scrolled" : ""}`} aria-label="Primary navigation">
      <a className="brand" href="#">
        <Image src="/images/orbis/orbis-logo.png" alt="Orbis Agents" width={28} height={28} />
        <span>ORBIS AGENTS</span>
      </a>
      <div className="nav__links">
        <a href="#platform">Build</a>
        <button className="nav__link-button" type="button" onClick={onMarketplaceClick}>
          Marketplace
        </button>
        <a href="/docs">Docs</a>
        <a href="/roadmap">Roadmap</a>
      </div>
      <div className="nav__actions">
        <a className="social-link" href={ryuxConfig.xUrl} target="_blank" rel="noreferrer" aria-label="ORBIS on X">
          X
        </a>
        <a
          className={`social-link social-link--image ${ryuxConfig.pumpFunUrl ? "" : "social-link--disabled"}`}
          href={ryuxConfig.pumpFunUrl || "#"}
          target={ryuxConfig.pumpFunUrl ? "_blank" : undefined}
          rel={ryuxConfig.pumpFunUrl ? "noreferrer" : undefined}
          aria-disabled={!ryuxConfig.pumpFunUrl}
          aria-label="ORBIS on Pump.fun"
        >
          <Image src="/images/ryux/pumplogo.png" alt="" width={15} height={15} />
        </a>
        <SpecularButton className="connect" onClick={onConnectWallet} size="sm" radius={15} shineSize={14} shineFade={46}>
          <Wallet size={13} />
          <span>{walletLabel}</span>
        </SpecularButton>
      </div>
    </nav>
  );
}

function Hero({
  copied,
  onCopy,
  onStartBuilding,
  tokenStats,
}: {
  copied: boolean;
  onCopy: () => void;
  onStartBuilding: () => void;
  tokenStats: TokenStats;
}) {
  const liveTokenStats = [
    { label: "24H CHANGE", value: tokenStats.change24h, tone: tokenStats.changeTone },
    { label: "MARKET CAP", value: tokenStats.marketCap },
    { label: "24H VOLUME", value: tokenStats.volume24h },
  ];

  return (
    <section className="hero">
      <div className="hero__content">
        <h1>
          Software that thinks.
          <span>Agents that earn.</span>
        </h1>
        <p>
          ORBIS is the infrastructure for onchain intelligence. Create an autonomous agent, give it skills, and let it
          work for you. Tokenize it on day one, or never. The choice is yours.
        </p>
        <div className="hero__buttons hero__buttons--single">
          <SpecularButton
            className="hero-start-button"
            onClick={onStartBuilding}
            size="lg"
            radius={2}
            tint="#ffffff"
            tintOpacity={0.06}
            textColor="#ffffff"
            baseColor="#4d4d4d"
            intensity={1.2}
            shineSize={13}
            shineFade={42}
            thickness={1.1}
            proximity={280}
          >
            Start Building
          </SpecularButton>
        </div>
        <div className="hero-token-stats" aria-label="ORBIS token stats">
          {liveTokenStats.map((stat) => (
            <div className="hero-token-stat" key={stat.label}>
              <span
                className={
                  stat.tone === "positive"
                    ? "hero-token-stat__label hero-token-stat__label--positive"
                    : "hero-token-stat__label"
                }
              >
                {stat.label}
              </span>
              <strong
                className={
                  stat.tone === "positive"
                    ? "hero-token-stat__value hero-token-stat__value--positive"
                    : stat.tone === "negative"
                      ? "hero-token-stat__value hero-token-stat__value--negative"
                      : "hero-token-stat__value"
                }
              >
                {stat.value}
              </strong>
            </div>
          ))}
        </div>
        <button className="hero-copy-ca" onClick={onCopy}>
          <Copy size={18} strokeWidth={1.6} />
          <span>{copied ? "Copied" : getContractLabel()}</span>
        </button>
        <div className="powered">
          <span>POWERED BY</span>
          <span className="dot dot--cyan" />
          Solana
          <Image src="/images/ryux/pumplogo.png" alt="Pump.fun" width={14} height={14} />
          Pump.fun
          <span className="dot dot--orange" />
          Meteora
          <Image src="/images/ryux/juplogo.png" alt="Jupiter" width={14} height={14} />
          Jupiter
        </div>
      </div>
    </section>
  );
}

function Platform() {
  return (
    <section className="section platform" id="platform">
      <SectionIntro eyebrow="THE PLATFORM" title="Your agent. Your rules.">
        ORBIS is the infrastructure layer for autonomous AI agents on Solana. Build an agent that trades, manages a
        treasury, interacts with protocols, or serves your community, all on-chain, all yours.
      </SectionIntro>
      <div className="platform-grid">
        {platformCards.map((card) => {
          const Icon = card.icon;
          return (
            <article className={`platform-card ${card.wide ? "platform-card--wide" : ""}`} key={card.number}>
              <div className="card-kicker">
                <span className="card-icon">
                  <Icon size={18} strokeWidth={1.2} />
                </span>
                {card.number}
              </div>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
              {card.cta ? (
                <a className="text-link" href="/docs">
                  {card.cta} <ArrowUpRight size={12} />
                </a>
              ) : null}
              {card.badges ? (
                <div className="badges">
                  {card.badges.map((badge) => (
                    <span key={badge}>
                      <span className="dot dot--cyan" />
                      {badge}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Marketplace() {
  return (
    <section className="section marketplace" id="marketplace">
      <SectionIntro eyebrow="MARKETPLACE" title="Discover agents worth investing in.">
        Browse a curated marketplace of autonomous agents built by developers worldwide. Analyze performance metrics,
        track revenue, and trade agent tokens, all within the ORBIS ecosystem.
      </SectionIntro>
      <p className="market-note">
        Every agent on the marketplace is transparent. On-chain treasury, verified creator, real-time metrics. No black
        boxes.
      </p>
    </section>
  );
}

function Labs() {
  return (
    <section className="section labs">
      <SectionIntro eyebrow="AGENT LABS" title="Pushing the boundary.">
        Orbis Agents is our dedicated research and development arm. We&apos;re building the next generation of agent
        capabilities: smarter strategies, deeper protocol integration, and tools that don&apos;t exist yet.
      </SectionIntro>
      <div className="metric-row">
        {labMetrics.map((metric) => (
          <MetricCard metric={metric} key={metric.label} />
        ))}
      </div>
    </section>
  );
}

function Cta({
  onStartBuilding,
}: {
  onStartBuilding: () => void;
}) {
  return (
    <section className="section cta" id="connect">
      <div className="cta__mark">
        <Sparkles size={22} />
      </div>
      <h2>The infrastructure for intelligent agents is here.</h2>
      <p>Whether you&apos;re building, investing, or exploring, ORBIS is where it starts.</p>
      <div className="hero__buttons">
        <SpecularButton
          className="hero-start-button"
          onClick={onStartBuilding}
          size="lg"
          radius={2}
          tint="#ffffff"
          tintOpacity={0.06}
          textColor="#ffffff"
          baseColor="#4d4d4d"
          intensity={1.2}
          shineSize={13}
          shineFade={42}
          thickness={1.1}
          proximity={280}
        >
          Start Building
        </SpecularButton>
      </div>
    </section>
  );
}

function SystemUpdateModal({
  eyebrow,
  title,
  message,
  onClose,
}: {
  eyebrow: string;
  title: string;
  message: string;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="system-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="system-update-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="system-modal__line" />
        <span>{eyebrow}</span>
        <h2 id="system-update-title">{title}</h2>
        <p>{message}</p>
        <button className="system-modal__button" onClick={onClose}>
          Got It
        </button>
      </section>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__links">
        <a href="/docs">Docs</a>
        <a href="/roadmap">Roadmap</a>
        <a href={ryuxConfig.xUrl} target="_blank" rel="noreferrer">
          X
        </a>
      </div>
      <div className="footer__logos">
        <span>Solana</span>
        <span>Pump.fun</span>
        <span>Meteora</span>
        <span>Jupiter</span>
      </div>
      <p>&copy; 2026 Orbis Agents</p>
    </footer>
  );
}

function SectionIntro({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="section-intro">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      <p>{children}</p>
    </div>
  );
}

function MetricCard({ metric }: { metric: Metric }) {
  return (
    <article className="metric-card">
      <strong>{metric.value}</strong>
      <span>{metric.label}</span>
      {metric.note ? <p>{metric.note}</p> : null}
    </article>
  );
}
