const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  const deployer = await ethers.getSigner();
  console.log("Deploying with account: ", deployer.address);
  console.log("Account balance: ", (await deployer.getBalance()).toString());

  const DAO = await hre.ethers.getContractFactory("CentralDAO");
  const dao = await DAO.deploy(1653660678, 3);

  await dao.deployed();

  console.log("DAO contract deployed to:", dao.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
