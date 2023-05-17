import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { getMerkleTreeRoot } from "../helpers/merkleTree";
import { ZERO_ADDRESS, ZERO_BYTES32 } from "../helpers/consts";

describe("ERC721DropImplementation", function () {
    let collection: Contract;

    let owner: SignerWithAddress,
        allowlistUser2: SignerWithAddress,
        randomUser: SignerWithAddress,
        allowedSigner: SignerWithAddress,
        admin: SignerWithAddress;

    const initialMaxSupply = 4000;
    const initialBaseURI =
        "ipfs://QmSBxebqcuP8GyUxaFVEDqpsmbcjNMxg5y3i1UAHLkhHg5/";

    const initialRoyaltiesRecipient =
        "0xE5F135b20F496189FB6C915bABc53e0A70Ff6A1f";
    const initialRoyaltiesFee = 1000;

    const activatePublicStageAndMaxMint = async () => {
        // Setup public mint stage
        const currentTimestamp = await time.latest();
        await collection.updatePublicMintStage({
            mintPrice: ethers.utils.parseUnits("0.1", "ether"),
            startTime: currentTimestamp, // start right away
            endTime: currentTimestamp + 86400, // last 24 hours
            mintLimitPerWallet: 3,
        });
        await time.increase(3600);

        // Mint few tokens
        await collection.mintPublic(owner.address, 3, {
            value: ethers.utils.parseUnits("0.3", "ether"),
        });
    };

    beforeEach(async function () {
        [owner, allowlistUser2, randomUser, allowedSigner, admin] =
            await ethers.getSigners();

        const ERC721DropImplementation = await ethers.getContractFactory(
            "ERC721DropImplementation",
        );
        collection = await ERC721DropImplementation.deploy();
        await collection.deployed();

        // Initialize
        await collection.initialize(
            "Blank Studio Collection",
            "BSC",
            admin.address,
        );

        // Configure royalties
        await collection.updateRoyalties(
            initialRoyaltiesRecipient,
            initialRoyaltiesFee,
        );

        // Configure base URI
        await collection.updateBaseURI(initialBaseURI);

        // Configure max supply
        await collection.updateMaxSupply(initialMaxSupply);
    });

    describe("getAmountMinted", () => {
        it("returns", async () => {
            // Check current state
            expect(await collection.getAmountMinted(owner.address)).to.eq(0);

            // Mint 3 NFTs
            await activatePublicStageAndMaxMint();

            // Check updated state
            expect(await collection.getAmountMinted(owner.address)).eq(3);
        });
    });

    describe("updatePublicMintStage", () => {
        it("updates", async () => {
            // Check current config
            const currentConfig = await collection.publicMintStage();
            expect(currentConfig.mintPrice).to.equal(0);
            expect(currentConfig.startTime).to.equal(0);
            expect(currentConfig.endTime).to.equal(0);
            expect(currentConfig.mintLimitPerWallet).to.equal(0);

            // Update config
            const newConfigData = {
                mintPrice: "100000000000000000", // 0.1 ETH
                startTime: 1676043287,
                endTime: 1686043287,
                mintLimitPerWallet: 5,
            };
            await collection.updatePublicMintStage(newConfigData);

            // Check updated config
            const updatedConfig = await collection.publicMintStage();
            expect(updatedConfig.mintPrice).to.equal(newConfigData.mintPrice);
            expect(updatedConfig.startTime).to.equal(newConfigData.startTime);
            expect(updatedConfig.endTime).to.equal(newConfigData.endTime);
            expect(updatedConfig.mintLimitPerWallet).to.equal(
                newConfigData.mintLimitPerWallet,
            );
        });

        it("reverts if caller is not contract owner or administrator", async () => {
            await expect(
                collection.connect(randomUser).updatePublicMintStage({
                    mintPrice: "100000000000000000", // 0.1 ETH
                    startTime: 1676043287,
                    endTime: 1686043287,
                    mintLimitPerWallet: 5,
                }),
            ).to.be.revertedWithCustomError(
                collection,
                "OnlyOwnerOrAdministrator",
            );
        });

        it("emits PublicMintStageUpdated", async () => {
            // Update config
            const newConfigData = {
                mintPrice: "100000000000000000", // 0.1 ETH
                startTime: 1676043287,
                endTime: 1686043287,
                mintLimitPerWallet: 5,
            };

            await expect(
                collection.updatePublicMintStage(newConfigData),
            ).to.emit(collection, "PublicMintStageUpdated");
        });
    });

    describe("updateAllowlistMintStage", () => {
        it("updates", async () => {
            // Check current config
            const stageId = 1;
            const currentConfig = await collection.allowlistMintStages(stageId);
            expect(currentConfig.mintPrice).to.equal(0);
            expect(currentConfig.startTime).to.equal(0);
            expect(currentConfig.endTime).to.equal(0);
            expect(currentConfig.mintLimitPerWallet).to.equal(0);
            expect(currentConfig.merkleRoot).to.equal(ZERO_BYTES32);

            // Update config
            const newConfigData = {
                mintPrice: "100000000000000000", // 0.1 ETH
                startTime: 1676043287, // 0.1 ETH
                endTime: 1686043287, // 0.1 ETH
                mintLimitPerWallet: 5,
                maxSupplyForStage: 4000,
                merkleRoot: `0x${getMerkleTreeRoot([owner.address])}`,
            };
            await collection.updateAllowlistMintStage(stageId, newConfigData);

            // Check updated config
            const updatedConfig = await collection.allowlistMintStages(stageId);
            expect(updatedConfig.mintPrice).to.equal(newConfigData.mintPrice);
            expect(updatedConfig.startTime).to.equal(newConfigData.startTime);
            expect(updatedConfig.endTime).to.equal(newConfigData.endTime);
            expect(updatedConfig.mintLimitPerWallet).to.equal(
                newConfigData.mintLimitPerWallet,
            );
            expect(updatedConfig.merkleRoot).to.equal(newConfigData.merkleRoot);
        });

        it("reverts if caller is not contract owner or administrator", async () => {
            await expect(
                collection.connect(randomUser).updateAllowlistMintStage(1, {
                    mintPrice: "100000000000000000", // 0.1 ETH
                    startTime: 1676043287, // 0.1 ETH
                    endTime: 1686043287, // 0.1 ETH
                    mintLimitPerWallet: 5,
                    maxSupplyForStage: 4000,
                    merkleRoot: `0x${getMerkleTreeRoot([owner.address])}`,
                }),
            ).to.be.revertedWithCustomError(
                collection,
                "OnlyOwnerOrAdministrator",
            );
        });

        it("emits AllowlistMintStageUpdated", async () => {
            // Update config
            const newConfigData = {
                mintPrice: "100000000000000000", // 0.1 ETH
                startTime: 1676043287, // 0.1 ETH
                endTime: 1686043287, // 0.1 ETH
                mintLimitPerWallet: 5,
                maxSupplyForStage: 4000,
                merkleRoot: `0x${getMerkleTreeRoot([owner.address])}`,
            };

            await expect(
                collection.updateAllowlistMintStage(1, newConfigData),
            ).to.emit(collection, "AllowlistMintStageUpdated");
        });
    });

    describe("updateTokenGatedMintStage", () => {
        it("updates", async () => {
            // Check current config
            const randomAddress = randomUser.address;
            const currentConfig = await collection.tokenGatedMintStages(
                randomAddress,
            );
            expect(currentConfig.mintPrice).to.equal(0);
            expect(currentConfig.startTime).to.equal(0);
            expect(currentConfig.endTime).to.equal(0);
            expect(currentConfig.mintLimitPerWallet).to.equal(0);

            // Update config
            const newConfigData = {
                mintPrice: "100000000000000000", // 0.1 ETH
                startTime: 1676043287, // 0.1 ETH
                endTime: 1686043287, // 0.1 ETH
                mintLimitPerWallet: 5,
                maxSupplyForStage: 4000,
            };
            await collection.updateTokenGatedMintStage(
                randomAddress,
                newConfigData,
            );

            // Check updated config
            const updatedConfig = await collection.tokenGatedMintStages(
                randomAddress,
            );
            expect(updatedConfig.mintPrice).to.equal(newConfigData.mintPrice);
            expect(updatedConfig.startTime).to.equal(newConfigData.startTime);
            expect(updatedConfig.endTime).to.equal(newConfigData.endTime);
            expect(updatedConfig.mintLimitPerWallet).to.equal(
                newConfigData.mintLimitPerWallet,
            );
        });

        it("reverts if caller is not contract owner or administrator", async () => {
            const randomAddress = randomUser.address;

            await expect(
                collection
                    .connect(randomUser)
                    .updateTokenGatedMintStage(randomAddress, {
                        mintPrice: "100000000000000000", // 0.1 ETH
                        startTime: 1676043287, // 0.1 ETH
                        endTime: 1686043287, // 0.1 ETH
                        mintLimitPerWallet: 5,
                        maxSupplyForStage: 4000,
                    }),
            ).to.be.revertedWithCustomError(
                collection,
                "OnlyOwnerOrAdministrator",
            );
        });

        it("emits TokenGatedMintStageUpdated", async () => {
            // Update config
            const randomAddress = randomUser.address;
            const newConfigData = {
                mintPrice: "100000000000000000", // 0.1 ETH
                startTime: 1676043287, // 0.1 ETH
                endTime: 1686043287, // 0.1 ETH
                mintLimitPerWallet: 5,
                maxSupplyForStage: 4000,
            };

            await expect(
                collection.updateTokenGatedMintStage(
                    randomAddress,
                    newConfigData,
                ),
            ).to.emit(collection, "TokenGatedMintStageUpdated");
        });
    });

    describe("updateMaxSupply", () => {
        it("updates", async () => {
            // Check current max supply
            expect(await collection.maxSupply()).to.eq(initialMaxSupply);

            // Update max supply
            const newMaxSupply = 10000;
            await collection.updateMaxSupply(newMaxSupply);

            // Check updated max supply
            expect(await collection.maxSupply()).to.eq(newMaxSupply);
        });

        it("reverts if caller is not contract owner or administrator", async () => {
            await expect(
                collection.connect(randomUser).updateMaxSupply(1500),
            ).to.be.revertedWithCustomError(
                collection,
                "OnlyOwnerOrAdministrator",
            );
        });

        it("reverts if max supply exceeds uint64", async () => {
            await expect(
                collection.updateMaxSupply("18446744073709551616"),
            ).to.be.revertedWithCustomError(
                collection,
                "CannotExceedMaxSupplyOfUint64",
            );
        });

        it("emits MaxSupplyUpdated", async () => {
            await expect(collection.updateMaxSupply(500))
                .to.be.emit(collection, "MaxSupplyUpdated")
                .withArgs(500);
        });
    });

    describe("updateConfiguration", () => {
        it("updates", async () => {
            const newConfig = {
                maxSupply: 1000,
                baseURI: "ipfs://hash/",
                royaltiesReceiver: randomUser.address,
                royaltiesFeeNumerator: 1500,
                payoutAddress: owner.address,
                publicMintStage: {
                    mintPrice: "100000000000000000",
                    startTime: 1676043287,
                    endTime: 1686043287,
                    mintLimitPerWallet: 5,
                },
                allowlistMintStageIds: [1, 2],
                allowlistMintStages: [
                    {
                        mintPrice: "100000000000000000",
                        startTime: 1676043287,
                        endTime: 1686043287,
                        mintLimitPerWallet: 5,
                        maxSupplyForStage: 400,
                        merkleRoot: `0x${getMerkleTreeRoot([owner.address])}`,
                    },
                    {
                        mintPrice: "200000000000000000",
                        startTime: 1676043286,
                        endTime: 1686043286,
                        mintLimitPerWallet: 2,
                        maxSupplyForStage: 100,
                        merkleRoot: `0x${getMerkleTreeRoot([
                            randomUser.address,
                        ])}`,
                    },
                ],
                nftContracts: [randomUser.address, owner.address],
                tokenGatedMintStages: [
                    {
                        mintPrice: "100000000000000000",
                        startTime: 1676043287,
                        endTime: 1686043287,
                        mintLimitPerWallet: 5,
                        maxSupplyForStage: 4000,
                    },
                    {
                        mintPrice: "200000000000000000",
                        startTime: 1676043286,
                        endTime: 1686043286,
                        mintLimitPerWallet: 2,
                        maxSupplyForStage: 1000,
                    },
                ],
            };

            // Update
            await collection.updateConfiguration(newConfig);

            // Check new state
            expect(await collection.maxSupply()).to.eq(newConfig.maxSupply);
            expect(await collection.baseURI()).to.eq(newConfig.baseURI);
            expect(await collection.payoutAddress()).to.eq(
                newConfig.payoutAddress,
            );

            const publicMintStage = await collection.publicMintStage();
            expect(publicMintStage.mintPrice).to.equal(
                newConfig.publicMintStage.mintPrice,
            );
            expect(publicMintStage.startTime).to.equal(
                newConfig.publicMintStage.startTime,
            );
            expect(publicMintStage.endTime).to.equal(
                newConfig.publicMintStage.endTime,
            );
            expect(publicMintStage.mintLimitPerWallet).to.equal(
                newConfig.publicMintStage.mintLimitPerWallet,
            );

            const allowlistStageConfig1 = await collection.allowlistMintStages(
                1,
            );
            expect(allowlistStageConfig1.mintPrice).to.equal(
                newConfig.allowlistMintStages[0].mintPrice,
            );
            expect(allowlistStageConfig1.startTime).to.equal(
                newConfig.allowlistMintStages[0].startTime,
            );
            expect(allowlistStageConfig1.endTime).to.equal(
                newConfig.allowlistMintStages[0].endTime,
            );
            expect(allowlistStageConfig1.mintLimitPerWallet).to.equal(
                newConfig.allowlistMintStages[0].mintLimitPerWallet,
            );
            expect(allowlistStageConfig1.merkleRoot).to.equal(
                newConfig.allowlistMintStages[0].merkleRoot,
            );

            const allowlistStageConfig2 = await collection.allowlistMintStages(
                2,
            );
            expect(allowlistStageConfig2.mintPrice).to.equal(
                newConfig.allowlistMintStages[1].mintPrice,
            );
            expect(allowlistStageConfig2.startTime).to.equal(
                newConfig.allowlistMintStages[1].startTime,
            );
            expect(allowlistStageConfig2.endTime).to.equal(
                newConfig.allowlistMintStages[1].endTime,
            );
            expect(allowlistStageConfig2.mintLimitPerWallet).to.equal(
                newConfig.allowlistMintStages[1].mintLimitPerWallet,
            );
            expect(allowlistStageConfig2.merkleRoot).to.equal(
                newConfig.allowlistMintStages[1].merkleRoot,
            );

            const tokenGatedStage1 = await collection.tokenGatedMintStages(
                randomUser.address,
            );
            expect(tokenGatedStage1.mintPrice).to.equal(
                newConfig.tokenGatedMintStages[0].mintPrice,
            );
            expect(tokenGatedStage1.startTime).to.equal(
                newConfig.tokenGatedMintStages[0].startTime,
            );
            expect(tokenGatedStage1.endTime).to.equal(
                newConfig.tokenGatedMintStages[0].endTime,
            );
            expect(tokenGatedStage1.mintLimitPerWallet).to.equal(
                newConfig.tokenGatedMintStages[0].mintLimitPerWallet,
            );

            const tokenGatedStage2 = await collection.tokenGatedMintStages(
                owner.address,
            );
            expect(tokenGatedStage2.mintPrice).to.equal(
                newConfig.tokenGatedMintStages[1].mintPrice,
            );
            expect(tokenGatedStage2.startTime).to.equal(
                newConfig.tokenGatedMintStages[1].startTime,
            );
            expect(tokenGatedStage2.endTime).to.equal(
                newConfig.tokenGatedMintStages[1].endTime,
            );
            expect(tokenGatedStage2.mintLimitPerWallet).to.equal(
                newConfig.tokenGatedMintStages[1].mintLimitPerWallet,
            );
        });
    });

    describe("updateOperatorFilterer", () => {
        it("updates", async () => {
            // Check current state
            expect(await collection.operatorFiltererEnabled()).to.eq(false);

            // Enable operator filterer
            await collection.updateOperatorFilterer(true);

            // Check updated max supply
            expect(await collection.operatorFiltererEnabled()).to.eq(true);
        });

        it("reverts if caller is not contract owner or administrator", async () => {
            await expect(
                collection.connect(randomUser).updateOperatorFilterer(true),
            ).to.be.revertedWithCustomError(
                collection,
                "OnlyOwnerOrAdministrator",
            );
        });

        it("emits OperatorFiltererEnabledUpdated", async () => {
            await expect(collection.updateOperatorFilterer(true))
                .to.emit(collection, "OperatorFiltererEnabledUpdated")
                .withArgs(true);
        });
    });

    describe("updateBaseURI", () => {
        it("updates", async () => {
            // Check current base URI
            expect(await collection.baseURI()).to.eq(initialBaseURI);

            // Update base URI
            const newBaseURI =
                "ipfs://QmSBxebqcuP8GyUxaFVEDqpsmbcjNMxg5y3i1UAHLNEW/";
            await collection.updateBaseURI(newBaseURI);

            // Check updated base URI
            expect(await collection.baseURI()).to.eq(newBaseURI);
        });

        it("reverts if caller is not contract owner or administrator", async () => {
            await expect(
                collection
                    .connect(randomUser)
                    .updateBaseURI(
                        "ipfs://QmSBxebqcuP8GyUxaFVEDqpsmbcjNMxg5y3i1UAHLNEW/",
                    ),
            ).to.be.revertedWithCustomError(
                collection,
                "OnlyOwnerOrAdministrator",
            );
        });

        it("emits BatchMetadataUpdate if tokens exist", async () => {
            // Mint tokens
            await activatePublicStageAndMaxMint();

            await expect(
                collection.updateBaseURI(
                    "ipfs://QmSBxebqcuP8GyUxaFVEDqpsmbcjNMxg5y3i1UAHLNEW/",
                ),
            )
                .to.emit(collection, "BatchMetadataUpdate")
                .withArgs(1, 3);
        });

        it("emits BaseURIUpdated", async () => {
            // Update base URI
            const newBaseURI =
                "ipfs://QmSBxebqcuP8GyUxaFVEDqpsmbcjNMxg5y3i1UAHLNEW/";

            await expect(collection.updateBaseURI(newBaseURI))
                .to.emit(collection, "BaseURIUpdated")
                .withArgs(newBaseURI);
        });
    });

    describe("updateRoyalties", () => {
        it("updates", async () => {
            // Check royalty info for token with ID 1
            const [receiver, amount] = await collection.royaltyInfo(
                1,
                ethers.utils.parseUnits("1", "ether"),
            );

            expect(receiver).to.eq(initialRoyaltiesRecipient);
            expect(amount).to.eq(ethers.utils.parseUnits("0.1", "ether"));

            // Update base URI
            const newReceiver = randomUser.address;
            const newFeeNumerator = 5000;
            await collection.updateRoyalties(newReceiver, newFeeNumerator);

            // Check new royalty info for token with ID 1
            const [updatedReceiver, updatedAmount] =
                await collection.royaltyInfo(
                    1,
                    ethers.utils.parseUnits("1", "ether"),
                );

            expect(updatedReceiver).to.eq(newReceiver);
            expect(updatedAmount).to.eq(
                ethers.utils.parseUnits("0.5", "ether"),
            );
        });

        it("reverts if caller is not contract owner or administrator", async () => {
            await expect(
                collection
                    .connect(randomUser)
                    .updateRoyalties(randomUser.address, 1000),
            ).to.be.revertedWithCustomError(
                collection,
                "OnlyOwnerOrAdministrator",
            );
        });
    });

    describe("updateProvenanceHash", () => {
        it("updates", async () => {
            // Check provenance hash
            expect(await collection.provenanceHash()).to.eq(ZERO_BYTES32);

            // Update provenance hash
            const newProvenanceHash = ethers.utils.id("image data");
            await collection.updateProvenanceHash(newProvenanceHash);

            // Check updated provenance hash
            expect(await collection.provenanceHash()).to.eq(newProvenanceHash);
        });

        it("reverts if caller is not contract owner or administrator", async () => {
            await expect(
                collection
                    .connect(randomUser)
                    .updateProvenanceHash(ethers.utils.id("image data")),
            ).to.be.revertedWithCustomError(
                collection,
                "OnlyOwnerOrAdministrator",
            );
        });
    });

    describe("updatePayoutAddress", () => {
        it("updates", async () => {
            // Check payout address
            expect(await collection.payoutAddress()).to.eq(ZERO_ADDRESS);

            // Update payout address
            await collection.updatePayoutAddress(owner.address);

            // Check updated provenance hash
            expect(await collection.payoutAddress()).to.eq(owner.address);
        });

        it("reverts if caller is not contract owner or administrator", async () => {
            await expect(
                collection
                    .connect(randomUser)
                    .updatePayoutAddress(randomUser.address),
            ).to.be.revertedWithCustomError(
                collection,
                "OnlyOwnerOrAdministrator",
            );
        });

        it("reverts if payout address is zero address", async () => {
            await expect(
                collection.updatePayoutAddress(ZERO_ADDRESS),
            ).to.be.revertedWithCustomError(
                collection,
                "PayoutAddressCannotBeZeroAddress",
            );
        });
    });

    describe("updatePlatformFees", () => {
        it("updates", async () => {
            // Check platform fees address
            expect(await collection.platformFeesAddress()).to.eq(
                "0xeA6b5147C353904D5faFA801422D268772F09512",
            );

            // Check platform fees
            expect(await collection.platformFeesNumerator()).to.eq(500);

            // Update payout address
            await collection
                .connect(admin)
                .updatePlatformFees(owner.address, 400);

            // Check updated state
            expect(await collection.platformFeesAddress()).to.eq(owner.address);

            // Check platform fees
            expect(await collection.platformFeesNumerator()).to.eq(400);
        });

        it("reverts if caller is not contract administrator", async () => {
            await expect(
                collection
                    .connect(randomUser)
                    .updatePlatformFees(owner.address, 400),
            ).to.be.revertedWithCustomError(collection, "OnlyAdministrator");
        });

        it("reverts if payout address is zero address", async () => {
            await expect(
                collection.connect(admin).updatePlatformFees(ZERO_ADDRESS, 400),
            ).to.be.revertedWithCustomError(
                collection,
                "PlatformFeesAddressCannotBeZeroAddress",
            );
        });
    });

    describe("updatePayer", () => {
        it("updates", async () => {
            // Check if payer is allowed
            expect(await collection.allowedPayers(randomUser.address)).to.eq(
                false,
            );

            // Update payer
            await collection.updatePayer(randomUser.address, true);

            // Check updated payer
            expect(await collection.allowedPayers(randomUser.address)).to.eq(
                true,
            );
        });

        it("reverts if caller is not contract owner or administrator", async () => {
            await expect(
                collection
                    .connect(randomUser)
                    .updatePayer(randomUser.address, true),
            ).to.be.revertedWithCustomError(
                collection,
                "OnlyOwnerOrAdministrator",
            );
        });
    });

    describe("withdrawAllFunds", () => {
        it("withdraws", async () => {
            // Fund contract
            await activatePublicStageAndMaxMint();

            // Setup payout address
            await collection.updatePayoutAddress(allowlistUser2.address);

            // Withdraw and check balance change
            await expect(() =>
                collection.withdrawAllFunds(),
            ).to.changeEtherBalance(
                allowlistUser2,
                ethers.utils.parseUnits("0.285", "ether"),
            );
        });

        it("reverts if caller is not contract owner or administrator", async () => {
            await expect(
                collection.connect(randomUser).withdrawAllFunds(),
            ).to.be.revertedWithCustomError(
                collection,
                "OnlyOwnerOrAdministrator",
            );
        });

        it("reverts if contract balance is zero", async () => {
            await expect(
                collection.withdrawAllFunds(),
            ).to.be.revertedWithCustomError(collection, "NothingToWithdraw");
        });

        it("reverts if payout address is zero address", async () => {
            // Fund contract
            await activatePublicStageAndMaxMint();

            await expect(
                collection.withdrawAllFunds(),
            ).to.be.revertedWithCustomError(collection, "InvalidPayoutAddress");
        });
    });

    describe("supportsInterface", () => {
        it("supports ERC721", async () => {
            expect(await collection.supportsInterface("0x80ac58cd")).to.eq(
                true,
            );
        });
        it("supports ERC165", async () => {
            expect(await collection.supportsInterface("0x01ffc9a7")).to.eq(
                true,
            );
        });
        it("supports ERC721Metadata", async () => {
            expect(await collection.supportsInterface("0x5b5e139f")).to.eq(
                true,
            );
        });
        it("supports ERC2981", async () => {
            expect(await collection.supportsInterface("0x2a55205a")).to.eq(
                true,
            );
        });
    });
});
