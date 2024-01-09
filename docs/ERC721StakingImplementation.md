# ERC721StakingImplementation









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

### initialize

```solidity
function initialize(address _nftContract, address _rewardToken, uint256 rewardsPerSecond) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _nftContract | address | undefined |
| _rewardToken | address | undefined |
| rewardsPerSecond | uint256 | undefined |

### isStakingEnabled

```solidity
function isStakingEnabled() external view returns (bool)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### multicall

```solidity
function multicall(bytes[] data) external nonpayable returns (bytes[] results)
```



*Receives and executes a batch of function calls on this contract.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| data | bytes[] | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| results | bytes[] | undefined |

### nextRewardPhaseId

```solidity
function nextRewardPhaseId() external view returns (uint88)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint88 | undefined |

### nftToken

```solidity
function nftToken() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### owner

```solidity
function owner() external view returns (address)
```



*Returns the address of the current owner.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### renounceOwnership

```solidity
function renounceOwnership() external nonpayable
```



*Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.*


### rewardPhases

```solidity
function rewardPhases(uint256 phaseId) external view returns (uint256 rewardsPerSecond, uint128 startTimestamp, uint128 endTimestamp)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| phaseId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| rewardsPerSecond | uint256 | undefined |
| startTimestamp | uint128 | undefined |
| endTimestamp | uint128 | undefined |

### rewardToken

```solidity
function rewardToken() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### stakeNft

```solidity
function stakeNft(uint256 tokenId) external nonpayable
```

Stake an NFT with the given token ID.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | Token ID of the NFT to stake. |

### stakedNftOwners

```solidity
function stakedNftOwners(uint256 tokenId) external view returns (address staker)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| staker | address | undefined |

### stakersInfo

```solidity
function stakersInfo(address staker) external view returns (uint104 amountStaked, uint48 lastUpdateTimestamp, uint104 lastUpdatePhaseId, uint256 unclaimedRewards)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| staker | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| amountStaked | uint104 | undefined |
| lastUpdateTimestamp | uint48 | undefined |
| lastUpdatePhaseId | uint104 | undefined |
| unclaimedRewards | uint256 | undefined |

### toggleStaking

```solidity
function toggleStaking() external nonpayable
```

Toggle the staking state between enabled and disabled.




### transferOwnership

```solidity
function transferOwnership(address newOwner) external nonpayable
```



*Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newOwner | address | undefined |

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

### Initialized

```solidity
event Initialized(uint8 version)
```



*Triggered when the contract has been initialized or reinitialized.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| version  | uint8 | undefined |

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

### OwnershipTransferred

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousOwner `indexed` | address | undefined |
| newOwner `indexed` | address | undefined |

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



