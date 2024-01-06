import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("ERC721DropImplementation - mintPublic", function () {
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

        await collection.initialize(
            "Blank Studio Collection",
            "BSC",
            initialBaseURI,
            "0xeA6b5147C353904D5faFA801422D268772F09512",
            0,
            admin.address,
        );

        await collection.updateRoyalties(
            initialRoyaltiesRecipient,
            initialRoyaltiesFee,
        );

        await collection.updateMaxSupply(initialMaxSupply);

        const currentTimestamp = await time.latest();

        await collection.updatePublicMintStage({
            mintPrice: ethers.utils.parseUnits("0.1", "ether"),
            startTime: currentTimestamp,
            endTime: currentTimestamp + 86400,
            mintLimitPerWallet: 3,
        });

        await time.increase(3600);
    });

    it("mints", async () => {
        await collection.mintPublic(owner.address, 3, {
            value: ethers.utils.parseUnits("0.3", "ether"),
        });

        expect(await collection.balanceOf(owner.address)).to.eq(3);
    });

    it("mints with allowed payer", async () => {
        await collection.updatePayer(randomUser.address, true);

        await collection.connect(randomUser).mintPublic(owner.address, 3, {
            value: ethers.utils.parseUnits("0.3", "ether"),
        });

        expect(await collection.balanceOf(owner.address)).to.eq(3);
        expect(await collection.balanceOf(randomUser.address)).to.eq(0);
    });

    it("emits Minted event", async () => {
        await expect(
            collection.mintPublic(owner.address, 3, {
                value: ethers.utils.parseUnits("0.3", "ether"),
            }),
        )
            .to.emit(collection, "Minted")
            .withArgs(owner.address, 3, 0);
    });

    it("reverts with unallowed payer", async () => {
        await expect(
            collection.connect(randomUser).mintPublic(owner.address, 3, {
                value: ethers.utils.parseUnits("0.3", "ether"),
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
        await expect(
            collection.mintPublic(owner.address, 4, {
                value: ethers.utils.parseUnits("0.4", "ether"),
            }),
        ).to.revertedWithCustomError(
            collection,
            "MintQuantityExceedsWalletLimit",
        );

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
        await time.increase(30 * 3600);

        await expect(
            collection.mintPublic(owner.address, 3, {
                value: ethers.utils.parseUnits("0.3", "ether"),
            }),
        ).to.revertedWithCustomError(collection, "StageNotActive");
    });

    it("reverts if stage didn't start", async () => {
        const currentTimestamp = await time.latest();

        await collection.updatePublicMintStage({
            mintPrice: ethers.utils.parseUnits("0.1", "ether"),
            startTime: currentTimestamp + 86400,
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
