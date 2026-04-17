// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable2Step.sol";

contract TotemGovernance is Ownable2Step {

    struct Proposal {
        uint256 id;
        bytes32 action;
        bool executed;
        uint256 timestamp;
    }

    mapping(uint256 => Proposal) public proposals;

    uint256 public proposalCount;

    uint256 public emergencyThreshold = 75; // stress > 75 = crisis mode

    bool public emergencyMode;

    event ProposalCreated(uint256 id, bytes32 action);
    event EmergencyActivated();
    event EmergencyDeactivated();

    function createProposal(bytes32 action) external onlyOwner {

        proposalCount++;

        proposals[proposalCount] = Proposal({
            id: proposalCount,
            action: action,
            executed: false,
            timestamp: block.timestamp
        });

        emit ProposalCreated(proposalCount, action);
    }

    function activateEmergency(uint256 stressIndex) external onlyOwner {

        if (stressIndex > emergencyThreshold) {
            emergencyMode = true;
            emit EmergencyActivated();
        }
    }

    function deactivateEmergency() external onlyOwner {
        emergencyMode = false;
        emit EmergencyDeactivated();
    }
}
