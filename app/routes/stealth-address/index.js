import { ethers } from "ethers";
import { authMiddleware } from "../../lib/middlewares/authMiddleware.js";
import { oneInchGetValueChart } from "./helpers/oneInchHelpers.js";

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

  app.get('/aliases/resolve/:sender/:data.json', async (request, reply) => {
    const { sender, data } = request.params;
    console.log({
      sender,
      data
    })

    // Handle your logic here
    reply.send({ message: `Resolved sender: ${sender}, data: ${data}` });
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
