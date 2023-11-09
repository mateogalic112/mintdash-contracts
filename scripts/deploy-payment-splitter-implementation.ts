import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(
        "🔥 Deploying PaymentSplitterImplementation with the account: ",
        deployer.address,
    );

    const PaymentSplitterImplementation = await ethers.getContractFactory(
        "PaymentSplitterImplementation",
    );
    const implementation = await PaymentSplitterImplementation.deploy();
    await implementation.deployed();
    await implementation.initialize(
        "Blank Studio Splitter",
        [ethers.constants.AddressZero],
        [10000],
    );

    console.log(
        "🚀 PaymentSplitterImplementation deployed to: ",
        implementation.address,
    );
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
