const { expect } = require('chai');
const { ethers } = require('hardhat');
const { getMerkleProof, getMerkleTreeRoot } = require('./helpers/merkleTree');

describe('ERC721DropImplementation', function() {
  let collection;
  let tokenPrice, tokenMaxSupply;
  let whitelistMintLimit, publicMintLimit;
  let whitelistedProof1, whitelistedProof2;

  beforeEach(async function() {
    [
      owner,
      whitelisted1,
      whitelisted2,
      notWhitelisted,
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

    // Configure contract for test
    await collection.setWhitelist(`0x${getMerkleTreeRoot(whitelist)}`);
    await collection.setMintLimits(4000, 5, 1);
    await collection.setRoyalties(
      '0xE5F135b20F496189FB6C915bABc53e0A70Ff6A1f',
      1000,
    );
    await collection.setTokenPrice('80000000000000000'); // 0.08 ETH
    await collection.setBaseURI(
      'ipfs://QmSBxebqcuP8GyUxaFVEDqpsmbcjNMxg5y3i1UAHLkhHg5/',
    );
    await collection.toggleWhitelistOnly();

    // Read config and denormalize props
    ({
      tokenPrice,
      tokenMaxSupply,
      whitelistMintLimit,
      publicMintLimit,
    } = await collection.saleConfig());

    whitelistedProof1 = getMerkleProof(whitelist, whitelisted1.address);
    whitelistedProof2 = getMerkleProof(whitelist, whitelisted2.address);
    invalidProof = getMerkleProof(whitelist, notWhitelisted.address);
  });

  describe('mint', function() {
    it('reverts if minting is disabled', async function() {
      await expect(
        collection.connect(whitelisted1).mint(1, whitelistedProof1, {
          value: tokenPrice,
        }),
      ).to.be.revertedWithCustomError(collection, 'MintingDisabled');
    });

    it('reverts if not enough ETH is provided', async function() {
      await collection.toggleMinting();

      await expect(
        collection.connect(whitelisted1).mint(1, whitelistedProof1, {
          value: tokenPrice.sub(1),
        }),
      ).to.be.revertedWithCustomError(collection, 'InvalidValueProvided');
    });

    it('reverts if there are no tokens left', async function() {
      await collection.toggleMinting();

      const wantedNumberOfTokens = tokenMaxSupply.add(1);

      await expect(
        collection
          .connect(whitelisted1)
          .mint(wantedNumberOfTokens, whitelistedProof1, {
            value: tokenPrice.mul(wantedNumberOfTokens),
          }),
      ).to.be.revertedWithCustomError(collection, 'NoMoreTokensLeft');
    });

    describe('Whitelist mint', function() {
      beforeEach(async function() {
        await collection.toggleMinting();
      });

      it('mints if caller is whitelisted', async function() {
        expect(await collection.balanceOf(whitelisted1.address)).to.equal(0);
        expect(await collection.amountMinted(whitelisted1.address)).to.equal(0);

        await collection
          .connect(whitelisted1)
          .mint(1, whitelistedProof1, { value: tokenPrice });

        expect(await collection.balanceOf(whitelisted1.address)).to.equal(1);
        expect(await collection.amountMinted(whitelisted1.address)).to.equal(1);
      });

      it('reverts above mint limit', async function() {
        const wantedNumberOfTokens = whitelistMintLimit.add(1);

        await expect(
          collection
            .connect(whitelisted1)
            .mint(wantedNumberOfTokens, whitelistedProof1, {
              value: tokenPrice.mul(wantedNumberOfTokens),
            }),
        ).to.be.revertedWithCustomError(collection, 'MintLimitExceeded');
      });

      it('reverts if caller is not whitelisted', async function() {
        await expect(
          collection.connect(notWhitelisted).mint(1, invalidProof, {
            value: tokenPrice,
          }),
        ).to.be.revertedWithCustomError(collection, 'NotWhitelisted');
      });

      it('reverts if not whitelisted caller uses invalid proof', async function() {
        await expect(
          collection.connect(notWhitelisted).mint(1, whitelistedProof1, {
            value: tokenPrice,
          }),
        ).to.be.revertedWithCustomError(collection, 'NotWhitelisted');

        await expect(
          collection.connect(whitelisted1).mint(1, whitelistedProof2, {
            value: tokenPrice,
          }),
        ).to.be.revertedWithCustomError(collection, 'NotWhitelisted');
      });
    });

    describe('Public mint', function() {
      beforeEach(async function() {
        await collection.toggleMinting();
        await collection.toggleWhitelistOnly();
      });

      it('mints', async function() {
        await collection.connect(notWhitelisted).mint(publicMintLimit, [], {
          value: tokenPrice.mul(publicMintLimit),
        });
      });

      it('reverts if mint limit is exceeded', async function() {
        const quantity = publicMintLimit.add(1);

        await expect(
          collection.connect(notWhitelisted).mint(quantity, [], {
            value: tokenPrice.mul(quantity),
          }),
        ).to.be.revertedWithCustomError(collection, 'MintLimitExceeded');
      });

      it('mints after receiving airdrop', async function() {
        expect(await collection.balanceOf(notWhitelisted.address)).to.equal(0);

        await collection.airdrop([notWhitelisted.address], [1]);

        await collection.connect(notWhitelisted).mint(publicMintLimit, [], {
          value: tokenPrice.mul(publicMintLimit),
        });

        expect(await collection.balanceOf(notWhitelisted.address)).to.equal(
          publicMintLimit.add(1),
        );
      });
    });
  });

  describe('burn', function() {
    beforeEach(async function() {
      await collection.toggleMinting();
      // Allow public mint phase
      await collection.toggleWhitelistOnly();
    });

    it('burns token for owner', async function() {
      await collection.connect(notWhitelisted).mint(1, [], {
        value: tokenPrice.mul(1),
      });
      expect(await collection.balanceOf(notWhitelisted.address)).to.equal(1);

      await collection.connect(notWhitelisted).burn(1);
      expect(await collection.balanceOf(notWhitelisted.address)).to.equal(0);
    });

    it('reverts if not owner', async function() {
      await collection.connect(notWhitelisted).mint(1, [], {
        value: tokenPrice.mul(1),
      });

      await expect(collection.burn(1)).to.be.revertedWithCustomError(
        collection,
        'TransferCallerNotOwnerNorApproved',
      );
    });
  });

  describe('supportsInterface', function() {
    it('ERC165', async function() {
      expect(await collection.supportsInterface('0x01ffc9a7')).to.equal(true);
    });

    it('ERC721', async function() {
      expect(await collection.supportsInterface('0x80ac58cd')).to.equal(true);
    });

    it('ERC721Metadata', async function() {
      expect(await collection.supportsInterface('0x5b5e139f')).to.equal(true);
    });

    it('ERC2981', async function() {
      expect(await collection.supportsInterface('0x2a55205a')).to.equal(true);
    });
  });

  describe('Owner functions', function() {
    describe('Config', function() {
      it('toggles minting', async function() {
        expect((await collection.saleConfig()).mintActive).to.equal(false);

        await collection.toggleMinting();

        expect((await collection.saleConfig()).mintActive).to.equal(true);
      });

      it('toggles whitelist mint', async function() {
        expect((await collection.saleConfig()).whitelistMintActive).to.equal(
          true,
        );

        await collection.toggleWhitelistOnly();

        expect((await collection.saleConfig()).whitelistMintActive).to.equal(
          false,
        );
      });

      it('toggles operator filterer', async function() {
        expect(await collection.isOperatorFiltererEnabled()).to.equal(false);

        await collection.toggleOperatorFilterer();

        expect(await collection.isOperatorFiltererEnabled()).to.equal(true);
      });

      it('sets token price', async function() {
        const { tokenPrice } = await collection.saleConfig();
        expect(tokenPrice.toString()).to.equal('80000000000000000');

        await collection.setTokenPrice('10000000000000000');

        const { tokenPrice: updatedTokenPrice } = await collection.saleConfig();
        expect(updatedTokenPrice.toString()).to.equal('10000000000000000');
      });

      it('sets mint limits', async function() {
        await collection.setMintLimits(1337, 12, 19);

        const {
          tokenMaxSupply,
          publicMintLimit,
          whitelistMintLimit,
        } = await collection.saleConfig();

        expect(tokenMaxSupply).to.equal(1337);
        expect(publicMintLimit).to.equal(12);
        expect(whitelistMintLimit).to.equal(19);
      });

      it('reverts if caller is not owner', async function() {
        await expect(
          collection.connect(whitelisted1).toggleMinting(),
        ).to.be.revertedWith('Ownable: caller is not the owner');

        await expect(
          collection.connect(whitelisted1).toggleWhitelistOnly(),
        ).to.be.revertedWith('Ownable: caller is not the owner');

        await expect(
          collection.connect(whitelisted1).toggleOperatorFilterer(),
        ).to.be.revertedWith('Ownable: caller is not the owner');

        await expect(
          collection.connect(whitelisted1).setTokenPrice('10000000000000000'),
        ).to.be.revertedWith('Ownable: caller is not the owner');

        await expect(
          collection.connect(whitelisted1).setMintLimits(1337, 12, 19),
        ).to.be.revertedWith('Ownable: caller is not the owner');
      });
    });

    describe('airdrop', function() {
      it('airdrops', async function() {
        const to = [whitelisted1.address, notWhitelisted.address];
        const quantity = [3, 4];

        await collection.airdrop(to, quantity);

        expect(await collection.balanceOf(to[0])).to.equal(3);
        expect(await collection.balanceOf(to[1])).to.equal(4);
      });

      it('reverts if airdroping more tokens than token max supply', async function() {
        const to = [
          whitelisted1.address,
          notWhitelisted.address,
          whitelisted2.address,
        ];
        const quantity = [4, tokenMaxSupply.sub(2), 3];

        await expect(
          collection.airdrop(to, quantity),
        ).to.be.revertedWithCustomError(collection, 'NoMoreTokensLeft');
      });

      it('reverts if caller is not owner', async function() {
        const to = [whitelisted1.address, notWhitelisted.address];
        const quantity = [3, 4];

        await expect(
          collection.connect(whitelisted1).airdrop(to, quantity),
        ).to.be.revertedWith('Ownable: caller is not the owner');
      });
    });

    describe('setBaseURI', function() {
      it('sets baseURI', async function() {
        await collection.airdrop([whitelisted1.address], [1]);

        expect(await collection.tokenURI(1)).to.equal(
          'ipfs://QmSBxebqcuP8GyUxaFVEDqpsmbcjNMxg5y3i1UAHLkhHg5/1',
        );

        await collection.setBaseURI(
          'ipfs://QmbJxj9yTDhDHXYQUHjyz74GxP1VCwF3pkVWCvBTejF3kD/',
        );

        expect(await collection.tokenURI(1)).to.equal(
          'ipfs://QmbJxj9yTDhDHXYQUHjyz74GxP1VCwF3pkVWCvBTejF3kD/1',
        );
      });

      it('reverts if caller is not owner', async function() {
        await expect(
          collection
            .connect(whitelisted1)
            .setBaseURI(
              'ipfs://QmbJxj9yTDhDHXYQUHjyz74GxP1VCwF3pkVWCvBTejF3kD/',
            ),
        ).to.be.revertedWith('Ownable: caller is not the owner');
      });
    });

    describe('setRoyalties', function() {
      it('sets royalties', async function() {
        await collection.setRoyalties(whitelisted1.address, 4000);

        const [royaltyReceiver, royaltyAmount] = await collection.royaltyInfo(
          0,
          1000,
        );

        expect(royaltyReceiver).to.equal(whitelisted1.address);
        expect(royaltyAmount).to.equal(1000 * 0.4);
      });

      it('reverts if caller is not owner', async function() {
        await expect(
          collection
            .connect(whitelisted1)
            .setRoyalties(whitelisted2.address, 2000),
        ).to.be.revertedWith('Ownable: caller is not the owner');
      });
    });

    describe('setWhitelist', function() {
      it('sets whitelist correctly', async function() {
        const root = `0x${getMerkleTreeRoot([owner.address])}`;
        await collection.setWhitelist(root);

        expect(await collection.merkleRoot()).to.equal(root);
      });

      it('reverts if caller is not owner', async function() {
        const root = `0x${getMerkleTreeRoot([owner.address])}`;
        await expect(
          collection.connect(whitelisted1).setWhitelist(root),
        ).to.be.revertedWith('Ownable: caller is not the owner');
      });
    });

    describe('withdrawAllFunds', function() {
      it('withdraws', async function() {
        await collection.toggleMinting();
        await collection.toggleWhitelistOnly();
        await collection.connect(whitelisted1).mint(1, whitelistedProof1, {
          value: tokenPrice.mul(1),
        });

        const balanceBefore = await ethers.provider.getBalance(owner.address);

        const withdrawTX = await collection.withdrawAllFunds();
        const { gasUsed, effectiveGasPrice } = await withdrawTX.wait();

        const balanceAfter = await ethers.provider.getBalance(owner.address);
        const totalGasUsedForWithdrawal = gasUsed.mul(effectiveGasPrice);

        expect(balanceAfter.sub(balanceBefore)).to.equal(
          tokenPrice.mul(1).sub(totalGasUsedForWithdrawal),
        );
      });

      it('reverts if caller is not owner', async function() {
        await expect(
          collection.connect(whitelisted1).withdrawAllFunds(),
        ).to.be.revertedWith('Ownable: caller is not the owner');
      });
    });
  });
});
