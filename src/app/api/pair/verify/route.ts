import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const base = url.searchParams.get("base")?.trim();
  const quote = url.searchParams.get("quote")?.trim();
  if (!base || !quote) return NextResponse.json({ error: "Both asset addresses are required." }, { status: 400 });

  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${encodeURIComponent(base)},${encodeURIComponent(quote)}`, { cache: "no-store" });
    if (!response.ok) return NextResponse.json({ error: "Market data unavailable." }, { status: 502 });
    const data = (await response.json()) as { pairs?: Array<{ chainId?: string; baseToken?: { address?: string; name?: string; symbol?: string }; quoteToken?: { address?: string; name?: string; symbol?: string } }> };
    const pairs = (data.pairs ?? []).filter((pair) => pair.chainId === "solana");
    const basePair = pairs.find((pair) => pair.baseToken?.address === base || pair.quoteToken?.address === base);
    const quotePair = pairs.find((pair) => pair.baseToken?.address === quote || pair.quoteToken?.address === quote);
    if (!basePair || !quotePair) return NextResponse.json({ error: "Assets not found in public market data." }, { status: 404 });
    return NextResponse.json({ base: assetFor(base, basePair), quote: assetFor(quote, quotePair) });
  } catch {
    return NextResponse.json({ error: "Market verification failed." }, { status: 502 });
  }
}

function assetFor(address: string, pair: { baseToken?: { address?: string; name?: string; symbol?: string }; quoteToken?: { address?: string; name?: string; symbol?: string } }) {
  const asset = pair.baseToken?.address === address ? pair.baseToken : pair.quoteToken;
  return { address, name: asset?.name ?? address.slice(0, 6), symbol: asset?.symbol ?? "TOKEN" };
}
