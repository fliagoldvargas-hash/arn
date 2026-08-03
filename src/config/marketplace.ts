import { ryuxConfig } from "@/config/ryux";

export type MarketplaceToken = {
  name: string;
  ticker: string;
  contractAddress: string;
  pumpFunUrl: string;
  description: string;
  tone: "blue" | "green" | "violet";
};

// Add new marketplace tokens here. Changes go live with the next Vercel deploy.
export const marketplaceTokens: MarketplaceToken[] = [
  {
    name: "Orbis",
    ticker: "$ORBIS",
    contractAddress: ryuxConfig.contractAddress,
    pumpFunUrl: ryuxConfig.pumpFunUrl,
    description: "Autonomous agent infrastructure for on-chain intelligence and execution.",
    tone: "blue",
  },
  {
    name: "Token Name",
    ticker: "$TICKER",
    contractAddress: "8rWNVQoFyhWgKfBQGo1o7va5imP9rYT9jNroDqN4pump",
    pumpFunUrl: "https://pump.fun/coin/8rWNVQoFyhWgKfBQGo1o7va5imP9rYT9jNroDqN4pump",
    description: "Descripción breve del proyecto.",
    tone: "blue",
  },
];
