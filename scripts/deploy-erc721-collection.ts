import { ethers, run } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(
        "🔥 Deploying ERC721CollectionImplementation with the account: ",
        deployer.address,
    );

    const ERC721CollectionImplementation = await ethers.getContractFactory(
        "ERC721CollectionImplementation",
    );
    const implementation = await ERC721CollectionImplementation.deploy();
    await implementation.deployTransaction.wait(6);
    await implementation.initialize("Mintdash", "MINTDASH");

    console.log(
        "🚀 ERC721CollectionImplementation deployed to: ",
        implementation.address,
    );

    await run("verify:verify", {
        address: implementation.address,
        constructorArguments: [],
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
