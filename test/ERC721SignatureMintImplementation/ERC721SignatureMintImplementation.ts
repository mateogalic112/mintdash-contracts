import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { getMerkleTreeRoot } from "../helpers/merkleTree";
import { ZERO_ADDRESS, ZERO_BYTES32 } from "../helpers/consts";

describe("ERC721SignatureMintImplementation", function () {
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

    beforeEach(async function () {
        [owner, allowlistUser2, randomUser, allowedSigner, admin] =
            await ethers.getSigners();

        const ERC721SignatureMintImplementation =
            await ethers.getContractFactory(
                "ERC721SignatureMintImplementation",
            );
        collection = await ERC721SignatureMintImplementation.deploy();
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

        // Configure allowed signer
        await collection.updateAllowedSigner(allowedSigner.address, true);
    });

    describe("getAmountMinted", () => {
        it("returns", async () => {
            // Check current state
            expect(await collection.getAmountMinted(owner.address)).to.eq(0);
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
            };

            // Update
            await collection.updateConfiguration(newConfig);

            // Check new state
            expect(await collection.maxSupply()).to.eq(newConfig.maxSupply);
            expect(await collection.baseURI()).to.eq(newConfig.baseURI);
            expect(await collection.payoutAddress()).to.eq(
                newConfig.payoutAddress,
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

        it("reverts if fees numerator is too high", async () => {
            await expect(
                collection
                    .connect(admin)
                    .updatePlatformFees(owner.address, 2100),
            ).to.be.revertedWithCustomError(
                collection,
                "PlatformFeesNumeratorTooHigh",
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
