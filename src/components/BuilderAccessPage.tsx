"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Wallet } from "lucide-react";
import { LightRays } from "@/components/LightRays";
import GlareHover from "@/components/GlareHover";
import { PillNav } from "@/components/PillNav";
import { ryuxConfig } from "@/config/ryux";

type WalletLike = {
  isPhantom?: boolean;
  connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>;
  signMessage?: (message: Uint8Array, display?: "utf8" | "hex") => Promise<unknown>;
};

type WhitelistRecord = {
  wallet: string;
  joinedAt: string;
};

const STORAGE_PREFIX = "vanta-builder-whitelist:";

export function BuilderAccessPage() {
  const [walletAddress, setWalletAddress] = useState("");
  const [record, setRecord] = useState<WhitelistRecord | null>(null);
  const [status, setStatus] = useState<"idle" | "connecting" | "signing" | "missing">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const provider = getSolanaProvider();
    if (!provider) return;

    void provider
      .connect({ onlyIfTrusted: true })
      .then((response) => selectWallet(response.publicKey.toString()))
      .catch(() => undefined);
  }, []);

  const selectWallet = (address: string) => {
    setWalletAddress(address);
    setRecord(readWhitelistRecord(address));
    setMessage("");
  };

  const connectWallet = async () => {
    const provider = getSolanaProvider();
    if (!provider) {
      setStatus("missing");
      setMessage("Install Phantom or Solflare to join the whitelist.");
      return;
    }

    try {
      setStatus("connecting");
      const response = await provider.connect();
      selectWallet(response.publicKey.toString());
      setStatus("idle");
    } catch {
      setStatus("idle");
      setMessage("Wallet connection was cancelled.");
    }
  };

  const joinWhitelist = async () => {
    const provider = getSolanaProvider();
    if (!provider) return connectWallet();
    if (!walletAddress) return connectWallet();
    if (!provider.signMessage) {
      setMessage("This wallet does not support message signing.");
      return;
    }

    const timestamp = Date.now().toString();
    const text = [
      "VANTA BUILDER WHITELIST",
      `Wallet: ${walletAddress}`,
      `Timestamp: ${timestamp}`,
      "This signature is free and only confirms wallet ownership.",
    ].join("\n");

    try {
      setStatus("signing");
      await provider.signMessage(new TextEncoder().encode(text), "utf8");
      const nextRecord = { wallet: walletAddress, joinedAt: new Date().toISOString() };
      window.localStorage.setItem(`${STORAGE_PREFIX}${walletAddress}`, JSON.stringify(nextRecord));
      setRecord(nextRecord);
      setMessage("Wallet ownership verified.");
    } catch {
      setMessage("Signature cancelled. You can try again whenever you are ready.");
    } finally {
      setStatus("idle");
    }
  };

  const walletLabel = walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : "Connect Wallet";

  return (
    <main className="builder-access-page">
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
        logo="/images/vanta/vanta-logo.png"
        logoAlt="Vanta Agents"
        activeHref="/builder"
        items={[
          { label: "Build", href: "/builder" },
          { label: "Marketplace", href: "/marketplace" },
          { label: "Docs", href: "/docs" },
          { label: "Roadmap", href: "/roadmap" },
        ]}
        rightContent={<div className="nav__actions">
          <a className="social-link" href={ryuxConfig.xUrl} target="_blank" rel="noreferrer" aria-label="VANTA on X">X</a>
          <button className="builder-nav-wallet" onClick={connectWallet} type="button">
            <Wallet size={13} />
            <span>{walletLabel}</span>
          </button>
        </div>}
      />

      <section className="builder-access-panel" aria-labelledby="builder-access-title">
        <span className="docs-eyebrow">BUILDER ACCESS</span>
        <h1 id="builder-access-title">
          <span>Join the whitelist.</span>
          <em>Build with Vanta.</em>
        </h1>
        <p>Builder access is opening in stages. Join the whitelist with your wallet and we&apos;ll enable your workspace when it is ready.</p>

        {record ? (
          <div className="builder-access-confirmation">
            <CheckCircle2 size={22} />
            <span>You&apos;re on the whitelist.</span>
            <strong>Builder access will be enabled in a few days.</strong>
            <small>{walletAddress.slice(0, 6)}...{walletAddress.slice(-6)}</small>
          </div>
        ) : (
          <GlareHover
            className="builder-join-glare"
            width="100%"
            height="54px"
            background="rgba(255, 255, 255, 0.06)"
            borderColor="rgba(255, 255, 255, 0.22)"
            borderRadius="2px"
            glareOpacity={0.35}
            glareAngle={-30}
            glareSize={300}
            transitionDuration={800}
          >
            <button className="builder-join-button" disabled={status === "connecting" || status === "signing"} onClick={joinWhitelist} type="button">
              {status === "connecting" || status === "signing" ? <Loader2 className="is-spinning" size={15} /> : <Wallet size={15} />}
              {status === "signing" ? "Sign in wallet" : status === "connecting" ? "Connecting" : "Join whitelist"}
            </button>
          </GlareHover>
        )}

        <div className="builder-access-status" role="status">
          {message || (record ? "Your wallet is registered for early builder access." : "No email required. The signature is free and only verifies wallet ownership.")}
        </div>
      </section>
    </main>
  );
}

function readWhitelistRecord(address: string) {
  const stored = window.localStorage.getItem(`${STORAGE_PREFIX}${address}`);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as WhitelistRecord;
  } catch {
    return null;
  }
}

function getSolanaProvider() {
  if (typeof window === "undefined") return undefined;
  const walletWindow = window as typeof window & { solana?: WalletLike; solflare?: WalletLike };
  return walletWindow.solana?.isPhantom ? walletWindow.solana : walletWindow.solflare ?? walletWindow.solana;
}
