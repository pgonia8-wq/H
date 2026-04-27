/**
 * Despliegue de los 23 contratos de Totem Protocol en Base Sepolia.
 *
 * Orden topológico — resuelve dependencias circulares vía pre-cálculo de
 * direcciones (CREATE address determinístico para cada nonce del deployer).
 *
 *   1) Mocks externos (WLD, WorldID) — Base Sepolia no tiene WLD nativo
 *   2) Núcleo: Treasury, Oracle, Registry, Totem, Curve, Metrics, Attestation, RateLimiter
 *   3) Periferia: FeeRouter, Stability, Graduation, Governance, AccessGateway,
 *      Control, Credits, AntiManipulation, Reader, RegistryFacade, CoreRouter,
 *      Factory, HumanTotem
 *   4) Imprime addresses finales (con foco en TotemBondingCurve y TotemOracle).
 */

const hre = require("hardhat");
const { ethers } = hre;

// Mock WLD ERC20 mínimo embebido para Base Sepolia (no hay WLD oficial allí)
const MOCK_WLD_BYTECODE_NOTE = `
NOTE: WLD no existe en Base Sepolia. Para deploy real en mainnet,
se debe pasar la address oficial de WLD como argumento al despliegue.
Para testnet, deployamos un MockWLD ERC20 mintable.
`;

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("\n========================================");
  console.log("  TOTEM PROTOCOL — DEPLOY (Base Sepolia)");
  console.log("========================================");
  console.log(`Network:  ${network.name} (chainId=${network.chainId})`);
  console.log(`Deployer: ${deployer.address}`);
  const bal = await ethers.provider.getBalance(deployer.address);
  console.log(`Balance:  ${ethers.formatEther(bal)} ETH`);
  console.log("========================================\n");

  if (bal === 0n) {
    throw new Error("Deployer balance = 0. Pide testnet ETH en https://www.alchemy.com/faucets/base-sepolia antes de continuar.");
  }

  const deployed = {};

  // ============================================================
  // 1) MOCKS EXTERNOS (necesarios porque Base Sepolia no tiene WLD)
  // ============================================================
  console.log("→ [1/3] Desplegando mocks externos (WLD, WorldID)...");

  // MockWLD ERC20 — usamos OZ ERC20Mock equivalente in-place
  const MockWLDFactory = new ethers.ContractFactory(
    [
      "constructor()",
      "function mint(address,uint256)",
      "function transfer(address,uint256) returns (bool)",
      "function balanceOf(address) view returns (uint256)",
      "function approve(address,uint256) returns (bool)",
      "function totalSupply() view returns (uint256)",
      "function decimals() view returns (uint8)",
    ],
    // bytecode mínimo de un ERC20 mintable — generado a partir de
    // openzeppelin v5 ERC20 + función mint pública
    "0x" + // placeholder — se reemplaza abajo
    "00",
    deployer
  );

  // En lugar del bytecode hardcoded, deployamos un contrato real
  // usando el compilado. Creamos MockWLD.sol on the fly si no existe.
  const wld = await deployContractInline("MockWLD", deployer);
  deployed.WLD = wld.target;
  console.log(`   MockWLD            ${wld.target}`);

  const worldID = await deployContractInline("MockWorldID", deployer);
  deployed.WorldID = worldID.target;
  console.log(`   MockWorldID        ${worldID.target}`);

  // ============================================================
  // 2) NÚCLEO — resuelve circularidad con CREATE address prediction
  // ============================================================
  console.log("\n→ [2/3] Desplegando núcleo (8 contratos con dependencias circulares)...");

  // Treasury (withdrawPeriod = 1 day)
  const Treasury = await ethers.getContractFactory("TotemTreasury");
  const treasury = await Treasury.deploy(86400);
  await treasury.waitForDeployment();
  deployed.Treasury = treasury.target;
  console.log(`   TotemTreasury      ${treasury.target}`);

  // Pre-calcular addresses para Registry → Totem → (Oracle, Curve, Metrics)
  const oracleSigner = deployer.address;
  const nonce = await ethers.provider.getTransactionCount(deployer.address, "pending");
  const aRegistry = ethers.getCreateAddress({ from: deployer.address, nonce: nonce });
  const aTotem    = ethers.getCreateAddress({ from: deployer.address, nonce: nonce + 1 });
  const aOracle   = ethers.getCreateAddress({ from: deployer.address, nonce: nonce + 2 });
  const aCurve    = ethers.getCreateAddress({ from: deployer.address, nonce: nonce + 3 });
  const aMetrics  = ethers.getCreateAddress({ from: deployer.address, nonce: nonce + 4 });

  // Registry (worldID, totem-pre)
  const Registry = await ethers.getContractFactory("TotemRegistry");
  const registry = await Registry.deploy(deployed.WorldID, aTotem);
  await registry.waitForDeployment();
  if (registry.target !== aRegistry) throw new Error(`Registry address mismatch: ${registry.target} vs ${aRegistry}`);
  deployed.Registry = registry.target;
  console.log(`   TotemRegistry      ${registry.target}`);

  // Totem (registry, oracle-pre, curve-pre)
  const Totem = await ethers.getContractFactory("Totem");
  const totem = await Totem.deploy(aRegistry, aOracle, aCurve);
  await totem.waitForDeployment();
  if (totem.target !== aTotem) throw new Error(`Totem address mismatch`);
  deployed.Totem = totem.target;
  console.log(`   Totem (NFT)        ${totem.target}`);

  // Oracle (signer, registry)
  const Oracle = await ethers.getContractFactory("TotemOracle");
  const oracle = await Oracle.deploy(oracleSigner, aRegistry);
  await oracle.waitForDeployment();
  if (oracle.target !== aOracle) throw new Error(`Oracle address mismatch`);
  deployed.Oracle = oracle.target;
  console.log(`   TotemOracle        ${oracle.target}   ★`);

  // Curve (wld, registry, oracle, treasury, metrics-pre)
  const Curve = await ethers.getContractFactory("TotemBondingCurve");
  const curve = await Curve.deploy(deployed.WLD, aRegistry, aOracle, treasury.target, aMetrics);
  await curve.waitForDeployment();
  if (curve.target !== aCurve) throw new Error(`Curve address mismatch`);
  deployed.Curve = curve.target;
  console.log(`   TotemBondingCurve  ${curve.target}   ★`);

  // Metrics (registry, curve, signer, backupSigner) — 4 args
  const Metrics = await ethers.getContractFactory("TotemMarketMetrics");
  const metrics = await Metrics.deploy(registry.target, curve.target, oracleSigner, oracleSigner);
  await metrics.waitForDeployment();
  if (metrics.target !== aMetrics) throw new Error(`Metrics address mismatch`);
  deployed.Metrics = metrics.target;
  console.log(`   TotemMarketMetrics ${metrics.target}`);

  // Attestation (sin args)
  const Attestation = await ethers.getContractFactory("TotemAttestation");
  const attestation = await Attestation.deploy();
  await attestation.waitForDeployment();
  deployed.Attestation = attestation.target;
  console.log(`   TotemAttestation   ${attestation.target}`);

  // RateLimiter (registry) — depende de Registry, va al final del núcleo
  const RateLimiter = await ethers.getContractFactory("TotemRateLimiter");
  const rateLimiter = await RateLimiter.deploy(registry.target);
  await rateLimiter.waitForDeployment();
  deployed.RateLimiter = rateLimiter.target;
  console.log(`   TotemRateLimiter   ${rateLimiter.target}`);

  // ============================================================
  // 3) PERIFERIA (15 contratos)
  // ============================================================
  console.log("\n→ [3/3] Desplegando periferia (15 contratos)...");

  const buybackVault = deployer.address;   // placeholder testnet
  const rewardPool   = deployer.address;

  const FeeRouter = await ethers.getContractFactory("TotemFeeRouter");
  const feeRouter = await FeeRouter.deploy(deployed.WLD, treasury.target, buybackVault, rewardPool);
  await feeRouter.waitForDeployment();
  deployed.FeeRouter = feeRouter.target;
  console.log(`   TotemFeeRouter             ${feeRouter.target}`);

  const Stability = await ethers.getContractFactory("TotemStabilityModule");
  const stability = await Stability.deploy(curve.target, metrics.target, oracle.target, feeRouter.target);
  await stability.waitForDeployment();
  deployed.Stability = stability.target;
  console.log(`   TotemStabilityModule       ${stability.target}`);

  const Graduation = await ethers.getContractFactory("TotemGraduationManager");
  const graduation = await Graduation.deploy(
    totem.target, curve.target, metrics.target, deployed.WLD,
    deployer.address, // router placeholder testnet
    deployer.address, // factory placeholder testnet
    treasury.target,  // liquidityProvider
    oracle.target,
    treasury.target
  );
  await graduation.waitForDeployment();
  deployed.Graduation = graduation.target;
  console.log(`   TotemGraduationManager     ${graduation.target}`);

  const Governance = await ethers.getContractFactory("TotemGovernance");
  const governance = await Governance.deploy();
  await governance.waitForDeployment();
  deployed.Governance = governance.target;
  console.log(`   TotemGovernance            ${governance.target}`);

  const Gateway = await ethers.getContractFactory("TotemAccessGateway");
  const gateway = await Gateway.deploy(registry.target, curve.target, rateLimiter.target, oracleSigner);
  await gateway.waitForDeployment();
  deployed.Gateway = gateway.target;
  console.log(`   TotemAccessGateway         ${gateway.target}`);

  const Control = await ethers.getContractFactory("TotemControl");
  const control = await Control.deploy();
  await control.waitForDeployment();
  deployed.Control = control.target;
  console.log(`   TotemControl               ${control.target}`);

  const Credits = await ethers.getContractFactory("TotemCredits");
  const credits = await Credits.deploy();
  await credits.waitForDeployment();
  deployed.Credits = credits.target;
  console.log(`   TotemCredits               ${credits.target}`);

  const Anti = await ethers.getContractFactory("TotemAntiManipulationLayer");
  const anti = await Anti.deploy();
  await anti.waitForDeployment();
  deployed.AntiManipulation = anti.target;
  console.log(`   TotemAntiManipulationLayer ${anti.target}`);

  const Reader = await ethers.getContractFactory("TotemReader");
  const reader = await Reader.deploy(oracle.target, registry.target);
  await reader.waitForDeployment();
  deployed.Reader = reader.target;
  console.log(`   TotemReader                ${reader.target}`);

  const RegFacade = await ethers.getContractFactory("TotemRegistryFacade");
  const regFacade = await RegFacade.deploy(registry.target, totem.target);
  await regFacade.waitForDeployment();
  deployed.RegistryFacade = regFacade.target;
  console.log(`   TotemRegistryFacade        ${regFacade.target}`);

  const CoreRouter = await ethers.getContractFactory("TotemCoreRouter");
  const coreRouter = await CoreRouter.deploy(
    registry.target, attestation.target, oracle.target, curve.target, rateLimiter.target
  );
  await coreRouter.waitForDeployment();
  deployed.CoreRouter = coreRouter.target;
  console.log(`   TotemCoreRouter            ${coreRouter.target}`);

  const Factory = await ethers.getContractFactory("TotemFactory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();
  deployed.Factory = factory.target;
  console.log(`   TotemFactory               ${factory.target}`);

  const HumanT = await ethers.getContractFactory("HumanTotem");
  const humanT = await HumanT.deploy(
    "Totem Human", "THUM",
    totem.target, oracle.target, registry.target, treasury.target
  );
  await humanT.waitForDeployment();
  deployed.HumanTotem = humanT.target;
  console.log(`   HumanTotem                 ${humanT.target}`);

  // ============================================================
  // RESUMEN FINAL
  // ============================================================
  console.log("\n========================================");
  console.log("  ✅ DEPLOY COMPLETADO");
  console.log("========================================");
  console.log("\n★ DIRECCIONES PRINCIPALES SOLICITADAS:\n");
  console.log(`   TotemBondingCurve = ${deployed.Curve}`);
  console.log(`   TotemOracle       = ${deployed.Oracle}`);
  console.log("\n========================================");
  console.log("  Verifica en BaseScan:");
  console.log(`  https://sepolia.basescan.org/address/${deployed.Curve}`);
  console.log(`  https://sepolia.basescan.org/address/${deployed.Oracle}`);
  console.log("========================================\n");

  // Persistir deployment.json
  const fs = require("fs");
  fs.writeFileSync(
    "deployment.base-sepolia.json",
    JSON.stringify({ network: "base_sepolia", chainId: 84532, deployer: deployer.address, contracts: deployed, timestamp: new Date().toISOString() }, null, 2)
  );
  console.log("📄 Direcciones guardadas en deployment.base-sepolia.json");
}

// Helper: deploy de mocks que están en contracts/_mocks/
async function deployContractInline(name, signer) {
  const factory = await ethers.getContractFactory(name);
  const c = await factory.deploy();
  await c.waitForDeployment();
  return c;
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n❌ DEPLOY FAILED:");
    console.error(err);
    process.exit(1);
  });
