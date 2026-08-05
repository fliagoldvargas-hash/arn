import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const required = ["user", "creator", "feePayer", "name", "symbol", "uri", "solLamports"];
  if (!body || required.some((key) => typeof body[key] !== "string" || !body[key])) {
    return NextResponse.json({ error: "Missing token launch data." }, { status: 400 });
  }

  try {
    const response = await fetch("https://fun-block.pump.fun/agents/create-coin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...body,
        mayhemMode: body.mayhemMode === true,
        cashback: body.cashback === true,
        tokenizedAgent: false,
        frontRunningProtection: body.frontRunningProtection === true,
        tipAmount: typeof body.tipAmount === "number" ? body.tipAmount : 0,
        encoding: "base64",
      }),
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ error: "Pump.fun transaction builder is unavailable." }, { status: 502 });
  }
}
