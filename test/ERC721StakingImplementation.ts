import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { ZERO_ADDRESS } from "./helpers/consts";

describe("ERC721StakingImplementation", function () {
    let staking: Contract, collection: Contract, rewardToken: Contract;

    let owner: SignerWithAddress,
        user: SignerWithAddress,
        user2: SignerWithAddress;

    const initialRewardRate = 100;
    const initialRewardBalance = 10_000_000;

    const mintNftsAndApprove = async (
        recipient: SignerWithAddress,
        amount: number,
    ) => {
        await collection.mint(recipient.address, amount);
        await collection
            .connect(recipient)
            .setApprovalForAll(staking.address, true);
    };

    beforeEach(async function () {
        [owner, user, user2] = await ethers.getSigners();

        const TestERC721 = await ethers.getContractFactory("TestERC721");
        collection = await TestERC721.deploy();
        await collection.deployed();

        const TestERC20 = await ethers.getContractFactory("TestERC20");
        rewardToken = await TestERC20.deploy();
        await rewardToken.deployed();

        const ERC721StakingImplementation = await ethers.getContractFactory(
            "ERC721StakingImplementation",
        );
        staking = await ERC721StakingImplementation.deploy();
        await staking.deployed();

        await staking.initialize(
            collection.address,
            rewardToken.address,
            initialRewardRate,
        );

        await rewardToken.mint(staking.address, initialRewardBalance);

        await staking.toggleStaking();

        await mintNftsAndApprove(user, 5);
    });

    describe("initialization", () => {
        it("initializes NFT token address", async () => {
            expect(await staking.nftToken()).to.equal(collection.address);
        });

        it("initializes reward token address", async () => {
            expect(await staking.rewardToken()).to.equal(rewardToken.address);
        });

        it("initializes reward phase", async () => {
            const rewardPhase = await staking.rewardPhases(0);
            expect(rewardPhase.rewardsPerSecond).to.equal(initialRewardRate);
        });
    });

    describe("stakeNft", () => {
        it("stakes", async () => {
            await staking.connect(user).stakeNft(0);

            const stakerInfo = await staking.stakersInfo(user.address);
            expect(stakerInfo.amountStaked).to.equal(1);

            expect(await staking.stakedNftOwners(0)).to.equal(user.address);
        });

        it("stakes multiple NFTs", async () => {
            await staking.connect(user).stakeNft(0);
            await staking.connect(user).stakeNft(1);
            await staking.connect(user).stakeNft(2);

            const stakerInfo = await staking.stakersInfo(user.address);
            expect(stakerInfo.amountStaked).to.equal(3);

            expect(await staking.stakedNftOwners(0)).to.equal(user.address);
            expect(await staking.stakedNftOwners(1)).to.equal(user.address);
            expect(await staking.stakedNftOwners(2)).to.equal(user.address);
        });

        it("reverts if staking is paused", async () => {
            await staking.toggleStaking();

            await expect(
                staking.connect(user).stakeNft(0),
            ).to.be.revertedWithCustomError(staking, "StakingPaused");
        });

        it("emits NftStaked event", async () => {
            await expect(staking.connect(user).stakeNft(0))
                .to.emit(staking, "NftStaked")
                .withArgs(user.address, 0);
        });
    });

    describe("unstakeNft", () => {
        it("unstakes", async () => {
            await staking.connect(user).stakeNft(0);
            await staking.connect(user).unstakeNft(0);

            const stakerInfo = await staking.stakersInfo(user.address);
            expect(stakerInfo.amountStaked).to.equal(0);

            expect(await staking.stakedNftOwners(0)).to.equal(ZERO_ADDRESS);
        });

        it("reverts if caller is not owner of staked NFT", async () => {
            await staking.connect(user).stakeNft(0);

            await expect(
                staking.connect(user2).unstakeNft(0),
            ).to.be.revertedWithCustomError(staking, "NotStakedNftOwner");
        });

        it("emits NftUnstaked event", async () => {
            await staking.connect(user).stakeNft(0);

            await expect(staking.connect(user).unstakeNft(0))
                .to.emit(staking, "NftUnstaked")
                .withArgs(user.address, 0);
        });
    });

    describe("claimRewards", () => {
        it("claims", async () => {
            const elapsedTime = 5000;

            await staking.connect(user).stakeNft(0);

            const timestamp = await time.latest();
            await time.setNextBlockTimestamp(timestamp + elapsedTime);

            const balanceBefore = await rewardToken.balanceOf(user.address);
            await staking.connect(user).claimRewards();
            const balanceAfter = await rewardToken.balanceOf(user.address);
            expect(balanceAfter.sub(balanceBefore)).to.equal(
                elapsedTime * initialRewardRate,
            );
        });

        it("claims correct amount after multiple reward changes", async () => {
            const elapsedTime1 = 5000;
            const elapsedTime2 = 7500;
            const elapsedTime3 = 4000;
            const rewardRate1 = 200;
            const rewardRate2 = 150;

            await staking.connect(user).stakeNft(0);

            let timestamp = await time.latest();
            await time.setNextBlockTimestamp(timestamp + elapsedTime1);

            await staking.updateRewardRate(rewardRate1);

            timestamp = await time.latest();
            await time.setNextBlockTimestamp(timestamp + elapsedTime2);

            await staking.updateRewardRate(rewardRate2);

            timestamp = await time.latest();
            await time.setNextBlockTimestamp(timestamp + elapsedTime3);

            const balanceBefore = await rewardToken.balanceOf(user.address);
            await staking.connect(user).claimRewards();
            const balanceAfter = await rewardToken.balanceOf(user.address);
            expect(balanceAfter.sub(balanceBefore)).to.equal(
                elapsedTime1 * initialRewardRate +
                    elapsedTime2 * rewardRate1 +
                    elapsedTime3 * rewardRate2,
            );
        });

        it("claims after unstaking NFTs", async () => {
            await staking.connect(user).stakeNft(0);

            await time.increase(4000);

            await staking.connect(user).unstakeNft(0);

            await time.increase(3000);

            await staking.connect(user).claimRewards();
        });

        it("reverts if there are not rewards to claim", async () => {
            await expect(
                staking.connect(user).claimRewards(),
            ).to.be.revertedWithCustomError(staking, "NoRewardsToClaim");
        });

        it("emits RewardsClaimed event", async () => {
            const elapsedTime = 2000;

            await staking.connect(user).stakeNft(0);
            const timestamp = await time.latest();

            await time.setNextBlockTimestamp(timestamp + elapsedTime);

            await expect(staking.connect(user).claimRewards())
                .to.emit(staking, "RewardsClaimed")
                .withArgs(user.address, elapsedTime * initialRewardRate);
        });
    });

    describe("getStakerUnclaimedRewards", () => {
        it("returns", async () => {
            const elapsedTime = 2000;

            await staking.connect(user).stakeNft(0);

            await time.increase(elapsedTime);

            const unclaimedRewards = await staking.getStakerUnclaimedRewards(
                user.address,
            );
            expect(unclaimedRewards).to.equal(elapsedTime * initialRewardRate);
        });

        it("returns correct amount after multiple reward changes", async () => {
            const elapsedTime1 = 5000;
            const elapsedTime2 = 7500;
            const elapsedTime3 = 4000;
            const rewardRate1 = 200;
            const rewardRate2 = 150;

            await staking.connect(user).stakeNft(0);

            let timestamp = await time.latest();
            await time.setNextBlockTimestamp(timestamp + elapsedTime1);

            await staking.updateRewardRate(rewardRate1);

            timestamp = await time.latest();
            await time.setNextBlockTimestamp(timestamp + elapsedTime2);

            await staking.updateRewardRate(rewardRate2);

            await time.increase(elapsedTime3);

            const unclaimedRewards = await staking.getStakerUnclaimedRewards(
                user.address,
            );
            expect(unclaimedRewards).to.equal(
                elapsedTime1 * initialRewardRate +
                    elapsedTime2 * rewardRate1 +
                    elapsedTime3 * rewardRate2,
            );
        });
    });

    describe("updateRewardRate", () => {
        it("updates", async () => {
            await staking.updateRewardRate(200);

            const rewardPhase = await staking.rewardPhases(1);
            expect(rewardPhase.rewardsPerSecond).to.equal(200);
        });

        it("reverts if new reward rate is same as previous", async () => {
            await expect(
                staking.updateRewardRate(100),
            ).to.be.revertedWithCustomError(staking, "SameRewardRate");
        });

        it("reverts if caller is not contract owner", async () => {
            await expect(
                staking.connect(user).updateRewardRate(200),
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("emits RewardRateUpdated event", async () => {
            await expect(staking.updateRewardRate(200))
                .to.emit(staking, "RewardRateUpdated")
                .withArgs(200);
        });
    });

    describe("toggleStaking", () => {
        it("toggles", async () => {
            await staking.toggleStaking();
            expect(await staking.isStakingEnabled()).to.equal(false);

            await staking.toggleStaking();
            expect(await staking.isStakingEnabled()).to.equal(true);
        });

        it("reverts if caller is not contract owner", async () => {
            await expect(
                staking.connect(user).toggleStaking(),
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("withdrawERC20Tokens", () => {
        it("withdraws", async () => {
            const tokenAmount = 1000;

            const balanceBefore = await rewardToken.balanceOf(owner.address);
            await staking.withdrawERC20Tokens(tokenAmount, owner.address);
            const balanceAfter = await rewardToken.balanceOf(owner.address);
            expect(balanceAfter.sub(balanceBefore)).to.equal(tokenAmount);
        });

        it("reverts if caller is not contract owner", async () => {
            await expect(
                staking.connect(user).withdrawERC20Tokens(1000, user.address),
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("depositERC20Tokens", () => {
        it("deposits", async () => {
            const tokenAmount = 1000;

            await rewardToken.mint(owner.address, tokenAmount);
            await rewardToken.approve(staking.address, tokenAmount);

            const balanceBefore = await rewardToken.balanceOf(staking.address);
            await staking.depositERC20Tokens(tokenAmount, owner.address);
            const balanceAfter = await rewardToken.balanceOf(staking.address);
            expect(balanceAfter.sub(balanceBefore)).to.equal(tokenAmount);
        });

        it("reverts if caller is not contract owner", async () => {
            const tokenAmount = 1000;

            await rewardToken.mint(owner.address, tokenAmount);
            await rewardToken.approve(staking.address, tokenAmount);

            await expect(
                staking
                    .connect(user)
                    .depositERC20Tokens(tokenAmount, owner.address),
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });
});
