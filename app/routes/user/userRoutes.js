import { prismaClient } from "../../lib/db/prisma.js";
import {
  authMiddleware,
  getUserJwtData,
} from "../../lib/middlewares/authMiddleware.js";

/**
 *
 * @param {import("fastify").FastifyInstance} app
 * @param {*} _
 * @param {*} done
 */
export const userRoutes = (app, _, done) => {
  app.get("/share-identity", async (req, reply) => {
    const userPaymentUrl = "https://bozo.squidl.me/0x6e892x782y2rx";

    return {
      userPaymentUrl,
    };
  });

  app.get("/alias", { preHandler: [authMiddleware] }, async (req, reply) => {
    const { address } = getUserJwtData(req.user);
    try {
      const userAliases = await prismaClient.userAlias.findMany({
        where: {
          user: {
            address,
          },
        },
      });
      return reply.send({
        message: "Success getting all user aliases data",
        data: userAliases,
      });
    } catch (e) {
      console.log("error getting aliases");
      return reply.status(500).send({
        message: "Error getting alias",
      });
    }
  });
  app.post(
    "/update-alias",
    { preHandler: [authMiddleware] },
    async (req, reply) => {
      const { alias } = req.body;

      console.log({ alias });

      const { address } = getUserJwtData(req.user);

      console.log({ address });
      try {
        const existingAliases = await prismaClient.userAlias.findMany({
          where: {
            alias,
          },
        });

        if (existingAliases && existingAliases.length === 0) {
          return reply
            .send({
              message: "Alias already exist",
            })
            .status(400);
        }

        const userAlias = await prismaClient.userAlias.update({
          where: {
            user: {
              address,
            },
          },
          data: {
            alias: alias,
          },
        });

        return {
          message: "User alias has been updated",
          data: userAlias,
        };
      } catch (e) {
        console.log("Error updating user alias");
        return reply.status(500).send({
          message: "Error updating alias",
        });
      }
    }
  );

  app.post(
    "/update-user",
    { preHandler: [authMiddleware] },
    async (req, reply) => {
      const { username } = req.body;

      console.log({ username });

      const { address } = getUserJwtData(req.user);

      try {
        const existingUser = await prismaClient.user.findFirst({
          where: {
            username: username,
          },
        });

        if (existingUser) {
          return reply
            .send({
              message: "Alias already exist",
            })
            .status(400);
        }

        const updatedUser = await prismaClient.user.update({
          where: {
            address: address,
          },
          data: {
            username: username,
          },
        });

        return {
          message: "User alias has been updated",
          data: updatedUser,
        };
      } catch (e) {
        console.log("Error updating user alias", e);
        return reply.status(500).send({
          message: "Error updating alias",
        });
      }
    }
  );

  app.get("/total-balance", async (req, reply) => {
    return;
  });

  done();
};
