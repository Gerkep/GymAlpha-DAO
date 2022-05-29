// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract GymAlphaToken is ERC20{
    address creator;
    constructor() ERC20("GymAlphaToken", "GAT") {
        _mint(msg.sender, 1000000000*10**18);
    }
}