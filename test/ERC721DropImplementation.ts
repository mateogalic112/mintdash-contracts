import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract } from 'ethers';
import { time } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import { getMerkleProof, getMerkleTreeRoot } from './helpers/merkleTree';
import { defaultBytes32 } from './helpers/consts';

describe('ERC721DropImplementation', function() {
  let collection: Contract;

  let owner: SignerWithAddress,
    allowlistUser: SignerWithAddress,
    allowlistUser2: SignerWithAddress,
    userWithoutAllowlist: SignerWithAddress,
    randomUser: SignerWithAddress;

  let allowlist: string[];

  const initialMaxSupply = 4000;
  const initialBaseURI =
    'ipfs://QmSBxebqcuP8GyUxaFVEDqpsmbcjNMxg5y3i1UAHLkhHg5/';

  const initialRoyaltiesRecipient =
    '0xE5F135b20F496189FB6C915bABc53e0A70Ff6A1f';
  const initialRoyaltiesFee = 1000;

  beforeEach(async function() {
    [
      owner,
      allowlistUser,
      allowlistUser2,
      userWithoutAllowlist,
      randomUser,
    ] = await ethers.getSigners();

    allowlist = [allowlistUser.address, allowlistUser2.address];

    const ERC721DropImplementation = await ethers.getContractFactory(
      'ERC721DropImplementation',
    );
    collection = await ERC721DropImplementation.deploy();
    await collection.deployed();

    // Initialize
    await collection.initialize('Blank Studio Collection', 'BSC');

    // Configure royalties
    await collection.updateRoyalties(
      initialRoyaltiesRecipient,
      initialRoyaltiesFee,
    );

    // Configure base URI
    await collection.updateBaseURI(initialBaseURI);

    // Configure max supply
    await collection.updateMaxSupply(initialMaxSupply);
  });

  describe('Public mint stage', () => {
    beforeEach(async () => {
      const currentTimestamp = await time.latest();

      // Configure public stage
      await collection.updatePublicMintStage({
        mintPrice: ethers.utils.parseUnits('0.1', 'ether'),
        startTime: currentTimestamp, // start right away
        endTime: currentTimestamp + 86400, // last 24 hours
        mintLimitPerWallet: 3,
      });
      // Increase time by 1 hour
      await time.increase(3600);
    });

    it('mints', async () => {
      // Mint 3 tokens
      await collection.mintPublic(3, {
        value: ethers.utils.parseUnits('0.3', 'ether'), // 3 * 0.1 ETH
      });

      // Check account token balance
      expect(await collection.balanceOf(owner.address)).to.eq(3);
    });

    it('emits Minted event', async () => {
      await expect(
        collection.mintPublic(3, {
          value: ethers.utils.parseUnits('0.3', 'ether'), // 3 * 0.1 ETH
        }),
      )
        .to.emit(collection, 'Minted')
        .withArgs(owner.address, 3, 0);
    });

    it('reverts if not enough ETH is provided', async () => {
      await expect(
        collection.mintPublic(3, {
          value: ethers.utils.parseUnits('0.2', 'ether'),
        }),
      ).to.revertedWithCustomError(collection, 'IncorrectFundsProvided');
    });

    it('reverts if over mint limit per wallet', async () => {
      // Revert if over limit in single transaction
      await expect(
        collection.mintPublic(4, {
          value: ethers.utils.parseUnits('0.4', 'ether'),
        }),
      ).to.revertedWithCustomError(
        collection,
        'MintQuantityExceedsWalletLimit',
      );

      // Revert if over limit in multiple transactons
      await collection.mintPublic(1, {
        value: ethers.utils.parseUnits('0.1', 'ether'),
      });

      await expect(
        collection.mintPublic(3, {
          value: ethers.utils.parseUnits('0.3', 'ether'),
        }),
      ).to.revertedWithCustomError(
        collection,
        'MintQuantityExceedsWalletLimit',
      );
    });

    it('reverts if over max supply', async () => {
      // Update max supply
      await collection.updateMaxSupply(2);

      await expect(
        collection.mintPublic(3, {
          value: ethers.utils.parseUnits('0.3', 'ether'),
        }),
      ).to.revertedWithCustomError(collection, 'MintQuantityExceedsMaxSupply');
    });

    it('reverts if not active', async () => {
      // Travel 30 hours in the future
      await time.increase(30 * 3600);

      await expect(
        collection.mintPublic(3, {
          value: ethers.utils.parseUnits('0.3', 'ether'),
        }),
      ).to.revertedWithCustomError(collection, 'StageNotActive');
    });
  });

  describe('Allowlist mint stage', () => {
    beforeEach(async () => {
      const currentTimestamp = await time.latest();

      // Configure allowlist stage
      await collection.updateAllowlistMintStage({
        mintPrice: ethers.utils.parseUnits('0.1', 'ether'),
        startTime: currentTimestamp, // start right away
        endTime: currentTimestamp + 86400, // last 24 hours
        mintLimitPerWallet: 2,
        merkleRoot: `0x${getMerkleTreeRoot(allowlist)}`,
      });

      // Increase time by 1 hour
      await time.increase(3600);
    });

    it('mints', async () => {
      // Mint 3 tokens
      await collection
        .connect(allowlistUser)
        .mintAllowlist(2, getMerkleProof(allowlist, allowlistUser.address), {
          value: ethers.utils.parseUnits('0.2', 'ether'), // 3 * 0.1 ETH
        });

      // Check account token balance
      expect(await collection.balanceOf(allowlistUser.address)).to.eq(2);
    });

    it('emits Minted event', async () => {
      await expect(
        collection
          .connect(allowlistUser)
          .mintAllowlist(2, getMerkleProof(allowlist, allowlistUser.address), {
            value: ethers.utils.parseUnits('0.2', 'ether'), // 3 * 0.1 ETH
          }),
      )
        .to.emit(collection, 'Minted')
        .withArgs(allowlistUser.address, 2, 1);
    });

    it('reverts if not enough ETH is provided', async () => {
      await expect(
        collection
          .connect(allowlistUser)
          .mintAllowlist(2, getMerkleProof(allowlist, allowlistUser.address), {
            value: ethers.utils.parseUnits('0.1', 'ether'), // 3 * 0.1 ETH
          }),
      ).to.revertedWithCustomError(collection, 'IncorrectFundsProvided');
    });

    it('reverts if over mint limit per wallet', async () => {
      // Revert if over limit in single transaction
      await expect(
        collection
          .connect(allowlistUser)
          .mintAllowlist(3, getMerkleProof(allowlist, allowlistUser.address), {
            value: ethers.utils.parseUnits('0.3', 'ether'), // 3 * 0.1 ETH
          }),
      ).to.revertedWithCustomError(
        collection,
        'MintQuantityExceedsWalletLimit',
      );

      // Revert if over limit in multiple transactons
      await collection
        .connect(allowlistUser)
        .mintAllowlist(1, getMerkleProof(allowlist, allowlistUser.address), {
          value: ethers.utils.parseUnits('0.1', 'ether'), // 3 * 0.1 ETH
        });

      await expect(
        collection
          .connect(allowlistUser)
          .mintAllowlist(2, getMerkleProof(allowlist, allowlistUser.address), {
            value: ethers.utils.parseUnits('0.2', 'ether'), // 3 * 0.1 ETH
          }),
      ).to.revertedWithCustomError(
        collection,
        'MintQuantityExceedsWalletLimit',
      );
    });

    it('reverts if over max supply', async () => {
      // Update max supply
      await collection.updateMaxSupply(2);

      await collection
        .connect(allowlistUser)
        .mintAllowlist(2, getMerkleProof(allowlist, allowlistUser.address), {
          value: ethers.utils.parseUnits('0.2', 'ether'),
        });

      await expect(
        collection
          .connect(allowlistUser2)
          .mintAllowlist(2, getMerkleProof(allowlist, allowlistUser2.address), {
            value: ethers.utils.parseUnits('0.2', 'ether'),
          }),
      ).to.revertedWithCustomError(collection, 'MintQuantityExceedsMaxSupply');
    });

    it('reverts if not active', async () => {
      // Travel 30 hours in the future
      await time.increase(30 * 3600);

      await expect(
        collection
          .connect(allowlistUser)
          .mintAllowlist(1, getMerkleProof(allowlist, allowlistUser.address), {
            value: ethers.utils.parseUnits('0.1', 'ether'), // 3 * 0.1 ETH
          }),
      ).to.revertedWithCustomError(collection, 'StageNotActive');
    });

    it('reverts if not on allowlist', async () => {
      await expect(
        collection.mintAllowlist(1, getMerkleProof(allowlist, owner.address), {
          value: ethers.utils.parseUnits('0.1', 'ether'), // 3 * 0.1 ETH
        }),
      ).to.revertedWithCustomError(collection, 'InvalidProof');
    });

    it('reverts if using proof from other user on the allowlist', async () => {
      await expect(
        collection
          .connect(allowlistUser)
          .mintAllowlist(1, getMerkleProof(allowlist, allowlistUser2.address), {
            value: ethers.utils.parseUnits('0.1', 'ether'), // 3 * 0.1 ETH
          }),
      ).to.revertedWithCustomError(collection, 'InvalidProof');
    });
  });

  describe('updatePublicMintStage', () => {
    it('updates', async () => {
      // Check current config
      const currentConfig = await collection.publicMintStage();
      expect(currentConfig.mintPrice).to.equal(0);
      expect(currentConfig.startTime).to.equal(0);
      expect(currentConfig.endTime).to.equal(0);
      expect(currentConfig.mintLimitPerWallet).to.equal(0);

      // Update config
      const newConfigData = {
        mintPrice: '100000000000000000', // 0.1 ETH
        startTime: 1676043287,
        endTime: 1686043287,
        mintLimitPerWallet: 5,
      };
      await collection.updatePublicMintStage(newConfigData);

      // Check updated config
      const updatedConfig = await collection.publicMintStage();
      expect(updatedConfig.mintPrice).to.equal(newConfigData.mintPrice);
      expect(updatedConfig.startTime).to.equal(newConfigData.startTime);
      expect(updatedConfig.endTime).to.equal(newConfigData.endTime);
      expect(updatedConfig.mintLimitPerWallet).to.equal(
        newConfigData.mintLimitPerWallet,
      );
    });

    it('reverts if caller is not contract owner', async () => {
      await expect(
        collection.connect(randomUser).updatePublicMintStage({
          mintPrice: '100000000000000000', // 0.1 ETH
          startTime: 1676043287,
          endTime: 1686043287,
          mintLimitPerWallet: 5,
        }),
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });
  });

  describe('updateAllowlistMintStage', () => {
    it('updates', async () => {
      // Check current config
      const currentConfig = await collection.allowlistMintStage();
      expect(currentConfig.mintPrice).to.equal(0);
      expect(currentConfig.startTime).to.equal(0);
      expect(currentConfig.endTime).to.equal(0);
      expect(currentConfig.mintLimitPerWallet).to.equal(0);
      expect(currentConfig.merkleRoot).to.equal(defaultBytes32);

      // Update config
      const newConfigData = {
        mintPrice: '100000000000000000', // 0.1 ETH
        startTime: 1676043287, // 0.1 ETH
        endTime: 1686043287, // 0.1 ETH
        mintLimitPerWallet: 5,
        merkleRoot: `0x${getMerkleTreeRoot([owner.address])}`,
      };
      await collection.updateAllowlistMintStage(newConfigData);

      // Check updated config
      const updatedConfig = await collection.allowlistMintStage();
      expect(updatedConfig.mintPrice).to.equal(newConfigData.mintPrice);
      expect(updatedConfig.startTime).to.equal(newConfigData.startTime);
      expect(updatedConfig.endTime).to.equal(newConfigData.endTime);
      expect(updatedConfig.mintLimitPerWallet).to.equal(
        newConfigData.mintLimitPerWallet,
      );
      expect(updatedConfig.merkleRoot).to.equal(newConfigData.merkleRoot);
    });

    it('reverts if caller is not contract owner', async () => {
      await expect(
        collection.connect(randomUser).updateAllowlistMintStage({
          mintPrice: '100000000000000000', // 0.1 ETH
          startTime: 1676043287, // 0.1 ETH
          endTime: 1686043287, // 0.1 ETH
          mintLimitPerWallet: 5,
          merkleRoot: `0x${getMerkleTreeRoot([owner.address])}`,
        }),
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });
  });

  describe('updateMaxSupply', () => {
    it('updates', async () => {
      // Check current max supply
      expect(await collection.maxSupply()).to.eq(initialMaxSupply);

      // Update max supply
      const newMaxSupply = 10000;
      await collection.updateMaxSupply(newMaxSupply);

      // Check updated max supply
      expect(await collection.maxSupply()).to.eq(newMaxSupply);
    });

    it('reverts if caller is not contract owner', async () => {
      await expect(
        collection.connect(randomUser).updateMaxSupply(1500),
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });
  });

  describe('updateOperatorFilterer', () => {
    it('updates', async () => {
      // Check current state
      expect(await collection.operatorFiltererEnabled()).to.eq(false);

      // Enable operator filterer
      await collection.updateOperatorFilterer(true);

      // Check updated max supply
      expect(await collection.operatorFiltererEnabled()).to.eq(true);
    });

    it('reverts if caller is not contract owner', async () => {
      await expect(
        collection.connect(randomUser).updateOperatorFilterer(true),
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });
  });

  describe('updateBaseURI', () => {
    it('updates', async () => {
      // Check current base URI
      expect(await collection.baseURI()).to.eq(initialBaseURI);

      // Update base URI
      const newBaseURI = 'ipfs://QmSBxebqcuP8GyUxaFVEDqpsmbcjNMxg5y3i1UAHLNEW/';
      await collection.updateBaseURI(newBaseURI);

      // Check updated base URI
      expect(await collection.baseURI()).to.eq(newBaseURI);
    });

    it('reverts if caller is not contract owner', async () => {
      await expect(
        collection
          .connect(randomUser)
          .updateBaseURI(
            'ipfs://QmSBxebqcuP8GyUxaFVEDqpsmbcjNMxg5y3i1UAHLNEW/',
          ),
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });
  });

  describe('updateRoyalties', () => {
    it('updates', async () => {
      // Check royalty info for token with ID 1
      const [receiver, amount] = await collection.royaltyInfo(
        1,
        ethers.utils.parseUnits('1', 'ether'),
      );

      expect(receiver).to.eq(initialRoyaltiesRecipient);
      expect(amount).to.eq(ethers.utils.parseUnits('0.1', 'ether'));

      // Update base URI
      const newReceiver = randomUser.address;
      const newFeeNumerator = 5000;
      await collection.updateRoyalties(newReceiver, newFeeNumerator);

      // Check new royalty info for token with ID 1
      const [updatedReceiver, updatedAmount] = await collection.royaltyInfo(
        1,
        ethers.utils.parseUnits('1', 'ether'),
      );

      expect(updatedReceiver).to.eq(newReceiver);
      expect(updatedAmount).to.eq(ethers.utils.parseUnits('0.5', 'ether'));
    });

    it('reverts if caller is not contract owner', async () => {
      await expect(
        collection
          .connect(randomUser)
          .updateRoyalties(randomUser.address, 1000),
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });
  });

  describe('updateProvenanceHash', () => {
    it('updates', async () => {
      // Check provenance hash
      expect(await collection.provenanceHash()).to.eq(defaultBytes32);

      // Update provenance hash
      const newProvenanceHash = ethers.utils.id('image data');
      await collection.updateProvenanceHash(newProvenanceHash);

      // Check updated provenance hash
      expect(await collection.provenanceHash()).to.eq(newProvenanceHash);
    });

    it('reverts if caller is not contract owner', async () => {
      await expect(
        collection
          .connect(randomUser)
          .updateProvenanceHash(ethers.utils.id('image data')),
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });
  });

  describe('withdrawAllFunds', () => {
    const fundContract = async () => {
      // Setup public mint stage
      const currentTimestamp = await time.latest();
      await collection.updatePublicMintStage({
        mintPrice: ethers.utils.parseUnits('0.1', 'ether'),
        startTime: currentTimestamp, // start right away
        endTime: currentTimestamp + 86400, // last 24 hours
        mintLimitPerWallet: 3,
      });
      await time.increase(3600);

      // Mint few tokens
      await collection.mintPublic(3, {
        value: ethers.utils.parseUnits('0.3', 'ether'),
      });

      await collection.connect(allowlistUser).mintPublic(3, {
        value: ethers.utils.parseUnits('0.3', 'ether'),
      });
    };
    it('withdraws', async () => {
      // Fund contract
      await fundContract();

      // Setup payout address
      await collection.updatePayoutAddress(allowlistUser2.address);

      // Withdraw and check balance change
      await expect(() => collection.withdrawAllFunds()).to.changeEtherBalance(
        allowlistUser2,
        ethers.utils.parseUnits('0.6', 'ether'),
      );
    });

    it('reverts if caller is not contract owner', async () => {
      await expect(
        collection.connect(randomUser).withdrawAllFunds(),
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('reverts if contract balance is zero', async () => {
      await expect(collection.withdrawAllFunds()).to.be.revertedWithCustomError(
        collection,
        'NothingToWithdraw',
      );
    });

    it('reverts if payout address is zero address', async () => {
      // Fund contract
      await fundContract();

      await expect(collection.withdrawAllFunds()).to.be.revertedWithCustomError(
        collection,
        'InvalidPayoutAddress',
      );
    });
  });
});
