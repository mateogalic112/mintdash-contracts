import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("🔥 Deploying ERC20Proxy with the account: ", deployer.address);

    const ERC20Proxy = await ethers.getContractFactory("ERC20Proxy");
    const proxy = await ERC20Proxy.deploy(
        "Blank Demo",
        "DEMO",
        deployer.address,
        1000,
    );
    await proxy.deployed();

    console.log("🚀 ERC20Proxy deployed to: ", proxy.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
