import { ethers } from "ethers";
import { authMiddleware } from "../../lib/middlewares/authMiddleware.js";
import { oneInchGetValueChart } from "./helpers/oneInchHelpers.js";
import {
  dnsDecodeName,
  handleQuery,
  OffchainResolverAbi,
} from "../../utils/ensUtils.js";
import { getNextAliasKey } from "./helpers/aliasHelpers.js";
import { prismaClient } from "../../lib/db/prisma.js";
import { stealthSignerGenerateStealthAddress } from "../../lib/contracts/oasis/oasisContract.js";

/**
 *
 * @param {import("fastify").FastifyInstance} app
 * @param {} _
 * @param {Function} done
 */
export const stealthAddressRoutes = (app, _, done) => {
  // GET /aliases, to get all aliases owned by the user
  app.get(
    "/aliases",
    {
      preHandler: [authMiddleware],
    },
    async (req, res) => {
      try {
        const { address } = req.user;
        const user = await prismaClient.user.findFirst({
          where: {
            wallet: {
              address,
            },
          },
          select: {
            id: true,
          },
        });

        if (!user) {
          return res.status(400).send({ message: "User not found" });
        }
        let aliases = await prismaClient.userAlias.findMany({
          where: {
            user: {
              id: user.id,
            },
          },
          include: {
            user: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        // Add balanceUsd to each alias
        for (let i = 0; i < aliases.length; i++) {
          // Random from $100 to $10000, max 2 decimal places
          // TODO: Fetch the actual balance for each alias
          aliases[i].balanceUsd = 0;
          // To fetch the overall balance, it will iterate each aliases, and using 1inch Generate Current Value API to get the balance of address collection
        }

        aliases = aliases.filter((alias) => {
          return alias.alias !== "";
        });

        console.log({ aliases });

        return aliases;
      } catch (error) {
        console.error("Error while fetching aliases:", error);
        return res.status(500).send({
          message: "Error while fetching aliases",
        });
      }
    }
  );

  // GET /aliases/:id , to get the detailed information of a certain alias
  app.get(
    "/aliases/:id",
    {
      preHandler: [authMiddleware],
    },
    async (req, res) => {
      const { id } = req.params;
      // Fetch alias by id from your database or service
      return {};
    }
  );

  // For testing only, this endpoint will shows the chart data of a certain address
  app.get("/chart/:address", async (req, res) => {
    try {
      const chainIds = req.query.chainIds
        ? req.query.chainIds.split(",").map((chainId) => parseInt(chainId))
        : [1, 137];
      const chartData = await oneInchGetValueChart({
        chainIds: chainIds,
        addresses: [req.params.address],
      });

      return chartData;
    } catch (error) {
      console.error(error);
      return res.status(500).send({
        error: error.message,
        data: null,
        message: "error while fetching chart data",
      });
    }
  });

  // POST /aliases/new-alias, to create a new alias for a user
  app.post(
    "/aliases/new-alias",
    {
      preHandler: [authMiddleware],
    },
    async (req, res) => {
      try {
        const { address } = req.user;
        const { alias } = req.body;

        const user = await prismaClient.user.findFirst({
          where: {
            wallet: {
              address,
            },
          },
          select: {
            id: true,
          },
        });

        if (!user) {
          return res.status(400).send({ message: "User not found" });
        }

        // Const check if alias already exists
        const existingUserAlias = await prismaClient.userAlias.findMany({
          where: {
            alias: alias,
            user: {
              address: address,
            },
          },
        });

        if (existingUserAlias.length > 0) {
          return res.status(400).send({ message: "Alias already exists" });
        }

        // Validate it's alphanumeric, no special characters, no spaces, 15 characters max, 1 character min
        if (!/^[a-zA-Z0-9]{1,15}$/.test(alias)) {
          return res.status(400).send({
            message:
              "Invalid alias. It should be alphanumeric, no special characters, no spaces, 15 characters max, 1 character min",
          });
        }

        // Create new alias logic here
        const nextAliasKey = await getNextAliasKey();

        const newAlias = await prismaClient.userAlias.create({
          data: {
            user: {
              connect: {
                id: user.id,
              },
            },
            key: nextAliasKey,
            alias: alias,
          },
        });

        return newAlias;
      } catch (error) {
        console.error("Error while creating new alias:", error);
        return res.status(500).send({
          message: "Error while creating new alias",
        });
      }
    }
  );

  // DEVNOTE: Due to time constraints and the complexity of implementing
  // a more efficient solution within the limited timeframe of the hackathon,
  // we've opted to index all stealth addresses directly in the database for now.
  // While this approach is functional, we acknowledge it's not ideal.
  // Our original plan was to temporarily track only the most recent stealth address,
  // allowing Sapphire’s ROFL (Rollup Optimistic Full-Node Layer) to periodically
  // retrieve and verify the data. Eventually, ROFL would serve as the
  // Squidl Data Availability Layer, ensuring a more scalable and decentralized data solution.
  app.get("/address/new-address", async (req, res) => {
    try {
      // Detect the full alias, e.g. user.user.squidl.eth, or user.squidl.eth ( [alias].[username].squidl.eth )
      const { fullAlias, isTestnet = false } = req.query;

      // Split the full alias to get the alias
      const aliasParts = fullAlias.split(".");
      const alias = aliasParts[aliasParts.length - 4];
      const username = aliasParts[aliasParts.length - 3];

      console.log({
        alias: alias,
        username: username,
      });

      const userAlias = await prismaClient.userAlias.findFirst({
        where: {
          alias: alias || "",
          user: {
            username: username,
          },
        },
      });

      if (!userAlias) {
        return res.status(400).send({ message: "Alias not found" });
      }

      // Generate or fetch new stealth address logic for aliasId
      const newStealthAddress = await stealthSignerGenerateStealthAddress({
        chainId: isTestnet ? 23295 : 23295,
        key: userAlias.key,
      });

      // Insert
      const savedStealthAddress = await prismaClient.stealthAddress.create({
        select: {
          address: true,
        },
        data: {
          aliasId: userAlias.id,
          address: newStealthAddress.stealthAddress,
          ephemeralPub: newStealthAddress.ephemeralPub,
          viewHint: newStealthAddress.viewHint,
          isSmartWallet: false,
        },
      });

      return savedStealthAddress;
    } catch (error) {
      console.error(error);
      return res.status(500).send({
        error: error.message,
        data: null,
        message: "error while generating new stealth address",
      });
    }
  });

  // GET /address/:alias-id/new-address, to get new stealth address of a certain alias. This endpoint is important, and it will be used for ENS CCIP read too
  // app.get('/address/new-address', async (req, res) => {
  //   const { alias } = req.params;
  //   // Generate or fetch new stealth address logic for aliasId
  //   // TODO: generate a stealth address, then save it to the database

  //   // Random address
  //   const wallet = ethers.Wallet.createRandom();

  //   return { address: wallet.address };
  // });

  // app.get('/aliases/resolve/:sender/:data.json', async (request, reply) => {
  //   const { sender, data } = request.params;
  //   console.log({
  //     sender,
  //     data
  //   })

  //   // Handle your logic here
  //   reply.send({ message: `Resolved sender: ${sender}, data: ${data}` });
  // });

  // POST /tx/withdraw, to generate the transactions for the withdrawal of the funds
  app.post(
    "/tx/withdraw",
    {
      preHandler: [authMiddleware],
    },
    async (req, res) => {
      const {
        fullAlias,
        tokenAddress,
        chainId,
        amount,
        destinationChainId,
        destinationAddress,
      } = req.body;

      const { address } = req.user;
      const user = await prismaClient.user.findFirst({
        where: {
          wallet: {
            address,
          },
        },
      });

      if (!user) {
        return res.status(400).send({ message: "User not found" });
      }

      const userAlias = await prismaClient.userAlias.findFirst({
        where: {
          alias: fullAlias,
          userId: user.id,
        },
      });

      // TODO: Get the stealth addresses of the userAlias that have the tokenAddress. Will map it out like { address: stealthAddress, amount: amount, ... }

      // TODO: Based on the addresses balances, will determine which stealth address to use for the withdrawal. For example if the user has 3 stealth addresses, the first one got 1 USDC, the second one got 2 USDC, and the third one got 3 USDC, and the user wants to withdraw 3 USDC, the system will use the third stealth address to withdraw the funds. Starting from the stealth address with the highest balance.

      // TODO: After determined all of which transfer recipient address, the system will generate the transactions for the withdrawal of the funds. This transaction then will be signed one by one (not be shown to the user) and then will be sent to the blockchain.

      //  TODO: After the transactions are sent to the blockchain, the system log the transactions to the database, and then the system will return the transaction hash to the user.
      // Transaction withdrawal logic here
      return { success: true };
    }
  );

  // POST /tx/private-withdraw, to generate the transactions for the withdrawal of the funds, privately (using Oasis protocol)
  app.post(
    "/tx/private-withdraw",
    {
      preHandler: [authMiddleware],
    },
    async (req, res) => {
      const { body } = req;
      // Private withdrawal logic using Oasis protocol
      return { success: true };
    }
  );

  app.get("/aliases/resolve/*", async (request, reply) => {
    try {
      const urlParts = request.url.split("/");
      const [sender, data] = urlParts.slice(-2);

      const dataWithoutJson = data.replace(".json", "");

      if (!ethers.isAddress(sender)) {
        throw new Error("Invalid sender address");
      } else if (!ethers.isHexString(dataWithoutJson)) {
        throw new Error("Invalid data");
      }

      const iface = new ethers.Interface(OffchainResolverAbi);
      const decodedResolveCall = iface.decodeFunctionData(
        "resolve",
        dataWithoutJson
      );

      const name = dnsDecodeName(decodedResolveCall[0]);
      const alias = name.split(".")[name.split(".").length - 3];

      // Random resolved address
      const resolvedAddress = ethers.Wallet.createRandom().address;

      const result = await handleQuery({
        dnsEncodedName: decodedResolveCall[0],
        encodedResolveCall: decodedResolveCall[1],
        sender: sender,
        contractAddress: process.env.RESOLVER_CONTRACT_ADDRESS,
        resolvedAddress: resolvedAddress,
        nameData: {
          name: name,
          address: resolvedAddress,
          display: dnsDecodeName(decodedResolveCall[0]),
          records: {
            name: name,
            description: "This is a test description",
            url: `https://${alias}.squidl.eth`,
          },
        },
      });

      return result;
    } catch (error) {
      console.error(error);
      return {
        error: error.message,
        data: null,
        message: "error while resolving sender",
      };
    }
  });

  done();
};
