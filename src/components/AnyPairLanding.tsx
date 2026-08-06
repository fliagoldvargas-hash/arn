"use client";

import { ArrowUpRight, Check, Coins, Droplets, LockKeyhole, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import { AnyPairPage, AnyPairLogo } from "@/components/AnyPairChrome";

const features = [
  { icon: Coins, number: "01", title: "Launch fairly", body: "Create on Pump.fun with no presale, insider allocation, or private round. Self-launch from your wallet with an optional same-transaction developer buy." },
  { icon: Droplets, number: "02", title: "Pair anything", body: "After graduation, route your token into a Meteora pool against SOL, another Solana token, tokenized stocks, gold, indexes, or any verified asset." },
  { icon: RefreshCw, number: "03", title: "Trade on-chain", body: "Every swap is routed directly from the user wallet to the liquidity pool. Prices stay relative to the paired asset and its USD value." },
  { icon: LockKeyhole, number: "04", title: "Stay non-custodial", body: "Any Pair never holds private keys or user funds. Launches, pool creation, and trades are signed by the wallet that owns them." },
];

export function AnyPairLanding() {
  return (
    <AnyPairPage>
      <section className="anypair-hero">
        <div className="anypair-hero__eyebrow"><span /> SOLANA LIQUIDITY PROTOCOL</div>
        <h1>Pair anything.<br /><em>Trade everything.</em></h1>
        <p>Any Pair turns fair-launched memecoins into programmable liquidity markets. Launch on Pump.fun, graduate, then pair with almost any tokenized asset.</p>
        <div className="anypair-actions">
          <a className="anypair-button anypair-button--light" href="/launch">Launch a token <ArrowUpRight size={15} /></a>
          <a className="anypair-button" href="/pair">Pair an asset <ArrowUpRight size={15} /></a>
        </div>
        <div className="anypair-hero__proof"><ShieldCheck size={15} /> Non-custodial infrastructure on Solana</div>
      </section>

      <section className="anypair-strip" aria-label="Protocol stack">
        <span>BUILT ON</span><strong>Solana</strong><span>LAUNCHES</span><strong>Pump.fun</strong><span>LIQUIDITY</span><strong>Meteora</strong><span>ASSET LAYER</span><strong>xStocks + crypto</strong>
      </section>

      <section className="anypair-section" id="protocol">
        <div className="anypair-section__intro"><span className="anypair-kicker">THE PROTOCOL</span><h2>From launch<br /><em>to liquidity.</em></h2><p>Most tokens stop at launch. Any Pair gives them a second market: a verified pool paired against the asset your community actually cares about.</p></div>
        <div className="anypair-feature-grid">{features.map(({ icon: Icon, number, title, body }) => <article className="anypair-feature" key={number}><div className="anypair-feature__top"><Icon size={19} /><span>{number}</span></div><h3>{title}</h3><p>{body}</p></article>)}</div>
      </section>

      <section className="anypair-section anypair-section--dark">
        <div className="anypair-section__intro"><span className="anypair-kicker">THE DIFFERENCE</span><h2>One token.<br /><em>Any market.</em></h2><p>Pair against assets that make your market legible: NVDAx, TSLAx, gold, indexes, SOL, or any graduated Solana token. The pool determines the relationship, the chain verifies it.</p></div>
        <div className="anypair-asset-board"><div><strong>NVDAx</strong><span>Tokenized equity</span></div><div><strong>GOLD</strong><span>Commodity exposure</span></div><div><strong>SOL</strong><span>Native liquidity</span></div><div><strong>ANY TOKEN</strong><span>Verified Solana asset</span></div></div>
      </section>

      <section className="anypair-final-cta"><AnyPairLogo size={46} /><span className="anypair-kicker">ANY PAIR / $STONK</span><h2>Markets are<br /><em>programmable.</em></h2><a className="anypair-button anypair-button--light" href="/markets">Explore markets <ArrowUpRight size={15} /></a></section>
      <footer className="anypair-footer"><span>© 2026 ANY PAIR</span><div><a href="/docs">Docs</a><a href="/roadmap">Roadmap</a><a href={"https://x.com/AnyPairProtocol"}>X</a></div></footer>
    </AnyPairPage>
  );
}
