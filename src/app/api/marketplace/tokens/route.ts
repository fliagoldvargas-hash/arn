import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CatalogToken = {
  name: string;
  ticker: string;
  contractAddress: string;
  pumpFunUrl: string;
  description: string;
  imageUrl: string;
  tone: "blue" | "green" | "violet";
};

export async function GET() {
  if (!hasSupabaseConfig()) return NextResponse.json({ configured: false, tokens: [] });
  try {
    const response = await supabaseFetch("/rest/v1/marketplace_tokens?select=name,ticker,contract_address,pump_fun_url,description,image_url,tone&order=created_at.desc", { method: "GET" });
    if (!response.ok) return NextResponse.json({ configured: false, tokens: [], error: "Marketplace table is not configured." });
    const rows = await response.json() as Array<Record<string, string>>;
    return NextResponse.json({ configured: true, tokens: rows.map(toCatalogToken) });
  } catch {
    return NextResponse.json({ configured: false, tokens: [], error: "Marketplace storage is unavailable." });
  }
}

export async function POST(request: Request) {
  if (!hasSupabaseConfig()) return NextResponse.json({ configured: false, error: "Supabase is not configured." }, { status: 503 });
  const body = await request.json().catch(() => null) as Partial<CatalogToken> | null;
  if (!body?.name || !body.ticker || !body.contractAddress || !body.pumpFunUrl || !body.description) return NextResponse.json({ error: "Missing marketplace token data." }, { status: 400 });
  try {
    const response = await supabaseFetch("/rest/v1/marketplace_tokens?on_conflict=contract_address", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=representation" }, body: JSON.stringify({ name: body.name, ticker: body.ticker, contract_address: body.contractAddress, pump_fun_url: body.pumpFunUrl, description: body.description, image_url: body.imageUrl ?? "", tone: body.tone ?? "blue" }) });
    if (!response.ok) return NextResponse.json({ configured: false, error: "Marketplace table is not configured." }, { status: 503 });
    return NextResponse.json({ configured: true });
  } catch {
    return NextResponse.json({ configured: false, error: "Marketplace storage is unavailable." }, { status: 503 });
  }
}

function toCatalogToken(row: Record<string, string>): CatalogToken { return { name: row.name, ticker: row.ticker, contractAddress: row.contract_address, pumpFunUrl: row.pump_fun_url, description: row.description, imageUrl: row.image_url ?? "", tone: (row.tone as CatalogToken["tone"]) ?? "blue" }; }
function hasSupabaseConfig() { return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY); }
function supabaseFetch(path: string, init: RequestInit) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars are missing.");
  const headers: Record<string, string> = { apikey: key, "Content-Type": "application/json", ...((init.headers ?? {}) as Record<string, string>) };
  if (!key.startsWith("sb_secret_")) headers.Authorization = `Bearer ${key}`;
  return fetch(`${url}${path}`, { ...init, headers, cache: "no-store" });
}
