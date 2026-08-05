import { PUMP_SDK } from "@pump-fun/pump-sdk";
import { Connection, Keypair, PublicKey, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const required = ["user", "creator", "feePayer", "name", "symbol", "uri", "solLamports"];
  if (!body || required.some((key) => typeof body[key] !== "string" || !body[key])) {
    return NextResponse.json({ error: "Missing token launch data." }, { status: 400 });
  }

  try {
    if (body.solLamports === "0") return await buildCreateOnlyTransaction(body);

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

async function buildCreateOnlyTransaction(body: Record<string, unknown>) {
  const connection = new Connection(process.env.SOLANA_RPC_URL ?? "https://api.mainnet-beta.solana.com", "confirmed");
  const user = new PublicKey(String(body.user));
  const creator = new PublicKey(String(body.creator));
  const mint = Keypair.generate();
  const instruction = await PUMP_SDK.createV2Instruction({
    mint: mint.publicKey,
    name: String(body.name),
    symbol: String(body.symbol),
    uri: String(body.uri),
    creator,
    user,
    mayhemMode: body.mayhemMode === true,
    cashback: body.cashback === true,
  });
  const latestBlockhash = await connection.getLatestBlockhash("confirmed");
  const message = new TransactionMessage({
    payerKey: user,
    recentBlockhash: latestBlockhash.blockhash,
    instructions: [instruction],
  }).compileToV0Message();
  const transaction = new VersionedTransaction(message);
  transaction.sign([mint]);

  return NextResponse.json({
    transaction: Buffer.from(transaction.serialize()).toString("base64"),
    mintPublicKey: mint.publicKey.toBase58(),
    quoteTokenAmount: "0",
    solLamports: "0",
    mayhemMode: body.mayhemMode === true,
    cashback: body.cashback === true,
    tokenizedAgent: false,
    frontRunningProtection: false,
  });
}
