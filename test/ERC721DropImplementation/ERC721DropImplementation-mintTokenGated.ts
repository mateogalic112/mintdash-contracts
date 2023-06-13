import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("ERC721DropImplementation - mintTokenGated", function () {
    let testERC721: Contract;
    let collection: Contract;

    let owner: SignerWithAddress,
        randomUser: SignerWithAddress,
        admin: SignerWithAddress;

    const initialMaxSupply = 4000;
    const initialBaseURI =
        "ipfs://QmSBxebqcuP8GyUxaFVEDqpsmbcjNMxg5y3i1UAHLkhHg5/";

    const initialRoyaltiesRecipient =
        "0xE5F135b20F496189FB6C915bABc53e0A70Ff6A1f";
    const initialRoyaltiesFee = 1000;

    beforeEach(async function () {
        [owner, randomUser, admin] = await ethers.getSigners();

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

        // Deploy test NFT collection
        const TestERC721 = await ethers.getContractFactory("TestERC721");
        testERC721 = await TestERC721.deploy();
        await testERC721.deployed();

        // Mint 5 NFTS to owner
        await testERC721.mint(owner.address, 5);

        // Configure public stage
        const currentTimestamp = await time.latest();
        await collection.updateTokenGatedMintStage({
            nftContract: testERC721.address,
            mintPrice: ethers.utils.parseUnits("0.1", "ether"),
            startTime: currentTimestamp, // start right away
            endTime: currentTimestamp + 86400, // last 24 hours
            mintLimitPerWallet: 3,
            maxSupplyForStage: 100,
        });

        // Increase time by 1 hour
        await time.increase(3600);
    });

    it("mints", async () => {
        // Mint 3 tokens
        await collection.mintTokenGated(
            owner.address,
            testERC721.address,
            [1, 2, 3],
            {
                value: ethers.utils.parseUnits("0.3", "ether"),
            },
        );

        // Check account token balance
        expect(await collection.balanceOf(owner.address)).to.eq(3);
    });

    it("mints with allowed payer", async () => {
        // Setup payer
        await collection.updatePayer(randomUser.address, true);

        // Mint 3 tokens to owner address with payer
        await collection
            .connect(randomUser)
            .mintTokenGated(owner.address, testERC721.address, [1, 2, 3], {
                value: ethers.utils.parseUnits("0.3", "ether"),
            });

        // Check account token balance
        expect(await collection.balanceOf(owner.address)).to.eq(3);
        expect(await collection.balanceOf(randomUser.address)).to.eq(0);
    });

    it("emits Minted event", async () => {
        await expect(
            collection.mintTokenGated(
                owner.address,
                testERC721.address,
                [1, 2, 3],
                {
                    value: ethers.utils.parseUnits("0.3", "ether"),
                },
            ),
        )
            .to.emit(collection, "Minted")
            .withArgs(owner.address, 3, 2);
    });

    it("reverts if not owner of the token", async () => {
        await expect(
            collection
                .connect(randomUser)
                .mintTokenGated(
                    randomUser.address,
                    testERC721.address,
                    [1, 2, 3],
                    {
                        value: ethers.utils.parseUnits("0.3", "ether"),
                    },
                ),
        ).to.revertedWithCustomError(collection, "TokenGatedNotTokenOwner");
    });

    it("reverts if token is already redeemed", async () => {
        // Redeem for 2 NFTs
        await collection.mintTokenGated(
            owner.address,
            testERC721.address,
            [1, 2],
            {
                value: ethers.utils.parseUnits("0.2", "ether"),
            },
        );

        await expect(
            collection.mintTokenGated(owner.address, testERC721.address, [1], {
                value: ethers.utils.parseUnits("0.2", "ether"),
            }),
        ).to.revertedWithCustomError(
            collection,
            "TokenGatedTokenAlreadyRedeemed",
        );
    });

    it("reverts with unallowed payer", async () => {
        await expect(
            collection
                .connect(randomUser)
                .mintTokenGated(owner.address, testERC721.address, [1, 2, 3], {
                    value: ethers.utils.parseUnits("0.3", "ether"),
                }),
        ).to.revertedWithCustomError(collection, "PayerNotAllowed");
    });

    it("reverts if not enough ETH is provided", async () => {
        await expect(
            collection.mintTokenGated(
                owner.address,
                testERC721.address,
                [1, 2, 3],
                {
                    value: ethers.utils.parseUnits("0.2", "ether"),
                },
            ),
        ).to.revertedWithCustomError(collection, "IncorrectFundsProvided");
    });

    it("reverts if over mint limit per wallet", async () => {
        // Revert if over limit in single transaction
        await expect(
            collection.mintTokenGated(
                owner.address,
                testERC721.address,
                [1, 2, 3, 4],
                {
                    value: ethers.utils.parseUnits("0.4", "ether"),
                },
            ),
        ).to.revertedWithCustomError(
            collection,
            "MintQuantityExceedsWalletLimit",
        );

        // Revert if over limit in multiple transactons
        await collection.mintTokenGated(
            owner.address,
            testERC721.address,
            [1],
            {
                value: ethers.utils.parseUnits("0.1", "ether"),
            },
        );

        await expect(
            collection.mintTokenGated(
                owner.address,
                testERC721.address,
                [2, 3, 4],
                {
                    value: ethers.utils.parseUnits("0.3", "ether"),
                },
            ),
        ).to.revertedWithCustomError(
            collection,
            "MintQuantityExceedsWalletLimit",
        );
    });

    it("reverts if over max supply", async () => {
        // Update max supply
        await collection.updateMaxSupply(2);

        await expect(
            collection.mintTokenGated(
                owner.address,
                testERC721.address,
                [1, 2, 3],
                {
                    value: ethers.utils.parseUnits("0.3", "ether"),
                },
            ),
        ).to.revertedWithCustomError(
            collection,
            "MintQuantityExceedsMaxSupply",
        );
    });

    it("reverts if stage ended", async () => {
        // Travel 30 hours in the future
        await time.increase(30 * 3600);

        await expect(
            collection.mintTokenGated(
                owner.address,
                testERC721.address,
                [1, 2, 3],
                {
                    value: ethers.utils.parseUnits("0.3", "ether"),
                },
            ),
        ).to.revertedWithCustomError(collection, "StageNotActive");
    });

    it("reverts if stage didn't start", async () => {
        const currentTimestamp = await time.latest();

        // Configure public stage
        await collection.updateTokenGatedMintStage({
            nftContract: testERC721.address,
            mintPrice: ethers.utils.parseUnits("0.1", "ether"),
            startTime: currentTimestamp + 86400, // start in 24 hours
            endTime: currentTimestamp + 186400,
            mintLimitPerWallet: 2,
            maxSupplyForStage: 1000,
        });

        await expect(
            collection.mintTokenGated(owner.address, testERC721.address, [1], {
                value: ethers.utils.parseUnits("0.1", "ether"),
            }),
        ).to.revertedWithCustomError(collection, "StageNotActive");
    });
});
