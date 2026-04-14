// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @notice World ID Router v4 interface
 * @dev MUST revert on invalid proof
 */
interface IWorldIDVerifier {
    function verifyProof(
        uint256 root,
        uint256 groupId,
        uint256 signalHash,
        uint256 nullifierHash,
        uint256 externalNullifierHash,
        uint256[8] calldata proof
    ) external view;
}

/**
 * @title TotemRegistry
 * @notice 1 humano = 1 tótem (World ID enforced)
 * @dev Production-grade: anti-sybil, anti-front-running, audit-ready
 */
contract TotemRegistry {

    // =========================
    // CONSTANTS
    // =========================

    address public immutable WORLD_ID_VERIFIER;

    uint256 public constant GROUP_ID = 1;
    uint256 public immutable EXTERNAL_NULLIFIER;

    // =========================
    // STORAGE
    // =========================

    address public admin;
    address public pendingAdmin;

    bool public paused;

    mapping(address => bool) public hasTotem;
    mapping(address => bool) public isBlocked;

    mapping(uint256 => bool) public usedNullifiers;
    mapping(uint256 => address) public nullifierToAddress;
    mapping(address => uint256) public totemNullifier;

    uint256 public totalTotems;

    // =========================
    // EVENTS
    // =========================

    event TotemCreated(
        address indexed user,
        uint256 indexed nullifierHash,
        uint256 root,
        uint256 signalHash,
        uint256 totalTotems,
        uint256 timestamp
    );

    event TotemBlocked(address indexed user, string reason);
    event TotemUnblocked(address indexed user);

    event Paused(bool status);

    event AdminTransferStarted(address indexed current, address indexed pending);
    event AdminTransferred(address indexed newAdmin);

    // =========================
    // ERRORS
    // =========================

    error NotAdmin();
    error PausedError();
    error TotemAlreadyExists();
    error NullifierAlreadyUsed();
    error InvalidNullifier();
    error NotRegistered();
    error AlreadyBlocked();
    error NotBlocked();
    error NoPendingAdmin();

    // =========================
    // MODIFIERS
    // =========================

    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAdmin();
        _;
    }

    modifier notPaused() {
        if (paused) revert PausedError();
        _;
    }

    // =========================
    // CONSTRUCTOR
    // =========================

    constructor(address _worldIdVerifier) {
        require(_worldIdVerifier != address(0), "Invalid verifier");

        WORLD_ID_VERIFIER = _worldIdVerifier;
        admin = msg.sender;

        paused = false; // explicit

        EXTERNAL_NULLIFIER = uint256(keccak256("create-totem"));
    }

    // =========================
    // CORE
    // =========================

    function createTotem(
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) external notPaused {

        if (isBlocked[msg.sender]) revert AlreadyBlocked();
        if (hasTotem[msg.sender]) revert TotemAlreadyExists();

        if (nullifierHash == 0) revert InvalidNullifier();
        if (usedNullifiers[nullifierHash]) revert NullifierAlreadyUsed();
        if (nullifierToAddress[nullifierHash] != address(0)) revert NullifierAlreadyUsed();

        // MUST match frontend signal generation
        uint256 signalHash = uint256(keccak256(abi.encodePacked(msg.sender)));

        IWorldIDVerifier(WORLD_ID_VERIFIER).verifyProof(
            root,
            GROUP_ID,
            signalHash,
            nullifierHash,
            EXTERNAL_NULLIFIER,
            proof
        );

        hasTotem[msg.sender] = true;
        usedNullifiers[nullifierHash] = true;
        nullifierToAddress[nullifierHash] = msg.sender;
        totemNullifier[msg.sender] = nullifierHash;

        unchecked { totalTotems++; }

        emit TotemCreated(
            msg.sender,
            nullifierHash,
            root,
            signalHash,
            totalTotems,
            block.timestamp
        );
    }

    // =========================
    // FRAUD CONTROL
    // =========================

    function blockTotem(address user, string calldata reason) external onlyAdmin {

        if (!hasTotem[user]) revert NotRegistered();
        if (isBlocked[user]) revert AlreadyBlocked();

        isBlocked[user] = true;

        emit TotemBlocked(user, reason);
    }

    function unblockTotem(address user) external onlyAdmin {

        if (!isBlocked[user]) revert NotBlocked();

        isBlocked[user] = false;

        emit TotemUnblocked(user);
    }

    // =========================
    // ADMIN (2-step)
    // =========================

    function startAdminTransfer(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Zero address");

        pendingAdmin = newAdmin;

        emit AdminTransferStarted(admin, newAdmin);
    }

    function acceptAdmin() external {
        if (msg.sender != pendingAdmin) revert NoPendingAdmin();

        admin = pendingAdmin;
        pendingAdmin = address(0);

        emit AdminTransferred(admin);
    }

    function setPaused(bool _paused) external onlyAdmin {
        paused = _paused;
        emit Paused(_paused);
    }

    // =========================
    // VIEWS
    // =========================

    function isTotem(address user) external view returns (bool) {
        return hasTotem[user] && !isBlocked[user];
    }

    function getNullifier(address user) external view returns (uint256) {
        return totemNullifier[user];
    }

    function isNullifierUsed(uint256 nullifierHash) external view returns (bool) {
        return usedNullifiers[nullifierHash];
    }

    function getOwnerByNullifier(uint256 nullifierHash) external view returns (address) {
        return nullifierToAddress[nullifierHash];
    }
}
