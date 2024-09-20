import { authMiddleware } from "../../lib/middlewares/authMiddleware.js";

/**
 *
 * @param {import("fastify").FastifyInstance} app
 * @param {} _
 * @param {Function} done
 */
export const authRoutes = (app, _, done) => {
  app.post('/login', async (req, res) => {
    // TODO: implement the SIWE login method here
    try {
      // TODO: Check the current user,, is it saved on User or not
      // If not, create new UserAlias with blank alias for it, and save it to the database. This alias will be for root/main alias

      return "Login succeed"
      // eslint-disable-next-line no-unreachable
    } catch (error) {
      return {
        error: 'error',
        data: null,
        message: 'error'
      }
    }
  })

  app.get('/me', {
    preHandler: [authMiddleware]
  }, async (req, res) => {
    try {
      return "User's Data"
      // eslint-disable-next-line no-unreachable
    } catch (error) {
      return {
        error: 'error',
        data: null,
        message: 'error'
      }
    }
  })

  done();
}