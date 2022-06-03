// const { expect } = require("chai");
// const { ethers } = require("hardhat");

// describe("GenesisDAO", function () {
//   let centralDAO;
//   let owner;
//   let addr1;

//   before(async function () {
//     const centralFactory = await ethers.getContractFactory("CentralDAO");
//     centralDAO = await centralFactory.deploy(1652641416, 3);

//     const accounts = await ethers.getSigners();
//     owner = accounts[0];
//     addr1 = accounts[1];
//   });

//   it("owner can create a voting", async function () {
//     const contractWithSigner = centralDAO.connect(owner);
//     await contractWithSigner.createVoting("Voting1", "Description1");

//     expect((await contractWithSigner.numberOfVotings()).toString()).to.equal(
//       "1"
//     );
//   });

//   it("only owner can create a voting", async function () {
//     const contractWithSigner = centralDAO.connect(addr1);
//     let err = "";
//     try {
//       await contractWithSigner.createVoting("Voting1", "Description1");
//     } catch (e) {
//       err = e.message;
//     }
//     expect(err).to.equal(
//       "VM Exception while processing transaction: reverted with reason string 'Only owner can do it'"
//     );
//   });

//   it("user can vote", async function () {
//     const contractWithSigner = centralDAO.connect(addr1);
//     await contractWithSigner.vote(0);
//     expect((await contractWithSigner.getApprovalCount(0)).toString()).to.equal(
//       "1"
//     );
//   });

//   it("user can't vote twice", async function () {
//     const contractWithSigner = centralDAO.connect(addr1);
//     let err = "";
//     try {
//       await contractWithSigner.vote(0);
//     } catch (e) {
//       err = e.message;
//     }
//     expect(err).to.equal(
//       "VM Exception while processing transaction: reverted with reason string 'You can't vote twice!'"
//     );
//   });

//   it("min 50% to finalize voting", async function () {
//     const contractWithOwner = centralDAO.connect(owner);
//     const contractWithUser = centralDAO.connect(addr1);
//     await contractWithOwner.createVoting("Voting2", "Description2");
//     await contractWithUser.vote(1);
//     let err = "";
//     try {
//       await contractWithOwner.finalizeVoting(1);
//     } catch (e) {
//       err = e.message;
//     }
//     expect(err).to.equal(
//       "VM Exception while processing transaction: reverted with reason string 'Insufficient votes to finalise a voting'"
//     );
//   });

//   it("owner can finalize voting", async function () {
//     const contractWithOwner = centralDAO.connect(owner);
//     await contractWithOwner.vote(1);
//     await contractWithOwner.finalizeVoting(1);
//     expect((await contractWithOwner.checkIfComplete(1)).toString()).to.equal(
//       "true"
//     );
//   });

//   it("voting can't be complete to finalize", async function () {
//     const contractWithOwner = centralDAO.connect(owner);
//     const contractWithUser = centralDAO.connect(addr1);
//     await contractWithOwner.createVoting("Voting3", "Description3");
//     await contractWithUser.vote(2);
//     await contractWithOwner.vote(2);
//     await contractWithOwner.finalizeVoting(2);
//     let err = "";
//     try {
//       await contractWithOwner.finalizeVoting(2);
//     } catch (e) {
//       err = e.message;
//     }
//     expect(err).to.equal(
//       "VM Exception while processing transaction: reverted with reason string 'Voting can't be complete to finalize it'"
//     );
//   });

//   it("user can't update activity date", async function () {
//     const contractWithUser = centralDAO.connect(addr1);
//     let err = "";
//     try {
//       await contractWithUser.updateActivity(1652729235);
//     } catch (e) {
//       err = e.message;
//     }
//     expect(err).to.equal(
//       "VM Exception while processing transaction: reverted with reason string 'Only owner can do it'"
//     );
//   });
  
//   it("owner can update activity date", async function () {
//     const contractWithOwner = centralDAO.connect(owner);
//     await contractWithOwner.updateActivity(1652729255);
//     expect(
//       (await contractWithOwner.getLastPeriodActivity()).toString()).to.equal("2");
//   });
// });
