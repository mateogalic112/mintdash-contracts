import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { getMerkleProof, getMerkleTreeRoot } from "./helpers/merkleTree";
import { ZERO_ADDRESS, ZERO_BYTES32 } from "./helpers/consts";

describe("ERC1155EditionsImplementation", function () {
    let collection: Contract;

    let owner: SignerWithAddress,
        allowlistUser: SignerWithAddress,
        allowlistUser2: SignerWithAddress,
        userWithoutAllowlist: SignerWithAddress,
        randomUser: SignerWithAddress,
        admin: SignerWithAddress;

    let allowlist: string[];

    const DEFAULT_TOKEN_ID = 1;
    const initialMaxSupply = 4000;
    const initialBaseURI =
        "ipfs://QmSBxebqcuP8GyUxaFVEDqpsmbcjNMxg5y3i1UAHLkhHg5/";

    const initialRoyaltiesRecipient =
        "0xE5F135b20F496189FB6C915bABc53e0A70Ff6A1f";
    const initialRoyaltiesFee = 1000;

    const activatePublicStageAndMaxMint = async () => {
        // Setup public mint stage
        const currentTimestamp = await time.latest();
        await collection.updatePublicMintStage(DEFAULT_TOKEN_ID, {
            mintPrice: ethers.utils.parseUnits("0.1", "ether"),
            startTime: currentTimestamp, // start right away
            endTime: currentTimestamp + 86400, // last 24 hours
            mintLimitPerWallet: 3,
        });
        await time.increase(3600);

        // Mint few tokens
        await collection.mintPublic(owner.address, DEFAULT_TOKEN_ID, 3, "0x", {
            value: ethers.utils.parseUnits("0.3", "ether"),
        });
    };

    beforeEach(async function () {
        [
            owner,
            allowlistUser,
            allowlistUser2,
            userWithoutAllowlist,
            randomUser,
            admin,
        ] = await ethers.getSigners();

        allowlist = [allowlistUser.address, allowlistUser2.address];

        const ERC1155EditionsImplementation = await ethers.getContractFactory(
            "ERC1155EditionsImplementation",
        );
        collection = await ERC1155EditionsImplementation.deploy();
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
        await collection.updateTokenURI(DEFAULT_TOKEN_ID, initialBaseURI);

        // Configure max supply for token ID 1
        await collection.updateMaxSupply(DEFAULT_TOKEN_ID, initialMaxSupply);
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
    });

    describe("mintPublic", () => {
        beforeEach(async () => {
            const currentTimestamp = await time.latest();

            // Configure public stage
            await collection.updatePublicMintStage(DEFAULT_TOKEN_ID, {
                mintPrice: ethers.utils.parseUnits("0.1", "ether"),
                startTime: currentTimestamp, // start right away
                endTime: currentTimestamp + 86400, // last 24 hours
                mintLimitPerWallet: 3,
            });
            // Increase time by 1 hour
            await time.increase(3600);
        });

        it("mints", async () => {
            // Mint 3 tokens
            await collection.mintPublic(
                owner.address,
                DEFAULT_TOKEN_ID,
                3,
                "0x",
                {
                    value: ethers.utils.parseUnits("0.3", "ether"),
                },
            );

            // Check account token balance
            expect(
                await collection.balanceOf(owner.address, DEFAULT_TOKEN_ID),
            ).to.eq(3);
        });

        it("mints with allowed payer", async () => {
            // Setup payer
            await collection.updatePayer(randomUser.address, true);

            // Mint 3 tokens to owner address with payer
            await collection
                .connect(randomUser)
                .mintPublic(owner.address, DEFAULT_TOKEN_ID, 3, "0x", {
                    value: ethers.utils.parseUnits("0.3", "ether"),
                });

            // Check account token balance
            expect(
                await collection.balanceOf(owner.address, DEFAULT_TOKEN_ID),
            ).to.eq(3);
            expect(
                await collection.balanceOf(
                    randomUser.address,
                    DEFAULT_TOKEN_ID,
                ),
            ).to.eq(0);
        });

        it("emits Minted event", async () => {
            await expect(
                collection.mintPublic(
                    owner.address,
                    DEFAULT_TOKEN_ID,
                    3,
                    "0x",
                    {
                        value: ethers.utils.parseUnits("0.3", "ether"),
                    },
                ),
            )
                .to.emit(collection, "Minted")
                .withArgs(owner.address, DEFAULT_TOKEN_ID, 3, 0);
        });

        it("reverts with unallowed payer", async () => {
            await expect(
                collection
                    .connect(randomUser)
                    .mintPublic(owner.address, DEFAULT_TOKEN_ID, 3, "0x", {
                        value: ethers.utils.parseUnits("0.3", "ether"),
                    }),
            ).to.revertedWithCustomError(collection, "PayerNotAllowed");
        });

        it("reverts if not enough ETH is provided", async () => {
            await expect(
                collection.mintPublic(
                    owner.address,
                    DEFAULT_TOKEN_ID,
                    3,
                    "0x",
                    {
                        value: ethers.utils.parseUnits("0.2", "ether"),
                    },
                ),
            ).to.revertedWithCustomError(collection, "IncorrectFundsProvided");
        });

        it("reverts if over mint limit per wallet", async () => {
            // Revert if over limit in single transaction
            await expect(
                collection.mintPublic(
                    owner.address,
                    DEFAULT_TOKEN_ID,
                    4,
                    "0x",
                    {
                        value: ethers.utils.parseUnits("0.4", "ether"),
                    },
                ),
            ).to.revertedWithCustomError(
                collection,
                "MintQuantityExceedsWalletLimit",
            );

            // Revert if over limit in multiple transactons
            await collection.mintPublic(
                owner.address,
                DEFAULT_TOKEN_ID,
                1,
                "0x",
                {
                    value: ethers.utils.parseUnits("0.1", "ether"),
                },
            );

            await expect(
                collection.mintPublic(
                    owner.address,
                    DEFAULT_TOKEN_ID,
                    3,
                    "0x",
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
            await collection.updateMaxSupply(DEFAULT_TOKEN_ID, 2);

            await expect(
                collection.mintPublic(
                    owner.address,
                    DEFAULT_TOKEN_ID,
                    3,
                    "0x",
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
                collection.mintPublic(
                    owner.address,
                    DEFAULT_TOKEN_ID,
                    3,
                    "0x",
                    {
                        value: ethers.utils.parseUnits("0.3", "ether"),
                    },
                ),
            ).to.revertedWithCustomError(collection, "StageNotActive");
        });

        it("reverts if stage didn't start", async () => {
            const currentTimestamp = await time.latest();

            // Configure public stage
            await collection.updatePublicMintStage(DEFAULT_TOKEN_ID, {
                mintPrice: ethers.utils.parseUnits("0.1", "ether"),
                startTime: currentTimestamp + 86400, // start in 24 hours
                endTime: currentTimestamp + 186400,
                mintLimitPerWallet: 2,
            });

            await expect(
                collection.mintPublic(
                    owner.address,
                    DEFAULT_TOKEN_ID,
                    1,
                    "0x",
                    {
                        value: ethers.utils.parseUnits("0.1", "ether"),
                    },
                ),
            ).to.revertedWithCustomError(collection, "StageNotActive");
        });
    });

    describe("mintAllowlist", () => {
        const PREPARED_MINT_STAGE_ID = 1;
        beforeEach(async () => {
            const currentTimestamp = await time.latest();

            // Configure allowlist stage
            await collection.updateAllowlistMintStage(DEFAULT_TOKEN_ID, {
                id: PREPARED_MINT_STAGE_ID,
                mintPrice: ethers.utils.parseUnits("0.1", "ether"),
                startTime: currentTimestamp, // start right away
                endTime: currentTimestamp + 86400, // last 24 hours
                mintLimitPerWallet: 2,
                maxSupplyForStage: 4000,
                merkleRoot: `0x${getMerkleTreeRoot(allowlist)}`,
            });

            // Increase time by 1 hour
            await time.increase(3600);
        });

        it("mints", async () => {
            // Mint 3 tokens
            await collection
                .connect(allowlistUser)
                .mintAllowlist(
                    PREPARED_MINT_STAGE_ID,
                    DEFAULT_TOKEN_ID,
                    allowlistUser.address,
                    2,
                    getMerkleProof(allowlist, allowlistUser.address),
                    "0x",
                    {
                        value: ethers.utils.parseUnits("0.2", "ether"),
                    },
                );

            // Check account token balance
            expect(
                await collection.balanceOf(
                    allowlistUser.address,
                    DEFAULT_TOKEN_ID,
                ),
            ).to.eq(2);
        });

        it("mints with allowed payer", async () => {
            // Setup payer
            await collection.updatePayer(randomUser.address, true);

            // Mint 3 tokens to owner address with payer
            await collection
                .connect(randomUser)
                .mintAllowlist(
                    PREPARED_MINT_STAGE_ID,
                    DEFAULT_TOKEN_ID,
                    allowlistUser.address,
                    2,
                    getMerkleProof(allowlist, allowlistUser.address),
                    "0x",
                    {
                        value: ethers.utils.parseUnits("0.2", "ether"),
                    },
                );

            // Check account token balance
            expect(
                await collection.balanceOf(
                    allowlistUser.address,
                    DEFAULT_TOKEN_ID,
                ),
            ).to.eq(2);
            expect(
                await collection.balanceOf(
                    randomUser.address,
                    DEFAULT_TOKEN_ID,
                ),
            ).to.eq(0);
        });

        it("emits Minted event", async () => {
            await expect(
                collection
                    .connect(allowlistUser)
                    .mintAllowlist(
                        PREPARED_MINT_STAGE_ID,
                        DEFAULT_TOKEN_ID,
                        allowlistUser.address,
                        2,
                        getMerkleProof(allowlist, allowlistUser.address),
                        "0x",
                        {
                            value: ethers.utils.parseUnits("0.2", "ether"),
                        },
                    ),
            )
                .to.emit(collection, "Minted")
                .withArgs(allowlistUser.address, DEFAULT_TOKEN_ID, 2, 1);
        });

        it("reverts with unallowed payer", async () => {
            await expect(
                collection
                    .connect(randomUser)
                    .mintAllowlist(
                        PREPARED_MINT_STAGE_ID,
                        DEFAULT_TOKEN_ID,
                        allowlistUser.address,
                        2,
                        getMerkleProof(allowlist, allowlistUser.address),
                        "0x",
                        {
                            value: ethers.utils.parseUnits("0.2", "ether"),
                        },
                    ),
            ).to.revertedWithCustomError(collection, "PayerNotAllowed");
        });

        it("reverts if not enough ETH is provided", async () => {
            await expect(
                collection
                    .connect(allowlistUser)
                    .mintAllowlist(
                        PREPARED_MINT_STAGE_ID,
                        DEFAULT_TOKEN_ID,
                        allowlistUser.address,
                        2,
                        getMerkleProof(allowlist, allowlistUser.address),
                        "0x",
                        {
                            value: ethers.utils.parseUnits("0.1", "ether"),
                        },
                    ),
            ).to.revertedWithCustomError(collection, "IncorrectFundsProvided");
        });

        it("reverts if over mint limit per wallet", async () => {
            // Revert if over limit in single transaction
            await expect(
                collection
                    .connect(allowlistUser)
                    .mintAllowlist(
                        PREPARED_MINT_STAGE_ID,
                        DEFAULT_TOKEN_ID,
                        allowlistUser.address,
                        3,
                        getMerkleProof(allowlist, allowlistUser.address),
                        "0x",
                        {
                            value: ethers.utils.parseUnits("0.3", "ether"),
                        },
                    ),
            ).to.revertedWithCustomError(
                collection,
                "MintQuantityExceedsWalletLimit",
            );

            // Revert if over limit in multiple transactons
            await collection
                .connect(allowlistUser)
                .mintAllowlist(
                    PREPARED_MINT_STAGE_ID,
                    DEFAULT_TOKEN_ID,
                    allowlistUser.address,
                    1,
                    getMerkleProof(allowlist, allowlistUser.address),
                    "0x",
                    {
                        value: ethers.utils.parseUnits("0.1", "ether"),
                    },
                );

            await expect(
                collection
                    .connect(allowlistUser)
                    .mintAllowlist(
                        PREPARED_MINT_STAGE_ID,
                        DEFAULT_TOKEN_ID,
                        allowlistUser.address,
                        2,
                        getMerkleProof(allowlist, allowlistUser.address),
                        "0x",
                        {
                            value: ethers.utils.parseUnits("0.2", "ether"),
                        },
                    ),
            ).to.revertedWithCustomError(
                collection,
                "MintQuantityExceedsWalletLimit",
            );
        });

        it("reverts if over max supply for stage", async () => {
            const currentTimestamp = await time.latest();

            // Configure allowlist stage
            await collection.updateAllowlistMintStage(DEFAULT_TOKEN_ID, {
                id: PREPARED_MINT_STAGE_ID,
                mintPrice: ethers.utils.parseUnits("0.1", "ether"),
                startTime: currentTimestamp, // start right away
                endTime: currentTimestamp + 86400, // last 24 hours
                mintLimitPerWallet: 2,
                maxSupplyForStage: 3,
                merkleRoot: `0x${getMerkleTreeRoot(allowlist)}`,
            });

            // Increase time by 1 hour
            await time.increase(3600);

            // Mint 2 items
            await collection
                .connect(allowlistUser)
                .mintAllowlist(
                    PREPARED_MINT_STAGE_ID,
                    DEFAULT_TOKEN_ID,
                    allowlistUser.address,
                    2,
                    getMerkleProof(allowlist, allowlistUser.address),
                    "0x",
                    {
                        value: ethers.utils.parseUnits("0.2", "ether"),
                    },
                );

            expect(
                collection
                    .connect(allowlistUser2)
                    .mintAllowlist(
                        PREPARED_MINT_STAGE_ID,
                        DEFAULT_TOKEN_ID,
                        allowlistUser2.address,
                        2,
                        getMerkleProof(allowlist, allowlistUser2.address),
                        "0x",
                        {
                            value: ethers.utils.parseUnits("0.2", "ether"),
                        },
                    ),
            ).to.revertedWithCustomError(
                collection,
                "MintQuantityExceedsMaxSupplyForStage",
            );
        });

        it("reverts if over max supply", async () => {
            // Update max supply
            await collection.updateMaxSupply(DEFAULT_TOKEN_ID, 2);

            await collection
                .connect(allowlistUser)
                .mintAllowlist(
                    PREPARED_MINT_STAGE_ID,
                    DEFAULT_TOKEN_ID,
                    allowlistUser.address,
                    2,
                    getMerkleProof(allowlist, allowlistUser.address),
                    "0x",
                    {
                        value: ethers.utils.parseUnits("0.2", "ether"),
                    },
                );

            await expect(
                collection
                    .connect(allowlistUser2)
                    .mintAllowlist(
                        PREPARED_MINT_STAGE_ID,
                        DEFAULT_TOKEN_ID,
                        allowlistUser2.address,
                        2,
                        getMerkleProof(allowlist, allowlistUser2.address),
                        "0x",
                        {
                            value: ethers.utils.parseUnits("0.2", "ether"),
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
                collection
                    .connect(allowlistUser)
                    .mintAllowlist(
                        PREPARED_MINT_STAGE_ID,
                        DEFAULT_TOKEN_ID,
                        allowlistUser.address,
                        1,
                        getMerkleProof(allowlist, allowlistUser.address),
                        "0x",
                        {
                            value: ethers.utils.parseUnits("0.1", "ether"),
                        },
                    ),
            ).to.revertedWithCustomError(collection, "StageNotActive");
        });

        it("reverts if stage didn't start", async () => {
            const currentTimestamp = await time.latest();

            // Configure allowlist stage
            await collection.updateAllowlistMintStage(DEFAULT_TOKEN_ID, {
                id: PREPARED_MINT_STAGE_ID,
                mintPrice: ethers.utils.parseUnits("0.1", "ether"),
                startTime: currentTimestamp + 86400, // start in 24 hours
                endTime: currentTimestamp + 186400,
                mintLimitPerWallet: 2,
                maxSupplyForStage: 4000,
                merkleRoot: `0x${getMerkleTreeRoot(allowlist)}`,
            });

            await expect(
                collection
                    .connect(allowlistUser)
                    .mintAllowlist(
                        PREPARED_MINT_STAGE_ID,
                        DEFAULT_TOKEN_ID,
                        allowlistUser.address,
                        1,
                        getMerkleProof(allowlist, allowlistUser.address),
                        "0x",
                        {
                            value: ethers.utils.parseUnits("0.1", "ether"),
                        },
                    ),
            ).to.revertedWithCustomError(collection, "StageNotActive");
        });

        it("reverts if not on allowlist", async () => {
            await expect(
                collection.mintAllowlist(
                    PREPARED_MINT_STAGE_ID,
                    DEFAULT_TOKEN_ID,
                    owner.address,
                    1,
                    getMerkleProof(allowlist, userWithoutAllowlist.address),
                    "0x",
                    {
                        value: ethers.utils.parseUnits("0.1", "ether"),
                    },
                ),
            ).to.revertedWithCustomError(
                collection,
                "AllowlistStageInvalidProof",
            );
        });

        it("reverts if using proof from other user on the allowlist", async () => {
            await expect(
                collection
                    .connect(allowlistUser)
                    .mintAllowlist(
                        PREPARED_MINT_STAGE_ID,
                        DEFAULT_TOKEN_ID,
                        allowlistUser.address,
                        1,
                        getMerkleProof(allowlist, allowlistUser2.address),
                        "0x",
                        {
                            value: ethers.utils.parseUnits("0.1", "ether"),
                        },
                    ),
            ).to.revertedWithCustomError(
                collection,
                "AllowlistStageInvalidProof",
            );
        });

        it("revents if invalid stage ID", async () => {
            await expect(
                collection.mintAllowlist(
                    100, // ID doesn't exist
                    DEFAULT_TOKEN_ID,
                    owner.address,
                    1,
                    getMerkleProof(allowlist, userWithoutAllowlist.address),
                    "0x",
                    {
                        value: ethers.utils.parseUnits("0.1", "ether"),
                    },
                ),
            ).to.revertedWithCustomError(collection, "StageNotActive");
        });
    });

    describe("mintTokenGated", () => {
        let testERC721: Contract;

        beforeEach(async () => {
            // Deploy test NFT collection
            const TestERC721 = await ethers.getContractFactory("TestERC721");
            testERC721 = await TestERC721.deploy();
            await testERC721.deployed();

            // Mint 5 NFTS to owner
            await testERC721.mint(owner.address, 5);

            // Configure public stage
            const currentTimestamp = await time.latest();
            await collection.updateTokenGatedMintStage(DEFAULT_TOKEN_ID, {
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
                DEFAULT_TOKEN_ID,
                testERC721.address,
                [1, 2, 3],
                "0x",
                {
                    value: ethers.utils.parseUnits("0.3", "ether"),
                },
            );

            // Check account token balance
            expect(
                await collection.balanceOf(owner.address, DEFAULT_TOKEN_ID),
            ).to.eq(3);
        });

        it("mints with allowed payer", async () => {
            // Setup payer
            await collection.updatePayer(randomUser.address, true);

            // Mint 3 tokens to owner address with payer
            await collection
                .connect(randomUser)
                .mintTokenGated(
                    owner.address,
                    DEFAULT_TOKEN_ID,
                    testERC721.address,
                    [1, 2, 3],
                    "0x",
                    {
                        value: ethers.utils.parseUnits("0.3", "ether"),
                    },
                );

            // Check account token balance
            expect(
                await collection.balanceOf(owner.address, DEFAULT_TOKEN_ID),
            ).to.eq(3);
            expect(
                await collection.balanceOf(
                    randomUser.address,
                    DEFAULT_TOKEN_ID,
                ),
            ).to.eq(0);
        });

        it("emits Minted event", async () => {
            await expect(
                collection.mintTokenGated(
                    owner.address,
                    DEFAULT_TOKEN_ID,
                    testERC721.address,
                    [1, 2, 3],
                    "0x",
                    {
                        value: ethers.utils.parseUnits("0.3", "ether"),
                    },
                ),
            )
                .to.emit(collection, "Minted")
                .withArgs(owner.address, DEFAULT_TOKEN_ID, 3, 2);
        });

        it("reverts if not owner of the token", async () => {
            await expect(
                collection
                    .connect(randomUser)
                    .mintTokenGated(
                        randomUser.address,
                        DEFAULT_TOKEN_ID,
                        testERC721.address,
                        [1, 2, 3],
                        "0x",
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
                DEFAULT_TOKEN_ID,
                testERC721.address,
                [1, 2],
                "0x",
                {
                    value: ethers.utils.parseUnits("0.2", "ether"),
                },
            );

            await expect(
                collection.mintTokenGated(
                    owner.address,
                    DEFAULT_TOKEN_ID,
                    testERC721.address,
                    [1],
                    "0x",
                    {
                        value: ethers.utils.parseUnits("0.2", "ether"),
                    },
                ),
            ).to.revertedWithCustomError(
                collection,
                "TokenGatedTokenAlreadyRedeemed",
            );
        });

        it("reverts with unallowed payer", async () => {
            await expect(
                collection
                    .connect(randomUser)
                    .mintTokenGated(
                        owner.address,
                        DEFAULT_TOKEN_ID,
                        testERC721.address,
                        [1, 2, 3],
                        "0x",
                        {
                            value: ethers.utils.parseUnits("0.3", "ether"),
                        },
                    ),
            ).to.revertedWithCustomError(collection, "PayerNotAllowed");
        });

        it("reverts if not enough ETH is provided", async () => {
            await expect(
                collection.mintTokenGated(
                    owner.address,
                    DEFAULT_TOKEN_ID,
                    testERC721.address,
                    [1, 2, 3],
                    "0x",
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
                    DEFAULT_TOKEN_ID,
                    testERC721.address,
                    [1, 2, 3, 4],
                    "0x",
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
                DEFAULT_TOKEN_ID,
                testERC721.address,
                [1],
                "0x",
                {
                    value: ethers.utils.parseUnits("0.1", "ether"),
                },
            );

            await expect(
                collection.mintTokenGated(
                    owner.address,
                    DEFAULT_TOKEN_ID,
                    testERC721.address,
                    [2, 3, 4],
                    "0x",
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
            await collection.updateMaxSupply(DEFAULT_TOKEN_ID, 2);

            await expect(
                collection.mintTokenGated(
                    owner.address,
                    DEFAULT_TOKEN_ID,
                    testERC721.address,
                    [1, 2, 3],
                    "0x",
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
                    DEFAULT_TOKEN_ID,
                    testERC721.address,
                    [1, 2, 3],
                    "0x",
                    {
                        value: ethers.utils.parseUnits("0.3", "ether"),
                    },
                ),
            ).to.revertedWithCustomError(collection, "StageNotActive");
        });

        it("reverts if stage didn't start", async () => {
            const currentTimestamp = await time.latest();

            // Configure public stage
            await collection.updateTokenGatedMintStage(DEFAULT_TOKEN_ID, {
                nftContract: testERC721.address,
                mintPrice: ethers.utils.parseUnits("0.1", "ether"),
                startTime: currentTimestamp + 86400, // start in 24 hours
                endTime: currentTimestamp + 186400,
                mintLimitPerWallet: 2,
                maxSupplyForStage: 1000,
            });

            await expect(
                collection.mintTokenGated(
                    owner.address,
                    DEFAULT_TOKEN_ID,
                    testERC721.address,
                    [1],
                    "0x",
                    {
                        value: ethers.utils.parseUnits("0.1", "ether"),
                    },
                ),
            ).to.revertedWithCustomError(collection, "StageNotActive");
        });
    });

    describe("getAmountMinted", () => {
        it("returns", async () => {
            // Check current state
            expect(
                await collection.getAmountMinted(
                    owner.address,
                    DEFAULT_TOKEN_ID,
                ),
            ).to.eq(0);

            // Mint 3 NFTs
            await activatePublicStageAndMaxMint();

            // Check updated state
            expect(
                await collection.getAmountMinted(
                    owner.address,
                    DEFAULT_TOKEN_ID,
                ),
            ).eq(3);
        });
    });

    describe("updatePublicMintStage", () => {
        it("updates", async () => {
            // Check current config
            const currentConfig = await collection.getPublicMintStage(
                DEFAULT_TOKEN_ID,
            );
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
            await collection.updatePublicMintStage(
                DEFAULT_TOKEN_ID,
                newConfigData,
            );

            // Check updated config
            const updatedConfig = await collection.getPublicMintStage(
                DEFAULT_TOKEN_ID,
            );
            expect(updatedConfig.mintPrice).to.equal(newConfigData.mintPrice);
            expect(updatedConfig.startTime).to.equal(newConfigData.startTime);
            expect(updatedConfig.endTime).to.equal(newConfigData.endTime);
            expect(updatedConfig.mintLimitPerWallet).to.equal(
                newConfigData.mintLimitPerWallet,
            );
        });

        it("reverts if caller is not contract owner or administrator", async () => {
            await expect(
                collection
                    .connect(randomUser)
                    .updatePublicMintStage(DEFAULT_TOKEN_ID, {
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
                collection.updatePublicMintStage(
                    DEFAULT_TOKEN_ID,
                    newConfigData,
                ),
            ).to.emit(collection, "PublicMintStageUpdated");
        });
    });

    describe("updateAllowlistMintStage", () => {
        it("updates", async () => {
            // Check current config
            const stageId = 1;
            const currentConfig = await collection.getAllowlistMintStage(
                DEFAULT_TOKEN_ID,
                stageId,
            );
            expect(currentConfig.mintPrice).to.equal(0);
            expect(currentConfig.startTime).to.equal(0);
            expect(currentConfig.endTime).to.equal(0);
            expect(currentConfig.mintLimitPerWallet).to.equal(0);
            expect(currentConfig.merkleRoot).to.equal(ZERO_BYTES32);

            // Update config
            const newConfigData = {
                id: stageId,
                mintPrice: "100000000000000000", // 0.1 ETH
                startTime: 1676043287, // 0.1 ETH
                endTime: 1686043287, // 0.1 ETH
                mintLimitPerWallet: 5,
                maxSupplyForStage: 4000,
                merkleRoot: `0x${getMerkleTreeRoot([owner.address])}`,
            };
            await collection.updateAllowlistMintStage(
                DEFAULT_TOKEN_ID,
                newConfigData,
            );

            // Check updated config
            const updatedConfig = await collection.getAllowlistMintStage(
                DEFAULT_TOKEN_ID,
                stageId,
            );
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
                collection
                    .connect(randomUser)
                    .updateAllowlistMintStage(DEFAULT_TOKEN_ID, {
                        id: 1,
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
                id: 1,
                mintPrice: "100000000000000000", // 0.1 ETH
                startTime: 1676043287, // 0.1 ETH
                endTime: 1686043287, // 0.1 ETH
                mintLimitPerWallet: 5,
                maxSupplyForStage: 4000,
                merkleRoot: `0x${getMerkleTreeRoot([owner.address])}`,
            };

            await expect(
                collection.updateAllowlistMintStage(
                    DEFAULT_TOKEN_ID,
                    newConfigData,
                ),
            ).to.emit(collection, "AllowlistMintStageUpdated");
        });
    });

    describe("updateTokenGatedMintStage", () => {
        it("updates", async () => {
            // Check current config
            const randomAddress = randomUser.address;
            const currentConfig = await collection.getTokenGatedMintStage(
                DEFAULT_TOKEN_ID,
                randomAddress,
            );
            expect(currentConfig.mintPrice).to.equal(0);
            expect(currentConfig.startTime).to.equal(0);
            expect(currentConfig.endTime).to.equal(0);
            expect(currentConfig.mintLimitPerWallet).to.equal(0);

            // Update config
            const newConfigData = {
                nftContract: randomAddress,
                mintPrice: "100000000000000000", // 0.1 ETH
                startTime: 1676043287, // 0.1 ETH
                endTime: 1686043287, // 0.1 ETH
                mintLimitPerWallet: 5,
                maxSupplyForStage: 4000,
            };
            await collection.updateTokenGatedMintStage(
                DEFAULT_TOKEN_ID,
                newConfigData,
            );

            // Check updated config
            const updatedConfig = await collection.getTokenGatedMintStage(
                DEFAULT_TOKEN_ID,
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
                    .updateTokenGatedMintStage(DEFAULT_TOKEN_ID, {
                        nftContract: randomAddress,
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
                nftContract: randomAddress,
                mintPrice: "100000000000000000", // 0.1 ETH
                startTime: 1676043287, // 0.1 ETH
                endTime: 1686043287, // 0.1 ETH
                mintLimitPerWallet: 5,
                maxSupplyForStage: 4000,
            };

            await expect(
                collection.updateTokenGatedMintStage(
                    DEFAULT_TOKEN_ID,
                    newConfigData,
                ),
            ).to.emit(collection, "TokenGatedMintStageUpdated");
        });
    });

    describe("updateMaxSupply", () => {
        it("updates", async () => {
            // Check current max supply
            expect(await collection.maxSupply(DEFAULT_TOKEN_ID)).to.eq(
                initialMaxSupply,
            );

            // Update max supply
            const newMaxSupply = 10000;
            await collection.updateMaxSupply(DEFAULT_TOKEN_ID, newMaxSupply);

            // Check updated max supply
            expect(await collection.maxSupply(DEFAULT_TOKEN_ID)).to.eq(
                newMaxSupply,
            );
        });

        it("reverts if caller is not contract owner or administrator", async () => {
            await expect(
                collection
                    .connect(randomUser)
                    .updateMaxSupply(DEFAULT_TOKEN_ID, 1500),
            ).to.be.revertedWithCustomError(
                collection,
                "OnlyOwnerOrAdministrator",
            );
        });

        it("reverts if max supply exceeds uint64", async () => {
            await expect(
                collection.updateMaxSupply(
                    DEFAULT_TOKEN_ID,
                    "18446744073709551616",
                ),
            ).to.be.revertedWithCustomError(
                collection,
                "CannotExceedMaxSupplyOfUint64",
            );
        });

        it("emits MaxSupplyUpdated", async () => {
            await expect(collection.updateMaxSupply(DEFAULT_TOKEN_ID, 500))
                .to.be.emit(collection, "MaxSupplyUpdated")
                .withArgs(DEFAULT_TOKEN_ID, 500);
        });
    });

    describe("updateConfiguration", () => {
        it("updates", async () => {
            const newConfig = {
                maxSupply: 1000,
                baseURI: "ipfs://hash/123",
                publicMintStage: {
                    mintPrice: "100000000000000000",
                    startTime: 1676043287,
                    endTime: 1686043287,
                    mintLimitPerWallet: 5,
                },
                allowlistMintStages: [
                    {
                        id: 1,
                        mintPrice: "100000000000000000",
                        startTime: 1676043287,
                        endTime: 1686043287,
                        mintLimitPerWallet: 5,
                        maxSupplyForStage: 400,
                        merkleRoot: `0x${getMerkleTreeRoot([owner.address])}`,
                    },
                    {
                        id: 2,
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
                tokenGatedMintStages: [
                    {
                        nftContract: randomUser.address,
                        mintPrice: "100000000000000000",
                        startTime: 1676043287,
                        endTime: 1686043287,
                        mintLimitPerWallet: 5,
                        maxSupplyForStage: 4000,
                    },
                    {
                        nftContract: owner.address,
                        mintPrice: "200000000000000000",
                        startTime: 1676043286,
                        endTime: 1686043286,
                        mintLimitPerWallet: 2,
                        maxSupplyForStage: 1000,
                    },
                ],
            };

            // Update
            await collection.updateConfiguration(DEFAULT_TOKEN_ID, newConfig);

            // Check new state
            expect(await collection.maxSupply(DEFAULT_TOKEN_ID)).to.eq(
                newConfig.maxSupply,
            );
            expect(await collection.uri(DEFAULT_TOKEN_ID)).to.eq(
                newConfig.baseURI,
            );

            const publicMintStage = await collection.getPublicMintStage(
                DEFAULT_TOKEN_ID,
            );
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

            const allowlistStageConfig1 =
                await collection.getAllowlistMintStage(DEFAULT_TOKEN_ID, 1);
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

            const allowlistStageConfig2 =
                await collection.getAllowlistMintStage(DEFAULT_TOKEN_ID, 2);
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

            const tokenGatedStage1 = await collection.getTokenGatedMintStage(
                DEFAULT_TOKEN_ID,
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

            const tokenGatedStage2 = await collection.getTokenGatedMintStage(
                DEFAULT_TOKEN_ID,
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

    describe("updateTokenURI", () => {
        it("updates", async () => {
            // Check current base URI
            expect(await collection.uri(DEFAULT_TOKEN_ID)).to.eq(
                initialBaseURI,
            );

            // Update base URI
            const newBaseURI =
                "ipfs://QmSBxebqcuP8GyUxaFVEDqpsmbcjNMxg5y3i1UAHLNEW/";
            await collection.updateTokenURI(DEFAULT_TOKEN_ID, newBaseURI);

            // Check updated base URI
            expect(await collection.uri(DEFAULT_TOKEN_ID)).to.eq(newBaseURI);
        });

        it("reverts if caller is not contract owner or administrator", async () => {
            await expect(
                collection
                    .connect(randomUser)
                    .updateTokenURI(
                        DEFAULT_TOKEN_ID,
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

            await expect(
                collection.updateTokenURI(DEFAULT_TOKEN_ID, newBaseURI),
            )
                .to.emit(collection, "TokenURIUpdated")
                .withArgs(DEFAULT_TOKEN_ID, newBaseURI);
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
        it("supports ERC1155", async () => {
            expect(await collection.supportsInterface("0xd9b67a26")).to.eq(
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
