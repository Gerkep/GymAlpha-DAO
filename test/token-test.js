const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token", function () {
    let token;
    let acc1;
    let owner;
    let cap;

    before(async function () {
        const tokenFactory = ethers.getContractFactory("GymAlphaToken")
    })
})