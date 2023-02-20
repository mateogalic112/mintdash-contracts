import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(
    '🔥 Deploying ERC721DropImplementation with the account: ',
    deployer.address,
  );

  const ERC721DropImplementation = await ethers.getContractFactory(
    'ERC721DropImplementation',
  );
  const implementation = await ERC721DropImplementation.deploy();
  await implementation.deployed();
  await implementation.initialize(
    'Blank NFT Studio',
    'BLANK',
    '0xFE89b64D4B0f4913a3862958918E3370101917DB',
  );

  console.log(
    '🚀 ERC721DropImplementation deployed to: ',
    implementation.address,
  );
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
