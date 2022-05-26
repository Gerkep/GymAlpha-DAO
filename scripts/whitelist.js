const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

const whitelistAddresses = [
  "0x350048f99A60FA48a85855C372658417Db5d6764",
  "0x8A6B77b37C4259624bB2C2490472F4dBf6934cd8",
];

const leafNodes = whitelistAddresses.map((addr) => keccak256(addr));
const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });

console.log(merkleTree.toString());
