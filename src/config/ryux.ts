export const ryuxConfig = {
  xUrl: "https://x.com/Vantaagents",

  pumpFunUrl: "https://pump.fun/coin/",

  contractAddress: "",
};

export function getContractLabel() {
  if (ryuxConfig.contractAddress === "SOON") {
    return "CA: SOON";
  }

  const ca = ryuxConfig.contractAddress;
  return `CA: ${ca.slice(0, 8)}...${ca.slice(-6)} - click to copy`;
}
