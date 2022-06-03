// const { expect } = require("chai");
// const { ethers } = require("hardhat");
// const { MerkleTree } = require("merkletreejs");
// const keccak256 = require("keccak256");

// describe("NFT", function () {
//     let nft;
//     let owner;
//     let addr1;
//     let hexproof;

//     before(async function () {
//         const nftFactory = await ethers.getContractFactory("GenesisNFT");
//         nft = await nftFactory.deploy();

//         const accounts = await ethers.getSigners();
//         owner = accounts[0];
//         addr1 = accounts[1];

//         let whitelistAddresses = [
//             "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
//         ]
//         const leafNodes = whitelistAddresses.map(addr => keccak256(addr));
//         const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
//         const claimingAddress = leafNodes[0];
//         hexproof = merkleTree.getHexProof(claimingAddress);
//     });
    
//     it("disables pause and mints an NFT", async function () {
//         const contractWithSigner = nft.connect(owner);
//         const address = await owner.getAddress().then((addr) => addr.toString());
//         await contractWithSigner.setPause(false);
//         await contractWithSigner.mintNFT(address, 1, hexproof, { value: ethers.utils.parseEther("0.03")});
//         expect((await contractWithSigner.balanceOf(address)).toString()).to.equal(
//             "1"
//           );
//     })
//     it("sets correct uri", async function () {
//         const contractWithSigner = nft.connect(owner);
//         expect(( await contractWithSigner.tokenURI(1) ).toString()).to.equal(
//             "https://someuri/1.json"
//         );
       
//     })
//     it("checks mint amount", async function () {
//         const contractWithSigner = nft.connect(owner);
//         const address = await owner.getAddress().then((addr) => addr.toString());
//         let err = "";
//         try {
//             await contractWithSigner.mintNFT(address, 2, hexproof, { value: ethers.utils.parseEther("0.03")});
//         } catch (e) {
//             err = e.message;
//         }
//         expect(err).to.equal(
//             "VM Exception while processing transaction: reverted with reason string 'Max mint per address exceeded!'"
//         );

//     })
//     it("enable owner to pause", async function () {
//         const contractWithSigner = nft.connect(owner);
//         await contractWithSigner.setPause(true);
//         const address = await owner.getAddress().then((addr) => addr.toString());
//         let err = "";
//         try {
//             await contractWithSigner.mintNFT(address, 1, hexproof, { value: ethers.utils.parseEther("0.03")});
//         } catch (e) {
//             err = e.message;
//         }
//         expect(err).to.equal(
//             "VM Exception while processing transaction: reverted with reason string 'The contract is paused!'"
//         );
//     })
//     it("checks whitelist", async function () {
//         const contractWithOwner = nft.connect(owner);
//         const contractWithSigner = nft.connect(addr1);
//         await contractWithOwner.setPause(false);
//         await contractWithOwner.setWhitelist(true);
//         const address = await addr1.getAddress().then((addr) => addr.toString());
//         let err = "";
//         try {
//             await contractWithSigner.mintNFT(address, 1, hexproof, { value: ethers.utils.parseEther("0.03")});
//         } catch (e) {
//             err = e.message;
//         }
//         expect(err).to.equal(
//             "VM Exception while processing transaction: reverted with reason string 'You are not whitelisted'"
//         );
//     })
//     it("updates supply", async function () {
//         const contractWithSigner = nft.connect(owner);
//         await contractWithSigner.setWhitelist(false);
//         const address = await addr1.getAddress().then((addr) => addr.toString());
//         await contractWithSigner.mintNFT(address, 1, hexproof, { value: ethers.utils.parseEther("0.03")});
//         expect(( await contractWithSigner.tokenURI(2) ).toString()).to.equal(
//             "https://someuri/2.json"
//         );
//     })
    

// })