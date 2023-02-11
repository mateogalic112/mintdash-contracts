const { expect } = require('chai');
const { ethers } = require('hardhat');
const { getMerkleProof, getMerkleTreeRoot } = require('./helpers/merkleTree');

describe('ERC721DropImplementation', function() {
  let collection;
  let tokenPrice, tokenMaxSupply;
  let whitelistedProof1, whitelistedProof2;

  beforeEach(async function() {
    [
      owner,
      whitelisted1,
      whitelisted2,
      notWhitelisted,
      user,
    ] = await ethers.getSigners();

    const whitelist = [
      owner.address,
      whitelisted1.address,
      whitelisted2.address,
    ];

    const ERC721DropImplementation = await ethers.getContractFactory(
      'ERC721DropImplementation',
    );
    collection = await ERC721DropImplementation.deploy();
    await collection.deployed();

    // Initialize
    await collection.initialize('Blank Studio Collection', 'BSC');

    // Configure royalties
    await collection.updateRoyalties(
      '0xE5F135b20F496189FB6C915bABc53e0A70Ff6A1f',
      1000,
    );

    // Configure base URI
    await collection.updateBaseURI(
      'ipfs://QmSBxebqcuP8GyUxaFVEDqpsmbcjNMxg5y3i1UAHLkhHg5/',
    );

    // Configure max supply
    await collection.updateMaxSupply(4000);

    whitelistedProof1 = getMerkleProof(whitelist, whitelisted1.address);
    whitelistedProof2 = getMerkleProof(whitelist, whitelisted2.address);
    invalidProof = getMerkleProof(whitelist, notWhitelisted.address);
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
        startTime: 1676043287, // 0.1 ETH
        endTime: 1686043287, // 0.1 ETH
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
        collection.connect(user).updatePublicMintStage({
          mintPrice: '100000000000000000', // 0.1 ETH
          startTime: 1676043287, // 0.1 ETH
          endTime: 1686043287, // 0.1 ETH
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
      expect(currentConfig.merkleRoot).to.equal(
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      );
      // Update config
      const newConfigData = {
        mintPrice: '100000000000000000', // 0.1 ETH
        startTime: 1676043287, // 0.1 ETH
        endTime: 1686043287, // 0.1 ETH
        mintLimitPerWallet: 5,
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
        collection.connect(user).updateAllowlistMintStage({
          mintPrice: '100000000000000000', // 0.1 ETH
          startTime: 1676043287, // 0.1 ETH
          endTime: 1686043287, // 0.1 ETH
          mintLimitPerWallet: 5,
          merkleRoot: `0x${getMerkleTreeRoot([owner.address])}`,
        }),
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });
  });
});
