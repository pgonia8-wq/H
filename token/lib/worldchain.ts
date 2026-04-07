const WORLDCHAIN_RPC = "https://worldchain-mainnet.g.alchemy.com/public";
  const WLD_CONTRACT = "0x2cFc85d8E48F8EAB294be644d9E25C3030863003";
  const USDC_CONTRACT = "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1";

  const BALANCE_OF_SELECTOR = "0x70a08231";

  async function callBalanceOf(contract: string, wallet: string): Promise<bigint> {
    const paddedAddress = wallet.toLowerCase().replace("0x", "").padStart(64, "0");
    const data = BALANCE_OF_SELECTOR + paddedAddress;

    const res = await fetch(WORLDCHAIN_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_call",
        params: [{ to: contract, data }, "latest"],
      }),
    });

    const json = await res.json();
    if (json.error) throw new Error(json.error.message);
    return BigInt(json.result || "0x0");
  }

  function formatUnits(raw: bigint, decimals: number): number {
    const divisor = BigInt(10 ** decimals);
    const whole = raw / divisor;
    const fraction = raw % divisor;
    const fractionStr = fraction.toString().padStart(decimals, "0");
    return parseFloat(whole.toString() + "." + fractionStr);
  }

  export async function getWldBalance(wallet: string): Promise<number> {
    const raw = await callBalanceOf(WLD_CONTRACT, wallet);
    return formatUnits(raw, 18);
  }

  export async function getUsdcBalance(wallet: string): Promise<number> {
    const raw = await callBalanceOf(USDC_CONTRACT, wallet);
    return formatUnits(raw, 6);
  }

  export async function getBalances(wallet: string): Promise<{ wld: number; usdc: number }> {
    const [wld, usdc] = await Promise.all([
      getWldBalance(wallet),
      getUsdcBalance(wallet),
    ]);
    return { wld, usdc };
  }
  