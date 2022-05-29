const { expect, use } = require("chai");
const { ethers } = require("hardhat");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

function delay(milliseconds){
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

describe("Staking", function () {
    let stakingContract;
    let nftContract; 
    let tokenContract;
    let nftContractAddress;
    let tokenContractAddress;
    let stakingContractAddress;
    let owner;
    let user;
    let hexproof;

    before(async function () {
        const stakingFactory = await ethers.getContractFactory("AlphaStaking");
        const nftFactory = await ethers.getContractFactory("GenesisNFT");
        const tokenFactory = await ethers.getContractFactory("GymAlphaToken");
        tokenContract = await tokenFactory.deploy();
        nftContract = await nftFactory.deploy();
        nftContractAddress = nftContract.address;
        tokenContractAddress = tokenContract.address;
        stakingContract = await stakingFactory.deploy(nftContractAddress, tokenContractAddress);
        stakingContractAddress = stakingContract.address;

        const accounts = await ethers.getSigners();
        owner = accounts[0];
        user = accounts[1];

        let whitelistAddresses = [
            "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
        ]
        const leafNodes = whitelistAddresses.map(addr => keccak256(addr));
        const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
        const claimingAddress = leafNodes[0];
        hexproof = merkleTree.getHexProof(claimingAddress);
    });

    it("Stakes NFT", async function () {
        const stakingWithOwner = stakingContract.connect(owner);
        const nftWithOwner = nftContract.connect(owner);
        const tokenWithOwner = tokenContract.connect(owner);
        await tokenWithOwner.approve(stakingContractAddress, 1000000000000000);
        await nftWithOwner.setApprovalForAll(stakingContractAddress, true);
        await nftWithOwner.setPause(false);
        const address = await owner.getAddress().then((addr) => addr.toString());
        await nftWithOwner.mintNFT(address, 1, hexproof, { value: ethers.utils.parseEther("0.03")});
        await stakingWithOwner.stake([1]); 
        expect(( await stakingWithOwner.getTotalStaked()).toString()).to.equal(
            "1"
        );
    });
    it("Claims some tokens(have to wait 3s)", async function () {
        const stakingWithOwner = stakingContract.connect(owner);
        const stakingWithUser = stakingContract.connect(user);
        const nftWithOwner = nftContract.connect(owner);
        const nftWithUser = nftContract.connect(user);
        const tokenWithOwner = tokenContract.connect(owner);
        const tokenWithUser = tokenContract.connect(user);
        await nftWithUser.setApprovalForAll(stakingContractAddress, true);
        const userAddress = await user.getAddress().then((addr) => addr.toString());
        await nftWithUser.mintNFT(userAddress, 1, hexproof, { value: ethers.utils.parseEther("0.03")});
        await stakingWithUser.stake([2]); 
        await stakingWithUser.claim([2], false)
        expect(( await tokenWithUser.balanceOf(userAddress)).toString()).to.equal(
            "1"
        );
    })
    it("Unstakes NFT", async function () {
        const stakingWithOwner = stakingContract.connect(owner);
        const nftWithOwner = nftContract.connect(owner);
        const tokenWithOwner = tokenContract.connect(owner);
        await stakingWithOwner.claim([1], true)
        expect(( await stakingWithOwner.getTotalStaked()).toString()).to.equal(
            "1"
        );
    });
    it("Checks if user owns NFT", async function () {
        const stakingWithOwner = stakingContract.connect(owner);
        const nftWithOwner = nftContract.connect(owner);
        const tokenWithOwner = tokenContract.connect(owner);
        let err = "";
        try{
            await stakingWithOwner.stake([2]); 
        } catch (e){
            err = e.message;
        }
        expect(err).to.equal(
            "VM Exception while processing transaction: reverted with reason string 'You don't have this NFT'"
        );
    });
})
