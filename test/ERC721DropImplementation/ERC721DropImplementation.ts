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
        admin: SignerWithAddress;

    const initialMaxSupply = 4000;
    const initialBaseURI =
        "ipfs://QmSBxebqcuP8GyUxaFVEDqpsmbcjNMxg5y3i1UAHLkhHg5/";

    const initialRoyaltiesRecipient =
        "0xE5F135b20F496189FB6C915bABc53e0A70Ff6A1f";
    const initialRoyaltiesFee = 1000;

    const activatePublicStageAndMaxMint = async () => {
        const currentTimestamp = await time.latest();
        await collection.updatePublicMintStage({
            mintPrice: ethers.utils.parseUnits("0.1", "ether"),
            startTime: currentTimestamp,
            endTime: currentTimestamp + 86400,
            mintLimitPerWallet: 3,
        });
        await time.increase(3600);

        await collection.mintPublic(owner.address, 3, {
            value: ethers.utils.parseUnits("0.3", "ether"),
        });
    };

    beforeEach(async function () {
        [owner, allowlistUser2, randomUser, admin] = await ethers.getSigners();

        const ERC721DropImplementation = await ethers.getContractFactory(
            "ERC721DropImplementation",
        );
        collection = await ERC721DropImplementation.deploy();
        await collection.deployed();

        await collection.initialize(
            "Blank Studio Collection",
            "BSC",
            initialBaseURI,
            "0xeA6b5147C353904D5faFA801422D268772F09512",
            500,
        );

        await collection.updateRoyalties(
            initialRoyaltiesRecipient,
            initialRoyaltiesFee,
        );

        await collection.updateMaxSupply(initialMaxSupply);
    });

    describe("initialization", () => {
        it("initializes name", async () => {
            expect(await collection.name()).to.eq("Blank Studio Collection");
        });
        it("initializes symbol", async () => {
            expect(await collection.symbol()).to.eq("BSC");
        });
        it("initializes baseURI", async () => {
            expect(await collection.baseURI()).to.eq(initialBaseURI);
        });
        it("initializes owner", async () => {
            expect(await collection.owner()).to.eq(owner.address);
        });
        it("initializes platform fee", async () => {
            expect(await collection.platformFeesAddress()).to.eq(
                "0xeA6b5147C353904D5faFA801422D268772F09512",
            );
            expect(await collection.platformFeesNumerator()).to.eq(500);
        });
    });
    describe("getAmountMinted", () => {
        it("returns", async () => {
            expect(await collection.getAmountMinted(owner.address)).to.eq(0);

            await activatePublicStageAndMaxMint();

            expect(await collection.getAmountMinted(owner.address)).eq(3);
        });
    });

    describe("burn", () => {
        it("burns token for owner", async () => {
            await activatePublicStageAndMaxMint();

            await collection.burn(1);

            expect(await collection.balanceOf(owner.address)).eq(2);
        });
        it("reverts if caller is not token owner", async () => {
            await activatePublicStageAndMaxMint();

            await expect(
                collection.connect(randomUser).burn(1),
            ).to.been.revertedWithCustomError(
                collection,
                "TransferCallerNotOwnerNorApproved",
            );
        });
    });

    describe("updatePublicMintStage", () => {
        it("updates", async () => {
            const currentConfig = await collection.publicMintStage();
            expect(currentConfig.mintPrice).to.equal(0);
            expect(currentConfig.startTime).to.equal(0);
            expect(currentConfig.endTime).to.equal(0);
            expect(currentConfig.mintLimitPerWallet).to.equal(0);

            const newConfigData = {
                mintPrice: "100000000000000000",
                startTime: 1676043287,
                endTime: 1686043287,
                mintLimitPerWallet: 5,
            };
            await collection.updatePublicMintStage(newConfigData);

            const updatedConfig = await collection.publicMintStage();
            expect(updatedConfig.mintPrice).to.equal(newConfigData.mintPrice);
            expect(updatedConfig.startTime).to.equal(newConfigData.startTime);
            expect(updatedConfig.endTime).to.equal(newConfigData.endTime);
            expect(updatedConfig.mintLimitPerWallet).to.equal(
                newConfigData.mintLimitPerWallet,
            );
        });

        it("reverts if caller is not contract owner", async () => {
            await expect(
                collection.connect(randomUser).updatePublicMintStage({
                    mintPrice: "100000000000000000",
                    startTime: 1676043287,
                    endTime: 1686043287,
                    mintLimitPerWallet: 5,
                }),
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("emits PublicMintStageUpdated", async () => {
            const newConfigData = {
                mintPrice: "100000000000000000",
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
            const stageId = 1;
            const currentConfig = await collection.allowlistMintStages(stageId);
            expect(currentConfig.mintPrice).to.equal(0);
            expect(currentConfig.startTime).to.equal(0);
            expect(currentConfig.endTime).to.equal(0);
            expect(currentConfig.mintLimitPerWallet).to.equal(0);
            expect(currentConfig.merkleRoot).to.equal(ZERO_BYTES32);

            const newConfigData = {
                id: stageId,
                data: {
                    mintPrice: "100000000000000000",
                    startTime: 1676043287,
                    endTime: 1686043287,
                    mintLimitPerWallet: 5,
                    maxSupplyForStage: 4000,
                    merkleRoot: `0x${getMerkleTreeRoot([owner.address])}`,
                },
            };
            await collection.updateAllowlistMintStage(newConfigData);

            const stageData = newConfigData.data;

            const updatedConfig = await collection.allowlistMintStages(stageId);
            expect(updatedConfig.mintPrice).to.equal(stageData.mintPrice);
            expect(updatedConfig.startTime).to.equal(stageData.startTime);
            expect(updatedConfig.endTime).to.equal(stageData.endTime);
            expect(updatedConfig.mintLimitPerWallet).to.equal(
                stageData.mintLimitPerWallet,
            );
            expect(updatedConfig.merkleRoot).to.equal(stageData.merkleRoot);
        });

        it("reverts if caller is not contract owner", async () => {
            await expect(
                collection.connect(randomUser).updateAllowlistMintStage({
                    id: 1,
                    data: {
                        mintPrice: "100000000000000000",
                        startTime: 1676043287,
                        endTime: 1686043287,
                        mintLimitPerWallet: 5,
                        maxSupplyForStage: 4000,
                        merkleRoot: `0x${getMerkleTreeRoot([owner.address])}`,
                    },
                }),
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("emits AllowlistMintStageUpdated", async () => {
            const newConfigData = {
                id: 1,
                data: {
                    mintPrice: "100000000000000000",
                    startTime: 1676043287,
                    endTime: 1686043287,
                    mintLimitPerWallet: 5,
                    maxSupplyForStage: 4000,
                    merkleRoot: `0x${getMerkleTreeRoot([owner.address])}`,
                },
            };

            await expect(
                collection.updateAllowlistMintStage(newConfigData),
            ).to.emit(collection, "AllowlistMintStageUpdated");
        });
    });

    describe("updateTokenGatedMintStage", () => {
        it("updates", async () => {
            const randomAddress = randomUser.address;
            const currentConfig = await collection.tokenGatedMintStages(
                randomAddress,
            );
            expect(currentConfig.mintPrice).to.equal(0);
            expect(currentConfig.startTime).to.equal(0);
            expect(currentConfig.endTime).to.equal(0);
            expect(currentConfig.mintLimitPerWallet).to.equal(0);

            const newConfigData = {
                nftContract: randomAddress,
                data: {
                    mintPrice: "100000000000000000",
                    startTime: 1676043287,
                    endTime: 1686043287,
                    mintLimitPerWallet: 5,
                    maxSupplyForStage: 4000,
                },
            };
            await collection.updateTokenGatedMintStage(newConfigData);

            const stageData = newConfigData.data;

            const updatedConfig = await collection.tokenGatedMintStages(
                randomAddress,
            );
            expect(updatedConfig.mintPrice).to.equal(stageData.mintPrice);
            expect(updatedConfig.startTime).to.equal(stageData.startTime);
            expect(updatedConfig.endTime).to.equal(stageData.endTime);
            expect(updatedConfig.mintLimitPerWallet).to.equal(
                stageData.mintLimitPerWallet,
            );
        });

        it("reverts if caller is not contract owner", async () => {
            const randomAddress = randomUser.address;

            await expect(
                collection.connect(randomUser).updateTokenGatedMintStage({
                    nftContract: randomAddress,
                    data: {
                        mintPrice: "100000000000000000",
                        startTime: 1676043287,
                        endTime: 1686043287,
                        mintLimitPerWallet: 5,
                        maxSupplyForStage: 4000,
                    },
                }),
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("emits TokenGatedMintStageUpdated", async () => {
            const randomAddress = randomUser.address;
            const newConfigData = {
                nftContract: randomAddress,
                data: {
                    mintPrice: "100000000000000000",
                    startTime: 1676043287,
                    endTime: 1686043287,
                    mintLimitPerWallet: 5,
                    maxSupplyForStage: 4000,
                },
            };

            await expect(
                collection.updateTokenGatedMintStage(newConfigData),
            ).to.emit(collection, "TokenGatedMintStageUpdated");
        });
    });

    describe("updateMaxSupply", () => {
        it("updates", async () => {
            expect(await collection.maxSupply()).to.eq(initialMaxSupply);

            const newMaxSupply = 10000;
            await collection.updateMaxSupply(newMaxSupply);

            expect(await collection.maxSupply()).to.eq(newMaxSupply);
        });

        it("reverts if caller is not contract owner", async () => {
            await expect(
                collection.connect(randomUser).updateMaxSupply(1500),
            ).to.be.revertedWith("Ownable: caller is not the owner");
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
                allowlistMintStages: [
                    {
                        id: 1,
                        data: {
                            mintPrice: "100000000000000000",
                            startTime: 1676043287,
                            endTime: 1686043287,
                            mintLimitPerWallet: 5,
                            maxSupplyForStage: 400,
                            merkleRoot: `0x${getMerkleTreeRoot([
                                owner.address,
                            ])}`,
                        },
                    },
                    {
                        id: 2,
                        data: {
                            mintPrice: "200000000000000000",
                            startTime: 1676043286,
                            endTime: 1686043286,
                            mintLimitPerWallet: 2,
                            maxSupplyForStage: 100,
                            merkleRoot: `0x${getMerkleTreeRoot([
                                randomUser.address,
                            ])}`,
                        },
                    },
                ],
                tokenGatedMintStages: [
                    {
                        nftContract: randomUser.address,
                        data: {
                            mintPrice: "100000000000000000",
                            startTime: 1676043287,
                            endTime: 1686043287,
                            mintLimitPerWallet: 5,
                            maxSupplyForStage: 4000,
                        },
                    },
                    {
                        nftContract: owner.address,
                        data: {
                            mintPrice: "200000000000000000",
                            startTime: 1676043286,
                            endTime: 1686043286,
                            mintLimitPerWallet: 2,
                            maxSupplyForStage: 1000,
                        },
                    },
                ],
            };

            await collection.updateConfiguration(newConfig);

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
                newConfig.allowlistMintStages[0].data.mintPrice,
            );
            expect(allowlistStageConfig1.startTime).to.equal(
                newConfig.allowlistMintStages[0].data.startTime,
            );
            expect(allowlistStageConfig1.endTime).to.equal(
                newConfig.allowlistMintStages[0].data.endTime,
            );
            expect(allowlistStageConfig1.mintLimitPerWallet).to.equal(
                newConfig.allowlistMintStages[0].data.mintLimitPerWallet,
            );
            expect(allowlistStageConfig1.merkleRoot).to.equal(
                newConfig.allowlistMintStages[0].data.merkleRoot,
            );

            const allowlistStageConfig2 = await collection.allowlistMintStages(
                2,
            );
            expect(allowlistStageConfig2.mintPrice).to.equal(
                newConfig.allowlistMintStages[1].data.mintPrice,
            );
            expect(allowlistStageConfig2.startTime).to.equal(
                newConfig.allowlistMintStages[1].data.startTime,
            );
            expect(allowlistStageConfig2.endTime).to.equal(
                newConfig.allowlistMintStages[1].data.endTime,
            );
            expect(allowlistStageConfig2.mintLimitPerWallet).to.equal(
                newConfig.allowlistMintStages[1].data.mintLimitPerWallet,
            );
            expect(allowlistStageConfig2.merkleRoot).to.equal(
                newConfig.allowlistMintStages[1].data.merkleRoot,
            );

            const tokenGatedStage1 = await collection.tokenGatedMintStages(
                randomUser.address,
            );
            expect(tokenGatedStage1.mintPrice).to.equal(
                newConfig.tokenGatedMintStages[0].data.mintPrice,
            );
            expect(tokenGatedStage1.startTime).to.equal(
                newConfig.tokenGatedMintStages[0].data.startTime,
            );
            expect(tokenGatedStage1.endTime).to.equal(
                newConfig.tokenGatedMintStages[0].data.endTime,
            );
            expect(tokenGatedStage1.mintLimitPerWallet).to.equal(
                newConfig.tokenGatedMintStages[0].data.mintLimitPerWallet,
            );

            const tokenGatedStage2 = await collection.tokenGatedMintStages(
                owner.address,
            );
            expect(tokenGatedStage2.mintPrice).to.equal(
                newConfig.tokenGatedMintStages[1].data.mintPrice,
            );
            expect(tokenGatedStage2.startTime).to.equal(
                newConfig.tokenGatedMintStages[1].data.startTime,
            );
            expect(tokenGatedStage2.endTime).to.equal(
                newConfig.tokenGatedMintStages[1].data.endTime,
            );
            expect(tokenGatedStage2.mintLimitPerWallet).to.equal(
                newConfig.tokenGatedMintStages[1].data.mintLimitPerWallet,
            );
        });
    });

    describe("updateBaseURI", () => {
        it("updates", async () => {
            expect(await collection.baseURI()).to.eq(initialBaseURI);

            const newBaseURI =
                "ipfs://QmSBxebqcuP8GyUxaFVEDqpsmbcjNMxg5y3i1UAHLNEW/";
            await collection.updateBaseURI(newBaseURI);

            expect(await collection.baseURI()).to.eq(newBaseURI);
        });

        it("reverts if caller is not contract owner", async () => {
            await expect(
                collection
                    .connect(randomUser)
                    .updateBaseURI(
                        "ipfs://QmSBxebqcuP8GyUxaFVEDqpsmbcjNMxg5y3i1UAHLNEW/",
                    ),
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("emits BatchMetadataUpdate if tokens exist", async () => {
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
            const newBaseURI =
                "ipfs://QmSBxebqcuP8GyUxaFVEDqpsmbcjNMxg5y3i1UAHLNEW/";

            await expect(collection.updateBaseURI(newBaseURI))
                .to.emit(collection, "BaseURIUpdated")
                .withArgs(newBaseURI);
        });
    });

    describe("updateRoyalties", () => {
        it("updates", async () => {
            const [receiver, amount] = await collection.royaltyInfo(
                1,
                ethers.utils.parseUnits("1", "ether"),
            );

            expect(receiver).to.eq(initialRoyaltiesRecipient);
            expect(amount).to.eq(ethers.utils.parseUnits("0.1", "ether"));

            const newReceiver = randomUser.address;
            const newFeeNumerator = 5000;
            await collection.updateRoyalties(newReceiver, newFeeNumerator);

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

        it("reverts if caller is not contract owner", async () => {
            await expect(
                collection
                    .connect(randomUser)
                    .updateRoyalties(randomUser.address, 1000),
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("updateProvenanceHash", () => {
        it("updates", async () => {
            expect(await collection.provenanceHash()).to.eq(ZERO_BYTES32);

            const newProvenanceHash = ethers.utils.id("image data");
            await collection.updateProvenanceHash(newProvenanceHash);

            expect(await collection.provenanceHash()).to.eq(newProvenanceHash);
        });

        it("reverts if caller is not contract owner", async () => {
            await expect(
                collection
                    .connect(randomUser)
                    .updateProvenanceHash(ethers.utils.id("image data")),
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("updatePayoutAddress", () => {
        it("updates", async () => {
            expect(await collection.payoutAddress()).to.eq(ZERO_ADDRESS);

            await collection.updatePayoutAddress(owner.address);

            expect(await collection.payoutAddress()).to.eq(owner.address);
        });

        it("reverts if caller is not contract owner", async () => {
            await expect(
                collection
                    .connect(randomUser)
                    .updatePayoutAddress(randomUser.address),
            ).to.be.revertedWith("Ownable: caller is not the owner");
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

    describe("updatePayer", () => {
        it("updates", async () => {
            expect(await collection.allowedPayers(randomUser.address)).to.eq(
                false,
            );

            await collection.updatePayer(randomUser.address, true);

            expect(await collection.allowedPayers(randomUser.address)).to.eq(
                true,
            );
        });

        it("reverts if caller is not contract owner", async () => {
            await expect(
                collection
                    .connect(randomUser)
                    .updatePayer(randomUser.address, true),
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("withdrawAllFunds", () => {
        it("withdraws", async () => {
            await activatePublicStageAndMaxMint();

            await collection.updatePayoutAddress(allowlistUser2.address);

            await expect(() =>
                collection.withdrawAllFunds(),
            ).to.changeEtherBalance(
                allowlistUser2,
                ethers.utils.parseUnits("0.285", "ether"),
            );
        });

        it("reverts if caller is not contract owner", async () => {
            await expect(
                collection.connect(randomUser).withdrawAllFunds(),
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("reverts if contract balance is zero", async () => {
            await expect(
                collection.withdrawAllFunds(),
            ).to.be.revertedWithCustomError(collection, "NothingToWithdraw");
        });

        it("reverts if payout address is zero address", async () => {
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
