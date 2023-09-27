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
                paymentSplitter.initialize([], [4000, 6000]),
            ).to.be.revertedWithCustomError(
                paymentSplitter,
                "EmptyOrMismatchedArrays",
            );

            await expect(
                paymentSplitter.initialize(
                    [recipient1.address, recipient2.address],
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
                [recipient1.address, recipient2.address, recipient3.address],
                [4000, 1000, 5000],
            );

            expect(await paymentSplitter.getRecipients()).to.deep.equal([
                recipient1.address,
                recipient2.address,
                recipient3.address,
            ]);
        });
    });

    describe("releaseEth", () => {
        beforeEach(async function () {
            await paymentSplitter.initialize(
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

            // Send another 1 ETH to contract
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

    describe("releaseErc20", () => {
        beforeEach(async function () {
            await paymentSplitter.initialize(
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

            // Send another 10 tokens to contract
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
});
