import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("AdministratedUpgradeable", () => {
    let collection: Contract;

    let owner: SignerWithAddress,
        admin: SignerWithAddress,
        randomUser: SignerWithAddress;

    beforeEach(async () => {
        [owner, admin, randomUser] = await ethers.getSigners();

        const ERC721DropImplementation = await ethers.getContractFactory(
            "ERC721DropImplementation",
        );
        collection = await ERC721DropImplementation.deploy();
        await collection.deployed();

        // Initialize
        await collection.initialize(
            "Blank Studio Collection",
            "BSC",
            "https://mintdash.xyz/",
            admin.address,
        );
    });

    describe("renounceAdministration", () => {
        it("renounces", async () => {
            // Check current administrator
            expect(await collection.administrator()).to.equal(admin.address);

            // Renounce administration
            await collection.connect(admin).renounceAdministration();

            // Check new administrator
            expect(await collection.administrator()).to.equal(
                ethers.constants.AddressZero,
            );
        });

        it("reverts if caller is not administrator", async () => {
            await expect(
                collection.connect(randomUser).renounceAdministration(),
            ).to.be.revertedWithCustomError(collection, "OnlyAdministrator");

            await expect(
                collection.renounceAdministration(),
            ).to.be.revertedWithCustomError(collection, "OnlyAdministrator");
        });

        it("emits AdministrationTransferred event", async () => {
            await expect(collection.connect(admin).renounceAdministration())
                .to.emit(collection, "AdministrationTransferred")
                .withArgs(admin.address, ethers.constants.AddressZero);
        });
    });

    describe("transferAdministration", () => {
        it("transfers", async () => {
            // Check current administrator
            expect(await collection.administrator()).to.equal(admin.address);

            // Transfer administration
            await collection
                .connect(admin)
                .transferAdministration(randomUser.address);

            // Check new administrator
            expect(await collection.administrator()).to.equal(
                randomUser.address,
            );
        });

        it("reverts if new desired administrator is zero address", async () => {
            await expect(
                collection
                    .connect(admin)
                    .transferAdministration(ethers.constants.AddressZero),
            ).to.be.revertedWithCustomError(
                collection,
                "InvalidAdministratorAddress",
            );
        });

        it("reverts if caller is not administrator", async () => {
            await expect(
                collection
                    .connect(randomUser)
                    .transferAdministration(owner.address),
            ).to.be.revertedWithCustomError(collection, "OnlyAdministrator");
        });

        it("emits AdministrationTransferred event", async () => {
            await expect(
                collection
                    .connect(admin)
                    .transferAdministration(randomUser.address),
            )
                .to.emit(collection, "AdministrationTransferred")
                .withArgs(admin.address, randomUser.address);
        });
    });
});
