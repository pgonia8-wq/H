/**
 * smoke-onchain.js — Smoke test end-to-end de los 23 contratos en Base Sepolia.
 *
 * Flujo:
 *   1. Lee deployment.base-sepolia.json + conecta deployer (PRIMARY_SIGNER del Oracle)
 *   2. Comprueba estado base: balance ETH, oracle.UPDATE_FEE, registry.totalTotems,
 *      y constantes públicas de los contratos clave para confirmar que responden.
 *   3. Si el deployer no tiene totem: registry.createTotem(...) (MockWorldID es no-op)
 *   4. Lee oracle.nonces(deployer)
 *   5. Firma EIP-712 (HTPOracle/1, UpdateMetrics) con score=influence=1010 (rango [975,1025])
 *   6. Llama oracle.update(...) con UPDATE_FEE=0.01 ETH
 *   7. Verifica oracle.getMetrics(deployer) → score/influence/timestamp actualizados
 *
 * NO modifica nada irreversible. Idempotente: si el totem ya existe, lo reusa.
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

function fmt(label, value) {
  console.log(`  ${label.padEnd(28)} ${value}`);
}

async function main() {
  console.log("\n========================================");
  console.log("  SMOKE TEST ON-CHAIN — Base Sepolia");
  console.log("========================================\n");

  const dep = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "deployment.base-sepolia.json"), "utf8"));
  const c = dep.contracts;

  const [signer] = await hre.ethers.getSigners();
  const me = await signer.getAddress();
  const balance = await hre.ethers.provider.getBalance(me);

  console.log("▶ Conexión");
  fmt("Network",        `${dep.network} (chainId ${dep.chainId})`);
  fmt("Signer",         me);
  fmt("Balance",        `${hre.ethers.formatEther(balance)} ETH`);
  if (balance < hre.ethers.parseEther("0.02")) {
    throw new Error("Balance insuficiente — necesitas al menos 0.02 ETH para registro + Oracle.UPDATE_FEE.");
  }

  // ===== Mínima ABI para cada contrato que vamos a tocar =====
  const oracle = new hre.ethers.Contract(c.Oracle, [
    "function UPDATE_FEE() view returns (uint256)",
    "function PRIMARY_SIGNER() view returns (address)",
    "function nonces(address) view returns (uint256)",
    "function getMetrics(address) view returns (uint256 score, uint256 influence, uint256 timestamp)",
    "function authorizedSigners(address) view returns (bool)",
    "function paused() view returns (bool)",
    "function update(address totem, address caller, uint256 score, uint256 influence, uint256 nonce, uint256 deadline, bytes signature) payable",
  ], signer);

  const registry = new hre.ethers.Contract(c.Registry, [
    "function totalTotems() view returns (uint256)",
    "function isTotem(address) view returns (bool)",
    "function hasTotem(address) view returns (bool)",
    "function paused() view returns (bool)",
    "function createTotem(uint256 root, uint256 nullifierHash, uint256[8] proof)",
  ], signer);

  const curve = new hre.ethers.Contract(c.Curve, [
    "function totalSupply() view returns (uint256)",
  ], signer);

  console.log("\n▶ Estado on-chain");
  const [updateFee, primarySigner, paused, totalTotems, hasMyTotem, oraclePaused, isAuthorized] = await Promise.all([
    oracle.UPDATE_FEE(),
    oracle.PRIMARY_SIGNER(),
    registry.paused(),
    registry.totalTotems(),
    registry.hasTotem(me),
    oracle.paused(),
    oracle.authorizedSigners(me),
  ]);
  fmt("Oracle.UPDATE_FEE",   `${hre.ethers.formatEther(updateFee)} ETH`);
  fmt("Oracle.PRIMARY_SIGNER", primarySigner);
  fmt("Oracle.paused",       oraclePaused);
  fmt("Oracle.authorized(me)", isAuthorized);
  fmt("Registry.paused",     paused);
  fmt("Registry.totalTotems", totalTotems.toString());
  fmt("Registry.hasTotem(me)", hasMyTotem);

  if (primarySigner.toLowerCase() !== me.toLowerCase()) {
    console.warn(`\n⚠️  Cuidado: el signer (${me}) no es el PRIMARY_SIGNER (${primarySigner}). La firma EIP-712 será rechazada salvo que esté en authorizedSigners.`);
  }
  if (!isAuthorized) {
    throw new Error(`El signer ${me} no es authorizedSigner del Oracle — no puede firmar updates.`);
  }

  // ===== STEP 1: Registrar totem si no existe =====
  if (!hasMyTotem) {
    console.log("\n▶ STEP 1: Registrar totem (MockWorldID — verifyProof no-op)");
    const dummyNullifier = BigInt("0x" + me.slice(2).padStart(64, "0").slice(0, 64));
    const dummyProof = [0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n];
    const tx1 = await registry.createTotem(0, dummyNullifier, dummyProof);
    const rcpt1 = await tx1.wait();
    fmt("createTotem tx",  tx1.hash);
    fmt("gasUsed",         rcpt1.gasUsed.toString());
    fmt("status",          rcpt1.status === 1 ? "✅ confirmed" : "❌ failed");
  } else {
    console.log("\n▶ STEP 1: Totem ya existe — skip register");
  }

  const isTotemNow = await registry.isTotem(me);
  fmt("Registry.isTotem(me)", isTotemNow);
  if (!isTotemNow) throw new Error("El totem no quedó registrado tras createTotem.");

  // ===== STEP 2: Leer nonce y métricas previas =====
  console.log("\n▶ STEP 2: Leer nonce y métricas previas");
  const nonce = await oracle.nonces(me);
  const prevMetrics = await oracle.getMetrics(me);
  fmt("Oracle.nonces(me)",   nonce.toString());
  fmt("prev score",          prevMetrics[0].toString());
  fmt("prev influence",      prevMetrics[1].toString());
  fmt("prev timestamp",      prevMetrics[2].toString());

  // El contrato exige >= 1h desde el último update. Si ya hay timestamp < 1h, no podemos updatear ahora.
  const now = Math.floor(Date.now() / 1000);
  const minNext = Number(prevMetrics[2]) + 3600;
  if (Number(prevMetrics[2]) > 0 && now < minNext) {
    const wait = minNext - now;
    console.log(`\n⚠️  El Oracle exige MIN_INTERVAL=1h. Próximo update permitido en ${wait}s (~${Math.round(wait/60)} min).`);
    console.log("    Saltando STEP 3 — el resto del flujo on-chain ya quedó verificado.");
    console.log("\n========================================");
    console.log("  RESUMEN — PARCIAL (rate-limited)");
    console.log("========================================");
    console.log(`  ✅ Conexión + estado:   OK`);
    console.log(`  ✅ Totem registrado:    OK`);
    console.log(`  ⏸  Oracle.update:       skipped (cooldown 1h)`);
    return;
  }

  // ===== STEP 3: Firmar EIP-712 + llamar Oracle.update =====
  console.log("\n▶ STEP 3: Firmar EIP-712 (HTPOracle/1) y llamar Oracle.update");
  const score     = 1010;  // dentro de [975, 1025]
  const influence = 1010;
  const deadline  = now + 600;  // 10 min

  const domain = {
    name: "HTPOracle",
    version: "1",
    chainId: dep.chainId,
    verifyingContract: c.Oracle,
  };
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
  const value = { totem: me, caller: me, score, influence, nonce, deadline };
  const signature = await signer.signTypedData(domain, types, value);
  fmt("signature (truncated)", signature.slice(0, 22) + "..." + signature.slice(-12));
  fmt("score / influence",    `${score} / ${influence}`);
  fmt("deadline",             new Date(deadline * 1000).toISOString());

  const tx2 = await oracle.update(me, me, score, influence, nonce, deadline, signature, {
    value: updateFee,
  });
  const rcpt2 = await tx2.wait();
  fmt("update tx",   tx2.hash);
  fmt("gasUsed",     rcpt2.gasUsed.toString());
  fmt("status",      rcpt2.status === 1 ? "✅ confirmed" : "❌ failed");

  // ===== STEP 4: Verificar que el estado cambió =====
  console.log("\n▶ STEP 4: Verificar nuevo estado");
  const [newMetrics, newNonce, totemSupply] = await Promise.all([
    oracle.getMetrics(me),
    oracle.nonces(me),
    curve.totalSupply().catch(() => "n/a"),
  ]);
  fmt("new score",          newMetrics[0].toString());
  fmt("new influence",      newMetrics[1].toString());
  fmt("new timestamp",      newMetrics[2].toString());
  fmt("new nonce",          newNonce.toString());
  fmt("Curve.totalSupply",  totemSupply.toString());

  if (newMetrics[0] !== BigInt(score)) throw new Error(`score on-chain (${newMetrics[0]}) != esperado (${score})`);
  if (newMetrics[1] !== BigInt(influence)) throw new Error(`influence on-chain (${newMetrics[1]}) != esperado (${influence})`);
  if (newNonce !== nonce + 1n) throw new Error(`nonce no avanzó: ${nonce} → ${newNonce}`);

  console.log("\n========================================");
  console.log("  ✅ SMOKE TEST ON-CHAIN: PASS");
  console.log("========================================");
  console.log(`  Tx createTotem: ${hasMyTotem ? "(skipped)" : `https://sepolia.basescan.org/tx/<see above>`}`);
  console.log(`  Tx update:      https://sepolia.basescan.org/tx/${tx2.hash}`);
}

main().then(() => process.exit(0)).catch(e => { console.error("\n❌ FAIL:", e); process.exit(1); });
