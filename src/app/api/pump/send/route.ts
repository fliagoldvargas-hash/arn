import { Connection } from "@solana/web3.js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { signedTransaction?: string; frontRunningProtection?: boolean } | null;
  if (!body?.signedTransaction) return NextResponse.json({ error: "Signed transaction is required." }, { status: 400 });

  try {
    const connection = new Connection(process.env.SOLANA_RPC_URL ?? "https://api.mainnet-beta.solana.com", "confirmed");
    const rawTransaction = Buffer.from(body.signedTransaction, "base64");
    const signature = body.frontRunningProtection
      ? await sendToJito(body.signedTransaction)
      : await connection.sendRawTransaction(rawTransaction, { skipPreflight: false, preflightCommitment: "confirmed" });
    await connection.confirmTransaction(signature, "confirmed");
    return NextResponse.json({ signature });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to send transaction." }, { status: 502 });
  }
}

async function sendToJito(transaction: string) {
  const endpoints = [
    "https://mainnet.block-engine.jito.wtf/api/v1/transactions",
    "https://amsterdam.mainnet.block-engine.jito.wtf/api/v1/transactions",
    "https://frankfurt.mainnet.block-engine.jito.wtf/api/v1/transactions",
    "https://ny.mainnet.block-engine.jito.wtf/api/v1/transactions",
    "https://tokyo.mainnet.block-engine.jito.wtf/api/v1/transactions",
  ];
  const responses = endpoints.map(async (url) => {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "sendTransaction", params: [transaction, { encoding: "base64" }] }),
    });
    if (!response.ok) throw new Error("Jito endpoint rejected the transaction.");
    const data = await response.json() as { result?: string; error?: { message?: string } };
    if (!data.result) throw new Error(data.error?.message ?? "Jito did not return a signature.");
    return data.result;
  });
  return Promise.any(responses);
}
