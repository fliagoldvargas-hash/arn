"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, Search, Wallet } from "lucide-react";
import { ryuxConfig } from "@/config/ryux";
import { LightRays } from "@/components/LightRays";
import { PillNav } from "@/components/PillNav";
import { SpecularButton } from "@/components/SpecularButton";
import { useRyuxMotion } from "@/components/useRyuxMotion";
import { marketplaceTokens } from "@/config/marketplace";
import { readWalletSession, saveWalletSession } from "@/lib/walletSession";

type WalletLike = {
  isPhantom?: boolean;
  isSolflare?: boolean;
  connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>;
  signMessage?: (message: Uint8Array, display?: "utf8" | "hex") => Promise<SignedMessageResult>;
};

type SignedMessageResult =
  | Uint8Array
  | number[]
  | {
      signature?: Uint8Array | number[];
      publicKey?: { toString: () => string };
    };

type LiveToken = {
  address: string;
  name: string | null;
  symbol: string | null;
  imageUrl: string | null;
  pairCreatedAt: number | null;
  chart: number[];
  pairUrl: string | null;
  priceUsd: number | null;
  change24h: number | null;
  marketCap: number | null;
  volume24h: number | null;
  liquidity: number | null;
};

type HolderVoteOption = {
  id:
    | "agent-profiles"
    | "partner-listings"
    | "holder-dashboard"
    | "marketplace-filters"
    | "holder-rewards"
    | "buyback-transparency";
  label: string;
  detail: string;
};

type HolderVoteResponse = {
  configured: boolean;
  totals: Record<HolderVoteOption["id"], number>;
  totalVotes?: number;
  userVote?: {
    vote_option: HolderVoteOption["id"];
    vote_label: string;
  } | null;
};

const HOLDER_VOTING_PUBLIC = false;

const holderVoteOptions: HolderVoteOption[] = [
  {
    id: "agent-profiles",
    label: "Agent profiles",
    detail: "Deeper pages for each agent with category, CA, status, and activity context.",
  },
  {
    id: "partner-listings",
    label: "Partner project listings",
    detail: "Add early external projects that fit the AUREN agent marketplace vision.",
  },
  {
    id: "holder-dashboard",
    label: "Holder dashboard",
    detail: "A connected wallet view for holder status, rewards, and early access.",
  },
  {
    id: "marketplace-filters",
    label: "Marketplace preview access",
    detail: "Give holders the first public vote on when the marketplace preview becomes visible.",
  },
  {
    id: "holder-rewards",
    label: "Holder rewards tracker",
    detail: "A holder view for rewards, community allocations, and claimed token distributions.",
  },
  {
    id: "buyback-transparency",
    label: "Buyback transparency",
    detail: "A public log that tracks creator rewards used for AUREN buybacks and treasury actions.",
  },
];

export function RyuxMarketplacePage({ holderVotingOnly = false }: { holderVotingOnly?: boolean }) {
  const pageRef = useRef<HTMLElement | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [walletAddress, setWalletAddress] = useState(() => readWalletSession());
  const [walletStatus, setWalletStatus] = useState<"idle" | "connecting" | "missing">("idle");
  const [holderVotePreview, setHolderVotePreview] = useState(false);
  const [voteTotals, setVoteTotals] = useState<HolderVoteResponse["totals"]>(() => emptyVoteTotals());
  const [totalVotes, setTotalVotes] = useState(0);
  const [userVote, setUserVote] = useState<HolderVoteResponse["userVote"]>(null);
  const [voteStatus, setVoteStatus] = useState<"idle" | "loading" | "submitting">("loading");
  const [voteMessage, setVoteMessage] = useState("");
  const [liveTokens, setLiveTokens] = useState<Record<string, LiveToken>>({});
  const [activeTab, setActiveTab] = useState<"all" | "recent" | "valued">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const holderVotingEnabled =
    HOLDER_VOTING_PUBLIC &&
    (holderVotingOnly || process.env.NEXT_PUBLIC_ENABLE_HOLDER_VOTING === "true" || holderVotePreview);

  useRyuxMotion(pageRef);

  useEffect(() => {
    let cancelled = false;
    const loadMarketData = async () => {
      try {
        const addresses = marketplaceTokens.map((token) => token.contractAddress).join(",");
        const response = await fetch(`/api/marketplace?addresses=${encodeURIComponent(addresses)}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Market data unavailable");
        const data = (await response.json()) as { tokens?: LiveToken[] };
        if (cancelled) return;
        setLiveTokens(Object.fromEntries((data.tokens ?? []).map((token) => [token.address, token])));
      } catch {
        // The cards keep their configured identity while live metrics retry.
      }
    };

    void loadMarketData();
    const interval = window.setInterval(loadMarketData, 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

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
      .then((response) => {
        const address = response.publicKey.toString();
        saveWalletSession(address);
        setWalletAddress(address);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hasPreviewParam = searchParams.get("holderVotePreview") === "1";

    if (hasPreviewParam) {
      window.localStorage.setItem("ryux-holder-vote-preview", "1");
      setHolderVotePreview(true);
      return;
    }

    setHolderVotePreview(window.localStorage.getItem("ryux-holder-vote-preview") === "1");
  }, []);

  useEffect(() => {
    if (!holderVotingEnabled) return;

    void loadHolderVotes(walletAddress);
  }, [holderVotingEnabled, walletAddress]);

  const connectWallet = async () => {
    const provider = getSolanaProvider();

    if (!provider) {
      setWalletStatus("missing");
      window.open("https://phantom.app/", "_blank", "noopener,noreferrer");
      return undefined;
    }

    try {
      setWalletStatus("connecting");
      const response = await provider.connect();
      const nextWalletAddress = response.publicKey.toString();
      saveWalletSession(nextWalletAddress);
      setWalletAddress(nextWalletAddress);
      setWalletStatus("idle");
      return nextWalletAddress;
    } catch {
      setWalletStatus("idle");
      return undefined;
    }
  };

  const loadHolderVotes = async (activeWalletAddress = "") => {
    setVoteStatus("loading");

    try {
      const query = activeWalletAddress ? `?wallet=${encodeURIComponent(activeWalletAddress)}` : "";
      const response = await fetch(`/api/holder-votes${query}`);
      const data = (await response.json()) as HolderVoteResponse;

      setVoteTotals(data.totals ?? emptyVoteTotals());
      setTotalVotes(data.totalVotes ?? 0);
      setUserVote(data.userVote ?? null);

      if (!data.configured) {
        setVoteMessage("Holder voting storage is being configured.");
      } else {
        setVoteMessage("");
      }
    } catch {
      setVoteMessage("Holder voting is temporarily unavailable.");
    } finally {
      setVoteStatus("idle");
    }
  };

  const submitHolderVote = async (option: HolderVoteOption) => {
    const provider = getSolanaProvider();
    const activeWalletAddress = walletAddress || (await connectWallet());

    if (!provider || !activeWalletAddress) return;

    if (!provider.signMessage) {
      setVoteMessage("This wallet does not support message signing.");
      return;
    }

    const timestamp = Date.now().toString();
    const message = createVoteMessage(activeWalletAddress, option.id, option.label, timestamp);

    try {
      setVoteStatus("submitting");
      setVoteMessage("Sign the vote in your wallet.");

      const signedMessage = await provider.signMessage(new TextEncoder().encode(message), "utf8");
      const signature = getSignatureBytes(signedMessage);

      if (!signature) {
        setVoteMessage("Wallet signature could not be read. Try signing again.");
        return;
      }

      const response = await fetch("/api/holder-votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: activeWalletAddress,
          optionId: option.id,
          message,
          signature: Array.from(signature),
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setVoteMessage(data.error ?? "Vote could not be saved.");
        return;
      }

      setVoteMessage("Vote saved. Holder status verified.");
      await loadHolderVotes(activeWalletAddress);
    } catch {
      setVoteMessage("Vote was not signed or could not be saved.");
    } finally {
      setVoteStatus("idle");
    }
  };

  const walletLabel = walletAddress
    ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
    : walletStatus === "connecting"
      ? "Connecting"
      : walletStatus === "missing"
        ? "Install Wallet"
        : "Connect Wallet";
  const lockedVoteLabel = userVote
    ? holderVoteOptions.find((option) => option.id === userVote.vote_option)?.label ?? userVote.vote_label
    : "";
  const visibleTokens = marketplaceTokens
    .filter((token) => {
      const live = liveTokens[token.contractAddress];
      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;
      return [token.name, token.ticker, live?.name, live?.symbol, token.contractAddress]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query));
    })
    .sort((a, b) => {
      const aLive = liveTokens[a.contractAddress];
      const bLive = liveTokens[b.contractAddress];
      if (activeTab === "valued") return (bLive?.marketCap ?? -1) - (aLive?.marketCap ?? -1);
      if (activeTab === "recent") return (bLive?.pairCreatedAt ?? 0) - (aLive?.pairCreatedAt ?? 0);
      return 0;
    });

  return (
    <main className={`marketplace-demo-shell ${holderVotingOnly ? "holder-vote-page" : ""}`} ref={pageRef}>
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
      <PillNav
        logo="/images/auren/auren-logo-v2.png"
        logoAlt="Auren Agents"
        activeHref="/marketplace"
        items={[
          { label: "Build", href: "/#platform" },
          { label: "Marketplace", href: "/marketplace" },
          { label: "Docs", href: "/docs" },
          { label: "Roadmap", href: "/roadmap" },
        ]}
        rightContent={<div className="nav__actions">
          <a className="social-link" href={ryuxConfig.xUrl} target="_blank" rel="noreferrer" aria-label="AUREN on X">
            X
          </a>
          <SpecularButton className="connect" onClick={connectWallet} size="sm" radius={15} shineSize={14} shineFade={46}>
            <Wallet size={13} />
            <span>{walletLabel}</span>
          </SpecularButton>
        </div>}
      />

      {holderVotingOnly ? (
        <section className="holder-vote-hero">
          <div className="marketplace-demo-mark">
            <Image src="/images/auren/auren-logo-v2.png" alt="" width={42} height={42} />
          </div>
          <span className="docs-eyebrow">AUREN HOLDERS</span>
          <h1>Holder Voting</h1>
          <p>Verified AUREN holders decide which product surface gets priority next.</p>
        </section>
      ) : (
        <>
          <section className="marketplace-demo-hero">
            <div className="marketplace-demo-mark">
              <Image src="/images/auren/auren-logo-v2.png" alt="" width={42} height={42} />
            </div>
            <span className="docs-eyebrow">THE AUREN COLLECTION</span>
            <h1>Agent Library</h1>
            <p>
              Browse autonomous AI agent projects for the AUREN ecosystem with live market data.
            </p>

            <div className="marketplace-demo-stats">
              <MarketStat value={formatCompactUsd(sumMarketData(liveTokens, "marketCap"))} label="Total Market Cap" />
              <MarketStat value={formatCompactUsd(sumMarketData(liveTokens, "liquidity"))} label="Total Liquidity" />
              <MarketStat value={formatCompactUsd(sumMarketData(liveTokens, "volume24h"))} label="24h Volume" />
              <MarketStat value={String(marketplaceTokens.length)} label="Listed Agents" />
            </div>

            <label className="marketplace-demo-search">
              <Search size={15} />
              <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search the marketplace..." />
            </label>
          </section>

          <section className="marketplace-demo-library" aria-label="AUREN marketplace">
            <div className="marketplace-demo-toolbar">
              <div className="marketplace-demo-tabs">
                {[
                  ["all", "All Entries"],
                  ["recent", "Recently Added"],
                  ["valued", "Top Valued"],
                ].map(([tab, label]) => (
                  <button className={activeTab === tab ? "is-active" : ""} key={tab} onClick={() => setActiveTab(tab as typeof activeTab)} type="button">
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="marketplace-demo-grid">
              {visibleTokens.map((agent) => {
                const live = liveTokens[agent.contractAddress];
                return (
                <article className={`marketplace-demo-card marketplace-demo-card--${agent.tone}`} key={agent.name}>
                  <div className="marketplace-demo-card__head">
                    <div className="marketplace-demo-orb">
                      <img className="marketplace-token-image" src={live?.imageUrl ?? "/images/auren/auren-logo-v2.png"} alt="" />
                    </div>
                    <div>
                      <h2>{live?.name ?? agent.name}</h2>
                      <span>{live?.symbol ? `$${live.symbol.replace(/^\$/, "")}` : agent.ticker}</span>
                    </div>
                  </div>
                  <p>{agent.description}</p>
                  <svg className={`marketplace-demo-chart ${(live?.change24h ?? 0) >= 0 ? "is-positive" : "is-negative"}`} viewBox="0 0 238 78" role="img" aria-label={`${agent.name} price chart`}>
                    <path d={buildChartPath(live?.chart ?? [])} />
                  </svg>
                  <div className="marketplace-demo-price">
                    <strong>{formatPrice(live?.priceUsd)}</strong>
                    <span className={(live?.change24h ?? 0) >= 0 ? "is-positive" : "is-negative"}>{formatPercent(live?.change24h)}</span>
                  </div>
                  <div className="marketplace-demo-metrics">
                    <div>
                      <span>MCAP</span>
                      <strong>{formatCompactUsd(live?.marketCap)}</strong>
                    </div>
                    <div>
                      <span>VOL</span>
                      <strong>{formatCompactUsd(live?.volume24h)}</strong>
                    </div>
                  </div>
                  <div className="marketplace-demo-card__foot">
                    <span>{shortAddress(agent.contractAddress)}</span>
                    <a className="marketplace-pump-link" href={agent.pumpFunUrl} target="_blank" rel="noreferrer" title="Open on Pump.fun" aria-label={`Open ${agent.name} on Pump.fun`}>
                      <Image src="/images/ryux/pumplogo.png" alt="Pump.fun" width={15} height={15} />
                    </a>
                  </div>
                </article>
                );
              })}
            </div>
            {!visibleTokens.length ? <p className="marketplace-data-status">No matching tokens found.</p> : null}
          </section>
        </>
      )}

      {holderVotingEnabled ? (
        <section className="holder-vote-section" aria-label="AUREN holder voting">
          <div className="holder-vote-head">
            <span className="docs-eyebrow">HOLDER VOTE</span>
            <h2>Choose what ships next</h2>
            <p>
              Connect a wallet, sign a vote, and AUREN verifies holder status before saving it.
              One wallet can keep one active vote.
            </p>
          </div>

          <div className="holder-vote-grid">
            {holderVoteOptions.map((option) => {
              const count = voteTotals[option.id] ?? 0;
              const share = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
              const isSelected = userVote?.vote_option === option.id;

              return (
                <button
                  className={`holder-vote-option ${isSelected ? "is-selected" : ""}`}
                  disabled={voteStatus === "submitting" || Boolean(userVote)}
                  key={option.id}
                  onClick={() => void submitHolderVote(option)}
                  type="button"
                >
                  <span className="holder-vote-option__top">
                    <strong>{option.label}</strong>
                    {isSelected ? <CheckCircle2 size={18} /> : null}
                  </span>
                  <span className="holder-vote-option__detail">{option.detail}</span>
                  <span className="holder-vote-option__bar" aria-hidden="true">
                    <span style={{ width: `${share}%` }} />
                  </span>
                  <span className="holder-vote-option__meta">
                    {count} votes
                    <span>{share}%</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="holder-vote-status" role="status">
            {voteStatus === "submitting" ? <Loader2 className="is-spinning" size={14} /> : <Wallet size={14} />}
            <span>
              {voteMessage ||
                (userVote
                  ? `Vote locked: ${lockedVoteLabel}`
                  : walletAddress
                  ? `Connected: ${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
                  : "Connect wallet to vote as a verified holder.")}
            </span>
          </div>
        </section>
      ) : null}

      <footer className="footer docs-footer">
        <p>&copy; 2026 Auren Agents</p>
        <div className="footer__links">
          <a href="/">Home</a>
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

function createVoteMessage(walletAddress: string, optionId: string, optionLabel: string, timestamp: string) {
  return [
    "AUREN Holder Vote",
    `Wallet: ${walletAddress}`,
    `Option: ${optionLabel}`,
    `Option ID: ${optionId}`,
    `Timestamp: ${timestamp}`,
  ].join("\n");
}

function emptyVoteTotals(): HolderVoteResponse["totals"] {
  return holderVoteOptions.reduce(
    (totals, option) => ({
      ...totals,
      [option.id]: 0,
    }),
    {} as HolderVoteResponse["totals"],
  );
}

function getSignatureBytes(signedMessage: SignedMessageResult) {
  if (signedMessage instanceof Uint8Array) return signedMessage;

  if (Array.isArray(signedMessage)) {
    return Uint8Array.from(signedMessage);
  }

  if (signedMessage.signature instanceof Uint8Array) {
    return signedMessage.signature;
  }

  if (Array.isArray(signedMessage.signature)) {
    return Uint8Array.from(signedMessage.signature);
  }

  return null;
}

function getSolanaProvider() {
  if (typeof window === "undefined") return undefined;
  const walletWindow = window as typeof window & { solana?: WalletLike; solflare?: WalletLike };
  return walletWindow.solana?.isPhantom ? walletWindow.solana : walletWindow.solflare ?? walletWindow.solana;
}

function MarketStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function sumMarketData(tokens: Record<string, LiveToken>, key: "marketCap" | "liquidity" | "volume24h") {
  return Object.values(tokens).reduce((total, token) => total + (token[key] ?? 0), 0);
}

function formatCompactUsd(value: number | null | undefined) {
  if (value == null) return "--";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function formatPrice(value: number | null | undefined) {
  if (value == null) return "--";
  if (value >= 1) return formatCompactUsd(value);
  return `$${value.toPrecision(4)}`;
}

function formatPercent(value: number | null | undefined) {
  if (value == null) return "--";
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

function buildChartPath(values: number[]) {
  if (values.length < 2) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 238;
      const y = 68 - ((value - min) / range) * 58;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}
