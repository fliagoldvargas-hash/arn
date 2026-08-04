const WALLET_SESSION_KEY = "vanta-wallet-session";

export function readWalletSession() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(WALLET_SESSION_KEY) ?? "";
}

export function saveWalletSession(address: string) {
  if (typeof window === "undefined" || !address) return;
  window.localStorage.setItem(WALLET_SESSION_KEY, address);
}
