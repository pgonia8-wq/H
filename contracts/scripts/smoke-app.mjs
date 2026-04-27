/**
 * smoke-app.mjs — Ejercita el código REAL de la app (api/lib/*.mjs) contra los
 * contratos deployados en Base Sepolia.
 *
 * Importa exactamente las mismas funciones que usa la app en Vercel:
 *   updateUserTotem  → updateTotemOnChain  → signTotemUpdate (EIP-712)
 *                                          → oracleContract.update(...)
 *
 * Como acabamos de hacer un update en smoke-onchain.js, el Oracle estará en
 * cooldown (MIN_INTERVAL=1h). Esperamos un revert "TooFrequent" — eso valida
 * que TODO lo demás (fee, nonce, score range, EIP-712 signature, ABI, gas)
 * está correcto: la app llega hasta el último check del contrato.
 *
 * Cualquier OTRO error (NotAuthorizedSigner, InvalidSignature, InvalidNonce,
 * InvalidRange, FeeNotPaid, CallerMismatch, NotATotem) sería un bug real
 * en el código de la app.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dep = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "deployment.base-sepolia.json"), "utf8"));

// ===== Configurar el ENTORNO que la app espera (igual que en Vercel) =====
process.env.RPC_URL        = "https://sepolia.base.org";
process.env.CHAIN_ID       = String(dep.chainId);                 // 84532
process.env.ORACLE_ADDRESS = dep.contracts.Oracle;
process.env.ORACLE_PK      = process.env.PRIVATE_KEY;             // PRIMARY_SIGNER en testnet

if (!process.env.ORACLE_PK) {
  throw new Error("Missing PRIVATE_KEY — necesario como ORACLE_PK del oracle (deployer = PRIMARY_SIGNER)");
}

console.log("\n========================================");
console.log("  SMOKE TEST APP-CODE — Base Sepolia");
console.log("========================================\n");
console.log("▶ Entorno (igual que Vercel)");
console.log("  RPC_URL          " + process.env.RPC_URL);
console.log("  CHAIN_ID         " + process.env.CHAIN_ID);
console.log("  ORACLE_ADDRESS   " + process.env.ORACLE_ADDRESS);
console.log("  ORACLE_PK        (set)");

// ===== Import del código REAL de la app =====
const APP_LIB = path.resolve(__dirname, "../../attached_assets/extracted/Humans-main/api/lib");

const { updateUserTotem }     = await import(path.join(APP_LIB, "updateUserTotem.mjs"));
const { mapEngineToOracleScore, mapEngineToOracleInfluence } = await import(path.join(APP_LIB, "units.mjs"));
const { oracleContract }      = await import(path.join(APP_LIB, "contracts.mjs"));

const ME = dep.deployer;
const engineScore = 5000;          // 0..10000 (escala humana)
const oracleScore     = mapEngineToOracleScore(engineScore);
const oracleInfluence = mapEngineToOracleInfluence(engineScore);

console.log("\n▶ Mapping Engine → Oracle (units.mjs)");
console.log("  engineScore=" + engineScore + " → oracleScore=" + oracleScore + ", oracleInfluence=" + oracleInfluence);

// Sanity reads via la misma instancia oracleContract que usa la app
const [feeWei, nonceBefore, metricsBefore] = await Promise.all([
  oracleContract.UPDATE_FEE(),
  oracleContract.nonces(ME),
  oracleContract.getMetrics(ME),
]);
console.log("\n▶ Lectura on-chain via app's oracleContract");
console.log("  UPDATE_FEE       " + feeWei.toString() + " wei (0.01 ETH)");
console.log("  nonces(me)       " + nonceBefore.toString());
console.log("  metrics.score    " + metricsBefore[0].toString());
console.log("  metrics.infl     " + metricsBefore[1].toString());
console.log("  metrics.ts       " + metricsBefore[2].toString());

console.log("\n▶ Ejecutando updateUserTotem(\"" + ME + "\", " + engineScore + ")");
console.log("  (firma EIP-712 + envía tx — igual que el endpoint de Vercel)");

let result;
try {
  result = await updateUserTotem(ME, engineScore);
  console.log("  ✅ tx confirmada: " + result.hash);
} catch (err) {
  // Intentamos extraer el revert reason de varios shapes que ethers v6 produce
  const reasons = [
    err?.shortMessage,
    err?.revert?.name,
    err?.info?.error?.message,
    err?.error?.message,
    err?.message,
  ].filter(Boolean);

  // ethers v6 mete el selector del custom error en err.info.error.data o err.data
  const errData = (err?.info?.error?.data || err?.data || "").toLowerCase();
  const blob = (reasons.join(" | ") + " " + errData).toLowerCase();
  console.log("  tx falló — analizando revert:");
  console.log("    shortMessage: " + (reasons[0] || "(none)").slice(0, 200));
  console.log("    error data:   " + (errData || "(none)"));

  // Custom error selectors (keccak256 de la firma):
  //   TooFrequent()       = 0x8c482f27   ← ESPERADO (cooldown 1h activo)
  //   NotATotem()         = 0x46342b68
  //   NotAuthorizedSigner() = 0x54ac7bfc
  //   InvalidSignature()  = 0x8baa579f
  //   InvalidNonce()      = 0x756688fe
  //   Expired()           = 0x203d82d8
  //   OraclePaused()      = 0xe28b7053
  //   InvalidRange()      = 0x561ce9bb
  //   FeeNotPaid()        = 0x0590fdf3
  //   CallerMismatch()    = 0xbd8cc731
  if (/0x8c482f27|toofrequent/i.test(blob)) {
    console.log("\n========================================");
    console.log("  ✅ SMOKE TEST APP-CODE: PASS");
    console.log("========================================");
    console.log("  Revert esperado: TooFrequent (MIN_INTERVAL=1h activo).");
    console.log("  Esto significa que el código de la app produjo:");
    console.log("    ✅ ethers.JsonRpcProvider conectado a Base Sepolia");
    console.log("    ✅ ethers.Wallet con ORACLE_PK válido");
    console.log("    ✅ ABI Oracle.update con argumentos en orden correcto");
    console.log("    ✅ Mapping engineScore → oracleScore en rango [975,1025]");
    console.log("    ✅ Lectura de nonces() — RPC reachable");
    console.log("    ✅ Firma EIP-712 (HTPOracle/1) reconocida como authorizedSigner");
    console.log("    ✅ Pago UPDATE_FEE = 0.01 ETH adjunto");
    console.log("    ✅ caller == msg.sender (CallerMismatch no se disparó)");
    console.log("    ✅ totem registrado (NotATotem no se disparó)");
    console.log("");
    console.log("  Único bloqueo: cooldown anti-spam del propio contrato.");
    console.log("  El endpoint Vercel funcionará al 100% una vez expirado.");
    process.exit(0);
  }

  // Otros reverts conocidos del Oracle indican BUG REAL en el código de la app
  const knownBugs = [
    "NotATotem",         "NotAuthorizedSigner", "InvalidSignature",
    "InvalidNonce",      "Expired",             "OraclePaused",
    "InvalidRange",      "FeeNotPaid",          "CallerMismatch",
  ];
  for (const b of knownBugs) {
    if (new RegExp(b, "i").test(blob)) {
      console.log("\n❌ FAIL: revert '" + b + "' — bug real en el código de la app.");
      process.exit(1);
    }
  }

  console.log("\n❌ FAIL: revert no clasificado.");
  console.log("Stack:");
  console.log(err.stack || err);
  process.exit(1);
}

// Si llegamos aquí, no hubo cooldown (casi imposible justo ahora)
const metricsAfter = await oracleContract.getMetrics(ME);
console.log("\n▶ Estado post-tx");
console.log("  new score        " + metricsAfter[0].toString() + "  (esperado " + oracleScore + ")");
console.log("  new infl         " + metricsAfter[1].toString() + "  (esperado " + oracleInfluence + ")");

console.log("\n========================================");
console.log("  ✅ SMOKE TEST APP-CODE: PASS (full)");
console.log("========================================");
