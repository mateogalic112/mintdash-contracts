import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("ERC721DropImplementation - mintPublic", function () {
    let collection: Contract;

    let owner: SignerWithAddress,
        randomUser: SignerWithAddress,
        allowedSigner: SignerWithAddress;

    const initialMaxSupply = 4000;
    const initialBaseURI =
        "ipfs://QmSBxebqcuP8GyUxaFVEDqpsmbcjNMxg5y3i1UAHLkhHg5/";

    const initialRoyaltiesRecipient =
        "0xE5F135b20F496189FB6C915bABc53e0A70Ff6A1f";
    const initialRoyaltiesFee = 1000;

    beforeEach(async function () {
        [owner, randomUser, allowedSigner] = await ethers.getSigners();

        const ERC721DropImplementation = await ethers.getContractFactory(
            "ERC721DropImplementation",
        );
        collection = await ERC721DropImplementation.deploy();
        await collection.deployed();

        // Initialize
        await collection.initialize("Blank Studio Collection", "BSC");

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

        const currentTimestamp = await time.latest();

        // Configure public stage
        await collection.updatePublicMintStage({
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
        await collection.mintPublic(owner.address, 3, {
            value: ethers.utils.parseUnits("0.3", "ether"), // 3 * 0.1 ETH
        });

        // Check account token balance
        expect(await collection.balanceOf(owner.address)).to.eq(3);
    });

    it("mints with allowed payer", async () => {
        // Setup payer
        await collection.updatePayer(randomUser.address, true);

        // Mint 3 tokens to owner address with payer
        await collection.connect(randomUser).mintPublic(owner.address, 3, {
            value: ethers.utils.parseUnits("0.3", "ether"), // 3 * 0.1 ETH
        });

        // Check account token balance
        expect(await collection.balanceOf(owner.address)).to.eq(3);
        expect(await collection.balanceOf(randomUser.address)).to.eq(0);
    });

    it("emits Minted event", async () => {
        await expect(
            collection.mintPublic(owner.address, 3, {
                value: ethers.utils.parseUnits("0.3", "ether"), // 3 * 0.1 ETH
            }),
        )
            .to.emit(collection, "Minted")
            .withArgs(owner.address, 3, 0);
    });

    it("reverts with unallowed payer", async () => {
        await expect(
            collection.connect(randomUser).mintPublic(owner.address, 3, {
                value: ethers.utils.parseUnits("0.3", "ether"), // 3 * 0.1 ETH
            }),
        ).to.revertedWithCustomError(collection, "PayerNotAllowed");
    });

    it("reverts if not enough ETH is provided", async () => {
        await expect(
            collection.mintPublic(owner.address, 3, {
                value: ethers.utils.parseUnits("0.2", "ether"),
            }),
        ).to.revertedWithCustomError(collection, "IncorrectFundsProvided");
    });

    it("reverts if over mint limit per wallet", async () => {
        // Revert if over limit in single transaction
        await expect(
            collection.mintPublic(owner.address, 4, {
                value: ethers.utils.parseUnits("0.4", "ether"),
            }),
        ).to.revertedWithCustomError(
            collection,
            "MintQuantityExceedsWalletLimit",
        );

        // Revert if over limit in multiple transactons
        await collection.mintPublic(owner.address, 1, {
            value: ethers.utils.parseUnits("0.1", "ether"),
        });

        await expect(
            collection.mintPublic(owner.address, 3, {
                value: ethers.utils.parseUnits("0.3", "ether"),
            }),
        ).to.revertedWithCustomError(
            collection,
            "MintQuantityExceedsWalletLimit",
        );
    });

    it("reverts if over max supply", async () => {
        // Update max supply
        await collection.updateMaxSupply(2);

        await expect(
            collection.mintPublic(owner.address, 3, {
                value: ethers.utils.parseUnits("0.3", "ether"),
            }),
        ).to.revertedWithCustomError(
            collection,
            "MintQuantityExceedsMaxSupply",
        );
    });

    it("reverts if stage ended", async () => {
        // Travel 30 hours in the future
        await time.increase(30 * 3600);

        await expect(
            collection.mintPublic(owner.address, 3, {
                value: ethers.utils.parseUnits("0.3", "ether"),
            }),
        ).to.revertedWithCustomError(collection, "StageNotActive");
    });

    it("reverts if stage didn't start", async () => {
        const currentTimestamp = await time.latest();

        // Configure public stage
        await collection.updatePublicMintStage({
            mintPrice: ethers.utils.parseUnits("0.1", "ether"),
            startTime: currentTimestamp + 86400, // start in 24 hours
            endTime: currentTimestamp + 186400,
            mintLimitPerWallet: 2,
        });

        await expect(
            collection.mintPublic(owner.address, 1, {
                value: ethers.utils.parseUnits("0.1", "ether"),
            }),
        ).to.revertedWithCustomError(collection, "StageNotActive");
    });
});
