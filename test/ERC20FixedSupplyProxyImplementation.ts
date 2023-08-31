import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("ERC20FixedSupplyProxyImplementation", function () {
    let token: Contract;

    let owner: SignerWithAddress;

    beforeEach(async function () {
        [owner] = await ethers.getSigners();

        const Token = await ethers.getContractFactory(
            "ERC20FixedSupplyProxyImplementation",
        );
        token = await Token.deploy();
        await token.deployed();

        // Initialize
        await token.initialize(
            "Blank Studio Token",
            "BST",
            owner.address,
            1000,
        );
    });

    describe("initialization", function () {
        it("initializes name", async () => {
            expect(await token.name()).to.equal("Blank Studio Token");
        });

        it("initializes symbol", async () => {
            expect(await token.symbol()).to.equal("BST");
        });

        it("initializes supply", async () => {
            expect(await token.balanceOf(owner.address)).to.equal(1000);
            expect(await token.totalSupply()).to.equal(1000);
        });
    });
});
