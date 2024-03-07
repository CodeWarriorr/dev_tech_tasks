// SPDX-License-Identifier: MIT
pragma solidity =0.8.24;

import { IDiamondLoupe } from "hardhat-deploy/solc_0.8/diamond/interfaces/IDiamondLoupe.sol";
import { UsingDiamondOwner, IDiamondCut } from "hardhat-deploy/solc_0.8/diamond/UsingDiamondOwner.sol";
import { IERC165 } from "@solidstate/contracts/interfaces/IERC165.sol";
import { WithStorage } from "./WithStorage.sol";

contract InitFacet is UsingDiamondOwner, WithStorage {
    function init(address[] memory allowedTokens) external onlyOwner {
        if (a().isInitialized) return;

        ds().supportedInterfaces[type(IERC165).interfaceId] = true;
        ds().supportedInterfaces[type(IDiamondCut).interfaceId] = true;
        ds().supportedInterfaces[type(IDiamondLoupe).interfaceId] = true;

        // allow deployer to create surveys
        voting().allowedToCreateSurvey[msg.sender] = true;

        // allow tokens to be used in surveys
        for (uint i = 0; i < allowedTokens.length; i++) {
          a().allowedTokens[allowedTokens[i]] = true;
        }

        a().isInitialized = true;
    }
}
