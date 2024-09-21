import { ethers } from "ethers";
import { authMiddleware } from "../../lib/middlewares/authMiddleware.js";
import { oneInchGetValueChart } from "./helpers/oneInchHelpers.js";
import { dnsDecodeName, handleQuery, resolverAbi, schema } from "../../utils/ensUtils.js";
import { concat, decodeFunctionData, encodeAbiParameters, encodeFunctionResult, encodePacked, isAddress, isHex, keccak256, recoverAddress, toHex } from "viem";
import { privateKeyToAccount, sign } from "viem/accounts";
import { ZERO_ADDRESS } from "thirdweb";

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
    // Fetch aliases from your database or service
    return []
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
      return {
        error: error.message,
        data: null,
        message: "error while fetching chart data"
      }
    }
  })

  // POST /aliases/new-alias, to create a new alias for a user
  app.post('/aliases/new-alias', {
    preHandler: [authMiddleware]
  }, async (req, res) => {
    const { body } = req;
    // Create new alias logic
    return { success: true, aliasId: "new-alias-id" };
  });

  // GET /address/:alias-id/new-address, to get new stealth address of a certain alias. This endpoint is important, and it will be used for ENS CCIP read too
  app.get('/address/new-address', async (req, res) => {
    const { alias } = req.params;
    // Generate or fetch new stealth address logic for aliasId
    // TODO: generate a stealth address, then save it to the database

    // Random address
    const wallet = ethers.Wallet.createRandom();

    return { address: wallet.address };
  });

  // app.get('/aliases/resolve/:sender/:data.json', async (request, reply) => {
  //   const { sender, data } = request.params;
  //   console.log({
  //     sender,
  //     data
  //   })

  //   // Handle your logic here
  //   reply.send({ message: `Resolved sender: ${sender}, data: ${data}` });
  // });

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

      if(!abiItem) {
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

  // POST /tx/withdraw, to generate the transactions for the withdrawal of the funds
  app.post('/tx/withdraw', {
    preHandler: [authMiddleware]
  }, async (req, res) => {
    const { body } = req;
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

  done();
}
