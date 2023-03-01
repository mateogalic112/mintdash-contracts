// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.18;

import { ERC721AUpgradeable } from "erc721a-upgradeable/contracts/ERC721AUpgradeable.sol";

import { AdministratedUpgradable } from "./AdministratedUpgradable.sol";
import { ERC721ContractMetadata } from "./ERC721ContractMetadata.sol";

import { IAirdrop} from "./interface/IAirdrop.sol";

abstract contract Airdrop is 
    AdministratedUpgradable, 
    ERC721ContractMetadata, 
    IAirdrop 
{
    function airdrop(address[] calldata to, uint64[] calldata quantity)
        external
        onlyOwnerOrAdministrator
    {
        address[] memory recipients = to;

        for (uint64 i = 0; i < recipients.length; ) {
            _mint(recipients[i], quantity[i]);

            unchecked {
                ++i;
            }
        }

        if (_totalMinted() > maxSupply) {
            revert MintQuantityExceedsMaxSupply();
        } 
    }
}