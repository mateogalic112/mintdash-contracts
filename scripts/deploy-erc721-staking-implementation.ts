import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(
        "🔥 Deploying ERC721StakingImplementation with the account: ",
        deployer.address,
    );

    const ERC721StakingImplementation = await ethers.getContractFactory(
        "ERC721StakingImplementation",
    );
    const implementation = await ERC721StakingImplementation.deploy();
    await implementation.deployed();
    await implementation.initialize(
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
        0,
    );

    console.log(
        "🚀 ERC721StakingImplementation deployed to: ",
        implementation.address,
    );
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
