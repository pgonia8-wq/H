/**
 * updateTotem.mjs
 *
 * FIX CRIT-2: Updated to pass `caller` and `deadline` to the Oracle,
 * matching the new on-chain function signature:
 *   update(address totem, address caller, uint256 score, uint256 influence,
 *          uint256 nonce, uint256 deadline, bytes calldata signature)
 *
 * The old version was calling update(totem, score, influence, nonce, signature)
 * which is missing `caller` and `deadline` — that call would always revert on-chain.
 *
 * IMPORTANT: The `caller` signed into the payload must equal msg.sender on-chain.
 * Since the backend wallet is the one sending the transaction, `caller` = wallet.address.
 */

import { signTotemUpdate } from "./oracleSigner.mjs";

// Signature deadline: 10 minutes from now. Adjust if node latency requires more.
const DEADLINE_BUFFER_SECONDS = 10 * 60;

export async function updateTotemOnChain({
  oracleContract,
  totem,
  score,
}) {

  // 1. Compute influence from score
  const influence = mapScoreToInfluence(score);

  // 2. Fetch current nonce from the contract
  const nonce = await oracleContract.nonces(totem);

  // 3. Set deadline (must be in the future when tx lands on-chain)
  const deadline = Math.floor(Date.now() / 1000) + DEADLINE_BUFFER_SECONDS;

  // 4. The caller that will send the tx — must match msg.sender on-chain (FIX CRIT-2)
  const caller = await oracleContract.runner.getAddress();

  // 5. Sign with EIP-712 (FIX CRIT-2)
  const signature = await signTotemUpdate({
    totem,
    caller,
    score,
    influence,
    nonce: Number(nonce),
    deadline,
  });

  // 6. Send transaction with correct argument order matching the on-chain ABI
  const tx = await oracleContract.update(
    totem,
    caller,
    score,
    influence,
    nonce,
    deadline,
    signature,
    { value: await oracleContract.UPDATE_FEE() }
  );

  await tx.wait();

  return tx;
}

/**
 * Maps a raw score to an influence multiplier.
 * Influence must be in range [925, 1075] to pass on-chain validation.
 */
function mapScoreToInfluence(score) {
  if (score > 8000) return 1075;
  if (score > 6000) return 1050;
  if (score > 4000) return 1000;
  if (score > 2000) return 960;
  return 925;
}
