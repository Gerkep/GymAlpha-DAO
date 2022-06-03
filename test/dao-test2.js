const { expect } = require("chai");
const { ethers } = require("hardhat");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

describe("GenesisDAO", function () {
  let centralDAO;
  let tokenContract;
  let owner;
  let addr1;

  before(async function () {
    const centralFactory = await ethers.getContractFactory("CentralDAO");
    const nftFactory = await ethers.getContractFactory("GenesisNFT");
    const tokenFactory = await ethers.getContractFactory("GymAlphaToken");
    tokenContract = await tokenFactory.deploy();
    const nftContract = await nftFactory.deploy();
    const nftContractAddress = nftContract.address;
    const tokenContractAddress = tokenContract.address;
    centralDAO = await centralFactory.deploy(1652641416, 3, nftContractAddress, tokenContractAddress);
    
    const accounts = await ethers.getSigners();
    owner = accounts[0];
    addr1 = accounts[1];
    const ownerAddress = owner.getAddress().then((address) => address.toString());
    const userAddress = addr1.getAddress().then((address) => address.toString());
    let whitelistAddresses = [
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    ]
    const leafNodes = whitelistAddresses.map(addr => keccak256(addr));
    const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
    const claimingAddress = leafNodes[0];
    hexproof = merkleTree.getHexProof(claimingAddress);
    const nftWithOwner = nftContract.connect(owner);
    const nftWithUser = nftContract.connect(addr1)
    const tokenWithOwner = tokenContract.connect(owner);
    await tokenWithOwner.approve(centralDAO.address, 10000000)
    await nftWithOwner.setApprovalForAll(centralDAO.address, true);
    await nftWithUser.setApprovalForAll(centralDAO.address, true);
    await nftWithOwner.setPause(false);
    await nftWithOwner.mintNFT(ownerAddress, 2, hexproof, { value: ethers.utils.parseEther("0.02")})
    await nftWithUser.mintNFT(userAddress, 2, hexproof, { value: ethers.utils.parseEther("0.02")})
  });

  it("Stakes NFTs", async function () {
      const daoWithOwner = centralDAO.connect(owner);
      const daoWithUser = centralDAO.connect(addr1);
      await daoWithUser.stake([3, 4]);
      expect(( await daoWithOwner.totalStaked()).toString()).to.equal(
        "2"
    );
  });
  it("Untakes an NFT", async function () {
    const daoWithOwner = centralDAO.connect(owner);
    const daoWithUser = centralDAO.connect(addr1);
    const ownerAddress = await owner.getAddress().then((address) => address.toString());
    const userAddress = addr1.getAddress().then((address) => address.toString());
    await daoWithUser.unstakeNFT(userAddress, [3]);
    expect(( await daoWithOwner.totalStaked()).toString()).to.equal(
      "1"
  );
  });
  it("Creates staking ranks", async function () {
    const daoWithOwner = centralDAO.connect(owner);
    await daoWithOwner.setRanks([100, 200, 300], [1, 2, 3]);
  });
  it("Creates a voting", async function () {
    const daoWithOwner = centralDAO.connect(owner);
    await daoWithOwner.createVoting("Voting1", "Description1", 200)
    expect(( await daoWithOwner.numberOfVotings()).toString()).to.equal(
      "1"
  );
  });
  it("Approves voting", async function () {
    const daoWithOwner = centralDAO.connect(owner);
    const daoWithUser = centralDAO.connect(addr1);
    await daoWithUser.vote(0, true);
    expect(( await daoWithOwner.getApprovalCount(0)).toString()).to.equal(
      "1"
  );
  });
  it("Counts rewards", async function () {
    const daoWithOwner = centralDAO.connect(owner);
    const daoWithUser = centralDAO.connect(addr1);
    const ownerAddress = await owner.getAddress().then((address) => address.toString());
    const userAddress = addr1.getAddress().then((address) => address.toString());
    expect(( await daoWithUser.userBalance(userAddress)).toString()).to.equal(
      "200"
  );
  });
  it("Counts user votings", async function () {
    const daoWithOwner = centralDAO.connect(owner);
    const daoWithUser = centralDAO.connect(addr1);
    const ownerAddress = await owner.getAddress().then((address) => address.toString());
    const userAddress = addr1.getAddress().then((address) => address.toString());
    expect(( await daoWithOwner.userVotings(userAddress)).toString()).to.equal(
      "1"
  );
  });
  it("Enables user to claim rewards", async function () {
    const daoWithOwner = centralDAO.connect(owner);
    const tokenWithOwner = tokenContract.connect(owner);
    const daoWithUser = centralDAO.connect(addr1);
    const userAddress = addr1.getAddress().then((address) => address.toString());
    await daoWithUser.claim();
    expect(( await tokenWithOwner.balanceOf(userAddress)).toString()).to.equal(
      "200"
  );
  });
});
