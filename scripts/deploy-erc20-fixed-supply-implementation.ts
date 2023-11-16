import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(
        "🔥 Deploying ERC20Implementation with the account: ",
        deployer.address,
    );

    const ERC20Implementation = await ethers.getContractFactory(
        "ERC20Implementation",
    );
    const implementation = await ERC20Implementation.deploy();
    await implementation.deployed();
    await implementation.initialize(
        "Blank NFT Studio",
        "BLANK",
        deployer.address,
        0,
    );

    console.log("🚀 ERC20Implementation deployed to: ", implementation.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
