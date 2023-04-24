import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(
        "🔥 Deploying ERC721StakingProxy with the account: ",
        deployer.address,
    );

    const ERC721StakingProxy = await ethers.getContractFactory(
        "ERC721StakingProxy",
    );
    const proxy = await ERC721StakingProxy.deploy(
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
        0,
    );
    await proxy.deployed();

    console.log("🚀 ERC721StakingProxy deployed to: ", proxy.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
