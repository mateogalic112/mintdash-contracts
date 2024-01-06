import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("PaymentSplitterImplementation", function () {
    let paymentSplitter: Contract, erc20Token: Contract;

    let deployer: SignerWithAddress,
        recipient1: SignerWithAddress,
        recipient2: SignerWithAddress,
        recipient3: SignerWithAddress,
        randomUser: SignerWithAddress;

    const splitterName = "Blank Studio Splitter";

    beforeEach(async function () {
        [deployer, recipient1, recipient2, recipient3, randomUser] =
            await ethers.getSigners();

        const PaymentSplitterImplementation = await ethers.getContractFactory(
            "PaymentSplitterImplementation",
        );
        paymentSplitter = await PaymentSplitterImplementation.deploy();
        await paymentSplitter.deployed();

        const TestERC20 = await ethers.getContractFactory("TestERC20");
        erc20Token = await TestERC20.deploy();
        await erc20Token.deployed();
    });

    describe("initialize", () => {
        it("reverts if array of recipients or percentages are empty", async () => {
            await expect(
                paymentSplitter.initialize(splitterName, [], [4000, 6000]),
            ).to.be.revertedWithCustomError(
                paymentSplitter,
                "EmptyOrMismatchedArrays",
            );

            await expect(
                paymentSplitter.initialize(
                    splitterName,
                    [(recipient1.address, recipient2.address)],
                    [],
                ),
            ).to.be.revertedWithCustomError(
                paymentSplitter,
                "EmptyOrMismatchedArrays",
            );
        });

        it("reverts if arrays have mismatched length", async () => {
            await expect(
                paymentSplitter.initialize(
                    splitterName,
                    [recipient1.address, recipient2.address],
                    [4000, 5000, 1000],
                ),
            ).to.be.revertedWithCustomError(
                paymentSplitter,
                "EmptyOrMismatchedArrays",
            );
        });

        it("reverts if percentage is zero", async () => {
            await expect(
                paymentSplitter.initialize(
                    splitterName,
                    [
                        recipient1.address,
                        recipient2.address,
                        recipient3.address,
                    ],
                    [4000, 0, 6000],
                ),
            ).to.be.revertedWithCustomError(
                paymentSplitter,
                "InvalidPercentageAmount",
            );
        });

        it("reverts if recipient is duplicate", async () => {
            await expect(
                paymentSplitter.initialize(
                    splitterName,
                    [
                        recipient1.address,
                        recipient2.address,
                        recipient2.address,
                    ],
                    [4000, 1000, 5000],
                ),
            ).to.be.revertedWithCustomError(
                paymentSplitter,
                "DuplicateRecipient",
            );
        });

        it("reverts if sum of percentages is not equal to denominator", async () => {
            await expect(
                paymentSplitter.initialize(
                    splitterName,
                    [
                        recipient1.address,
                        recipient2.address,
                        recipient3.address,
                    ],
                    [4000, 999, 5000],
                ),
            ).to.be.revertedWithCustomError(
                paymentSplitter,
                "InvalidPercentageAmount",
            );

            await expect(
                paymentSplitter.initialize(
                    splitterName,
                    [
                        recipient1.address,
                        recipient2.address,
                        recipient3.address,
                    ],
                    [4000, 1001, 5000],
                ),
            ).to.be.revertedWithCustomError(
                paymentSplitter,
                "InvalidPercentageAmount",
            );
        });

        it("should initialize correctly if input is correct", async () => {
            await paymentSplitter.initialize(
                splitterName,
                [recipient1.address, recipient2.address, recipient3.address],
                [4000, 1000, 5000],
            );

            expect(await paymentSplitter.name()).to.equal(splitterName);

            expect(await paymentSplitter.getRecipients()).to.deep.equal([
                recipient1.address,
                recipient2.address,
                recipient3.address,
            ]);

            expect(await paymentSplitter.getSplitConfiguration()).to.deep.equal(
                [
                    [
                        recipient1.address,
                        recipient2.address,
                        recipient3.address,
                    ],
                    [4000, 1000, 5000],
                ],
            );

            expect(
                await paymentSplitter.percentages(recipient1.address),
            ).to.equal(4000);
            expect(
                await paymentSplitter.percentages(recipient2.address),
            ).to.equal(1000);
            expect(
                await paymentSplitter.percentages(recipient3.address),
            ).to.equal(5000);
        });
    });

    describe("releaseEth", () => {
        beforeEach(async function () {
            await paymentSplitter.initialize(
                splitterName,
                [recipient1.address, recipient2.address, recipient3.address],
                [4000, 1000, 5000],
            );
        });

        it("reverts if caller release to invalid recipient", async () => {
            await expect(
                paymentSplitter.releaseEth(randomUser.address),
            ).to.be.revertedWithCustomError(
                paymentSplitter,
                "InvalidRecipient",
            );
        });

        it("reverts if there is no funds to release", async () => {
            await expect(
                paymentSplitter.releaseEth(recipient2.address),
            ).to.be.revertedWithCustomError(
                paymentSplitter,
                "NoFundsToRelease",
            );
        });

        it("reverts if releasing for same recipient twice in row", async () => {
            await deployer.sendTransaction({
                to: paymentSplitter.address,
                value: ethers.utils.parseEther("1"),
            });

            await expect(
                paymentSplitter.releaseEth(recipient2.address),
            ).to.changeEtherBalance(recipient2, ethers.utils.parseEther("0.1"));

            await expect(
                paymentSplitter.releaseEth(recipient2.address),
            ).to.be.revertedWithCustomError(
                paymentSplitter,
                "NoFundsToRelease",
            );
        });

        it("should release correct amount to recipients", async () => {
            await deployer.sendTransaction({
                to: paymentSplitter.address,
                value: ethers.utils.parseEther("1"),
            });

            await expect(
                paymentSplitter.releaseEth(recipient2.address),
            ).to.changeEtherBalance(recipient2, ethers.utils.parseEther("0.1"));

            await deployer.sendTransaction({
                to: paymentSplitter.address,
                value: ethers.utils.parseEther("1"),
            });

            await expect(
                paymentSplitter.releaseEth(recipient2.address),
            ).to.changeEtherBalance(recipient2, ethers.utils.parseEther("0.1"));

            await expect(
                paymentSplitter.releaseEth(recipient1.address),
            ).to.changeEtherBalance(recipient1, ethers.utils.parseEther("0.8"));

            await expect(
                paymentSplitter.releaseEth(recipient3.address),
            ).to.changeEtherBalance(recipient3, ethers.utils.parseEther("1"));

            expect(
                await ethers.provider.getBalance(paymentSplitter.address),
            ).to.equal(0);
        });
    });

    describe("releaseEthToAll", () => {
        beforeEach(async function () {
            await paymentSplitter.initialize(
                splitterName,
                [recipient1.address, recipient2.address, recipient3.address],
                [4000, 1000, 5000],
            );
        });

        it("should release correct amount to recipients", async () => {
            await deployer.sendTransaction({
                to: paymentSplitter.address,
                value: ethers.utils.parseEther("1"),
            });

            await expect(
                paymentSplitter.releaseEthToAll(),
            ).to.changeEtherBalances(
                [recipient1, recipient2, recipient3],
                [
                    ethers.utils.parseEther("0.4"),
                    ethers.utils.parseEther("0.1"),
                    ethers.utils.parseEther("0.5"),
                ],
            );
        });

        it("should release correct amount if balance is tiny", async () => {
            await deployer.sendTransaction({
                to: paymentSplitter.address,
                value: 9,
            });

            const startingBalance1 = await ethers.provider.getBalance(
                recipient1.address,
            );
            const startingBalance2 = await ethers.provider.getBalance(
                recipient2.address,
            );
            const startingBalance3 = await ethers.provider.getBalance(
                recipient3.address,
            );

            await expect(
                paymentSplitter.releaseEthToAll(),
            ).to.changeEtherBalances(
                [recipient1, recipient2, recipient3],
                [3, 0, 4],
            );

            await deployer.sendTransaction({
                to: paymentSplitter.address,
                value: ethers.utils.parseEther("1").sub(9),
            });

            await paymentSplitter.releaseEthToAll();

            const finalBalance1 = await ethers.provider.getBalance(
                recipient1.address,
            );
            const finalBalance2 = await ethers.provider.getBalance(
                recipient2.address,
            );
            const finalBalance3 = await ethers.provider.getBalance(
                recipient3.address,
            );

            expect(finalBalance1.sub(startingBalance1)).to.equal(
                ethers.utils.parseEther("0.4"),
            );
            expect(finalBalance2.sub(startingBalance2)).to.equal(
                ethers.utils.parseEther("0.1"),
            );
            expect(finalBalance3.sub(startingBalance3)).to.equal(
                ethers.utils.parseEther("0.5"),
            );
        });
    });

    describe("releaseErc20", () => {
        beforeEach(async function () {
            await paymentSplitter.initialize(
                splitterName,
                [recipient1.address, recipient2.address, recipient3.address],
                [4000, 1000, 5000],
            );
        });

        it("reverts if caller release to invalid recipient", async () => {
            await expect(
                paymentSplitter.releaseErc20(
                    erc20Token.address,
                    randomUser.address,
                ),
            ).to.be.revertedWithCustomError(
                paymentSplitter,
                "InvalidRecipient",
            );
        });

        it("reverts if there is no funds to release", async () => {
            await expect(
                paymentSplitter.releaseErc20(
                    erc20Token.address,
                    recipient2.address,
                ),
            ).to.be.revertedWithCustomError(
                paymentSplitter,
                "NoFundsToRelease",
            );
        });

        it("reverts if releasing for same recipient twice in row", async () => {
            await erc20Token.mint(
                paymentSplitter.address,
                ethers.utils.parseEther("10"),
            );

            await expect(
                paymentSplitter.releaseErc20(
                    erc20Token.address,
                    recipient2.address,
                ),
            ).to.changeTokenBalance(
                erc20Token,
                recipient2,
                ethers.utils.parseEther("1"),
            );

            await expect(
                paymentSplitter.releaseErc20(
                    erc20Token.address,
                    recipient2.address,
                ),
            ).to.be.revertedWithCustomError(
                paymentSplitter,
                "NoFundsToRelease",
            );
        });

        it("should release correct amount to recipients", async () => {
            await erc20Token.mint(
                paymentSplitter.address,
                ethers.utils.parseEther("10"),
            );

            await expect(
                paymentSplitter.releaseErc20(
                    erc20Token.address,
                    recipient2.address,
                ),
            ).to.changeTokenBalance(
                erc20Token,
                recipient2,
                ethers.utils.parseEther("1"),
            );

            await erc20Token.mint(
                paymentSplitter.address,
                ethers.utils.parseEther("10"),
            );

            await expect(
                paymentSplitter.releaseErc20(
                    erc20Token.address,
                    recipient2.address,
                ),
            ).to.changeTokenBalance(
                erc20Token,
                recipient2,
                ethers.utils.parseEther("1"),
            );

            await expect(
                paymentSplitter.releaseErc20(
                    erc20Token.address,
                    recipient1.address,
                ),
            ).to.changeTokenBalance(
                erc20Token,
                recipient1,
                ethers.utils.parseEther("8"),
            );

            await expect(
                paymentSplitter.releaseErc20(
                    erc20Token.address,
                    recipient3.address,
                ),
            ).to.changeTokenBalance(
                erc20Token,
                recipient3,
                ethers.utils.parseEther("10"),
            );

            expect(
                await erc20Token.balanceOf(paymentSplitter.address),
            ).to.equal(0);
        });
    });

    describe("releaseErc20ToAll", () => {
        beforeEach(async function () {
            await paymentSplitter.initialize(
                splitterName,
                [recipient1.address, recipient2.address, recipient3.address],
                [4000, 1000, 5000],
            );
        });

        it("should release correct amount to recipients", async () => {
            await erc20Token.mint(
                paymentSplitter.address,
                ethers.utils.parseEther("10"),
            );

            await expect(
                paymentSplitter.releaseErc20ToAll(erc20Token.address),
            ).to.changeTokenBalances(
                erc20Token,
                [recipient1, recipient2, recipient3],
                [
                    ethers.utils.parseEther("4"),
                    ethers.utils.parseEther("1"),
                    ethers.utils.parseEther("5"),
                ],
            );
        });

        it("should release correct amount if balance is tiny", async () => {
            await erc20Token.mint(paymentSplitter.address, 9);

            await expect(
                paymentSplitter.releaseErc20ToAll(erc20Token.address),
            ).to.changeTokenBalances(
                erc20Token,
                [recipient1, recipient2, recipient3],
                [3, 0, 4],
            );

            await erc20Token.mint(
                paymentSplitter.address,
                ethers.utils.parseEther("1").sub(9),
            );

            await paymentSplitter.releaseErc20ToAll(erc20Token.address);

            const balance1 = await erc20Token.balanceOf(recipient1.address);
            const balance2 = await erc20Token.balanceOf(recipient2.address);
            const balance3 = await erc20Token.balanceOf(recipient3.address);

            expect(balance1).to.equal(ethers.utils.parseEther("0.4"));
            expect(balance2).to.equal(ethers.utils.parseEther("0.1"));
            expect(balance3).to.equal(ethers.utils.parseEther("0.5"));
        });
    });
});
