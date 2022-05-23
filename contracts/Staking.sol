// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./CentralNFT.sol";
import "./GymAlphaToken.sol";

contract AlphaStaking is Ownable, IERC721Receiver {
    uint256 public totalStaked;

    struct Stake {
        uint24 tokenId;
        uint48 timestamp;
        address owner;
    }
    mapping(uint256 => Stake) public vault;

    GymAlphaGenesis nft;
    GAToken token;

    event NFTStaked(address owner, uint256 tokenId, uint256 value);
    event NFTUnstaked(address owner, uint256 tokenId, uint256 value);
    event Claimed(address owner, uint256 amount);

    constructor(GymAlphaGenesis _nft, GAToken _token){
        nft = _nft;
        token = _token;
    }
    

    function stake(uint256[] calldata tokenIds) external {
        uint256 tokenId;
        for (uint i = 0; i<tokenIds.length; i++){
            tokenId = tokenIds[i];
            require(nft.ownerOf(tokenId) == msg.sender, "You don't have this NFT");
            require(vault[tokenId].tokenId == 0, "Already staked");
            totalStaked += 1;
            nft.transferFrom(msg.sender, address(this), tokenId);
            emit NFTStaked(msg.sender, tokenId, block.timestamp);
            vault[tokenId] = Stake({
                tokenId: uint24(tokenId),
                timestamp: uint48(block.timestamp),
                owner: msg.sender
            });
        }
    }
    function _unstakeNFT(address account, uint256[] calldata tokenIds) internal {
        uint256 tokenId;
        for (uint i = 0; i<tokenIds.length; i++){
            tokenId = tokenIds[i];
            Stake memory staked = vault[tokenId];
            require(staked.owner == account, "You are not an owner");
            delete vault[tokenId];
            totalStaked -= 1;
            nft.transferFrom(address(this), account, tokenId);
            emit NFTUnstaked(account, tokenId, block.timestamp);
        }
    }
    function claim(uint256[] calldata tokenIds, bool _unstake) internal {
        uint256 tokenId;
        uint256 earned = 0;

        for (uint i = 0; i < tokenIds.length; i++){
            tokenId = tokenIds[i];
            Stake memory staked = vault[tokenId];
            require(staked.owner == msg.sender, "You are not an owner");
            uint256 stakedAt = staked.timestamp;
            earned += 1000 ether * (block.timestamp - stakedAt) / 1 days;
            vault[tokenId] = Stake({
                owner: msg.sender,
                tokenId: uint24(tokenId),
                timestamp: uint48(block.timestamp)
            });
        }
        if(earned > 0) {
            earned = earned / 1000;
            token.issueToken(msg.sender, earned);
        }
        if (_unstake){
            _unstakeNFT(msg.sender, tokenIds);
        }
        emit Claimed(msg.sender, earned);
    }
    function earningInfo(uint256[] calldata tokenIds) external view returns(uint256[1] memory info){
        uint256 tokenId;
        uint earned = 0;
        Stake memory staked = vault[tokenId];
        uint256 stakedAt = staked.timestamp;
        earned += 1000 ether * (block.timestamp - stakedAt) / 1 days;
        return [earned];
    }
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external override pure returns (bytes4) {
        require(from == address(0x0), "Cannot send nfts to Vault directly");
        return IERC721Receiver.onERC721Received.selector;
    }
}