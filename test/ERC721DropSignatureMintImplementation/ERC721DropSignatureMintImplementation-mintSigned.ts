import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber, Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

import type { SignedMintParamsStruct } from "../../typechain-types/src/ERC721DropSignatureMintImplementation";

describe("ERC721DropSignatureMintImplementation - mintSigned", function () {
    let collection: Contract;

    let owner: SignerWithAddress,
        randomUser: SignerWithAddress,
        allowedSigner: SignerWithAddress,
        admin: SignerWithAddress;

    let eip712Domain: { [key: string]: string | number };
    let eip712Types: Record<string, Array<{ name: string; type: string }>>;

    let mintParams: SignedMintParamsStruct;
    let salt: BigNumber;

    const initialMaxSupply = 4000;
    const initialBaseURI =
        "ipfs://QmSBxebqcuP8GyUxaFVEDqpsmbcjNMxg5y3i1UAHLkhHg5/";

    const initialRoyaltiesRecipient =
        "0xE5F135b20F496189FB6C915bABc53e0A70Ff6A1f";
    const initialRoyaltiesFee = 1000;

    const signMint = async (
        minter: SignerWithAddress,
        mintParams: SignedMintParamsStruct,
        salt: BigNumber,
        signer: SignerWithAddress,
    ) => {
        const signedMint = {
            minter: minter.address,
            mintParams,
            salt,
        };

        const signature = await signer._signTypedData(
            eip712Domain,
            eip712Types,
            signedMint,
        );

        const verifiedAddress = ethers.utils.verifyTypedData(
            eip712Domain,
            eip712Types,
            signedMint,
            signature,
        );
        expect(verifiedAddress).to.eq(signer.address);

        return signature;
    };

    beforeEach(async function () {
        [owner, randomUser, allowedSigner, admin] = await ethers.getSigners();

        const ERC721DropSignatureMintImplementation =
            await ethers.getContractFactory(
                "ERC721DropSignatureMintImplementation",
            );
        collection = await ERC721DropSignatureMintImplementation.deploy();
        await collection.deployed();

        await collection.initialize(
            "Blank Studio Collection",
            "BSC",
            "0xeA6b5147C353904D5faFA801422D268772F09512",
            0,
        );

        await collection.updateRoyalties(
            initialRoyaltiesRecipient,
            initialRoyaltiesFee,
        );

        await collection.updateBaseURI(initialBaseURI);

        await collection.updateMaxSupply(initialMaxSupply);

        await collection.updateAllowedSigner(allowedSigner.address, true);

        eip712Domain = {
            name: "ERC721Drop",
            version: "1.0",
            chainId: (await ethers.provider.getNetwork()).chainId,
            verifyingContract: collection.address,
        };

        eip712Types = {
            SignedMint: [
                { name: "minter", type: "address" },
                { name: "mintParams", type: "SignedMintParams" },
                { name: "salt", type: "uint256" },
            ],
            SignedMintParams: [
                { name: "mintPrice", type: "uint80" },
                { name: "startTime", type: "uint48" },
                { name: "endTime", type: "uint48" },
                { name: "mintLimitPerWallet", type: "uint16" },
                { name: "maxSupplyForStage", type: "uint40" },
                { name: "stageIndex", type: "uint256" },
            ],
        };

        const currentTimestamp = await time.latest();

        mintParams = {
            mintPrice: ethers.utils.parseUnits("0.1", "ether"),
            startTime: currentTimestamp - 1000,
            endTime: currentTimestamp + 1000,
            mintLimitPerWallet: 3,
            maxSupplyForStage: 100,
            stageIndex: 1,
        };

        salt = BigNumber.from("1");
    });
    it("mints", async () => {
        const signature = await signMint(
            owner,
            mintParams,
            salt,
            allowedSigner,
        );

        await collection.mintSigned(
            owner.address,
            3,
            mintParams,
            salt,
            signature,
            {
                value: ethers.utils.parseUnits("0.3", "ether"),
            },
        );

        expect(await collection.balanceOf(owner.address)).to.eq(3);
    });

    it("mints with allowed payer", async () => {
        await collection.updatePayer(randomUser.address, true);

        const signature = await signMint(
            owner,
            mintParams,
            salt,
            allowedSigner,
        );

        await collection
            .connect(randomUser)
            .mintSigned(owner.address, 3, mintParams, salt, signature, {
                value: ethers.utils.parseUnits("0.3", "ether"),
            });

        expect(await collection.balanceOf(owner.address)).to.eq(3);
        expect(await collection.balanceOf(randomUser.address)).to.eq(0);
    });

    it("emits Minted event", async () => {
        const signature = await signMint(
            owner,
            mintParams,
            salt,
            allowedSigner,
        );
        await expect(
            collection.mintSigned(
                owner.address,
                3,
                mintParams,
                salt,
                signature,
                {
                    value: ethers.utils.parseUnits("0.3", "ether"),
                },
            ),
        )
            .to.emit(collection, "Minted")
            .withArgs(owner.address, 3, 1);
    });

    it("reverts with unallowed payer", async () => {
        const signature = await signMint(
            owner,
            mintParams,
            salt,
            allowedSigner,
        );

        await expect(
            collection
                .connect(randomUser)
                .mintSigned(owner.address, 3, mintParams, salt, signature, {
                    value: ethers.utils.parseUnits("0.3", "ether"),
                }),
        ).to.revertedWithCustomError(collection, "PayerNotAllowed");
    });

    it("reverts if not enough ETH is provided", async () => {
        const signature = await signMint(
            owner,
            mintParams,
            salt,
            allowedSigner,
        );
        await expect(
            collection.mintSigned(
                owner.address,
                3,
                mintParams,
                salt,
                signature,
                {
                    value: ethers.utils.parseUnits("0.2", "ether"),
                },
            ),
        ).to.revertedWithCustomError(collection, "IncorrectFundsProvided");
    });

    it("reverts if over mint limit per wallet", async () => {
        let signature = await signMint(owner, mintParams, salt, allowedSigner);

        await expect(
            collection.mintSigned(
                owner.address,
                5,
                mintParams,
                salt,
                signature,
                {
                    value: ethers.utils.parseUnits("0.5", "ether"),
                },
            ),
        ).to.revertedWithCustomError(
            collection,
            "MintQuantityExceedsWalletLimit",
        );

        salt = salt.add(1);
        signature = await signMint(owner, mintParams, salt, allowedSigner);

        await collection.mintSigned(
            owner.address,
            3,
            mintParams,
            salt,
            signature,
            {
                value: ethers.utils.parseUnits("0.3", "ether"),
            },
        );

        salt = salt.add(1);
        signature = await signMint(owner, mintParams, salt, allowedSigner);

        await expect(
            collection.mintSigned(
                owner.address,
                2,
                mintParams,
                salt,
                signature,
                {
                    value: ethers.utils.parseUnits("0.2", "ether"),
                },
            ),
        ).to.revertedWithCustomError(
            collection,
            "MintQuantityExceedsWalletLimit",
        );
    });

    it("reverts if over max supply", async () => {
        await collection.updateMaxSupply(2);

        const signature = await signMint(
            owner,
            mintParams,
            salt,
            allowedSigner,
        );

        await expect(
            collection.mintSigned(
                owner.address,
                3,
                mintParams,
                salt,
                signature,
                {
                    value: ethers.utils.parseUnits("0.3", "ether"),
                },
            ),
        ).to.revertedWithCustomError(
            collection,
            "MintQuantityExceedsMaxSupply",
        );
    });

    it("reverts if digest was already used", async () => {
        const signature = await signMint(
            owner,
            mintParams,
            salt,
            allowedSigner,
        );

        await collection.mintSigned(
            owner.address,
            1,
            mintParams,
            salt,
            signature,
            {
                value: ethers.utils.parseUnits("0.1", "ether"),
            },
        );

        await expect(
            collection.mintSigned(
                owner.address,
                1,
                mintParams,
                salt,
                signature,
                {
                    value: ethers.utils.parseUnits("0.1", "ether"),
                },
            ),
        ).to.revertedWithCustomError(collection, "SignatureAlreadyUsed");
    });

    it("reverts is signer is not allowed", async () => {
        const signature = await signMint(owner, mintParams, salt, randomUser);

        await expect(
            collection.mintSigned(
                owner.address,
                3,
                mintParams,
                salt,
                signature,
                {
                    value: ethers.utils.parseUnits("0.3", "ether"),
                },
            ),
        ).to.revertedWithCustomError(collection, "InvalidSignature");
    });

    it("reverts if stage didn't start", async () => {
        const currentTimestamp = await time.latest();
        const inactiveStageMintParams = {
            ...mintParams,
            startTime: currentTimestamp + 86400,
            endTime: currentTimestamp + 186400,
        };

        const signature = await signMint(
            owner,
            inactiveStageMintParams,
            salt,
            allowedSigner,
        );

        await expect(
            collection.mintSigned(
                owner.address,
                3,
                inactiveStageMintParams,
                salt,
                signature,
                {
                    value: ethers.utils.parseUnits("0.3", "ether"),
                },
            ),
        ).to.revertedWithCustomError(collection, "StageNotActive");
    });

    it("reverts if stage ended", async () => {
        const signature = await signMint(
            owner,
            mintParams,
            salt,
            allowedSigner,
        );

        await time.increase(30 * 3600);

        await expect(
            collection.mintSigned(
                owner.address,
                3,
                mintParams,
                salt,
                signature,
                {
                    value: ethers.utils.parseUnits("0.3", "ether"),
                },
            ),
        ).to.revertedWithCustomError(collection, "StageNotActive");
    });
});
