import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(
        "🔥 Deploying ERC20FixedSupplyProxy with the account: ",
        deployer.address,
    );

    const ERC20FixedSupplyProxy = await ethers.getContractFactory(
        "ERC20FixedSupplyProxy",
    );
    const proxy = await ERC20FixedSupplyProxy.deploy(
        "Mintdash Demo",
        "MINTDASH",
        deployer.address,
        10000,
    );
    await proxy.deployed();

    console.log("🚀 ERC20FixedSupplyProxy deployed to: ", proxy.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
