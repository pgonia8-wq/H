// 📦 "src/lib/oracleSigner.ts" — EIP-712 typed-data signing para TotemOracle
import { ethers } from "ethers";

// ⚠️ ESTA KEY DEBE IR EN ENV
const PRIVATE_KEY = process.env.ORACLE_PK as string;

const wallet = new ethers.Wallet(PRIVATE_KEY);

// Tipos EIP-712 — deben coincidir EXACTAMENTE con TotemOracle.sol UPDATE_TYPEHASH:
// "UpdateMetrics(address totem,address caller,uint256 score,uint256 influence,uint256 nonce,uint256 deadline)"
const UPDATE_METRICS_TYPES = {
  UpdateMetrics: [
    { name: "totem",     type: "address" },
    { name: "caller",    type: "address" },
    { name: "score",     type: "uint256" },
    { name: "influence", type: "uint256" },
    { name: "nonce",     type: "uint256" },
    { name: "deadline",  type: "uint256" },
  ],
} as const;

export async function signTotemUpdate({
  totem,
  caller,
  score,
  influence,
  nonce,
  deadline,
}: {
  totem:     string;
  caller:    string;
  score:     number;
  influence: number;
  nonce:     number;
  deadline:  number;
}) {
  const chainId           = Number(process.env.CHAIN_ID ?? 480); // World Chain mainnet = 480
  const verifyingContract = process.env.ORACLE_ADDRESS as string;

  const domain = {
    name:               "HTPOracle",
    version:            "1",
    chainId,
    verifyingContract,
  };

  const value = { totem, caller, score, influence, nonce, deadline };

  return wallet.signTypedData(domain, UPDATE_METRICS_TYPES, value);
}
