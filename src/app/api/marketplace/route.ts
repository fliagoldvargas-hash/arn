import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type DexPair = {
  chainId?: string;
  dexId?: string;
  url?: string;
  baseToken?: { address?: string };
  priceUsd?: string;
  priceChange?: { h24?: number };
  marketCap?: number;
  fdv?: number;
  volume?: { h24?: number };
  liquidity?: { usd?: number };
};

export async function GET(request: Request) {
  const addresses = new URL(request.url).searchParams
    .get("addresses")
    ?.split(",")
    .map((address) => address.trim())
    .filter(Boolean);

  if (!addresses?.length) {
    return NextResponse.json({ tokens: [] });
  }

  try {
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${addresses.join(",")}`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      return NextResponse.json({ tokens: [], error: "Market data unavailable." }, { status: 502 });
    }

    const data = (await response.json()) as { pairs?: DexPair[] };
    const tokens = addresses.map((address) => {
      const pairs = (data.pairs ?? []).filter(
        (pair) => pair.chainId === "solana" && pair.baseToken?.address === address,
      );
      const pair = pairs.sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];

      return {
        address,
        pairUrl: pair?.url ?? null,
        priceUsd: numberOrNull(pair?.priceUsd),
        change24h: pair?.priceChange?.h24 ?? null,
        marketCap: pair?.marketCap ?? pair?.fdv ?? null,
        volume24h: pair?.volume?.h24 ?? null,
        liquidity: pair?.liquidity?.usd ?? null,
      };
    });

    return NextResponse.json({ tokens, updatedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json({ tokens: [], error: "Market data unavailable." }, { status: 502 });
  }
}

function numberOrNull(value?: string) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
