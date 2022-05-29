// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AlphaStaking is Ownable, IERC721Receiver {
    uint256 public totalStaked;

    struct Stake {
        uint24 tokenId;
        uint48 timestamp;
        address owner;
    }
    mapping(uint256 => Stake) public vault;

    IERC721 nft;
    IERC20 token;

    event NFTStaked(address owner, uint256 tokenId, uint256 value);
    event NFTUnstaked(address owner, uint256 tokenId, uint256 value);
    event Claimed(address owner, uint256 amount);

    constructor(address nftAddress, address tokenAddress){
        nft = IERC721(nftAddress);
        token = IERC20(tokenAddress);
    }
    
    function stake(uint256[] calldata tokenIds) external {
        uint256 tokenId;
        for (uint i = 0; i<tokenIds.length; i++){
            tokenId = tokenIds[i];
            require(nft.ownerOf(tokenId) == msg.sender, "You don't have this NFT");
            nft.safeTransferFrom(msg.sender, address(this), tokenId);
            totalStaked += 1;
            emit NFTStaked(msg.sender, tokenId, block.timestamp);
            vault[tokenId] = Stake({
                tokenId: uint24(tokenId),
                timestamp: uint48(block.timestamp),
                owner: msg.sender
            });
        }
    }
    function unstakeNFT(address account, uint256[] calldata tokenIds) public {
        uint256 tokenId;
        for (uint i = 0; i<tokenIds.length; i++){
            tokenId = tokenIds[i];
            Stake memory staked = vault[tokenId];
            require(staked.owner == account, "You are not an owner");
            delete vault[tokenId];
            totalStaked -= 1;
            nft.safeTransferFrom(address(this), account, tokenId);
            emit NFTUnstaked(account, tokenId, block.timestamp);
        }
    }
    function claim(uint256[] calldata tokenIds, bool _unstake) public {
        uint256 tokenId;
        uint256 earned = 0;

        for (uint i = 0; i < tokenIds.length; i++){
            tokenId = tokenIds[i];
            Stake memory staked = vault[tokenId];
            require(staked.owner == msg.sender, "You are not an owner");
            uint256 stakedAt = staked.timestamp;
            earned += block.timestamp - stakedAt;
            vault[tokenId] = Stake({
                owner: msg.sender,
                tokenId: uint24(tokenId),
                timestamp: uint48(block.timestamp)
            });
        }
        if(earned > 0) {
            token.transferFrom(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266, msg.sender, earned);
        }
        if (_unstake){
            unstakeNFT(msg.sender, tokenIds);
        }
        emit Claimed(msg.sender, earned);
    }
    function earningInfo(uint256[] calldata tokenIds) external view returns(uint256 info){
        uint256 tokenId;
        uint earned = 0;
        for (uint i = 0; i < tokenIds.length; i++){
            tokenId = tokenIds[i];
            Stake memory staked = vault[tokenId];
            uint256 stakedAt = staked.timestamp;
            earned += block.timestamp - stakedAt;
        }
        return earned;
    }
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external override pure returns (bytes4) {
        // require(from == address(0x0), "Cannot send nfts to Vault directly");
        return IERC721Receiver.onERC721Received.selector;
    }
}