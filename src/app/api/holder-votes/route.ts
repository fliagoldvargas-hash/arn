import { createPublicKey, verify } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { ryuxConfig } from "@/config/ryux";

export const runtime = "nodejs";

const voteOptions = [
  { id: "agent-profiles", label: "Agent profiles" },
  { id: "partner-listings", label: "Partner project listings" },
  { id: "holder-dashboard", label: "Holder dashboard" },
  { id: "marketplace-filters", label: "Marketplace preview access" },
  { id: "holder-rewards", label: "Holder rewards tracker" },
  { id: "buyback-transparency", label: "Buyback transparency" },
] as const;

type VoteOptionId = (typeof voteOptions)[number]["id"];

type HolderVoteRecord = {
  wallet_address: string;
  vote_option: VoteOptionId;
  vote_label: string;
  token_balance_raw: string;
  signature: string;
  signed_message: string;
  updated_at?: string;
};

type SolanaTokenAccountResponse = {
  result?: {
    value?: Array<{
      account?: {
        data?: {
          parsed?: {
            info?: {
              tokenAmount?: {
                amount?: string;
              };
            };
          };
        };
      };
    }>;
  };
};

const base58Alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export async function GET(request: NextRequest) {
  const walletAddress = request.nextUrl.searchParams.get("wallet")?.trim();

  if (!hasSupabaseConfig()) {
    return NextResponse.json({
      configured: false,
      options: voteOptions,
      totals: emptyTotals(),
      userVote: null,
    });
  }

  const response = await supabaseFetch(
    "/rest/v1/holder_votes?select=wallet_address,vote_option,vote_label,created_at&order=created_at.desc",
    { method: "GET" },
  );

  if (!response.ok) {
    return NextResponse.json({ error: "Unable to load holder votes." }, { status: 502 });
  }

  const records = (await response.json()) as Array<Pick<HolderVoteRecord, "wallet_address" | "vote_option" | "vote_label">>;
  const totals = emptyTotals();

  for (const record of records) {
    if (record.vote_option in totals) {
      totals[record.vote_option as VoteOptionId] += 1;
    }
  }

  const userVote = walletAddress
    ? records.find((record) => record.wallet_address.toLowerCase() === walletAddress.toLowerCase()) ?? null
    : null;

  return NextResponse.json({
    configured: true,
    options: voteOptions,
    totals,
    totalVotes: records.length,
    userVote,
  });
}

export async function POST(request: NextRequest) {
  if (!hasSupabaseConfig()) {
    return NextResponse.json({ error: "Supabase is not configured yet." }, { status: 500 });
  }

  const body = (await request.json()) as {
    walletAddress?: string;
    optionId?: VoteOptionId;
    message?: string;
    signature?: number[];
  };

  const walletAddress = body.walletAddress?.trim();
  const option = voteOptions.find((item) => item.id === body.optionId);
  const signature = Array.isArray(body.signature) ? Uint8Array.from(body.signature) : null;

  if (!walletAddress || !option || !body.message || !signature) {
    return NextResponse.json({ error: "Missing vote data." }, { status: 400 });
  }

  const expectedMessage = createVoteMessage(walletAddress, option.id, option.label, extractTimestamp(body.message));

  if (body.message !== expectedMessage) {
    return NextResponse.json({ error: "Invalid vote message." }, { status: 400 });
  }

  if (!isRecentVoteMessage(body.message)) {
    return NextResponse.json({ error: "Vote signature expired. Please sign again." }, { status: 400 });
  }

  if (!verifySolanaSignature(walletAddress, body.message, signature)) {
    return NextResponse.json({ error: "Wallet signature could not be verified." }, { status: 401 });
  }

  const existingVote = await getExistingHolderVote(walletAddress);

  if (existingVote && existingVote.vote_option !== option.id) {
    return NextResponse.json({ error: "This wallet already voted. Holder votes are locked." }, { status: 409 });
  }

  const tokenBalanceRaw = await getRyuxTokenBalance(walletAddress);

  if (BigInt(tokenBalanceRaw) <= BigInt(0)) {
    return NextResponse.json({ error: "$NEXA holder status not found for this wallet." }, { status: 403 });
  }

  const voteRecord: HolderVoteRecord = {
    wallet_address: walletAddress,
    vote_option: option.id,
    vote_label: option.label,
    token_balance_raw: tokenBalanceRaw,
    signature: Buffer.from(signature).toString("base64"),
    signed_message: body.message,
  };

  const response = await supabaseFetch("/rest/v1/holder_votes?on_conflict=wallet_address", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify(voteRecord),
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Unable to save holder vote." }, { status: 502 });
  }

  const records = (await response.json()) as HolderVoteRecord[];

  return NextResponse.json({
    ok: true,
    vote: records[0],
  });
}

async function getExistingHolderVote(walletAddress: string) {
  const response = await supabaseFetch(
    `/rest/v1/holder_votes?select=wallet_address,vote_option,vote_label&wallet_address=eq.${encodeURIComponent(walletAddress)}&limit=1`,
    { method: "GET" },
  );

  if (!response.ok) return null;

  const records = (await response.json()) as Array<Pick<HolderVoteRecord, "wallet_address" | "vote_option" | "vote_label">>;
  return records[0] ?? null;
}

function createVoteMessage(walletAddress: string, optionId: string, optionLabel: string, timestamp: string) {
  return [
    "NEXA Holder Vote",
    `Wallet: ${walletAddress}`,
    `Option: ${optionLabel}`,
    `Option ID: ${optionId}`,
    `Timestamp: ${timestamp}`,
  ].join("\n");
}

function extractTimestamp(message: string) {
  const timestampLine = message.split("\n").find((line) => line.startsWith("Timestamp: "));
  return timestampLine?.replace("Timestamp: ", "").trim() ?? "";
}

function isRecentVoteMessage(message: string) {
  const timestamp = Number(extractTimestamp(message));

  if (!Number.isFinite(timestamp)) return false;

  const tenMinutes = 10 * 60 * 1000;
  return Math.abs(Date.now() - timestamp) <= tenMinutes;
}

async function getRyuxTokenBalance(walletAddress: string) {
  const response = await fetch(process.env.SOLANA_RPC_URL ?? "https://api.mainnet-beta.solana.com", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "ryux-holder-vote",
      method: "getTokenAccountsByOwner",
      params: [
        walletAddress,
        { mint: ryuxConfig.contractAddress },
        { encoding: "jsonParsed" },
      ],
    }),
  });

  if (!response.ok) return "0";

  const data = (await response.json()) as SolanaTokenAccountResponse;
  const accounts = data.result?.value ?? [];

  return accounts
    .reduce((total, account) => {
      const amount = account.account?.data?.parsed?.info?.tokenAmount?.amount ?? "0";
      return total + BigInt(amount);
    }, BigInt(0))
    .toString();
}

function verifySolanaSignature(walletAddress: string, message: string, signature: Uint8Array) {
  try {
    const publicKey = solanaPublicKeyToNodeKey(walletAddress);
    return verify(null, Buffer.from(message), publicKey, Buffer.from(signature));
  } catch {
    return false;
  }
}

function solanaPublicKeyToNodeKey(walletAddress: string) {
  const publicKeyBytes = decodeBase58(walletAddress);

  if (publicKeyBytes.length !== 32) {
    throw new Error("Invalid Solana public key length.");
  }

  const ed25519SpkiPrefix = Buffer.from("302a300506032b6570032100", "hex");
  return createPublicKey({
    key: Buffer.concat([ed25519SpkiPrefix, Buffer.from(publicKeyBytes)]),
    format: "der",
    type: "spki",
  });
}

function decodeBase58(value: string) {
  const bytes = [0];

  for (const char of value) {
    const index = base58Alphabet.indexOf(char);
    if (index === -1) throw new Error("Invalid base58 character.");

    let carry = index;
    for (let i = 0; i < bytes.length; i += 1) {
      carry += bytes[i] * 58;
      bytes[i] = carry & 0xff;
      carry >>= 8;
    }

    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }

  for (const char of value) {
    if (char !== "1") break;
    bytes.push(0);
  }

  return Uint8Array.from(bytes.reverse());
}

function emptyTotals() {
  return voteOptions.reduce(
    (totals, option) => ({
      ...totals,
      [option.id]: 0,
    }),
    {} as Record<VoteOptionId, number>,
  );
}

function hasSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function supabaseFetch(path: string, init: RequestInit) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase env vars are missing.");
  }

  const extraHeaders = init.headers as Record<string, string> | undefined;
  const headers: Record<string, string> = {
    apikey: serviceRoleKey,
    "Content-Type": "application/json",
    "User-Agent": "ryux-holder-vote-api/1.0",
    ...extraHeaders,
  };

  if (!serviceRoleKey.startsWith("sb_secret_")) {
    headers.Authorization = `Bearer ${serviceRoleKey}`;
  }

  return fetch(`${supabaseUrl}${path}`, {
    ...init,
    headers,
  });
}
