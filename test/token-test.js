const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token", function () {
    let token;
    let acc1;
    let owner;
    let tokenAddress;

    before(async function () {
        const tokenFactory = await ethers.getContractFactory("GymAlphaToken");
        token = await tokenFactory.deploy();
        tokenAddress = token.address;

        const accounts = await ethers.getSigners();
        owner = accounts[0];
        acc1 = accounts[1];
    })

    it("transfers token", async function () {
        const contractWithSigner = token.connect(owner);
        const ownerAddress = await owner.getAddress().then((addr) => addr.toString());
        const userAddress = await acc1.getAddress().then((addr) => addr.toString());
        await contractWithSigner.transfer(userAddress, 20000000)
        expect((await contractWithSigner.balanceOf(userAddress)).toString()).to.equal("20000000")
    })
})