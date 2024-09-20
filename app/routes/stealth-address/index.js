import { authMiddleware } from "../../lib/middlewares/authMiddleware.js";

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

  // POST /aliases/new-alias, to create a new alias for a user
  app.post('/aliases/new-alias', {
    preHandler: [authMiddleware]
  }, async (req, res) => {
    const { body } = req;
    // Create new alias logic
    return { success: true, aliasId: "new-alias-id" };
  });

  // GET /address/:alias-id/new-address, to get new stealth address of a certain alias. This endpoint is important, and it will be used for ENS CCIP read too
  app.get('/address/:alias/new-address', async (req, res) => {
    const { alias } = req.params;
    // Generate or fetch new stealth address logic for aliasId
    // TODO: generate a stealth address, then save it to the database

    return "0xabc"; // Example stealth address
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
