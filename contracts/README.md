# Totem Protocol — Smart Contracts

Hardhat project containing the 23 production contracts of the Totem Protocol plus 2 testnet mocks (WLD, WorldID).

## Live deployment — Base Sepolia (chainId 84532)

See [`deployment.base-sepolia.json`](./deployment.base-sepolia.json) for the full address map.

Key addresses:

| Contract | Address |
|---|---|
| **TotemBondingCurve** | `0x6fDcc0EEEdab1024855f10d8bE3A7856Fc0E6F00` |
| **TotemOracle** | `0x5E97221883aB0998A4f58fd487d5665ccf437b8D` |
| TotemRegistry | `0xd8c5e5b801180A639A6736434cfDAa2562cdfA62` |
| Totem (NFT) | `0xB71849b8a036C8b211092082cC61f66Df1A20f6b` |
| TotemTreasury | `0xFAA49062df0c5de8Ade7aBEf49f3201e1F353df9` |

## Layout

```
contracts/
  *.sol            # 23 production contracts
  _mocks/          # MockWLD, MockWorldID (testnet only)
scripts/
  deploy.js        # Topological deploy (CREATE-address prediction for cycles)
hardhat.config.js  # Solidity 0.8.20 + viaIR + optimizer (200 runs)
package.json
deployment.base-sepolia.json
```

## Usage

```bash
npm install
echo "PRIVATE_KEY=0x..." > .env
npx hardhat compile
npx hardhat run scripts/deploy.js --network base_sepolia
```

The deploy script handles the circular dependency between `TotemRegistry`,
`Totem (NFT)`, `TotemOracle`, `TotemBondingCurve`, and `TotemMarketMetrics`
by precomputing CREATE addresses using the deployer nonce.

## License

All Solidity sources are licensed `UNLICENSED` (proprietary).
