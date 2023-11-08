import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(
        "🔥 Deploying ERC1155EditionsImplementation with the account: ",
        deployer.address,
    );

    const ERC1155EditionsImplementation = await ethers.getContractFactory(
        "ERC1155EditionsImplementation",
    );
    const implementation = await ERC1155EditionsImplementation.deploy();
    await implementation.deployed();
    await implementation.initialize("Mintdash", "MINTDASH", deployer.address);

    console.log(
        "🚀 ERC1155EditionsImplementation deployed to: ",
        implementation.address,
    );
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
