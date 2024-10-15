export const CHAINS = {
  mainnet: [
    {
      id: 1,
      name: "Ethereum Mainnet",
      chainlistUrl: "https://chainlist.org/chain/1",
      rpcUrl: "https://sepolia.infura.io/v3/0be86a45a4c3431398571a7c81165708",
      nativeToken: "ETH",
      blockExplorerUrl: "https://etherscan.io",
      imageUrl:
        "https://filebucketz.sgp1.cdn.digitaloceanspaces.com/misc/chains/ethereum.svg",
    },
    // {
    //   id: 56,
    //   name: "BNB Smart Chain Mainnet",
    //   chainlistUrl: "https://chainlist.org/chain/56",
    //   rpcUrl:
    //     "https://bsc-mainnet.infura.io/v3/0be86a45a4c3431398571a7c81165708",
    //   nativeToken: "BNB",
    //   blockExplorerUrl: "https://bscscan.com",
    //   imageUrl:
    //     "https://filebucketz.sgp1.cdn.digitaloceanspaces.com/misc/chains/bsc.svg",
    // },
    {
      id: 137,
      name: "Polygon Mainnet",
      chainlistUrl: "https://chainlist.org/chain/137",
      rpcUrl:
        "https://polygon-mainnet.infura.io/v3/0be86a45a4c3431398571a7c81165708",
      nativeToken: "MATIC",
      blockExplorerUrl: "https://polygonscan.com",
      imageUrl:
        "https://filebucketz.sgp1.cdn.digitaloceanspaces.com/misc/chains/matic.svg",
    },
    // {
    //   id: 747,
    //   name: "EVM on Flow",
    //   chainlistUrl: "https://chainlist.org/chain/747",
    //   rpcUrl: "https://mainnet.evm.nodes.onflow.org",
    //   nativeToken: "FLOW",
    //   blockExplorerUrl: "https://flowscan.io",
    //   imageUrl:
    //     "https://filebucketz.sgp1.cdn.digitaloceanspaces.com/misc/chains/flow.svg",
    // },
    // {
    //   id: 59144,
    //   name: "Linea",
    //   chainlistUrl: "https://chainlist.org/chain/59144",
    //   rpcUrl:
    //     "https://linea-mainnet.infura.io/v3/0be86a45a4c3431398571a7c81165708",
    //   nativeToken: "ETH",
    //   blockExplorerUrl: "https://lineascan.build/",
    //   imageUrl:
    //     "https://filebucketz.sgp1.cdn.digitaloceanspaces.com/misc/chains/linea.svg",
    // },
  ],
  testnet: [
    {
      id: 2810,
      name: "Morph Holesky",
      chainlistUrl: "https://chainlist.org/chain/2810",
      rpcUrl: "https://rpc-quicknode-holesky.morphl2.io",
      nativeToken: "ETH",
      blockExplorerUrl: "https://explorer-holesky.morphl2.io/",
      imageUrl:
        "https://filebucketz.sgp1.cdn.digitaloceanspaces.com/misc/chains/morph.svg",
    },
    {
      id: 11155111,
      name: "Ethereum Sepolia",
      chainlistUrl: "https://chainlist.org/chain/11155111",
      rpcUrl: "https://sepolia.infura.io/v3/0be86a45a4c3431398571a7c81165708",
      nativeToken: "ETH",
      blockExplorerUrl: "https://sepolia.etherscan.io/",
      imageUrl:
        "https://filebucketz.sgp1.cdn.digitaloceanspaces.com/misc/chains/ethereum.svg",
    },
    {
      id: 80002,
      name: "Polygon Amoy",
      chainlistUrl: "https://chainlist.org/chain/80002",
      rpcUrl: "https://rpc.ankr.com/polygon_amoy",
      nativeToken: "MATIC",
      blockExplorerUrl: "https://www.oklink.com/amoy",
      imageUrl:
        "https://filebucketz.sgp1.cdn.digitaloceanspaces.com/misc/chains/ethereum.svg",
    },
  ],
  oasis: {
    mainnet: {
      id: 23294,
      name: "Oasis Sapphire Mainnet",
      chainlistUrl: "https://chainlist.org/chain/23294",
      rpcUrl: "https://sapphire.oasis.io",
      nativeToken: "ROSE",
      blockExplorerUrl: "https://explorer.oasis.io/mainnet/sapphire",
      imageUrl:
        "https://filebucketz.sgp1.cdn.digitaloceanspaces.com/misc/chains/oasis.svg",
      compatibility: [137],
    },
    testnet: {
      id: 23295,
      name: "Oasis Sapphire Testnet",
      chainlistUrl: "https://chainlist.org/chain/23295",
      rpcUrl: "https://testnet.sapphire.oasis.io",
      nativeToken: "TEST",
      blockExplorerUrl: "https://explorer.oasis.io/testnet/sapphire",
      imageUrl:
        "https://filebucketz.sgp1.cdn.digitaloceanspaces.com/misc/chains/oasis.svg",
      compatibility: [137],
    },
  },
};

export const ALLOWED_CHAIN_IDS = [1, 137];
