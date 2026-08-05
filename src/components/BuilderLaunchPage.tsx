"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ExternalLink, ImagePlus, Loader2, Wallet } from "lucide-react";
import { VersionedTransaction } from "@solana/web3.js";
import { LightRays } from "@/components/LightRays";
import { PillNav } from "@/components/PillNav";
import { ryuxConfig } from "@/config/ryux";
import { readWalletSession, saveWalletSession } from "@/lib/walletSession";

type WalletProvider = {
  isPhantom?: boolean;
  isSolflare?: boolean;
  connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>;
  signTransaction?: (transaction: VersionedTransaction) => Promise<VersionedTransaction>;
};

type LaunchState = "idle" | "connecting" | "uploading" | "building" | "signing" | "sending" | "success" | "error";

type LaunchResult = {
  mintPublicKey: string;
  signature: string;
  metadataUri: string;
  marketplaceSaved: boolean;
};

const DEFAULT_DESCRIPTION = "Autonomous agent infrastructure for on-chain intelligence and execution.";

export function BuilderLaunchPage() {
  const [walletAddress, setWalletAddress] = useState(() => readWalletSession());
  const [walletState, setWalletState] = useState<"idle" | "connecting" | "missing">("idle");
  const [launchState, setLaunchState] = useState<LaunchState>("idle");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [result, setResult] = useState<LaunchResult | null>(null);
  const [form, setForm] = useState({
    name: "",
    symbol: "",
    description: DEFAULT_DESCRIPTION,
    twitter: ryuxConfig.xUrl,
    telegram: "",
    website: "",
    initialBuy: "0",
    showName: true,
    cashback: false,
    mayhemMode: false,
    frontRunningProtection: false,
    tipAmount: "0.0001",
  });

  useEffect(() => {
    const provider = getSolanaProvider();
    if (!provider) return;
    void provider.connect({ onlyIfTrusted: true }).then(({ publicKey }) => {
      const address = publicKey.toString();
      saveWalletSession(address);
      setWalletAddress(address);
    }).catch(() => undefined);
  }, []);

  const walletLabel = walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : walletState === "connecting" ? "Connecting" : "Connect wallet";
  const isBusy = launchState !== "idle" && launchState !== "success" && launchState !== "error";
  const progressLabel = useMemo(() => ({
    connecting: "Connecting wallet",
    uploading: "Uploading metadata",
    building: "Preparing Pump.fun transaction",
    signing: "Sign in your wallet",
    sending: "Confirming on Solana",
  } as Record<string, string>)[launchState] ?? "Launch token", [launchState]);

  const connectWallet = async () => {
    const provider = getSolanaProvider();
    if (!provider) {
      setWalletState("missing");
      setMessage("Install Phantom or Solflare to launch a token.");
      return "";
    }

    try {
      setWalletState("connecting");
      const response = await provider.connect();
      const address = response.publicKey.toString();
      saveWalletSession(address);
      setWalletAddress(address);
      setWalletState("idle");
      return address;
    } catch {
      setWalletState("idle");
      setMessage("Wallet connection was cancelled.");
      return "";
    }
  };

  const updateField = (field: keyof typeof form, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const launchToken = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResult(null);
    setMessage("");

    const provider = getSolanaProvider();
    // Re-authorize the provider before signing so a stale local session cannot reach signTransaction.
    const address = await connectWallet();
    if (!provider || !address) return;
    if (!provider.signTransaction) {
      setLaunchState("error");
      setMessage("This wallet does not support transaction signing.");
      return;
    }
    if (!image) {
      setLaunchState("error");
      setMessage("Choose a PNG, JPG, GIF or WEBP image first.");
      return;
    }
    if (!form.name.trim() || !form.symbol.trim()) {
      setLaunchState("error");
      setMessage("Token name and ticker are required.");
      return;
    }

    try {
      setLaunchState("uploading");
      const metadataForm = new FormData();
      metadataForm.append("file", image);
      metadataForm.append("name", form.name.trim());
      metadataForm.append("symbol", form.symbol.trim().toUpperCase());
      metadataForm.append("description", form.description.trim());
      metadataForm.append("twitter", form.twitter.trim());
      metadataForm.append("telegram", form.telegram.trim());
      metadataForm.append("website", form.website.trim());
      metadataForm.append("showName", String(form.showName));

      const metadataResponse = await fetch("/api/pump/metadata", { method: "POST", body: metadataForm });
      const metadata = await readJson<{ metadataUri?: string; imageUri?: string; error?: string }>(metadataResponse);
      if (!metadataResponse.ok || !metadata.metadataUri) throw new Error(metadata.error ?? "Pump.fun metadata upload failed.");

      const initialBuy = parseSolLamports(form.initialBuy);
      if (initialBuy == null) throw new Error("Initial buy must be zero or a valid SOL amount.");
      const hasInitialBuy = BigInt(initialBuy) > BigInt(0);

      setLaunchState("building");
      const buildResponse = await fetch("/api/pump/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: address,
          creator: address,
          feePayer: address,
          name: form.name.trim(),
          symbol: form.symbol.trim().toUpperCase(),
          uri: metadata.metadataUri,
          solLamports: initialBuy,
          mayhemMode: form.mayhemMode,
          cashback: form.cashback,
          frontRunningProtection: form.frontRunningProtection && hasInitialBuy,
          tipAmount: form.frontRunningProtection && hasInitialBuy ? Number(form.tipAmount || "0") : 0,
        }),
      });
      const built = await readJson<{ transaction?: string; mintPublicKey?: string; error?: string }>(buildResponse);
      if (!buildResponse.ok || !built.transaction || !built.mintPublicKey) throw new Error(built.error ?? "Pump.fun could not prepare the transaction.");

      setLaunchState("signing");
      const transaction = VersionedTransaction.deserialize(decodeBase64(built.transaction));
      const signedTransaction = await provider.signTransaction(transaction);

      setLaunchState("sending");
      const sendResponse = await fetch("/api/pump/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signedTransaction: encodeBase64(signedTransaction.serialize()), frontRunningProtection: form.frontRunningProtection && hasInitialBuy }),
      });
      const sent = await readJson<{ signature?: string; error?: string }>(sendResponse);
      if (!sendResponse.ok || !sent.signature) throw new Error(sent.error ?? "The transaction could not be confirmed.");

      const pumpFunUrl = `${ryuxConfig.pumpFunUrl}${built.mintPublicKey}`;
      const catalogResponse = await fetch("/api/marketplace/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          ticker: `$${form.symbol.trim().toUpperCase()}`,
          contractAddress: built.mintPublicKey,
          pumpFunUrl,
          description: form.description.trim(),
          imageUrl: metadata.imageUri ?? "",
          tone: "blue",
        }),
      });
      const catalog = await readJson<{ configured?: boolean }>(catalogResponse);
      const marketplaceSaved = catalogResponse.ok && Boolean(catalog.configured);
      const nextResult = { mintPublicKey: built.mintPublicKey, signature: sent.signature, metadataUri: metadata.metadataUri, marketplaceSaved };
      window.localStorage.setItem("auren-last-launch", JSON.stringify(nextResult));
      window.dispatchEvent(new CustomEvent("auren-token-launched", { detail: {
        ...nextResult,
        token: {
          name: form.name.trim(),
          ticker: `$${form.symbol.trim().toUpperCase()}`,
          contractAddress: built.mintPublicKey,
          pumpFunUrl,
          description: form.description.trim(),
          imageUrl: metadata.imageUri ?? "",
          tone: "blue",
        },
      } }));
      setResult(nextResult);
      setLaunchState("success");
      setMessage(marketplaceSaved ? "Token launched and added to the marketplace." : "Token launched. Marketplace storage still needs its Supabase table.");
    } catch (error) {
      setLaunchState("error");
      setMessage(error instanceof Error ? error.message : "Launch failed. Please try again.");
    }
  };

  return (
    <main className="builder-access-page builder-launch-page">
      <div className="light-rays-bg" aria-hidden="true"><LightRays raysOrigin="top-center" raysColor="#00ffff" raysSpeed={1.5} lightSpread={1} rayLength={1.2} saturation={1} followMouse mouseInfluence={0} noiseAmount={0.1} distortion={0.05} /></div>
      <PillNav
        logo="/images/auren/auren-logo-v2.png"
        logoAlt="Auren Agents"
        activeHref="/builder"
        items={[{ label: "Build", href: "/builder" }, { label: "Marketplace", href: "/marketplace" }, { label: "Docs", href: "/docs" }, { label: "Roadmap", href: "/roadmap" }]}
        rightContent={<div className="nav__actions"><a className="social-link" href={ryuxConfig.xUrl} target="_blank" rel="noreferrer" aria-label="AUREN on X">X</a><button className="builder-nav-wallet" onClick={() => void connectWallet()} type="button"><Wallet size={13} /><span>{walletLabel}</span></button></div>}
      />

      <section className="builder-access-panel builder-launch-panel" aria-labelledby="builder-launch-title">
        <span className="docs-eyebrow">TOKEN LAUNCHER</span>
        <h1 id="builder-launch-title"><span>Launch on Pump.fun.</span><em>Build with Auren.</em></h1>
        <p>Create a Solana token directly from your wallet. You choose the identity, metadata and launch options; Pump.fun handles the on-chain market.</p>

        <form className="builder-launch-form" onSubmit={launchToken}>
          <div className="builder-launch-grid">
            <label><span>Token name</span><input value={form.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Auren Agents" maxLength={32} required /></label>
            <label><span>Ticker</span><input value={form.symbol} onChange={(event) => updateField("symbol", event.target.value.replace(/[^a-z0-9]/gi, ""))} placeholder="AUREN" maxLength={10} required /></label>
          </div>
          <label><span>Description</span><textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} maxLength={500} rows={3} required /></label>
          <label className="builder-image-picker"><span>Token image</span><input type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={(event) => setImage(event.target.files?.[0] ?? null)} required /><span className="builder-image-picker__box"><ImagePlus size={18} />{image ? image.name : "Choose an image"}</span></label>
          <div className="builder-launch-grid builder-launch-grid--three"><label><span>Twitter / X</span><input value={form.twitter} onChange={(event) => updateField("twitter", event.target.value)} placeholder="https://x.com/..." /></label><label><span>Telegram</span><input value={form.telegram} onChange={(event) => updateField("telegram", event.target.value)} placeholder="https://t.me/..." /></label><label><span>Website</span><input value={form.website} onChange={(event) => updateField("website", event.target.value)} placeholder="https://..." /></label></div>
          <div className="builder-launch-options"><label><span>Initial buy (SOL)</span><input type="number" min="0" step="0.000000001" value={form.initialBuy} onChange={(event) => updateField("initialBuy", event.target.value)} /></label><label className="builder-toggle"><input type="checkbox" checked={form.showName} onChange={(event) => updateField("showName", event.target.checked)} /><span>Show name on Pump.fun</span></label></div>
          <details className="builder-advanced"><summary>Advanced Pump.fun options</summary><div className="builder-advanced__body"><label className="builder-toggle"><input type="checkbox" checked={form.cashback} onChange={(event) => updateField("cashback", event.target.checked)} /><span>Enable cashback</span></label><label className="builder-toggle"><input type="checkbox" checked={form.mayhemMode} onChange={(event) => updateField("mayhemMode", event.target.checked)} /><span>Mayhem mode</span></label><label className="builder-toggle"><input type="checkbox" checked={form.frontRunningProtection} onChange={(event) => updateField("frontRunningProtection", event.target.checked)} /><span>Front-runner protection</span></label>{form.frontRunningProtection ? <label><span>Jito tip (SOL)</span><input type="number" min="0" step="0.0001" value={form.tipAmount} onChange={(event) => updateField("tipAmount", event.target.value)} /></label> : null}</div></details>
          <button className="builder-launch-submit" disabled={isBusy} type="submit">{isBusy ? <><Loader2 className="is-spinning" size={16} />{progressLabel}</> : <><Wallet size={16} />{walletAddress ? "Launch token" : "Connect wallet and launch"}</>}</button>
        </form>

        <div className={`builder-access-status ${launchState === "error" ? "is-error" : ""}`} role="status">{message || "Your wallet signs the transaction. No private key or seed phrase is ever requested."}</div>
        {result ? <div className="builder-launch-success"><CheckCircle2 size={20} /><strong>Token launched successfully.</strong><span>CA: {result.mintPublicKey}</span><div><a href={`${ryuxConfig.pumpFunUrl}${result.mintPublicKey}`} target="_blank" rel="noreferrer">Open on Pump.fun <ExternalLink size={13} /></a><a href={`https://solscan.io/tx/${result.signature}`} target="_blank" rel="noreferrer">View transaction <ExternalLink size={13} /></a></div></div> : null}
      </section>
    </main>
  );
}

function getSolanaProvider(): WalletProvider | undefined {
  if (typeof window === "undefined") return undefined;
  const walletWindow = window as typeof window & { solana?: WalletProvider; solflare?: WalletProvider };
  return walletWindow.solana?.isPhantom ? walletWindow.solana : walletWindow.solflare ?? walletWindow.solana;
}

function parseSolLamports(value: string) {
  const trimmed = value.trim();
  if (!/^\d+(\.\d{1,9})?$/.test(trimmed)) return null;
  const [whole, fraction = ""] = trimmed.split(".");
  return (BigInt(whole) * BigInt(1_000_000_000) + BigInt(fraction.padEnd(9, "0"))).toString();
}

function decodeBase64(value: string) {
  const binary = window.atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function encodeBase64(value: Uint8Array) {
  let binary = "";
  value.forEach((byte) => { binary += String.fromCharCode(byte); });
  return window.btoa(binary);
}

async function readJson<T>(response: Response) {
  try { return await response.json() as T; } catch { return {} as T; }
}
