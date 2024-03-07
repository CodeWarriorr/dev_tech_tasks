// SPDX-License-Identifier: MIT
pragma solidity =0.8.24;

import { WithStorage } from "./WithStorage.sol";
import { IERC20 } from "@solidstate/contracts/interfaces/IERC20.sol";
import { ReentrancyGuard } from "@solidstate/contracts/security/reentrancy_guard/ReentrancyGuard.sol";

contract StakingFacet is WithStorage, ReentrancyGuard {
    event Deposit(IERC20 indexed token, address indexed wallet, uint amount);
    event Withdraw(IERC20 indexed token, address indexed wallet, uint amount);

    function deposit(IERC20 token, uint amount) public nonReentrant {
        require(a().allowedTokens[address(token)], "StakingFacet: token not allowed");
        require(amount > 0, "StakingFacet: amount should be greater than 0");
        require(token.allowance(msg.sender, address(this)) >= amount, "StakingFacet: token allowance too low");

        token.transferFrom(msg.sender, address(this), amount);

        staking().balances[address(token)][msg.sender] += amount;
        staking().lastTimeStaked[address(token)][msg.sender] = block.timestamp;

        emit Deposit(token, msg.sender, amount);
    }

    function withdraw(IERC20 token, uint amount) public nonReentrant {
        require(amount > 0, "StakingFacet: amount should be greater than 0");
        require(staking().balances[address(token)][msg.sender] >= amount, "StakingFacet: amount exceeds balance");

        staking().balances[address(token)][msg.sender] -= amount;

        token.transfer(msg.sender, amount);

        emit Withdraw(token, msg.sender, amount);
    }
}
