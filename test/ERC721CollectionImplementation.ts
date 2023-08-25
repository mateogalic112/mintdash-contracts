import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import { expect } from "chai";

describe("ERC721CollectionImplementation", function () {
    let collection: Contract;

    let owner: SignerWithAddress,
        randomUser: SignerWithAddress,
        admin: SignerWithAddress;

    beforeEach(async function () {
        [owner, randomUser, admin] = await ethers.getSigners();

        const ERC721CollectionImplementation = await ethers.getContractFactory(
            "ERC721CollectionImplementation",
        );
        collection = await ERC721CollectionImplementation.deploy();
        await collection.deployed();

        // Initialize
        await collection.initialize(
            "Blank Studio Collection",
            "BSC",
            admin.address,
        );
    });

    describe("initialization", () => {
        it("initializes name", async () => {
            expect(await collection.name()).to.eq("Blank Studio Collection");
        });
        it("initializes symbol", async () => {
            expect(await collection.symbol()).to.eq("BSC");
        });
        it("initializes admin", async () => {
            expect(await collection.administrator()).to.eq(admin.address);
        });
        it("initializes owner", async () => {
            expect(await collection.owner()).to.eq(owner.address);
        });
    });

    describe("mint", () => {
        it("mints", async () => {
            await collection.mint(
                "QmSBxebqcuP8GyUxaFVEDqpsmbcjNMxg5y3i1UAHLkhHg5",
            );

            // Check account token balance
            expect(await collection.balanceOf(owner.address)).to.eq(1);
        });

        it("emits Minted event", async () => {
            await expect(
                collection.mint(
                    "QmSBxebqcuP8GyUxaFVEDqpsmbcjNMxg5y3i1UAHLkhHg5",
                ),
            )
                .to.emit(collection, "Minted")
                .withArgs(
                    owner.address,
                    1,
                    "QmSBxebqcuP8GyUxaFVEDqpsmbcjNMxg5y3i1UAHLkhHg5",
                );
        });

        it("increases total supply", async () => {
            await collection.mint(
                "QmSBxebqcuP8GyUxaFVEDqpsmbcjNMxg5y3i1UAHLkhHg5",
            );

            // Check account token balance
            expect(await collection.totalSupply()).to.eq(1);
        });
    });
    describe("batchMint", () => {});
    describe("burn", () => {});

    describe("updateRoyalties", () => {
        it("updates", async () => {
            // Check royalty info for token with ID 1
            const [receiver, amount] = await collection.royaltyInfo(
                1,
                ethers.utils.parseUnits("1", "ether"),
            );

            expect(receiver).to.eq(
                "0x0000000000000000000000000000000000000000",
            );
            expect(amount).to.eq(ethers.utils.parseUnits("0", "ether"));

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

    describe("updateBaseURI", () => {
        it("updates", async () => {
            // Check current base URI
            expect(await collection.baseURI()).to.eq("");

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
        it("supports ERC2981", async () => {
            expect(await collection.supportsInterface("0x2a55205a")).to.eq(
                true,
            );
        });
    });
});
