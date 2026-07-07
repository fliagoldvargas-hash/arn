export const ryuxConfig = {
  xUrl: "https://x.com/Ryuxfun",

  // Cuando lances el token, pega aca el link completo de Pump.fun.
  // Ejemplo: "https://pump.fun/coin/TU_CONTRACT_ADDRESS"
  pumpFunUrl: "",

  // Cuando lances el token, reemplaza SOON por el CA real.
  contractAddress: "SOON",
};

export function getContractLabel() {
  if (ryuxConfig.contractAddress === "SOON") {
    return "CA: SOON";
  }

  const ca = ryuxConfig.contractAddress;
  return `CA: ${ca.slice(0, 8)}...${ca.slice(-6)} - click to copy`;
}
