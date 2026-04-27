/**
 * verify.js — Verifica los 23 contratos + 2 mocks en BaseScan (Base Sepolia).
 *
 * Lee deployment.base-sepolia.json y reconstruye los constructor args desde
 * el script de deploy, llamando hardhat-verify por cada contrato.
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const deploymentPath = path.join(__dirname, "..", "deployment.base-sepolia.json");
  const dep = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const c = dep.contracts;
  const deployer = dep.deployer;

  // Lista de [contractFQN, address, constructorArgs]
  const tasks = [
    // Mocks
    ["contracts/_mocks/MockWLD.sol:MockWLD",                   c.WLD,            []],
    ["contracts/_mocks/MockWorldID.sol:MockWorldID",           c.WorldID,        []],

    // Core
    ["contracts/TotemTreasury.sol:TotemTreasury",              c.Treasury,       [86400]],
    ["contracts/TotemRegistry.sol:TotemRegistry",              c.Registry,       [c.WorldID, c.Totem]],
    ["contracts/Totem.sol:Totem",                              c.Totem,          [c.Registry, c.Oracle, c.Curve]],
    ["contracts/TotemOracle.sol:TotemOracle",                  c.Oracle,         [deployer, c.Registry]],
    ["contracts/TotemBondingCurve.sol:TotemBondingCurve",      c.Curve,          [c.WLD, c.Registry, c.Oracle, c.Treasury, c.Metrics]],
    ["contracts/TotemMarketMetrics.sol:TotemMarketMetrics",    c.Metrics,        [c.Registry, c.Curve, deployer, deployer]],
    ["contracts/TotemAttestation.sol:TotemAttestation",        c.Attestation,    []],
    ["contracts/TotemRateLimiter.sol:TotemRateLimiter",        c.RateLimiter,    [c.Registry]],

    // Periphery
    ["contracts/TotemFeeRouter.sol:TotemFeeRouter",            c.FeeRouter,      [c.WLD, c.Treasury, deployer, deployer]],
    ["contracts/TotemStabilityModule.sol:TotemStabilityModule", c.Stability,     [c.Curve, c.Metrics, c.Oracle, c.FeeRouter]],
    ["contracts/TotemGraduationManager.sol:TotemGraduationManager", c.Graduation, [c.Totem, c.Curve, c.Metrics, c.WLD, deployer, deployer, c.Treasury, c.Oracle, c.Treasury]],
    ["contracts/TotemGovernance.sol:TotemGovernance",          c.Governance,     []],
    ["contracts/TotemAccessGateway.sol:TotemAccessGateway",    c.Gateway,        [c.Registry, c.Curve, c.RateLimiter, deployer]],
    ["contracts/TotemControl.sol:TotemControl",                c.Control,        []],
    ["contracts/TotemCredits.sol:TotemCredits",                c.Credits,        []],
    ["contracts/TotemAntiManipulationLayer.sol:TotemAntiManipulationLayer", c.AntiManipulation, []],
    ["contracts/TotemReader.sol:TotemReader",                  c.Reader,         [c.Oracle, c.Registry]],
    ["contracts/TotemRegistryFacade.sol:TotemRegistryFacade",  c.RegistryFacade, [c.Registry, c.Totem]],
    ["contracts/TotemCoreRouter.sol:TotemCoreRouter",          c.CoreRouter,     [c.Registry, c.Attestation, c.Oracle, c.Curve, c.RateLimiter]],
    ["contracts/TotemFactory.sol:TotemFactory",                c.Factory,        []],
    ["contracts/HumanTotem.sol:HumanTotem",                    c.HumanTotem,     ["Totem Human", "THUM", c.Totem, c.Oracle, c.Registry, c.Treasury]],
  ];

  console.log(`\n========================================`);
  console.log(`  VERIFY EN BASESCAN — ${tasks.length} contratos`);
  console.log(`========================================\n`);

  let ok = 0, already = 0, failed = 0;
  const failures = [];

  for (let i = 0; i < tasks.length; i++) {
    const [fqn, address, args] = tasks[i];
    const name = fqn.split(":").pop();
    process.stdout.write(`[${String(i + 1).padStart(2)}/${tasks.length}] ${name.padEnd(28)} ${address}  ... `);

    try {
      await hre.run("verify:verify", {
        address,
        constructorArguments: args,
        contract: fqn,
      });
      console.log("✅ verified");
      ok++;
    } catch (err) {
      const msg = (err.message || String(err)).split("\n")[0];
      if (/already verified/i.test(msg) || /already been verified/i.test(msg)) {
        console.log("ℹ️  already verified");
        already++;
      } else {
        console.log(`❌ ${msg.slice(0, 120)}`);
        failures.push({ name, address, err: msg });
        failed++;
      }
    }
    // Pequeño delay para no saturar el rate limit de BaseScan
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log(`\n========================================`);
  console.log(`  RESUMEN`);
  console.log(`========================================`);
  console.log(`  ✅ Verified:        ${ok}`);
  console.log(`  ℹ️  Already verified: ${already}`);
  console.log(`  ❌ Failed:           ${failed}`);
  if (failures.length) {
    console.log(`\nFailures:`);
    for (const f of failures) console.log(`  - ${f.name} (${f.address}): ${f.err.slice(0, 200)}`);
  }
  console.log("");
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
