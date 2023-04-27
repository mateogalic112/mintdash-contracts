# IERC721StakingImplementation









## Methods

### claimRewards

```solidity
function claimRewards() external nonpayable
```

Claim the staker&#39;s accumulated rewards.




### depositERC20Tokens

```solidity
function depositERC20Tokens(uint256 amount, address sender) external nonpayable
```

Deposit ERC20 tokens into contract.



#### Parameters

| Name | Type | Description |
|---|---|---|
| amount | uint256 | Amount of ERC20 tokens to be deposited. |
| sender | address | Address of the sender depositing the tokens. |

### getStakerUnclaimedRewards

```solidity
function getStakerUnclaimedRewards(address staker) external view returns (uint256)
```

Get the unclaimed rewards for the specified staker address.



#### Parameters

| Name | Type | Description |
|---|---|---|
| staker | address | Address of the staker to get info for. |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | Amount of unclaimed rewards for the staker. |

### stakeNft

```solidity
function stakeNft(uint256 tokenId) external nonpayable
```

Stake an NFT with the given token ID.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | Token ID of the NFT to stake. |

### toggleStaking

```solidity
function toggleStaking() external nonpayable
```

Toggle the staking state between enabled and disabled.




### unstakeNft

```solidity
function unstakeNft(uint256 tokenId) external nonpayable
```

Unstake an NFT with the given token ID.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | Token ID of the NFT to unstake. |

### updateRewardRate

```solidity
function updateRewardRate(uint256 rewardsPerSecond) external nonpayable
```

Update the reward rate to a new value.



#### Parameters

| Name | Type | Description |
|---|---|---|
| rewardsPerSecond | uint256 | New reward rate per second for each NFT. |

### withdrawERC20Tokens

```solidity
function withdrawERC20Tokens(uint256 amount, address recipient) external nonpayable
```

Withdraw ERC20 tokens from the contract.



#### Parameters

| Name | Type | Description |
|---|---|---|
| amount | uint256 | Amount of ERC20 tokens to be withdrawn. |
| recipient | address | Address of the recipient receiving the tokens. |



## Events

### NftStaked

```solidity
event NftStaked(address staker, uint256 tokenId)
```

Emit an event when NFT is staked.



#### Parameters

| Name | Type | Description |
|---|---|---|
| staker  | address | undefined |
| tokenId  | uint256 | undefined |

### NftUnstaked

```solidity
event NftUnstaked(address staker, uint256 tokenId)
```

Emit an event when NFT is unstaked.



#### Parameters

| Name | Type | Description |
|---|---|---|
| staker  | address | undefined |
| tokenId  | uint256 | undefined |

### RewardRateUpdated

```solidity
event RewardRateUpdated(uint256 newRewardRate)
```

Emit an event when the reward rate is updated.



#### Parameters

| Name | Type | Description |
|---|---|---|
| newRewardRate  | uint256 | undefined |

### RewardsClaimed

```solidity
event RewardsClaimed(address staker, uint256 rewards)
```

Emit an event when a staker claims their rewards.



#### Parameters

| Name | Type | Description |
|---|---|---|
| staker  | address | undefined |
| rewards  | uint256 | undefined |



## Errors

### NoRewardsToClaim

```solidity
error NoRewardsToClaim()
```



*Revert if there are no rewards to claim.*


### NotStakedNftOwner

```solidity
error NotStakedNftOwner()
```



*Revert if caller is not the owner of the staked NFT.*


### SameRewardRate

```solidity
error SameRewardRate()
```



*Revert if new reward rate is the same as the current one.*


### StakingPaused

```solidity
error StakingPaused()
```



*Revert if staking is currently paused.*



