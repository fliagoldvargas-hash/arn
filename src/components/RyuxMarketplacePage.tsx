"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Activity, CheckCircle2, Loader2, Search, Share2, Wallet } from "lucide-react";
import { ryuxConfig } from "@/config/ryux";
import { LightRays } from "@/components/LightRays";
import { SpecularButton } from "@/components/SpecularButton";
import { useRyuxMotion } from "@/components/useRyuxMotion";

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

const holderVoteOptions: HolderVoteOption[] = [
  {
    id: "agent-profiles",
    label: "Agent profiles",
    detail: "Deeper pages for each agent with category, CA, status, and activity context.",
  },
  {
    id: "partner-listings",
    label: "Partner project listings",
    detail: "Add early external projects that fit the NODUS agent marketplace vision.",
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
    detail: "A public log that tracks creator rewards used for NODUS buybacks and treasury actions.",
  },
];

export function RyuxMarketplacePage({ holderVotingOnly = false }: { holderVotingOnly?: boolean }) {
  const pageRef = useRef<HTMLElement | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletStatus, setWalletStatus] = useState<"idle" | "connecting" | "missing">("idle");
  const [holderVotePreview, setHolderVotePreview] = useState(false);
  const [voteTotals, setVoteTotals] = useState<HolderVoteResponse["totals"]>(() => emptyVoteTotals());
  const [totalVotes, setTotalVotes] = useState(0);
  const [userVote, setUserVote] = useState<HolderVoteResponse["userVote"]>(null);
  const [voteStatus, setVoteStatus] = useState<"idle" | "loading" | "submitting">("loading");
  const [voteMessage, setVoteMessage] = useState("");
  const holderVotingEnabled =
    HOLDER_VOTING_PUBLIC &&
    (holderVotingOnly || process.env.NEXT_PUBLIC_ENABLE_HOLDER_VOTING === "true" || holderVotePreview);

  useRyuxMotion(pageRef);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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

  return (
    <main className={`marketplace-demo-shell ${holderVotingOnly ? "holder-vote-page" : ""}`} ref={pageRef}>
      {holderVotingOnly ? (
        <div className="light-rays-bg" aria-hidden="true">
          <LightRays
            raysOrigin="top-center"
            raysColor="#76f8ff"
            raysSpeed={0.82}
            lightSpread={1.12}
            rayLength={2.25}
            fadeDistance={1.42}
            saturation={1}
            followMouse
            mouseInfluence={0.12}
            noiseAmount={0.08}
            distortion={0.24}
          />
        </div>
      ) : null}
      <nav className={`nav ${scrolled ? "nav--scrolled" : ""}`} aria-label="Primary navigation">
        <a className="brand" href="/">
          <Image src="/images/nodus/nodus-logo.png" alt="Nodus Agents" width={28} height={28} />
          <span>NODUS AGENTS</span>
        </a>
        <div className="nav__links">
          <a href="/#platform">Build</a>
          <a href="/docs">Docs</a>
          <a href="/roadmap">Roadmap</a>
        </div>
        <div className="nav__actions">
          <a className="social-link" href={ryuxConfig.xUrl} target="_blank" rel="noreferrer" aria-label="NODUS on X">
            X
          </a>
          <SpecularButton className="connect" onClick={connectWallet} size="sm" radius={15} shineSize={14} shineFade={46}>
            <Wallet size={13} />
            <span>{walletLabel}</span>
          </SpecularButton>
        </div>
      </nav>

      {holderVotingOnly ? (
        <section className="holder-vote-hero">
          <div className="marketplace-demo-mark">
            <Image src="/images/nodus/nodus-logo.png" alt="" width={42} height={42} />
          </div>
          <span className="docs-eyebrow">NODUS HOLDERS</span>
          <h1>Holder Voting</h1>
          <p>Verified NODUS holders decide which product surface gets priority next.</p>
        </section>
      ) : (
        <>
          <section className="marketplace-demo-hero">
            <div className="marketplace-demo-mark">
              <Image src="/images/nodus/nodus-logo.png" alt="" width={42} height={42} />
            </div>
            <span className="docs-eyebrow">THE NODUS COLLECTION</span>
            <h1>Agent Library</h1>
            <p>
              Browse a demo catalog of autonomous AI agent projects for the NODUS ecosystem.
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

          <section className="marketplace-demo-library" aria-label="NODUS demo marketplace">
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
        </>
      )}

      {holderVotingEnabled ? (
        <section className="holder-vote-section" aria-label="NODUS holder voting">
          <div className="holder-vote-head">
            <span className="docs-eyebrow">HOLDER VOTE</span>
            <h2>Choose what ships next</h2>
            <p>
              Connect a wallet, sign a vote, and NODUS verifies holder status before saving it.
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
        <p>&copy; 2026 Nodus Agents Demo</p>
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
    "NODUS Holder Vote",
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
