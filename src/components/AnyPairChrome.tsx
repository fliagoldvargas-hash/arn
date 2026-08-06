"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { PillNav } from "@/components/PillNav";
import { ryuxConfig } from "@/config/ryux";
import { readWalletSession, saveWalletSession } from "@/lib/walletSession";

type WalletProvider = {
  isPhantom?: boolean;
  connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>;
};

export function AnyPairChrome({ activeHref = "/" }: { activeHref?: string }) {
  const [wallet, setWallet] = useState(() => readWalletSession());
  const [status, setStatus] = useState<"idle" | "connecting">("idle");

  useEffect(() => {
    const provider = getProvider();
    provider?.connect({ onlyIfTrusted: true }).then((result) => {
      const address = result.publicKey.toString();
      saveWalletSession(address);
      setWallet(address);
    }).catch(() => undefined);
  }, []);

  const connect = async () => {
    const provider = getProvider();
    if (!provider) {
      window.open("https://phantom.app/", "_blank", "noopener,noreferrer");
      return;
    }
    try {
      setStatus("connecting");
      const result = await provider.connect();
      const address = result.publicKey.toString();
      saveWalletSession(address);
      setWallet(address);
    } finally {
      setStatus("idle");
    }
  };

  const walletLabel = wallet ? `${wallet.slice(0, 4)}...${wallet.slice(-4)}` : status === "connecting" ? "Connecting" : "Connect Wallet";

  return (
    <PillNav
      logo="/images/vanta/vanta-logo.png"
      logoAlt="Any Pair"
      activeHref={activeHref}
      items={[
        { label: "Launch", href: "/launch" },
        { label: "Pair", href: "/pair" },
        { label: "Markets", href: "/markets" },
        { label: "Rewards", href: "/rewards" },
        { label: "Burns", href: "/burns" },
        { label: "Docs", href: "/docs" },
      ]}
      rightContent={
        <div className="nav__actions">
          <a className="social-link" href={ryuxConfig.xUrl} target="_blank" rel="noreferrer" aria-label="Any Pair on X">X</a>
          <button className="builder-nav-wallet" onClick={() => void connect()} type="button">
            <Wallet size={13} />
            <span>{walletLabel}</span>
          </button>
        </div>
      }
    />
  );
}

function getProvider() {
  if (typeof window === "undefined") return undefined;
  const walletWindow = window as typeof window & { solana?: WalletProvider; solflare?: WalletProvider };
  return walletWindow.solana?.isPhantom ? walletWindow.solana : walletWindow.solflare ?? walletWindow.solana;
}

export function AnyPairPage({ children, activeHref }: { children: React.ReactNode; activeHref?: string }) {
  return <main className="anypair-page"><AnyPairChrome activeHref={activeHref} />{children}</main>;
}

export function AnyPairLogo({ size = 42 }: { size?: number }) {
  return <Image src="/images/vanta/vanta-logo.png" alt="" width={size} height={size} />;
}
