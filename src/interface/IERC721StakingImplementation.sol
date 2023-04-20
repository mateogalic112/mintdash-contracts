// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface IERC721StakingImplementation {
    struct StakerInfo {
        uint256 amountStaked;
        uint256 lastUpdateTimestamp;
        uint256 unclaimedRewards;
        uint256 lastUpdatePhaseId;
    }

    struct RewardPhase {
        uint256 rewardsPerSecond;
        uint256 startTimestamp;
        uint256 endTimestamp;
    }

    error StakingPaused();
    error NoRewardsToClaim();
    error NotStakedNftOwner();
    error SameRewardRate();

    event NftStaked(address staker, uint256 tokenId);
    event NftUnstaked(address staker, uint256 tokenId);
    event RewardsClaimed(address staker, uint256 rewards);
    event RewardRateUpdated(uint256 newRewardRate);

    function stakeNft(uint256 tokenId) external;
    function unstakeNft(uint256 tokenId) external;
    function claimRewards() external;
    function updateRewardRate(uint256 rewardsPerSecond) external;
    function toggleStaking() external;
    function depositERC20Tokens(uint256 amount, address sender) external;
    function withdrawERC20Tokens(uint256 amount, address recipient) external;
    function getStakerUnclaimedRewards(address staker) external view returns (uint256);
}
