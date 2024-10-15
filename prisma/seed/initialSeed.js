import { PrismaClient } from "@prisma/client";
import { CHAINS } from "../../app/config.js";

const prisma = new PrismaClient();

async function main() {
  // Testnet chains
  for (const chain of CHAINS.testnet) {
    await prisma.chain.upsert({
      where: {
        id: chain.id,
      },
      create: {
        id: chain.id,
        name: chain.name,
        chainlistUrl: chain.chainlistUrl,
        rpcUrl: chain.rpcUrl,
        nativeToken: chain.nativeToken,
        blockExplorerUrl: chain.blockExplorerUrl,
        isTestnet: true,
      },
      update: {
        name: chain.name,
        chainlistUrl: chain.chainlistUrl,
        rpcUrl: chain.rpcUrl,
        nativeToken: chain.nativeToken,
        blockExplorerUrl: chain.blockExplorerUrl,
        isTestnet: true,
      },
    });
  }

  for (const chain of CHAINS.mainnet) {
    await prisma.chain.upsert({
      where: {
        id: chain.id,
      },
      create: {
        id: chain.id,
        name: chain.name,
        chainlistUrl: chain.chainlistUrl,
        rpcUrl: chain.rpcUrl,
        nativeToken: chain.nativeToken,
        blockExplorerUrl: chain.blockExplorerUrl,
        isTestnet: false,
      },
      update: {
        name: chain.name,
        chainlistUrl: chain.chainlistUrl,
        rpcUrl: chain.rpcUrl,
        nativeToken: chain.nativeToken,
        blockExplorerUrl: chain.blockExplorerUrl,
        isTestnet: false,
      },
    });
  }

  await prisma.$disconnect();

  console.log("Initial seed completed successfully");
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
