import { prismaClient } from "../../lib/db/prisma.js";
import { authMiddleware } from "../../lib/middlewares/authMiddleware.js";
import { verifyFields } from "../../utils/request.js";
import { getNextAliasKey } from "../stealth-address/helpers/aliasHelpers.js";
import jwt from "jsonwebtoken";

/**
 *
 * @param {import("fastify").FastifyInstance} app
 * @param {} _
 * @param {Function} done
 */
export const authRoutes = (app, _, done) => {
  app.post("/login", async (req, res) => {
    await verifyFields(req.body, ["username", "address", "walletType"], res);

    const { address, username, walletType } = req.body;

    try {
      let existingUser = await prismaClient.user.findFirst({
        where: {
          wallet: {
            address,
          },
        },
      });

      if (!existingUser) {
        const nextAliasKey = await getNextAliasKey();

        existingUser = await prismaClient.$transaction(async (prisma) => {
          const createdUser = await prisma.user.create({
            data: {
              wallet: {
                create: {
                  address,
                  type: walletType,
                },
              },
              username,
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
              key: nextAliasKey,
            },
          });
          return createdUser;
        });
      }

      console.log({ existingUser });

      const token = jwt.sign(
        {
          id: existingUser.id,
          address,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "4d",
        }
      );

      console.log({ token });

      return {
        access_token: token,
        user: existingUser,
      };
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
      const user = req.user;

      try {
        const userData = await prismaClient.user.findFirst({
          where: {
            wallet: {
              address: user.address,
            },
          },
        });
        return userData;
      } catch (error) {
        return reply.status(500).send({
          error: "Error while fetching user data",
          data: null,
          message: "Error while fetching user data",
        });
      }
    }
  );

  // app.post("/session", async (req, reply) => {
  //   const { authToken } = req.body;
  //   await verifyFields(req.body, ["authToken"], reply);
  //   try {
  //     const decodedToken = await verifyDynamicToken(authToken);
  //     return {
  //       decodedToken,
  //     };
  //   } catch (e) {
  //     console.log("Error while getting session token");
  //     return reply
  //       .send({
  //         message: "Error while getting session token",
  //       })
  //       .status(500);
  //   }
  // });

  done();
};
