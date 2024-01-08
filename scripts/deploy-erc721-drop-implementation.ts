import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(
        "🔥 Deploying ERC721DropImplementation with the account: ",
        deployer.address,
    );

    const ERC721DropImplementation = await ethers.getContractFactory(
        "ERC721DropImplementation",
    );
    const implementation = await ERC721DropImplementation.deploy();
    await implementation.deployed();
    await implementation.initialize(
        "Mintdash",
        "MINTDASH",
        "",
        "0xeA6b5147C353904D5faFA801422D268772F09512",
        0,
    );

    console.log(
        "🚀 ERC721DropImplementation deployed to: ",
        implementation.address,
    );
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
