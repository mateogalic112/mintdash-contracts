# PaymentSplitterImplementation









## Methods

### PERCENTAGE_DENOMINATOR

```solidity
function PERCENTAGE_DENOMINATOR() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### calculateReleasableErc20

```solidity
function calculateReleasableErc20(contract IERC20 token, address recipient) external view returns (uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token | contract IERC20 | undefined |
| recipient | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### calculateReleasableEth

```solidity
function calculateReleasableEth(address recipient) external view returns (uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| recipient | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### getRecipients

```solidity
function getRecipients() external view returns (address[])
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address[] | undefined |

### getSplitConfiguration

```solidity
function getSplitConfiguration() external view returns (address[], uint256[])
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address[] | undefined |
| _1 | uint256[] | undefined |

### initialize

```solidity
function initialize(string name_, address[] recipients_, uint256[] percentages_) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| name_ | string | undefined |
| recipients_ | address[] | undefined |
| percentages_ | uint256[] | undefined |

### name

```solidity
function name() external view returns (string)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### percentages

```solidity
function percentages(address recipient) external view returns (uint256 percentage)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| recipient | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| percentage | uint256 | undefined |

### releaseErc20

```solidity
function releaseErc20(contract IERC20 token, address recipient) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token | contract IERC20 | undefined |
| recipient | address | undefined |

### releaseErc20ToAll

```solidity
function releaseErc20ToAll(contract IERC20 token) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token | contract IERC20 | undefined |

### releaseEth

```solidity
function releaseEth(address recipient) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| recipient | address | undefined |

### releaseEthToAll

```solidity
function releaseEthToAll() external nonpayable
```








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



## Errors

### DuplicateRecipient

```solidity
error DuplicateRecipient()
```






### EmptyOrMismatchedArrays

```solidity
error EmptyOrMismatchedArrays()
```






### InvalidPercentageAmount

```solidity
error InvalidPercentageAmount()
```






### InvalidRecipient

```solidity
error InvalidRecipient()
```






### NoFundsToRelease

```solidity
error NoFundsToRelease()
```






### TransferFailed

```solidity
error TransferFailed()
```







