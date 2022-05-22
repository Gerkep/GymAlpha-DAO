// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";

contract GAToken is ERC20Capped{
    constructor(uint256 cap) ERC20("GAToken", "GAT") ERC20Capped(cap){
}

    function issueToken(address receiver, uint amount) public{
        _mint(receiver, amount);
    }
}