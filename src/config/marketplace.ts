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
    name: "STONK",
    ticker: "$STONK",
    contractAddress: ryuxConfig.contractAddress,
    pumpFunUrl: ryuxConfig.pumpFunUrl,
    description: "The native token of the Any Pair ecosystem.",
    tone: "blue",
  },
];
