// SPDX-License-Identifier: MIT
pragma solidity =0.8.24;

import { SolidStateERC20 } from "@solidstate/contracts/token/ERC20/SolidStateERC20.sol";

contract ExampleToken is SolidStateERC20 {
    constructor() {
        _setName("ExampleToken");
        _setSymbol("EXT");
        _setDecimals(18);
        _mint(msg.sender, 1000000 * 10 ** _decimals());
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
