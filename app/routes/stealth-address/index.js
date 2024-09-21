import { ethers } from "ethers";
import { authMiddleware, getUserJwtData } from "../../lib/middlewares/authMiddleware.js";
import { oneInchGetValueChart } from "./helpers/oneInchHelpers.js";
import { dnsDecodeName, resolverAbi } from "../../utils/ensUtils.js";
import { concat, decodeFunctionData, encodeAbiParameters, encodeFunctionResult, encodePacked, isAddress, isHex, keccak256, recoverAddress, toHex } from "viem";
import { sign } from "viem/accounts";
import { getNextAliasKey } from "./helpers/aliasHelpers.js";
import { prismaClient } from "../../lib/db/prisma.js";
import { OASIS_CONTRACT, stealthSignerGenerateStealthAddress } from "../../lib/contracts/oasis/oasisContract.js";

/**
 *
 * @param {import("fastify").FastifyInstance} app
 * @param {} _
 * @param {Function} done
 */
export const stealthAddressRoutes = (app, _, done) => {
  // GET /aliases, to get all aliases owned by the user
  app.get('/aliases', {
    preHandler: [authMiddleware]
  }, async (req, res) => {
    try {
      const { address } = getUserJwtData(req.user);
      const user = await prismaClient.user.findFirst({
        where: {
          address: address
        },
        select: {
          id: true,
        }
      })

      if (!user) {
        return res.status(400).send({ message: "User not found" });
      }
      const aliases = await prismaClient.userAlias.findMany({
        where: {
          user: {
            id: user.id
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      // Add balanceUsd to each alias
      for (let i = 0; i < aliases.length; i++) {
        // Random from $100 to $10000, max 2 decimal places
        // TODO: Fetch the actual balance for each alias
        aliases[i].balanceUsd = Math.floor(Math.random() * 509900 + 100) / 100;

        // To fetch the overall balance, it will iterate each aliases, and using 1inch Generate Current Value API to get the balance of address collection

      }

      return aliases;
    } catch (error) {
      console.error('Error while fetching aliases:', error)
      return res.status(500).send({
        message: "Error while fetching aliases"
      });
    }
  });

  // GET /aliases/:id , to get the detailed information of a certain alias
  app.get('/aliases/:id', {
    preHandler: [authMiddleware]
  }, async (req, res) => {
    const { id } = req.params;
    // Fetch alias by id from your database or service
    return {}
  });

  // For testing only, this endpoint will shows the chart data of a certain address
  app.get('/chart/:address', async (req, res) => {
    try {
      const chainIds = req.query.chainIds ? req.query.chainIds.split(",").map(chainId => parseInt(chainId)) : [1, 137];
      const chartData = await oneInchGetValueChart({
        chainIds: chainIds,
        addresses: [req.params.address]
      })

      return chartData;
    } catch (error) {
      console.error(error)
      return res.status(500).send({
        error: error.message,
        data: null,
        message: "error while fetching chart data"
      })
    }
  })

  // POST /aliases/new-alias, to create a new alias for a user
  app.post('/aliases/new-alias', {
    preHandler: [authMiddleware]
  }, async (req, res) => {
    try {
      const { address } = getUserJwtData(req.user);
      const { alias } = req.body;

      const user = await prismaClient.user.findFirst({
        where: {
          address: address
        },
        select: {
          id: true,
        }
      })

      if (!user) {
        return res.status(400).send({ message: "User not found" });
      }

      // Const check if alias already exists
      const existingUserAlias = await prismaClient.userAlias.findMany({
        where: {
          alias: alias,
          user: {
            address: address
          }
        }
      })

      if (existingUserAlias.length > 0) {
        return res.status(400).send({ message: "Alias already exists" });
      }

      // Validate it's alphanumeric, no special characters, no spaces, 15 characters max, 1 character min
      if (!/^[a-zA-Z0-9]{1,15}$/.test(alias)) {
        return res.status(400).send({ message: "Invalid alias. It should be alphanumeric, no special characters, no spaces, 15 characters max, 1 character min" });
      }

      // Create new alias logic here
      const nextAliasKey = await getNextAliasKey();

      const newAlias = await prismaClient.userAlias.create({
        data: {
          user: {
            connect: {
              id: user.id
            }
          },
          key: nextAliasKey,
          alias: alias
        }
      })

      return newAlias;
    } catch (error) {
      console.error('Error while creating new alias:', error)
      return res.status(500).send({
        message: "Error while creating new alias"
      });
    }
  });

  // DEVNOTE: Due to time constraints and the complexity of implementing 
  // a more efficient solution within the limited timeframe of the hackathon, 
  // we've opted to index all stealth addresses directly in the database for now. 
  // While this approach is functional, we acknowledge it's not ideal. 
  // Our original plan was to temporarily track only the most recent stealth address, 
  // allowing Sapphire’s ROFL (Rollup Optimistic Full-Node Layer) to periodically 
  // retrieve and verify the data. Eventually, ROFL would serve as the 
  // Squidl Data Availability Layer, ensuring a more scalable and decentralized data solution.
  app.get('/address/new-address', async (req, res) => {
    try {
      // Detect the full alias, e.g. user.user.squidl.eth, or user.squidl.eth ( [alias].[username].squidl.eth )
      const { fullAlias, isTestnet = false } = req.query;

      // Split the full alias to get the alias
      const aliasParts = fullAlias.split('.');
      const alias = aliasParts[aliasParts.length - 4];
      const username = aliasParts[aliasParts.length - 3];

      console.log({
        alias: alias,
        username: username
      })

      const userAlias = await prismaClient.userAlias.findFirst({
        where: {
          alias: alias || '',
          user: {
            username: username
          }
        }
      })

      if (!userAlias) {
        return res.status(400).send({ message: "Alias not found" });
      }

      // Generate or fetch new stealth address logic for aliasId
      const newStealthAddress = await stealthSignerGenerateStealthAddress({
        chainId: isTestnet ? 23295 : 23295,
        key: userAlias.key
      })

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
          isSmartWallet: false
        }
      })

      return savedStealthAddress;
    } catch (error) {
      console.error(error)
      return res.status(500).send({
        error: error.message,
        data: null,
        message: "error while generating new stealth address"
      })
    }
  })

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
  app.post('/tx/withdraw', {
    preHandler: [authMiddleware]
  }, async (req, res) => {
    const {
      fullAlias,
      tokenAddress,
      chainId,
      amount,
      destinationChainId,
      destinationAddress
    } = req.body;

    const { address } = getUserJwtData(req.user);
    const user = await prismaClient.user.findFirst({
      where: {
        address: address
      },
    })

    if (!user) {
      return res.status(400).send({ message: "User not found" });
    }

    const userAlias = await prismaClient.userAlias.findFirst({
      where: {
        alias: fullAlias,
        userId: user.id
      },
    })

    // TODO: Get the stealth addresses of the userAlias that have the tokenAddress. Will map it out like { address: stealthAddress, amount: amount, ... }

    // TODO: Based on the addresses balances, will determine which stealth address to use for the withdrawal. For example if the user has 3 stealth addresses, the first one got 1 USDC, the second one got 2 USDC, and the third one got 3 USDC, and the user wants to withdraw 3 USDC, the system will use the third stealth address to withdraw the funds. Starting from the stealth address with the highest balance.

    // TODO: After determined all of which transfer recipient address, the system will generate the transactions for the withdrawal of the funds. This transaction then will be signed one by one (not be shown to the user) and then will be sent to the blockchain.

    //  TODO: After the transactions are sent to the blockchain, the system log the transactions to the database, and then the system will return the transaction hash to the user.
    // Transaction withdrawal logic here
    return { success: true };
  });

  // POST /tx/private-withdraw, to generate the transactions for the withdrawal of the funds, privately (using Oasis protocol)
  app.post('/tx/private-withdraw', {
    preHandler: [authMiddleware]
  }, async (req, res) => {
    const { body } = req;
    // Private withdrawal logic using Oasis protocol
    return { success: true };
  });

  // ENS RESOLVERS!
  app.get('/aliases/resolve/*', async (request, reply) => {
    try {
      // const { sender, data } = request.params;

      // make stealth-address/aliases/resolve/:sender/:data 

      const urlParts = request.url.split('/')

      const [sender, data] = urlParts.slice(-2);
      console.log({
        sender,
        data
      })

      // Convert sender to address,
      // Convert data to hex
      if (isAddress(sender) === false) {
        throw new Error('Invalid sender address')
      } else if (isHex(data.replace('.json', '')) === false) {
        throw new Error('Invalid data')
      }

      const decodedResolveCall = decodeFunctionData({
        abi: resolverAbi,
        data: data.replace('.json', '')
      });

      // console.log('decodedResolveCall', decodedResolveCall)

      const name = dnsDecodeName(decodedResolveCall.args[0]);
      console.log('name:', name) // e.g. user.squidl.eth

      const alias = name.split('.')[name.split('.').length - 3];
      console.log('alias:', alias)

      // const { result, ttl } = await handleQuery({
      //   dnsEncodedName: decodedResolveCall.args[0],
      //   encodedResolveCall: decodedResolveCall.args[1],
      //   env: null
      // }).catch((error) => {
      //   console.error(error)
      // })

      // Decode the internal resolve call like addr(), text() or contenthash()
      const { functionName, args } = decodeFunctionData({
        abi: resolverAbi,
        data: decodedResolveCall.args[1],
      })


      // We need to find the correct ABI item for each function, otherwise `addr(node)` and `addr(node, coinType)` causes issues
      const abiItem = resolverAbi.find(
        (abi) => abi.name === functionName && abi.inputs.length === args.length
      )
      console.log('abiItem:', abiItem)

      if (!abiItem) {
        throw new Error(`Unsupported query function ${functionName}`);
      }

      // const randomWallet = ethers.Wallet.createRandom().address
      // res = randomWallet

      const randomWallet = ethers.Wallet.createRandom().address
      const nameData = {
        address: randomWallet,
        texts: {
          url: 'https://test.com'
        }
      }

      let res;

      switch (functionName) {
        // case 'addr': {
        //   const coinType = args[1] ?? BigInt(60); // Default coinType to 60 (ETH)
        //   res = nameData?.address ?? ZERO_ADDRESS; // Resolve the address or return ZERO_ADDRESS if not available
        //   break;
        // }
        case 'text': {
          const key = args[1];
          if (key === 'url') {
            res = nameData?.texts?.url ?? 'https://test.com'; // Resolve the 'url' key, defaulting to 'https://test.com'
          } else {
            res = nameData?.texts?.[key] ?? 'testing'; // Handle other text keys
          }
          break;
        }
        // case 'contenthash': {
        //   res = nameData?.contenthash ?? '0x'; // Resolve the contenthash or return '0x' if not available
        //   break;
        // }
        default: {
          throw new Error(`Unsupported query function ${functionName}`);
        }
      }

      console.log('res:', res)

      // return {
      //   ttl: 1000,
      //   result: encodeFunctionResult({
      //     abi: [abiItem],
      //     functionName: functionName,
      //     result: {
      //       data: res,
      //     }
      //   })
      // }
      const result = encodeFunctionResult({
        abi: [abiItem],
        functionName: functionName,
        result: res
      });

      const ttl = 1000

      const validUntil = Math.floor(Date.now() / 1000 + ttl)

      const messageHash = keccak256(
        encodePacked(
          ['bytes', 'address', 'uint64', 'bytes32', 'bytes32'],
          [
            '0x1900', // This is hardcoded in the contract but idk why
            sender, // target: The address the signature is for.
            BigInt(validUntil), // expires: The timestamp at which the response becomes invalid.
            keccak256(data), // request: The original request that was sent.
            keccak256(result), // result: The `result` field of the response (not including the signature part).
          ]
        )
      )

      // const account = privateKeyToAccount(`0x35ecaf3dc46d80f17b3cdcd5248b119c7c39f5135e04b1bdfa42e897f7bb0903`)
      // console.log('account:', account)

      const sig = await sign({
        hash: messageHash,
        privateKey: process.env.ENS_RESOLVER_PK,
      })
      // console.log('sig:', sig)
      const sigData = concat([sig.r, sig.s, toHex(sig.v)]);
      // console.log('sigData:', sigData)

      const encodedResponse = encodeAbiParameters(
        [
          { name: 'result', type: 'bytes' },
          { name: 'expires', type: 'uint64' },
          { name: 'sig', type: 'bytes' },
        ],
        [result, BigInt(validUntil), sigData]
      )

      // console.log('encodedResponse:', encodedResponse)

      // Try to verify the signature
      // const signer = ethers.verifyMessage(messageHash, sigData)
      // console.log('signer:', signer)

      // Verify the signer
      const recoveredAddress = await recoverAddress({
        hash: messageHash,
        signature: concat([sig.r, sig.s, toHex(sig.v)]),
      });
      console.log('Recovered signer address:', recoveredAddress);

      return { data: encodedResponse };
    } catch (error) {
      console.error(error)
      return {
        error: error.message,
        data: null,
        message: "error while resolving sender"
      }
    }
  });

  done();
}
