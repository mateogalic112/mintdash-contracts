import { ethers, run } from "hardhat";

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
    await implementation.deployTransaction.wait(6);
    await implementation.initialize("Blank NFT Studio", "BLANK", 0);

    console.log("🚀 ERC20Implementation deployed to: ", implementation.address);

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
