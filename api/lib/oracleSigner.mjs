/**
 * oracleSigner.mjs
 *
 * FIX CRIT-2: Replaced raw solidityPacked + signMessage with EIP-712 signTypedData.
 *
 * Previous version was signing a flat keccak256(solidityPacked(...)) and adding the
 * Ethereum personal-sign prefix via signMessage(). The on-chain Oracle verifies an
 * EIP-712 structured hash with the \x19\x01 prefix (not the personal-sign prefix),
 * so EVERY signature produced by the old code was invalid on-chain.
 *
 * Additionally the old code omitted `caller` and `deadline` from the signed payload,
 * meaning signatures never expired and the caller restriction was bypass-able.
 *
 * This version produces signatures that the on-chain Oracle will accept.
 */

import { ethers } from "ethers";

const PRIVATE_KEY = process.env.ORACLE_PK;
const ORACLE_ADDRESS = process.env.ORACLE_ADDRESS;
const CHAIN_ID = parseInt(process.env.CHAIN_ID ?? "480", 10); // World Chain mainnet = 480

if (!PRIVATE_KEY) {
  throw new Error("Missing ORACLE_PK");
}
if (!ORACLE_ADDRESS) {
  throw new Error("Missing ORACLE_ADDRESS");
}

const wallet = new ethers.Wallet(PRIVATE_KEY);

// EIP-712 domain — must match the domain in TotemOracle.sol constructor exactly.
const domain = {
  name: "HTPOracle",
  version: "1",
  chainId: CHAIN_ID,
  verifyingContract: ORACLE_ADDRESS,
};

// Struct types — must match UPDATE_TYPEHASH in TotemOracle.sol exactly.
const types = {
  UpdateMetrics: [
    { name: "totem",     type: "address" },
    { name: "caller",    type: "address" },
    { name: "score",     type: "uint256" },
    { name: "influence", type: "uint256" },
    { name: "nonce",     type: "uint256" },
    { name: "deadline",  type: "uint256" },
  ],
};

/**
 * Signs an oracle metrics update using EIP-712.
 *
 * @param {object} params
 * @param {string} params.totem      - Address of the Totem being updated
 * @param {string} params.caller     - Address of the tx sender (must match msg.sender on-chain)
 * @param {number} params.score      - Score value (1 – 10000)
 * @param {number} params.influence  - Influence value (925 – 1075)
 * @param {number} params.nonce      - Current nonce from oracleContract.nonces(totem)
 * @param {number} params.deadline   - Unix timestamp after which the signature is invalid
 * @returns {Promise<string>}        - Hex-encoded EIP-712 signature
 */
export async function signTotemUpdate({ totem, caller, score, influence, nonce, deadline }) {
  const value = {
    totem,
    caller,
    score,
    influence,
    nonce,
    deadline,
  };

  // signTypedData produces an EIP-712 signature (not personal-sign)
  const signature = await wallet.signTypedData(domain, types, value);
  return signature;
}
