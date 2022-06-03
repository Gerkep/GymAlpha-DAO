// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GenesisNFT is ERC721, Ownable {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  using Strings for uint256;
  uint256 public cost = 0.01 ether;
  uint256 public maxSupply = 5777;
  // uint256 public maxMintAmountPerTx = 1;
  uint256 public maxMintAmountPerAddress = 2;
  bool public paused = true;
  bool public whitelist = false;
  bytes32 public root = 0x0d0a1200bcb20302b68982d9e37e4968aff8830f258f26e823cdf77b65946edb;
  struct Stake {
      uint24 tokenId;
      uint48 timestamp;
      address owner;
  }
  uint256 public totalStaked;
  mapping(uint256 => Stake) public stakingVault;
  mapping(address => uint256) public userStake;
  IERC721 nft;
  IERC20 token;

  constructor() ERC721("GymAlphaGenesis", "GAG") {}

  function _baseURI() pure internal override returns (string memory) {
    return "https://gymalpha.mypinata.cloud/ipfs/QmQS98C3AFsKZ2AfT1zjU1gcAV7JMEvtYPBmp91KYphWkH/";
  }
  
  function tokenURI(uint256 tokenId) public view virtual override returns (string memory){
    require(_exists(tokenId), "Nonexistent token");
    string memory base = _baseURI();
    return string(abi.encodePacked(base, tokenId.toString(), ".json"));
  }
  function mintNFT(address recipient, uint8 amount, bytes32[] calldata _merkleProof) public payable{
    // require(amount > 0 && amount <= maxMintAmountPerTx, "Invalid mint amount!");
    require(_tokenIds.current() + amount <= maxSupply, "Max supply exceeded!");
    require(!paused, "The contract is paused!");
    require(msg.value >= cost * amount, "Insufficient funds!");
    require(balanceOf(msg.sender) + amount <= maxMintAmountPerAddress, "Max mint per address exceeded!");
    if(whitelist){
      bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
      require(MerkleProof.verify(_merkleProof, root, leaf), "You are not whitelisted");
    }
    for(uint i = 0; i < amount; i++){//probably will change this to single mint
      _tokenIds.increment();
      _mint(recipient, _tokenIds.current());
    }
 }
 function setPause(bool pause) public onlyOwner {
   paused = pause;
 }
  function setWhitelist(bool active) public onlyOwner {
   whitelist = active;
 }
  function setMaxPerAddr(uint256 amount) public onlyOwner{
   maxMintAmountPerAddress = amount;
 }
   function getMinted() public view returns(uint256 minted){
     return _tokenIds.current();
 }
}