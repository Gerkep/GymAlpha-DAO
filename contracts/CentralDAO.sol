// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CentralDAO is Ownable, IERC721Receiver{

    struct Voting{
        string header;
        string description;
        uint approvalCount;
        uint denialCount;
        uint rewardValue;
        bool complete;
        mapping(address => bool) approvals;
    }
    address public manager;
    mapping(address => uint) public userTimestamp;
    uint public currentPeriodActivity;
    uint public lastPeriodActivity;
    uint public activityDate;
    uint public numberOfVotings;
    mapping (uint256 => Voting) public votings;
    mapping(address => uint256) public userVotings;

    struct Stake {
        uint24 tokenId;
        uint48 timestamp;
        address owner;
    }
    uint256 public totalStaked;
    mapping(uint256 => Stake) public stakingVault;
    mapping(address => uint256) public userStake;
    uint[] public stakingRanks;
    uint[] public stakingMultipliers;
    mapping(address => uint256) public userBalance;
    IERC721 nft;
    IERC20 token;

    event NFTStaked(address owner, uint256 tokenId, uint256 value);
    event NFTUnstaked(address owner, uint256 tokenId, uint256 value);
    event Claimed(address owner, uint256 amount);

    constructor(uint timestamp, uint initialActivity, address nftAddress, address tokenAddress){ //epoch unix timestamp
        manager = msg.sender;
        activityDate = timestamp;
        lastPeriodActivity = initialActivity;
        nft = IERC721(nftAddress);
        token = IERC20(tokenAddress);
    }
    
    modifier restricted() {
        require(msg.sender == manager, "Only owner can do it");
        _;
    }
    function vote(uint index, bool approve) public {
        Voting storage voting = votings[index];

        require(!voting.approvals[msg.sender], "You can't vote twice!");
        require(bytes(voting.header).length != 0, "Voting doesn't exist.");
        voting.approvals[msg.sender] = true;
        if(approve){  
            voting.approvalCount++;
            userVotings[msg.sender]++;
        }
        if(!approve){
            voting.denialCount++;
            userVotings[msg.sender]++;
        }
        if(activityDate >= userTimestamp[msg.sender]){
            currentPeriodActivity = currentPeriodActivity + 1;
            userTimestamp[msg.sender] = block.timestamp;
        }
        for (uint i = 1; i < stakingRanks.length; i++){
            if(userVotings[msg.sender] < stakingRanks[i]){
                userBalance[msg.sender] += stakingMultipliers[i-1] * voting.rewardValue * userStake[msg.sender];
                break;
            }
        }
    }

    function updateActivity(uint newTimestamp) public restricted {
        require(newTimestamp <= block.timestamp, "You can't set date for the future");
        activityDate = newTimestamp;
        lastPeriodActivity = currentPeriodActivity;
        currentPeriodActivity = 0;
    }

    function createVoting(string memory header, string memory description, uint256 votingValue) public restricted {
        Voting storage voting = votings[numberOfVotings++];
        voting.header = header;
        voting.description = description;
        voting.approvalCount = 0;
        voting.complete = false;
        voting.rewardValue = votingValue;
    }

    function finalizeVoting(uint index) public restricted {
        Voting storage voting = votings[index];
        require(!voting.complete, "Voting can't be complete to finalize it");
        require(voting.approvalCount < voting.denialCount, "Too many denials");
        require(voting.approvalCount > (lastPeriodActivity / 2), "Insufficient votes to finalise a voting");
        voting.complete = true;
    }

    function checkIfComplete(uint index) public view returns(bool){
        Voting storage voting = votings[index];
        return voting.complete;
    }
    function getApprovalCount(uint index) public view returns(uint){
        Voting storage voting = votings[index];
        return voting.approvalCount;
    }
    function getDenialCount(uint index) public view returns(uint){
        Voting storage voting = votings[index];
        return voting.denialCount;
    }
    function getLastPeriodActivity() public view returns(uint){
        return lastPeriodActivity;
    }
    function getUserBalance() public view returns(uint){
        return userBalance[msg.sender];
    }
    function setRanks(uint256[] calldata ranks, uint256[] calldata multipliers) public restricted{
        delete stakingRanks;
        delete stakingMultipliers;
        stakingRanks = ranks;
        stakingMultipliers = multipliers;
    }
    function stake(uint256[] calldata tokenIds) external {
        uint256 tokenId;
        for (uint i = 0; i < tokenIds.length; i++){
            tokenId = tokenIds[i];
            require(nft.ownerOf(tokenId) == msg.sender, "You don't have this NFT");
            nft.safeTransferFrom(msg.sender, address(this), tokenId);
            totalStaked += 1;
            emit NFTStaked(msg.sender, tokenId, block.timestamp);
            userStake[msg.sender]++;
            stakingVault[tokenId] = Stake({
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
            Stake memory staked = stakingVault[tokenId];
            require(staked.owner == account, "You are not an owner");
            delete stakingVault[tokenId];
            totalStaked -= 1;
            userStake[msg.sender]--;
            nft.safeTransferFrom(address(this), account, tokenId);
            emit NFTUnstaked(account, tokenId, block.timestamp);
        }
    }
    function claim() public {
        uint earned = userBalance[msg.sender];
        if(earned > 0) {
            token.transferFrom(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266, msg.sender, earned);
            userBalance[msg.sender] = 0;
        }
        emit Claimed(msg.sender, earned);
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