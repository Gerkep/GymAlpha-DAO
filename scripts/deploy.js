const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  const deployer = await ethers.getSigner();
  console.log("Deploying with account: ", deployer.address);
  console.log("Account balance: ", (await deployer.getBalance()).toString());

  const NFT = await hre.ethers.getContractFactory("GenesisNFT");
  const nft = await NFT.deploy();

  await nft.deployed();

  console.log("NFT contract deployed to:", nft.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
