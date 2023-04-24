// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.18;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {MulticallUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/MulticallUpgradeable.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {AdministratedUpgradeable} from "./core/AdministratedUpgradeable.sol";

import {IERC721StakingImplementation} from "./interface/IERC721StakingImplementation.sol";

contract ERC721StakingImplementation is
    AdministratedUpgradeable,
    MulticallUpgradeable,
    IERC721StakingImplementation
{
    using SafeERC20 for IERC20;

    address public rewardToken;
    address public nftToken;
    bool public isStakingEnabled;
    uint88 public nextRewardPhaseId;

    mapping(address staker => StakerInfo stakerInfo) public stakersInfo;
    mapping(uint256 tokenId => address staker) public stakedNftOwners;
    mapping(uint256 phaseId => RewardPhase rewardPhase) public rewardPhases;

    function initialize(address _nftContract, address _rewardToken, uint256 rewardsPerSecond)
        external
        initializer
    {
        __Ownable_init();

        nftToken = _nftContract;
        rewardToken = _rewardToken;

        _createNewRewardPhase(rewardsPerSecond);
    }

    function stakeNft(uint256 tokenId) external {
        if (!isStakingEnabled) revert StakingPaused();

        if (stakersInfo[msg.sender].amountStaked > 0) {
            _updateStakerUnclaimedRewards();
        }

        _updateStakerTimestamps();

        _stakeNft(tokenId);

        emit NftStaked(msg.sender, tokenId);
    }

    function unstakeNft(uint256 tokenId) external {
        if (stakedNftOwners[tokenId] != msg.sender) revert NotStakedNftOwner();

        _updateStakerUnclaimedRewards();
        _updateStakerTimestamps();

        _unstakeNft(tokenId);

        emit NftUnstaked(msg.sender, tokenId);
    }

    function claimRewards() external {
        StakerInfo storage stakerInfo = stakersInfo[msg.sender];

        uint256 rewards = _calculateRewardsSinceLastUpdate(msg.sender) + stakerInfo.unclaimedRewards;

        if (rewards == 0) revert NoRewardsToClaim();

        stakerInfo.unclaimedRewards = 0;
        _updateStakerTimestamps();

        IERC20(rewardToken).transfer(msg.sender, rewards);

        emit RewardsClaimed(msg.sender, rewards);
    }

    function updateRewardRate(uint256 rewardsPerSecond) external onlyOwnerOrAdministrator {
        RewardPhase storage currentRewardPhase = rewardPhases[nextRewardPhaseId - 1];

        if (currentRewardPhase.rewardsPerSecond == rewardsPerSecond) {
            revert SameRewardRate();
        }

        currentRewardPhase.endTimestamp = uint128(block.timestamp);

        _createNewRewardPhase(rewardsPerSecond);

        emit RewardRateUpdated(rewardsPerSecond);
    }

    function toggleStaking() external onlyOwnerOrAdministrator {
        isStakingEnabled = !isStakingEnabled;
    }

    function depositERC20Tokens(uint256 amount, address sender) external onlyOwnerOrAdministrator {
        IERC20(rewardToken).transferFrom(sender, address(this), amount);
    }

    function withdrawERC20Tokens(uint256 amount, address recipient)
        external
        onlyOwnerOrAdministrator
    {
        IERC20(rewardToken).transfer(recipient, amount);
    }

    function getStakerUnclaimedRewards(address staker) external view returns (uint256) {
        return stakersInfo[staker].unclaimedRewards + _calculateRewardsSinceLastUpdate(staker);
    }

    function _stakeNft(uint256 tokenId) internal {
        stakersInfo[msg.sender].amountStaked += 1;
        stakedNftOwners[tokenId] = msg.sender;
        IERC721(nftToken).transferFrom(msg.sender, address(this), tokenId);
    }

    function _unstakeNft(uint256 tokenId) internal {
        stakersInfo[msg.sender].amountStaked -= 1;
        stakedNftOwners[tokenId] = address(0);
        IERC721(nftToken).transferFrom(address(this), msg.sender, tokenId);
    }

    function _updateStakerUnclaimedRewards() internal {
        uint256 rewards = _calculateRewardsSinceLastUpdate(msg.sender);
        stakersInfo[msg.sender].unclaimedRewards += rewards;
    }

    function _updateStakerTimestamps() internal {
        stakersInfo[msg.sender].lastUpdateTimestamp = uint48(block.timestamp);
        stakersInfo[msg.sender].lastUpdatePhaseId = nextRewardPhaseId - 1;
    }

    function _createNewRewardPhase(uint256 rewardsPerSecond) internal {
        rewardPhases[nextRewardPhaseId] = RewardPhase(rewardsPerSecond, uint128(block.timestamp), 0);
        nextRewardPhaseId += 1;
    }

    function _calculateRewardsSinceLastUpdate(address staker)
        internal
        view
        returns (uint256 totalRewards)
    {
        uint256 stakerPhaseId = stakersInfo[staker].lastUpdatePhaseId;

        for (uint256 i = stakerPhaseId; i < nextRewardPhaseId;) {
            RewardPhase memory phase = rewardPhases[i];

            uint256 elapsedTime = _getElapsedPhaseTime(staker, phase, i);

            totalRewards += _calculatePhaseRewards(staker, elapsedTime, phase);

            unchecked {
                ++i;
            }
        }
    }

    function _getElapsedPhaseTime(address staker, RewardPhase memory phase, uint256 phaseId)
        internal
        view
        returns (uint256 elapsedTime)
    {
        uint256 startTime = (phaseId != stakersInfo[staker].lastUpdatePhaseId)
            ? phase.startTimestamp
            : stakersInfo[staker].lastUpdateTimestamp;
        uint256 endTime = (phase.endTimestamp != 0) ? phase.endTimestamp : block.timestamp;

        elapsedTime = endTime - startTime;
    }

    function _calculatePhaseRewards(address staker, uint256 elapsedTime, RewardPhase memory phase)
        internal
        view
        returns (uint256 phaseRewards)
    {
        phaseRewards = elapsedTime * phase.rewardsPerSecond * stakersInfo[staker].amountStaked;
    }
}
