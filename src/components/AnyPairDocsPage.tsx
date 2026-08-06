import { ArrowUpRight, Check, Droplets, LockKeyhole, ShieldCheck, Wallet } from "lucide-react";
import { AnyPairPage } from "@/components/AnyPairChrome";

const sections = [
  ["01", "Launch a token", "Create on Pump.fun through a fair-launch bonding curve. No presale, no insider allocation, and no team reserve.", Wallet],
  ["02", "Graduate", "When the bonding curve fills, the token moves into an open market where liquidity can be configured against another asset.", Droplets],
  ["03", "Pair an asset", "Choose SOL, another Solana token, an xStock, gold, an index, or another graduated Pump.fun token and verify the pool on-chain.", ShieldCheck],
  ["04", "Trade and earn", "Users trade from their own wallets. Creators and eligible holders can receive the configured share of market fees.", LockKeyhole],
] as const;

export function AnyPairDocsPage() {
  return <AnyPairPage activeHref="/docs"><section className="docs-hero"><span className="anypair-kicker">ANY PAIR / DOCUMENTATION</span><h1>The market layer<br /><em>for fair launches.</em></h1><p>Any Pair connects Pump.fun launches with programmable liquidity markets on Solana.</p><div className="anypair-actions"><a className="anypair-button anypair-button--light" href="/launch">Launch a token <ArrowUpRight size={15} /></a><a className="anypair-button" href="/pair">Pair an asset <ArrowUpRight size={15} /></a></div></section><section className="docs-content"><div><span className="anypair-kicker">HOW IT WORKS</span><h2>From mint<br /><em>to market.</em></h2></div><div className="docs-steps">{sections.map(([number, title, body, Icon]) => <article key={number}><div><Icon size={18} /><span>{number}</span></div><h3>{title}</h3><p>{body}</p><a href={number === "01" ? "/launch" : number === "03" ? "/pair" : "/markets"}>Explore <ArrowUpRight size={12} /></a></article>)}</div></section><section className="docs-note"><span className="anypair-kicker">NON-CUSTODIAL BY DESIGN</span><h2>Your wallet signs.<br /><em>The chain verifies.</em></h2><p>Any Pair does not hold your tokens or private keys. Pool creation, trading, and reward claims require direct wallet signatures.</p><div><Check size={15} /> Solana programs</div><div><Check size={15} /> Pump.fun launches</div><div><Check size={15} /> Meteora liquidity</div></section><footer className="anypair-footer"><span>© 2026 ANY PAIR</span><div><a href="/">Home</a><a href="/roadmap">Roadmap</a><a href={"https://x.com/AnyPairProtocol"}>X</a></div></footer></AnyPairPage>;
}
