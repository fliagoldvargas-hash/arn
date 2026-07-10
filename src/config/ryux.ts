export const ryuxConfig = {
  xUrl: "https://x.com/Ryuxfun",

  pumpFunUrl: "https://pump.fun/coin/A4XawuDZWNQmpH38Vj1K8UF7HDWqvMMREqF48rMQpump",

  contractAddress: "A4XawuDZWNQmpH38Vj1K8UF7HDWqvMMREqF48rMQpump",
};

export function getContractLabel() {
  if (ryuxConfig.contractAddress === "SOON") {
    return "CA: SOON";
  }

  const ca = ryuxConfig.contractAddress;
  return `CA: ${ca.slice(0, 8)}...${ca.slice(-6)} - click to copy`;
}
