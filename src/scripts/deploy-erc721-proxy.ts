import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('🔥 Deploying ERC721Proxy with the account: ', deployer.address);

  const ERC721Proxy = await ethers.getContractFactory('ERC721Proxy');
  const proxy = await ERC721Proxy.deploy(
    'Funky Cats',
    'CATS',
    '0xFE89b64D4B0f4913a3862958918E3370101917DB',
  );
  await proxy.deployed();

  console.log('🚀 ERC721Proxy deployed to: ', proxy.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
