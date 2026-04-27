/**
 * contracts.mjs
 *
 * FIX CRIT-2: Updated ABI to match the current TotemOracle.sol function signature.
 *
 *   Old ABI:  update(address, uint256, uint256, uint256, bytes)
 *   New ABI:  update(address totem, address caller, uint256 score, uint256 influence,
 *                    uint256 nonce, uint256 deadline, bytes signature)
 *
 *   The missing `caller` and `deadline` arguments caused every on-chain call to revert.
 *
 * FIX FEE-WLD (post re-deploy 2026-04-27): TotemOracle ya no cobra el UPDATE_FEE en
 * ETH nativo (msg.value) sino en 0.03 WLD ERC20 vía transferFrom.
 *
 *   - Removido `payable` del ABI de update().
 *   - Agregado IERC20 WLD ABI mínimo (approve / allowance / transfer / balanceOf).
 *   - Exportado `wldContract` para que callers puedan hacer wld.approve(oracle, fee)
 *     ANTES de invocar oracle.update(...).
 *
 *   Env vars requeridas: RPC_URL, ORACLE_PK, ORACLE_ADDRESS, WLD_ADDRESS.
 */

import { ethers } from "ethers";

const RPC_URL        = process.env.RPC_URL;
const PRIVATE_KEY    = process.env.ORACLE_PK;
const ORACLE_ADDRESS = process.env.ORACLE_ADDRESS;
const WLD_ADDRESS    = process.env.WLD_ADDRESS;

if (!RPC_URL || !PRIVATE_KEY || !ORACLE_ADDRESS || !WLD_ADDRESS) {
  throw new Error("Missing env variables: RPC_URL, ORACLE_PK, ORACLE_ADDRESS, WLD_ADDRESS");
}

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet   = new ethers.Wallet(PRIVATE_KEY, provider);

// Full ABI matching TotemOracle.sol (FIX CRIT-2 + FIX FEE-WLD)
const ORACLE_ABI = [
  // State-changing functions (no longer payable — fee cobrada en WLD)
  "function update(address totem, address caller, uint256 score, uint256 influence, uint256 nonce, uint256 deadline, bytes calldata signature) external",

  // View functions
  "function nonces(address totem) external view returns (uint256)",
  "function getScore(address user) external view returns (uint256)",
  "function getInfluence(address user) external view returns (uint256)",
  "function getMetrics(address user) external view returns (uint256 score, uint256 influence, uint256 timestamp)",

  // Constants
  "function UPDATE_FEE() external view returns (uint256)",
  "function DOMAIN_SEPARATOR() external view returns (bytes32)",
  "function wldToken() external view returns (address)",
];

// IERC20 ABI mínimo — necesario para que el caller del Oracle apruebe el UPDATE_FEE
// en WLD antes de invocar oracle.update(...). El contrato hace transferFrom(msg.sender).
const WLD_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function decimals() external view returns (uint8)",
];

export const oracleContract = new ethers.Contract(
  ORACLE_ADDRESS,
  ORACLE_ABI,
  wallet
);

export const wldContract = new ethers.Contract(
  WLD_ADDRESS,
  WLD_ABI,
  wallet
);
