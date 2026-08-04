"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Wallet } from "lucide-react";
import { ryuxConfig } from "@/config/ryux";
import { LightRays } from "@/components/LightRays";
import { PillNav } from "@/components/PillNav";
import { SpecularButton } from "@/components/SpecularButton";
import { useRyuxMotion } from "@/components/useRyuxMotion";

type WalletLike = {
  isPhantom?: boolean;
  isSolflare?: boolean;
  connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>;
};

type RoadmapPhase = {
  date: string;
  status: "completed" | "pending";
  phase: string;
  count: string;
  title: string;
  body: string;
  milestones: string[];
};

const phases: RoadmapPhase[] = [
  {
    date: "EARLY AUG 2026",
    status: "completed",
    phase: "PHASE 1",
    count: "4/4",
    title: "Genesis Launch",
    body: "AUREN is live. The token launch, website, X presence, documentation, wallet connect, and launch-state modals are in place.",
    milestones: ["Token Launch", "AUREN Website", "X / Twitter Live", "Docs and Roadmap Pages"],
  },
  {
    date: "EARLY AUG 2026",
    status: "completed",
    phase: "PHASE 2",
    count: "4/4",
    title: "Marketplace Opening",
    body: "The marketplace is live with project listings, agent cards, live market data, and direct token links.",
    milestones: ["Marketplace Public Release", "Agent Listing Cards", "Project Discovery", "Trading Links"],
  },
  {
    date: "LATE AUG 2026",
    status: "pending",
    phase: "PHASE 3",
    count: "0/4",
    title: "Wallet and Dashboard",
    body: "Wallet flows and dashboard surfaces roll out so users can track positions, connect profiles, and prepare for agent tools.",
    milestones: ["Wallet Session Polish", "User Dashboard", "Portfolio Overview", "Dashboard Update Modal Removal"],
  },
  {
    date: "SEP 2026",
    status: "pending",
    phase: "PHASE 4",
    count: "0/5",
    title: "Agent Builder Layer",
    body: "AUREN begins opening the infrastructure layer for creators to configure agents, connect skills, and prepare automated workflows.",
    milestones: ["Agent Templates", "Skill Modules", "Creator Setup Flow", "Agent Metadata", "Cloud Deploy Prep"],
  },
  {
    date: "OCT 2026",
    status: "pending",
    phase: "PHASE 5",
    count: "0/4",
    title: "Ecosystem Expansion",
    body: "The project moves toward wider ecosystem integrations, analytics, creator incentives, and long-term growth systems.",
    milestones: ["Analytics Layer", "Creator Incentives", "Partner Integrations", "Community Governance"],
  },
];

export function RyuxRoadmapPage() {
  const pageRef = useRef<HTMLElement | null>(null);
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

  useRyuxMotion(pageRef);

  return (
    <main className="roadmap-shell" ref={pageRef}>
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
        activeHref="/roadmap"
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
          <a
            className={`social-link social-link--image ${ryuxConfig.pumpFunUrl ? "" : "social-link--disabled"}`}
            href={ryuxConfig.pumpFunUrl || "#"}
            target={ryuxConfig.pumpFunUrl ? "_blank" : undefined}
            rel={ryuxConfig.pumpFunUrl ? "noreferrer" : undefined}
            aria-disabled={!ryuxConfig.pumpFunUrl}
            aria-label="AUREN on Pump.fun"
          >
            <Image src="/images/ryux/pumplogo.png" alt="" width={15} height={15} />
          </a>
          <SpecularButton className="connect" onClick={connectWallet} size="sm" radius={15} shineSize={14} shineFade={46}>
            <Wallet size={13} />
            <span>{walletLabel}</span>
          </SpecularButton>
        </div>}
      />

      <section className="roadmap-hero">
        <span className="docs-eyebrow">DEVELOPMENT ROADMAP</span>
        <h1>
          Building the Future of
          <span>Autonomous Agents.</span>
        </h1>
        <p>Each phase unlocks new AUREN capabilities. Track what shipped on 31/07/2026 and what comes next.</p>
        <div className="roadmap-progress">
          <div>
            <span>OVERALL PROGRESS</span>
            <strong>4/21 MILESTONES - 19%</strong>
          </div>
          <div className="roadmap-progress__bar">
            <span />
          </div>
        </div>
      </section>

      <section className="roadmap-timeline" aria-label="AUREN roadmap phases">
        <div className="roadmap-line" />
        {phases.map((phase) => (
          <article className={`roadmap-card roadmap-card--${phase.status}`} key={phase.phase}>
            <div className="roadmap-dot" />
            <div className="roadmap-card__meta">
              <span>{phase.date}</span>
              <span className="roadmap-status">{phase.status === "completed" ? "COMPLETED" : "PENDING"}</span>
              <span>{phase.phase}</span>
              <strong>{phase.count}</strong>
            </div>
            <h2>{phase.title}</h2>
            <p>{phase.body}</p>
            <div className="roadmap-card__divider" />
            <div className="roadmap-milestones">
              {phase.milestones.map((milestone) => (
                <span key={milestone}>- {milestone}</span>
              ))}
            </div>
          </article>
        ))}
      </section>

      <footer className="footer docs-footer">
        <p>&copy; 2026 Auren Agents</p>
        <div className="footer__links">
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
