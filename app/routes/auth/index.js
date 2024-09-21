import { prismaClient } from "../../lib/db/prisma.js";
import { verifyDynamicToken } from "../../lib/dynamic/auth.js";
import {
  authMiddleware,
  getUserJwtData,
} from "../../lib/middlewares/authMiddleware.js";
import { verifyFields } from "../../utils/request.js";

/**
 *
 * @param {import("fastify").FastifyInstance} app
 * @param {} _
 * @param {Function} done
 */
export const authRoutes = (app, _, done) => {
  app.post("/login", async (req, res) => {
    await verifyFields(req.body, ["username", "address"], res);

    const { address, username } = req.body;

    try {
      const existingUser = await prismaClient.user.findFirst({
        where: {
          address,
          username,
        },
      });

      console.log({ existingUser });
      if (!existingUser) {
        const createdUser = await prismaClient.$transaction(async (prisma) => {
          const createdUser = await prisma.user.create({
            data: {
              address,
              username: "",
            },
          });
          await prisma.userAlias.create({
            data: {
              user: {
                connect: {
                  id: createdUser.id,
                },
              },
              alias: "",
            },
          });
          return createdUser;
        });
        return createdUser;
      }
      return existingUser;
    } catch (error) {
      console.log("error while login", error);
      return {
        error: "error",
        data: null,
        message: "error",
      };
    }
  });

  app.get(
    "/me",
    {
      preHandler: [authMiddleware],
    },
    async (req, reply) => {
      const user = getUserJwtData(req.user);

      try {
        const userData = await prismaClient.user.findFirst({
          where: {
            address: user.address,
          },
        });
        console.log({ userData });
        return userData;
      } catch (error) {
        return {
          error: "error",
          data: null,
          message: "error",
        };
      }
    }
  );

  app.post("/session", async (req, reply) => {
    const { authToken } = req.body;
    await verifyFields(req.body, ["authToken"], reply);
    try {
      const decodedToken = await verifyDynamicToken(authToken);
      return {
        decodedToken,
      };
    } catch (e) {
      console.log("Error while getting session token");
      return reply
        .send({
          message: "Error while getting session token",
        })
        .status(500);
    }
  });

  done();
};
