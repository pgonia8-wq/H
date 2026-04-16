// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable2Step.sol";

contract TotemRateLimiter is Ownable2Step {

    struct Bucket {
        uint128 tokens;
        uint64 lastRefill;
    }

    struct Config {
        uint128 capacity;     // max tokens
        uint128 refillRate;   // tokens per second
    }

    // actionId => config (ej: QUERY, UPDATE, etc)
    mapping(bytes32 => Config) public configs;

    // user => actionId => bucket
    mapping(address => mapping(bytes32 => Bucket)) public buckets;

    bytes32 public constant ACTION_QUERY = keccak256("QUERY");

    error RateLimited();

    constructor() {
        // default config
        configs[ACTION_QUERY] = Config({
            capacity: 5,
            refillRate: 1 // 1 token/sec
        });
    }

    function check(address user, bytes32 action) external {
        Config memory cfg = configs[action];
        Bucket storage b = buckets[user][action];

        uint64 nowTs = uint64(block.timestamp);

        if (b.lastRefill == 0) {
            b.lastRefill = nowTs;
            b.tokens = cfg.capacity;
        }

        uint64 elapsed = nowTs - b.lastRefill;

        if (elapsed > 0) {
            uint128 refill = uint128(elapsed) * cfg.refillRate;
            uint128 newTokens = b.tokens + refill;

            if (newTokens > cfg.capacity) {
                newTokens = cfg.capacity;
            }

            b.tokens = newTokens;
            b.lastRefill = nowTs;
        }

        if (b.tokens == 0) revert RateLimited();

        b.tokens -= 1;
    }

    function setConfig(
        bytes32 action,
        uint128 capacity,
        uint128 refillRate
    ) external onlyOwner {
        configs[action] = Config(capacity, refillRate);
    }
}
