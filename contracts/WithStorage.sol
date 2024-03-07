// SPDX-License-Identifier: MIT
pragma solidity =0.8.24;

import { LibDiamond } from "hardhat-deploy/solc_0.8/diamond/libraries/LibDiamond.sol";
import { IERC20 } from "@solidstate/contracts/interfaces/IERC20.sol";

struct StakingStorage {
    // token => user => balance
    mapping(address => mapping (address => uint)) balances;
    // token => user => last time staked
    mapping(address => mapping (address => uint)) lastTimeStaked; // TODO: explain this in README as a simple multi voting protection
}

struct Survey {
    string name;
    string description;
    IERC20 token;
    uint votingStart;
    uint votingDeadline;
    uint numberOfVotes;
    uint yesVotes;
    uint noVotes;
    mapping(address => bool) voted;
    address creator;
}


struct VotingStorage {
    mapping(address => bool) allowedToCreateSurvey;
    mapping(uint => Survey) surveys;
    uint[] surveyIds;
}

struct AppStorage {
    bool isInitialized;
    mapping(address => bool) allowedTokens;
}

contract WithStorage {
    bytes32 private constant APP_STORAGE_SLOT = keccak256("storage.slot.app");
    bytes32 private constant STAKING_STORAGE_SLOT = keccak256("storage.slot.staking");
    bytes32 private constant VOTING_STORAGE_SLOT = keccak256("storage.slot.voting");

    function a() internal pure returns (AppStorage storage appStorage) {
        bytes32 slot = APP_STORAGE_SLOT;
        assembly {
            appStorage.slot := slot
        }
    }

    function staking() internal pure returns (StakingStorage storage stakingStorage) {
        bytes32 slot = STAKING_STORAGE_SLOT;
        assembly {
            stakingStorage.slot := slot
        }
    }

    function voting() internal pure returns (VotingStorage storage votingStorage) {
        bytes32 slot = VOTING_STORAGE_SLOT;
        assembly {
            votingStorage.slot := slot
        }
    }

    function ds() internal pure returns (LibDiamond.DiamondStorage storage) {
        return LibDiamond.diamondStorage();
    }
}
