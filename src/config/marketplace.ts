import { ryuxConfig } from "@/config/ryux";

export type MarketplaceToken = {
  name: string;
  ticker: string;
  contractAddress: string;
  pumpFunUrl: string;
  description: string;
  imageUrl?: string;
  tone: "blue" | "green" | "violet";
};

// Add new marketplace tokens here. Changes go live with the next Vercel deploy.
export const marketplaceTokens: MarketplaceToken[] = [
  {
    name: "Auren",
    ticker: "$AUREN",
    contractAddress: ryuxConfig.contractAddress,
    pumpFunUrl: ryuxConfig.pumpFunUrl,
    description: "Autonomous agent infrastructure for on-chain intelligence and execution.",
    tone: "blue",
  },
];
