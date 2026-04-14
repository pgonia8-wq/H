// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IRegistry {
    function isTotem(address user) external view returns (bool);
}

interface IOracle {
    function data(address user) external view returns (
        uint256 score,
        uint256 influence,
        uint256 timestamp,
        uint256 nonce
    );
}

contract Totem {

    string public name = "Human Totem";
    string public symbol = "TOTEM";

    uint256 public totalSupply;

    IRegistry public registry;
    IOracle public oracle;

    address public admin;

    struct History {
        uint256 totalScoreAccumulated;
        uint256 lastScore;
        uint256 negativeEvents;
        uint256 lastUpdate;
    }

    struct Status {
        bool fraudLocked;
        uint256 level;
        uint256 badge;
    }

    mapping(uint256 => address) public ownerOf;
    mapping(address => uint256) public tokenOf;

    mapping(address => History) public history;
    mapping(address => Status) public status;

    event Mint(address indexed user, uint256 tokenId);
    event FraudLock(address indexed user, bool locked);
    event BadgeUpdated(address indexed user, uint256 badge);
    event LevelUpdated(address indexed user, uint256 level);

    constructor(address _registry, address _oracle) {
        registry = IRegistry(_registry);
        oracle = IOracle(_oracle);
        admin = msg.sender;
    }

    // =========================
    // MINT
    // =========================

    function mint() external {

        require(registry.isTotem(msg.sender), "Not registered");
        require(tokenOf[msg.sender] == 0, "Already minted");

        totalSupply++;

        uint256 id = totalSupply;

        ownerOf[id] = msg.sender;
        tokenOf[msg.sender] = id;

        emit Mint(msg.sender, id);
    }

    // =========================
    // SOULBOUND
    // =========================

    function transferFrom(address, address, uint256) external pure {
        revert("Soulbound");
    }

    function approve(address, uint256) external pure {
        revert("Soulbound");
    }

    // =========================
    // SYNC DESDE ORACLE
    // =========================

    function sync(address user) external {

        (uint256 score,, uint256 timestamp,) = oracle.data(user);

        History storage h = history[user];

        if (h.lastUpdate > 0) {
            h.totalScoreAccumulated += score;
        }

        // detectar eventos negativos
        if (score < h.lastScore) {
            h.negativeEvents++;
        }

        h.lastScore = score;
        h.lastUpdate = timestamp;

        // actualizar nivel
        uint256 lvl = calculateLevel(h.totalScoreAccumulated);
        status[user].level = lvl;

        // actualizar badge
        uint256 badge = calculateBadge(score, h.negativeEvents);
        status[user].badge = badge;

        emit LevelUpdated(user, lvl);
        emit BadgeUpdated(user, badge);
    }

    // =========================
    // FRAUDE
    // =========================

    function setFraud(address user, bool locked) external {
        require(msg.sender == admin, "Not admin");

        status[user].fraudLocked = locked;

        emit FraudLock(user, locked);
    }

    function isLocked(address user) external view returns (bool) {
        return status[user].fraudLocked;
    }

    // =========================
    // LÓGICA DE NIVEL
    // =========================

    function calculateLevel(uint256 totalScore) public pure returns (uint256) {

        if (totalScore > 1_000_000) return 5;
        if (totalScore > 500_000) return 4;
        if (totalScore > 100_000) return 3;
        if (totalScore > 10_000) return 2;
        return 1;
    }

    // =========================
    // BADGES
    // =========================

    function calculateBadge(uint256 score, uint256 negatives) public pure returns (uint256) {

        if (negatives > 50) return 0; // tóxico
        if (score > 8000) return 3; // elite
        if (score > 5000) return 2; // bueno
        return 1; // normal
    }

    // =========================
    // METADATA DINÁMICA JSON
    // =========================

    function tokenURI(uint256 tokenId) external view returns (string memory) {

        address user = ownerOf[tokenId];

        require(user != address(0), "Not exists");

        (uint256 score, uint256 influence,,) = oracle.data(user);

        History memory h = history[user];
        Status memory s = status[user];

        return string(
            abi.encodePacked(
                "{",
                '"name":"Totem #', uint2str(tokenId), '",',
                '"description":"Human economic identity",',
                '"attributes":[',

                '{"trait_type":"Score","value":', uint2str(score), '},',
                '{"trait_type":"Influence","value":', uint2str(influence), '},',
                '{"trait_type":"Level","value":', uint2str(s.level), '},',
                '{"trait_type":"Badge","value":', uint2str(s.badge), '},',
                '{"trait_type":"Negative Events","value":', uint2str(h.negativeEvents), '},',
                '{"trait_type":"Fraud Locked","value":"', s.fraudLocked ? "true" : "false", '"}',

                "]}"
            )
        );
    }

    // =========================
    // HELPERS
    // =========================

    function uint2str(uint256 _i) internal pure returns (string memory str) {
        if (_i == 0) return "0";
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        while (_i != 0) {
            bstr[--k] = bytes1(uint8(48 + _i % 10));
            _i /= 10;
        }
        str = string(bstr);
    }
}
