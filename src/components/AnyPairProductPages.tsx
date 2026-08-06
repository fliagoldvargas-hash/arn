"use client";

import { useState } from "react";
import { ArrowUpRight, Check, CircleAlert, ExternalLink, Loader2, ShieldCheck, Wallet } from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { AnyPairPage } from "@/components/AnyPairChrome";
import { ryuxConfig } from "@/config/ryux";

export function AnyPairLaunchPage() {
  const [mode, setMode] = useState<"self" | "auto">("self");
  const [form, setForm] = useState({ name: "", symbol: "", description: "", buy: "0" });
  const [message, setMessage] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.name || !form.symbol) return setMessage("Add a token name and symbol before continuing.");
    if (mode === "auto") return setMessage("Auto-Launch is prepared for the secure backend integration and is not enabled yet.");
    setMessage("Self-Launch is wallet-signed. Continue on Pump.fun to complete the official launch transaction.");
    window.open("https://pump.fun/create", "_blank", "noopener,noreferrer");
  };
  return <AnyPairPage activeHref="/launch"><ProductHero eyebrow="TOKEN LAUNCHING" title={<>Launch fairly.<br /><em>Own the origin.</em></>} body="Create directly on Pump.fun with no presale, insider allocation, or private distribution." />
    <section className="product-workspace"><div className="workspace-head"><span className="anypair-kicker">LAUNCH CONFIGURATION</span><h2>Create a fair-launch token.</h2><p>Choose how the creator transaction is signed. Your wallet remains the source of truth.</p></div><div className="mode-switch"><button className={mode === "self" ? "is-active" : ""} onClick={() => setMode("self")} type="button"><Wallet size={16} /><strong>Self-Launch</strong><span>You sign directly</span></button><button className={mode === "auto" ? "is-active" : ""} onClick={() => setMode("auto")} type="button"><ShieldCheck size={16} /><strong>Auto-Launch</strong><span>Coming with secure relayer</span></button></div><form className="anypair-form" onSubmit={submit}><label>Token name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Example Token" /></label><label>Symbol<input value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value.toUpperCase() })} placeholder="EXAMPLE" maxLength={10} /></label><label className="span-2">Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What is this market?" rows={3} /></label><label>Developer buy (SOL)<input type="number" min="0" step="0.01" value={form.buy} onChange={(e) => setForm({ ...form, buy: e.target.value })} /></label><div className="launch-checks"><span><Check size={14} /> No presale</span><span><Check size={14} /> No team reserve</span><span><Check size={14} /> Same-transaction buy</span></div><button className="anypair-button anypair-button--light span-2" type="submit">Continue with {mode === "self" ? "Self-Launch" : "Auto-Launch"} <ArrowUpRight size={15} /></button>{message ? <p className="form-message span-2" role="status">{message}</p> : null}</form></section></AnyPairPage>;
}

export function AnyPairPairPage() {
  const [base, setBase] = useState("");
  const [quote, setQuote] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<{ base: string; quote: string } | null>(null);
  const verify = async (event: FormEvent) => {
    event.preventDefault();
    if (!base || !quote) return;
    setStatus("loading"); setResult(null);
    try {
      const response = await fetch(`/api/pair/verify?base=${encodeURIComponent(base)}&quote=${encodeURIComponent(quote)}`, { cache: "no-store" });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setResult({ base: data.base?.name ?? base, quote: data.quote?.name ?? quote }); setStatus("done");
    } catch { setStatus("error"); }
  };
  return <AnyPairPage activeHref="/pair"><ProductHero eyebrow="PAIR WITH ANYTHING" title={<>Your token.<br /><em>Any reference asset.</em></>} body="Configure the market you want after graduation. Any Pair verifies both assets and the pool before listing it." /><section className="product-workspace"><div className="workspace-head"><span className="anypair-kicker">PAIR VERIFICATION</span><h2>Find two on-chain assets.</h2><p>Paste mint addresses for the graduated token and the asset you want it paired against.</p></div><form className="anypair-form" onSubmit={verify}><label className="span-2">Token mint<input value={base} onChange={(e) => setBase(e.target.value.trim())} placeholder="Graduated token contract address" /></label><label className="span-2">Pair asset mint<input value={quote} onChange={(e) => setQuote(e.target.value.trim())} placeholder="SOL, NVDAx, TSLAx, GOLD, or any Solana token" /></label><button className="anypair-button anypair-button--light span-2" disabled={status === "loading"} type="submit">{status === "loading" ? <Loader2 className="is-spinning" size={15} /> : <ShieldCheck size={15} />} Verify market</button></form>{status === "done" && result ? <div className="verification-result"><Check size={18} /><strong>Assets found on public market data</strong><span>{result.base} / {result.quote}</span><small>Pool creation and liquidity deposit require the Meteora integration and wallet signature.</small></div> : null}{status === "error" ? <div className="form-error"><CircleAlert size={17} /> One or both addresses could not be found in public market data.</div> : null}</section></AnyPairPage>;
}

export function AnyPairMarketsPage() {
  const [address, setAddress] = useState(ryuxConfig.contractAddress);
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const lookup = async (event: React.FormEvent) => { event.preventDefault(); if (!address) return; setLoading(true); try { const response = await fetch(`/api/marketplace?addresses=${encodeURIComponent(address)}`, { cache: "no-store" }); setData(((await response.json()).tokens?.[0] ?? null) as Record<string, unknown> | null); } finally { setLoading(false); } };
  return <AnyPairPage activeHref="/markets"><ProductHero eyebrow="MARKETS" title={<>Markets without<br /><em>permission.</em></>} body="Explore listed assets and inspect live public market data before you trade or provide liquidity." /><section className="product-workspace"><div className="workspace-head"><span className="anypair-kicker">MARKET LOOKUP</span><h2>Inspect any Solana token.</h2><p>Paste a mint address to retrieve the best available pair, price, liquidity, and 24h activity.</p></div><form className="lookup-form" onSubmit={lookup}><input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Token contract address" /><button className="anypair-button anypair-button--light" type="submit">{loading ? <Loader2 className="is-spinning" size={15} /> : "Inspect"}</button></form>{data ? <div className="market-result"><strong>{String(data.name ?? "Unknown token")}</strong><span>{String(data.symbol ?? "--")}</span><div><b>{formatValue(data.priceUsd)}</b><b>{formatValue(data.marketCap)}<small>MCAP</small></b><b>{formatValue(data.volume24h)}<small>24H VOL</small></b></div><a href={String(data.pairUrl ?? "#")} target="_blank" rel="noreferrer">Open market <ExternalLink size={14} /></a></div> : <div className="empty-state">No market loaded. Add a mint address to inspect it.</div>}</section></AnyPairPage>;
}

export function AnyPairRewardsPage() {
  return <AnyPairPage activeHref="/rewards"><ProductHero eyebrow="REWARDS" title={<>Fees belong<br /><em>to the market.</em></>} body="Creators earn from trading activity. Holders can claim eligible distributions when a configured market activates rewards." /><section className="product-workspace rewards-workspace"><span className="anypair-kicker">REWARDS CENTER</span><h2>Connect to check eligibility.</h2><p>Rewards are held by on-chain program accounts and must be claimed with the wallet that owns the eligible position.</p><div className="reward-cards"><div><strong>Creator fees</strong><span>Accrue from your token’s trading activity.</span><button type="button" disabled>Claim creator fees <ArrowUpRight size={14} /></button></div><div><strong>Holder rewards</strong><span>Claimable distributions for configured paired-asset holders.</span><button type="button" disabled>Check eligibility <ArrowUpRight size={14} /></button></div></div><div className="form-message"><CircleAlert size={15} /> Claim transactions require the rewards contract and fee-recipient configuration.</div></section></AnyPairPage>;
}

export function AnyPairBurnsPage() {
  const [signature, setSignature] = useState("");
  return <AnyPairPage activeHref="/burns"><ProductHero eyebrow="$STONK / BURNS" title={<>Make supply<br /><em>verifiable.</em></>} body="Any Pair routes a portion of platform revenue toward $STONK buybacks and permanent burns. Every burn should be checkable on-chain." /><section className="product-workspace"><div className="workspace-head"><span className="anypair-kicker">PUBLIC VERIFICATION</span><h2>Verify a burn transaction.</h2><p>Paste a Solana transaction signature to open the canonical explorer record.</p></div><form className="lookup-form" onSubmit={(event) => { event.preventDefault(); if (signature) window.open(`https://solscan.io/tx/${encodeURIComponent(signature)}`, "_blank", "noopener,noreferrer"); }}><input value={signature} onChange={(e) => setSignature(e.target.value.trim())} placeholder="Solana transaction signature" /><button className="anypair-button anypair-button--light" type="submit">Verify <ExternalLink size={14} /></button></form><div className="empty-state">No burn events are configured yet. The explorer remains the source of truth.</div></section></AnyPairPage>;
}

function ProductHero({ eyebrow, title, body }: { eyebrow: string; title: ReactNode; body: string }) { return <section className="product-hero"><span className="anypair-kicker">{eyebrow}</span><h1>{title}</h1><p>{body}</p></section>; }
function formatValue(value: unknown) { if (value == null || value === "") return "--"; if (typeof value === "number") return value >= 1000 ? `$${(value / 1000).toFixed(1)}K` : `$${value.toPrecision(4)}`; return String(value); }
