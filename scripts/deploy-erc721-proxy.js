const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contract with the account: ', deployer.address);

  const ERC721Proxy = await ethers.getContractFactory('ERC721Proxy');
  const proxy = await ERC721Proxy.deploy('Blank NFT Studio Demo', 'BLANK');
  await proxy.deployed();

  console.log('Success! ERC721Proxy was deployed to: ', proxy.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
