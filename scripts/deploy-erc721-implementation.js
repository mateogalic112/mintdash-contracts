const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(
    '🔥 Deploying ERC721Implementation with the account: ',
    deployer.address,
  );

  const ERC721Implementation = await ethers.getContractFactory(
    'ERC721Implementation',
  );
  const implementation = await ERC721Implementation.deploy();
  await implementation.deployed();
  await implementation.initialize('Blank NFT Studio', 'BLANK');

  console.log('🚀 ERC721Implementation deployed to: ', implementation.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
