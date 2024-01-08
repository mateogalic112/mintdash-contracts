import { ethers, run } from "hardhat";

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
    await implementation.deployTransaction.wait(6);

    await implementation.initialize(
        "Mintdash",
        "MINTDASH",
        "0xeA6b5147C353904D5faFA801422D268772F09512",
        0,
    );

    console.log(
        "🚀 ERC1155EditionsImplementation deployed to: ",
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
