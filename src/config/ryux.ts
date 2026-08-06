export const ryuxConfig = {
  brandName: "Any Pair",
  tokenName: "$STONK",
  xUrl: "https://x.com/AnyPairProtocol",

  pumpFunUrl: "https://pump.fun/coin/D1wD7EnYL5wPREVgGbdbMwwp5uwhMSVTmLkKRJ9Vpump",

  contractAddress: "D1wD7EnYL5wPREVgGbdbMwwp5uwhMSVTmLkKRJ9Vpump",
  stonkMint: "D1wD7EnYL5wPREVgGbdbMwwp5uwhMSVTmLkKRJ9Vpump",
};

export function getContractLabel() {
  if (ryuxConfig.contractAddress === "SOON") {
    return "CA: SOON";
  }

  const ca = ryuxConfig.contractAddress;
  return ca ? `CA: ${ca.slice(0, 8)}...${ca.slice(-6)} - click to copy` : "CA: Configure token";
}
