import { ethers } from "ethers";
import { authMiddleware } from "../../lib/middlewares/authMiddleware.js";
import { oneInchGetValueChart } from "./helpers/oneInchHelpers.js";
import { dnsDecodeName, handleQuery, resolverAbi, schema } from "../../utils/ensUtils.js";
import { concat, decodeFunctionData, encodeAbiParameters, encodePacked, isAddress, isHex, keccak256, recoverAddress, toHex } from "viem";
import { privateKeyToAccount, sign } from "viem/accounts";

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

      console.log('decodedResolveCall', decodedResolveCall)

      const name = dnsDecodeName(decodedResolveCall.args[0]);
      console.log('name:', name)

      // it will be [...].squidl.eth , read the [...] , so the 3rd element, if they try to become [...].[...].squidl.eth, it will be still be the 3rd element from the last
      const alias = name.split('.')[name.split('.').length - 3];
      console.log('alias:', alias)

      const resolvedAddress = ethers.Wallet.createRandom().address;

      const { result, ttl } = await handleQuery({
        dnsEncodedName: decodedResolveCall.args[0],
        encodedResolveCall: decodedResolveCall.args[1],
        env: null
      })
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
      console.log('sig:', sig)
      const sigData = concat([sig.r, sig.s, toHex(sig.v)]);
      console.log('sigData:', sigData)

      const encodedResponse = encodeAbiParameters(
        [
          { name: 'result', type: 'bytes' },
          { name: 'expires', type: 'uint64' },
          { name: 'sig', type: 'bytes' },
        ],
        [result, BigInt(validUntil), sigData]
      )

      console.log('encodedResponse:', encodedResponse)

      // Try to verify the signature
      // const signer = ethers.verifyMessage(messageHash, sigData)
      // console.log('signer:', signer)

      // Verify the signer
      const recoveredAddress = await recoverAddress({
        hash: messageHash,
        signature: concat([sig.r, sig.s, toHex(sig.v)]),
      });
      console.log('Recovered signer address:', recoveredAddress);

      return encodedResponse;
    } catch (error) {
      console.error(error)
      return {
        error: error.message,
        data: null,
        message: "error while resolving alias"
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
