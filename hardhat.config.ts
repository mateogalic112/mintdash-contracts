import "@nomicfoundation/hardhat-chai-matchers";
import "@nomiclabs/hardhat-etherscan";
import "@primitivefi/hardhat-dodoc";
import "hardhat-gas-reporter";
import "hardhat-contract-sizer";
import "solidity-coverage";
import "@typechain/hardhat";

import dotenv from "dotenv";
dotenv.config();

const config = {
    solidity: {
        version: "0.8.18",
        settings: {
            optimizer: {
                enabled: true,
                runs: 300,
            },
        },
    },
    paths: {
        sources: "./src",
    },
    networks: {
        mainnet: {
            url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
            accounts: [process.env.MAINNET_PRIVATE_KEY],
        },
        sepolia: {
            url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
            accounts: [process.env.TESTNET_PRIVATE_KEY],
        },
        goerli: {
            url: `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
            accounts: [process.env.TESTNET_PRIVATE_KEY],
        },
        arbitrum: {
            url: `https://arb-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
            accounts: [process.env.MAINNET_PRIVATE_KEY],
        },
        polygon: {
            url: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
            accounts: [process.env.MAINNET_PRIVATE_KEY],
        },
        base: {
            url: `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
            accounts: [process.env.MAINNET_PRIVATE_KEY],
        },
    },
    etherscan: {
        apiKey: {
            mainnet: process.env.ETHERSCAN_API_KEY,
            sepolia: process.env.ETHERSCAN_API_KEY,
            goerli: process.env.ETHERSCAN_API_KEY,
            polygon: process.env.POLYSCAN_API_KEY,
            base: process.env.BASESCAN_API_KEY,
        },
        customChains: [
            {
                network: "base",
                chainId: 8453,
                urls: {
                    apiURL: "https://api.basescan.org/api",
                    browserURL: "https://basescan.org",
                },
            },
        ],
    },
    gasReporter: {
        enabled: true,
        currency: "USD",
        gasPrice: 30,
        coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    },
    dodoc: {
        runOnCompile: true,
        include: [
            "ERC721DropImplementation",
            "ERC20Implementation",
            "ERC721StakingImplementation",
            "ERC1155EditionsImplementation",
            "PaymentSplitterImplementation",
            "ERC721CollectionImplementation",
        ],
    },
};

export default config;
