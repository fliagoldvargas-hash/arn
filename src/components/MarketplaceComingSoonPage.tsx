"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Wallet } from "lucide-react";
import { ryuxConfig } from "@/config/ryux";
import { LightRays } from "@/components/LightRays";
import { SpecularButton } from "@/components/SpecularButton";
import { useRyuxMotion } from "@/components/useRyuxMotion";

type WalletLike = {
  isPhantom?: boolean;
  isSolflare?: boolean;
  connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>;
};

export function MarketplaceComingSoonPage() {
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
      window.open("https://phantom.app/download", "_blank", "noopener,noreferrer");
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
    <main className="coming-soon-shell" ref={pageRef}>
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

      <section className="coming-soon-panel" aria-labelledby="marketplace-coming-soon-title">
        <div className="system-modal__line" />
        <span className="docs-eyebrow">Marketplace</span>
        <h1 id="marketplace-coming-soon-title">Coming soon.</h1>
        <p>The marketplace is being finished and will launch to the public on 03/08.</p>
        <a className="system-modal__button" href="/">
          Back Home
        </a>
      </section>
    </main>
  );
}

function getSolanaProvider() {
  if (typeof window === "undefined") return undefined;
  const walletWindow = window as typeof window & { solana?: WalletLike; solflare?: WalletLike };
  return walletWindow.solana?.isPhantom ? walletWindow.solana : walletWindow.solflare ?? walletWindow.solana;
}
