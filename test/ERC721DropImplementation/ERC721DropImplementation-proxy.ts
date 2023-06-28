import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { getMerkleProof, getMerkleTreeRoot } from "../helpers/merkleTree";

describe("ERC721DropImplementation-proxy", function () {
    let collection: Contract, testERC721: Contract;

    let owner: SignerWithAddress,
        allowlistUser: SignerWithAddress,
        allowlistUser2: SignerWithAddress;

    let allowlist: string[];

    const initialMaxSupply = 4000;

    const PREPARED_MINT_STAGE_ID = 1;

    const PUBLIC_STAGE_INDEX = 0;
    const ALLOWLIST_STAGE_INDEX = 1;
    const TOKEN_GATED_STAGE_INDEX = 2;

    beforeEach(async function () {
        [owner, allowlistUser, allowlistUser2] = await ethers.getSigners();

        const ERC721DropImplementation = await ethers.getContractFactory(
            "ERC721DropImplementation",
        );
        const implementation = await ERC721DropImplementation.deploy();
        await implementation.deployed();

        const ERC721Proxy = await ethers.getContractFactory("TestERC721Proxy");
        const erc721Proxy = await ERC721Proxy.deploy(
            "Blank Studio Collection",
            "BSC",
            implementation.address,
        );
        await erc721Proxy.deployed();

        collection = ERC721DropImplementation.attach(erc721Proxy.address);
    });

    describe("mintPublic", () => {
        beforeEach(async function () {
            // Configure max supply
            await collection.updateMaxSupply(initialMaxSupply);

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

        it("emits correct stage index", async () => {
            await expect(
                collection.mintPublic(owner.address, 3, {
                    value: ethers.utils.parseUnits("0.3", "ether"),
                }),
            )
                .to.emit(collection, "Minted")
                .withArgs(owner.address, 3, PUBLIC_STAGE_INDEX);
        });
    });

    describe("mintAllowlist", () => {
        beforeEach(async function () {
            allowlist = [allowlistUser.address, allowlistUser2.address];

            // Configure max supply
            await collection.updateMaxSupply(initialMaxSupply);

            const currentTimestamp = await time.latest();

            // Configure allowlist stage
            await collection.updateAllowlistMintStage({
                id: PREPARED_MINT_STAGE_ID,
                data: {
                    mintPrice: ethers.utils.parseUnits("0.1", "ether"),
                    startTime: currentTimestamp, // start right away
                    endTime: currentTimestamp + 86400, // last 24 hours
                    mintLimitPerWallet: 2,
                    maxSupplyForStage: 4000,
                    merkleRoot: `0x${getMerkleTreeRoot(allowlist)}`,
                },
            });

            // Increase time by 1 hour
            await time.increase(3600);
        });

        it("emits correct stage index", async () => {
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
                .withArgs(allowlistUser.address, 2, ALLOWLIST_STAGE_INDEX);
        });
    });

    describe("mintTokenGated", () => {
        beforeEach(async function () {
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
                data: {
                    mintPrice: ethers.utils.parseUnits("0.1", "ether"),
                    startTime: currentTimestamp, // start right away
                    endTime: currentTimestamp + 86400, // last 24 hours
                    mintLimitPerWallet: 3,
                    maxSupplyForStage: 100,
                },
            });

            // Increase time by 1 hour
            await time.increase(3600);
        });

        it("emits correct stage index", async () => {
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
                .withArgs(owner.address, 3, TOKEN_GATED_STAGE_INDEX);
        });
    });
});
