// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

interface IERC721StakingImplementation {
    struct StakerInfo {
        // Amount of staked NFTs
        uint104 amountStaked;

        // Last update info
        uint48 lastUpdateTimestamp;
        uint104 lastUpdatePhaseId;

        // Unclaimed rewards
        uint256 unclaimedRewards;
    }

    struct RewardPhase {
        // Reward rate
        uint256 rewardsPerSecond;

        // Phase start and end time
        uint128 startTimestamp;
        uint128 endTimestamp;
    }

    /**
     * @dev Revert if staking is currently paused.
     */
    error StakingPaused();

    /**
     * @dev Revert if there are no rewards to claim.
     */
    error NoRewardsToClaim();

    /**
     * @dev Revert if caller is not the owner of the staked NFT.
     */
    error NotStakedNftOwner();

    /**
     * @dev Revert if new reward rate is the same as the current one.
     */
    error SameRewardRate();

    /**
     * @notice Emit an event when NFT is staked.
     */
    event NftStaked(address staker, uint256 tokenId);

    /**
     * @notice Emit an event when NFT is unstaked.
     */
    event NftUnstaked(address staker, uint256 tokenId);

    /**
     * @notice Emit an event when a staker claims their rewards.
     */
    event RewardsClaimed(address staker, uint256 rewards);

    /**
     * @notice Emit an event when the reward rate is updated.
     */
    event RewardRateUpdated(uint256 newRewardRate);

    /**
     * @notice Stake an NFT with the given token ID.
     * @param tokenId Token ID of the NFT to stake.
     */
    function stakeNft(uint256 tokenId) external;

    /**
     * @notice Unstake an NFT with the given token ID.
     * @param tokenId Token ID of the NFT to unstake.
     */
    function unstakeNft(uint256 tokenId) external;

    /**
     * @notice Claim the staker's accumulated rewards.
     */
    function claimRewards() external;

    /**
     * @notice Update the reward rate to a new value.
     * @param rewardsPerSecond New reward rate per second for each NFT.
     */
    function updateRewardRate(uint256 rewardsPerSecond) external;

    /**
     * @notice Toggle the staking state between enabled and disabled.
     */
    function toggleStaking() external;

    /**
     * @notice Deposit ERC20 tokens into contract.
     * @param amount Amount of ERC20 tokens to be deposited.
     * @param sender Address of the sender depositing the tokens.
     */
    function depositERC20Tokens(uint256 amount, address sender) external;

    /**
     * @notice Withdraw ERC20 tokens from the contract.
     * @param amount Amount of ERC20 tokens to be withdrawn.
     * @param recipient Address of the recipient receiving the tokens.
     */
    function withdrawERC20Tokens(uint256 amount, address recipient) external;

    /**
     * @notice Get the unclaimed rewards for the specified staker address.
     * @param staker Address of the staker to get info for.
     * @return Amount of unclaimed rewards for the staker.
     */
    function getStakerUnclaimedRewards(address staker) external view returns (uint256);
}
