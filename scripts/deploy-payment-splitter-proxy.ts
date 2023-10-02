import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(
        "🔥 Deploying PaymentSplitterProxy with the account: ",
        deployer.address,
    );

    const PaymentSplitterProxy = await ethers.getContractFactory(
        "PaymentSplitterProxy",
    );
    const proxy = await PaymentSplitterProxy.deploy(
        [ethers.constants.AddressZero],
        [10000],
    );
    await proxy.deployed();

    console.log("🚀 PaymentSplitterProxy deployed to: ", proxy.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
