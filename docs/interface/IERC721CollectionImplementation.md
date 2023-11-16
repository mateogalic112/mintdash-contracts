# IERC721CollectionImplementation










## Events

### BaseURIUpdated

```solidity
event BaseURIUpdated(string baseURI)
```



*Emit an event when base URI of the collection is updated.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| baseURI  | string | undefined |

### RoyaltiesUpdated

```solidity
event RoyaltiesUpdated(address indexed receiver, uint96 indexed feeNumerator)
```



*Emit an event when royalties are updated.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| receiver `indexed` | address | undefined |
| feeNumerator `indexed` | uint96 | undefined |



## Errors

### CallerNotTokenOwner

```solidity
error CallerNotTokenOwner()
```







