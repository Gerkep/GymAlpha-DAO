const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  const deployer = await ethers.getSigner();
  console.log("Deploying with account: ", deployer.address);
  console.log("Account balance: ", (await deployer.getBalance()).toString());

  // const DAO = await hre.ethers.getContractFactory("CentralDAO");
  // const dao = await DAO.deploy(1653660678, 3);
  const NFT = await hre.ethers.getContractFactory("GenesisNFT");
  const nft = await NFT.deploy();
  // const Token = await hre.ethers.getContractFactory("GymAlphaToken");
  // const token = await Token.deploy();
  await nft.deployed();
  // await token.deployed();
  const Staking = await hre.ethers.getContractFactory("AlphaStaking");
  const staking = await Staking.deploy(nft.address, "0x19AB832907c6B0898aB84a1CFd74B8c34817B339");

  // await dao.deployed();
  await staking.deployed();

  // console.log("DAO contract deployed to:", dao.address);
  console.log("NFT contract deployed to:", nft.address);
  // console.log("Token contract deployed to:", token.address);
  console.log("Staking contract deployed to:", staking.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
