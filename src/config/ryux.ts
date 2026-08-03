export const ryuxConfig = {
  xUrl: "https://x.com/Aurenagents",

  pumpFunUrl: "https://pump.fun/coin/J84UT3MfBRUXXosxxQnXqnMRLVkohhSY5vLsTW4Ypump",

  contractAddress: "J84UT3MfBRUXXosxxQnXqnMRLVkohhSY5vLsTW4Ypump",
};

export function getContractLabel() {
  if (ryuxConfig.contractAddress === "SOON") {
    return "CA: SOON";
  }

  const ca = ryuxConfig.contractAddress;
  return `CA: ${ca.slice(0, 8)}...${ca.slice(-6)} - click to copy`;
}
