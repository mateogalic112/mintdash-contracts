import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { getMerkleProof, getMerkleTreeRoot } from "../helpers/merkleTree";

describe("ERC721DropImplementation - mintAllowlist", function () {
    let collection: Contract;

    let owner: SignerWithAddress,
        allowlistUser: SignerWithAddress,
        allowlistUser2: SignerWithAddress,
        userWithoutAllowlist: SignerWithAddress,
        randomUser: SignerWithAddress;

    let allowlist: string[];

    const initialMaxSupply = 4000;
    const initialBaseURI =
        "ipfs://QmSBxebqcuP8GyUxaFVEDqpsmbcjNMxg5y3i1UAHLkhHg5/";

    const initialRoyaltiesRecipient =
        "0xE5F135b20F496189FB6C915bABc53e0A70Ff6A1f";
    const initialRoyaltiesFee = 1000;

    const PREPARED_MINT_STAGE_ID = 1;

    beforeEach(async function () {
        [
            owner,
            allowlistUser,
            allowlistUser2,
            userWithoutAllowlist,
            randomUser,
        ] = await ethers.getSigners();

        allowlist = [allowlistUser.address, allowlistUser2.address];

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

        const currentTimestamp = await time.latest();

        await collection.updateAllowlistMintStage({
            id: PREPARED_MINT_STAGE_ID,
            data: {
                mintPrice: ethers.utils.parseUnits("0.1", "ether"),
                startTime: currentTimestamp,
                endTime: currentTimestamp + 86400,
                mintLimitPerWallet: 2,
                maxSupplyForStage: 4000,
                merkleRoot: `0x${getMerkleTreeRoot(allowlist)}`,
            },
        });

        await time.increase(3600);
    });

    it("mints", async () => {
        await collection
            .connect(allowlistUser)
            .mintAllowlist(
                PREPARED_MINT_STAGE_ID,
                allowlistUser.address,
                2,
                getMerkleProof(allowlist, allowlistUser.address),
                {
                    value: ethers.utils.parseUnits("0.2", "ether"),
                },
            );

        expect(await collection.balanceOf(allowlistUser.address)).to.eq(2);
    });

    it("mints with allowed payer", async () => {
        await collection.updatePayer(randomUser.address, true);

        await collection
            .connect(randomUser)
            .mintAllowlist(
                PREPARED_MINT_STAGE_ID,
                allowlistUser.address,
                2,
                getMerkleProof(allowlist, allowlistUser.address),
                {
                    value: ethers.utils.parseUnits("0.2", "ether"),
                },
            );

        expect(await collection.balanceOf(allowlistUser.address)).to.eq(2);
        expect(await collection.balanceOf(randomUser.address)).to.eq(0);
    });

    it("emits Minted event", async () => {
        await expect(
            collection
                .connect(allowlistUser)
                .mintAllowlist(
                    PREPARED_MINT_STAGE_ID,
                    allowlistUser.address,
                    2,
                    getMerkleProof(allowlist, allowlistUser.address),
                    {
                        value: ethers.utils.parseUnits("0.2", "ether"),
                    },
                ),
        )
            .to.emit(collection, "Minted")
            .withArgs(allowlistUser.address, 2, 1);
    });

    it("reverts with unallowed payer", async () => {
        await expect(
            collection
                .connect(randomUser)
                .mintAllowlist(
                    PREPARED_MINT_STAGE_ID,
                    allowlistUser.address,
                    2,
                    getMerkleProof(allowlist, allowlistUser.address),
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
                    allowlistUser.address,
                    2,
                    getMerkleProof(allowlist, allowlistUser.address),
                    {
                        value: ethers.utils.parseUnits("0.1", "ether"),
                    },
                ),
        ).to.revertedWithCustomError(collection, "IncorrectFundsProvided");
    });

    it("reverts if over mint limit per wallet", async () => {
        await expect(
            collection
                .connect(allowlistUser)
                .mintAllowlist(
                    PREPARED_MINT_STAGE_ID,
                    allowlistUser.address,
                    3,
                    getMerkleProof(allowlist, allowlistUser.address),
                    {
                        value: ethers.utils.parseUnits("0.3", "ether"),
                    },
                ),
        ).to.revertedWithCustomError(
            collection,
            "MintQuantityExceedsWalletLimit",
        );

        await collection
            .connect(allowlistUser)
            .mintAllowlist(
                PREPARED_MINT_STAGE_ID,
                allowlistUser.address,
                1,
                getMerkleProof(allowlist, allowlistUser.address),
                {
                    value: ethers.utils.parseUnits("0.1", "ether"),
                },
            );

        await expect(
            collection
                .connect(allowlistUser)
                .mintAllowlist(
                    PREPARED_MINT_STAGE_ID,
                    allowlistUser.address,
                    2,
                    getMerkleProof(allowlist, allowlistUser.address),
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

        await collection.updateAllowlistMintStage({
            id: PREPARED_MINT_STAGE_ID,
            data: {
                mintPrice: ethers.utils.parseUnits("0.1", "ether"),
                startTime: currentTimestamp,
                endTime: currentTimestamp + 86400,
                mintLimitPerWallet: 2,
                maxSupplyForStage: 3,
                merkleRoot: `0x${getMerkleTreeRoot(allowlist)}`,
            },
        });

        await time.increase(3600);

        await collection
            .connect(allowlistUser)
            .mintAllowlist(
                PREPARED_MINT_STAGE_ID,
                allowlistUser.address,
                2,
                getMerkleProof(allowlist, allowlistUser.address),
                {
                    value: ethers.utils.parseUnits("0.2", "ether"),
                },
            );

        expect(
            collection
                .connect(allowlistUser2)
                .mintAllowlist(
                    PREPARED_MINT_STAGE_ID,
                    allowlistUser2.address,
                    2,
                    getMerkleProof(allowlist, allowlistUser2.address),
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
        await collection.updateMaxSupply(2);

        await collection
            .connect(allowlistUser)
            .mintAllowlist(
                PREPARED_MINT_STAGE_ID,
                allowlistUser.address,
                2,
                getMerkleProof(allowlist, allowlistUser.address),
                {
                    value: ethers.utils.parseUnits("0.2", "ether"),
                },
            );

        await expect(
            collection
                .connect(allowlistUser2)
                .mintAllowlist(
                    PREPARED_MINT_STAGE_ID,
                    allowlistUser2.address,
                    2,
                    getMerkleProof(allowlist, allowlistUser2.address),
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
        await time.increase(30 * 3600);

        await expect(
            collection
                .connect(allowlistUser)
                .mintAllowlist(
                    PREPARED_MINT_STAGE_ID,
                    allowlistUser.address,
                    1,
                    getMerkleProof(allowlist, allowlistUser.address),
                    {
                        value: ethers.utils.parseUnits("0.1", "ether"),
                    },
                ),
        ).to.revertedWithCustomError(collection, "StageNotActive");
    });

    it("reverts if stage didn't start", async () => {
        const currentTimestamp = await time.latest();

        await collection.updateAllowlistMintStage({
            id: PREPARED_MINT_STAGE_ID,
            data: {
                mintPrice: ethers.utils.parseUnits("0.1", "ether"),
                startTime: currentTimestamp + 86400,
                endTime: currentTimestamp + 186400,
                mintLimitPerWallet: 2,
                maxSupplyForStage: 4000,
                merkleRoot: `0x${getMerkleTreeRoot(allowlist)}`,
            },
        });

        await expect(
            collection
                .connect(allowlistUser)
                .mintAllowlist(
                    PREPARED_MINT_STAGE_ID,
                    allowlistUser.address,
                    1,
                    getMerkleProof(allowlist, allowlistUser.address),
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
                owner.address,
                1,
                getMerkleProof(allowlist, userWithoutAllowlist.address),
                {
                    value: ethers.utils.parseUnits("0.1", "ether"),
                },
            ),
        ).to.revertedWithCustomError(collection, "AllowlistStageInvalidProof");
    });

    it("reverts if using proof from other user on the allowlist", async () => {
        await expect(
            collection
                .connect(allowlistUser)
                .mintAllowlist(
                    PREPARED_MINT_STAGE_ID,
                    allowlistUser.address,
                    1,
                    getMerkleProof(allowlist, allowlistUser2.address),
                    {
                        value: ethers.utils.parseUnits("0.1", "ether"),
                    },
                ),
        ).to.revertedWithCustomError(collection, "AllowlistStageInvalidProof");
    });

    it("revents if invalid stage ID", async () => {
        await expect(
            collection.mintAllowlist(
                100,
                owner.address,
                1,
                getMerkleProof(allowlist, userWithoutAllowlist.address),
                {
                    value: ethers.utils.parseUnits("0.1", "ether"),
                },
            ),
        ).to.revertedWithCustomError(collection, "StageNotActive");
    });
});
