import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const incoming = await request.formData();
    const form = new FormData();
    for (const [key, value] of incoming.entries()) {
      if (typeof value === "string") form.append(key, value);
      else form.append(key, value, value.name);
    }

    const response = await fetch("https://pump.fun/api/ipfs", { method: "POST", body: form, cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ error: "Unable to upload token metadata." }, { status: 502 });
  }
}
