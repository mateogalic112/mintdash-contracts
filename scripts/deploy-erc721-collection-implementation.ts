import { ethers } from "hardhat";

export async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(
        "🔥 Deploying ERC721CollectionImplementation with the account: ",
        deployer.address,
    );

    const ERC721CollectionImplementation = await ethers.getContractFactory(
        "ERC721CollectionImplementation",
    );
    const implementation = await ERC721CollectionImplementation.deploy();
    await implementation.deployed();
    await implementation.initialize("Mintdash", "MINTDASH", deployer.address);

    console.log(
        "🚀 ERC721CollectionImplementation deployed to: ",
        implementation.address,
    );
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
