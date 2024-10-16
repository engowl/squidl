import { prismaClient } from "../../lib/db/prisma.js";
import { authMiddleware } from "../../lib/middlewares/authMiddleware.js";
import { oneInchApi } from "../../lib/1inch/api.js";
import { sleep } from "../../utils/miscUtils.js";
import { moralisApi } from "../../lib/moralis/api.js";
import { toHex } from "viem";
import { ALLOWED_CHAIN_IDS } from "../../config.js";
import { verifyFields } from "../../utils/request.js";

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
    const { address } = req.user;
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

      const { address } = req.user;

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
      await verifyFields(req.body, ["username"], reply);

      const { username } = req.body;

      const { address } = req.user;

      try {
        const existingUser = await prismaClient.user.findFirst({
          where: {
            username,
          },
        });

        if (existingUser) {
          return reply
            .send({
              message: "Alias already exist",
            })
            .status(400);
        }

        const user = await prismaClient.user.findFirst({
          where: {
            wallet: {
              address,
            },
          },
        });

        const updatedUser = await prismaClient.user.update({
          where: {
            id: user.id,
          },
          data: {
            username,
          },
        });

        console.log({ updatedUser });

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

  // TODO Optimize grouping, db saving, querying, etc.
  app.get(
    "/wallet-assets",
    // Enable later
    // { preHandler: [authMiddleware] },
    async function (req, reply) {
      const { id } = req.query;

      // Enable later
      // const { id, address } = req.user;
      if (!id) {
        return reply.status(400).send({
          message: "User id is required",
        });
      }

      try {
        const user = await prismaClient.user.findUnique({
          where: {
            id: id,
          },
        });

        if (!user) {
          return reply.status(404).send({
            message: "User not found",
          });
        }

        // TODO Replace with real user address
        const mainAddress = "0xE55f467EDF9cf38379cea2f19ae3d2Aaf6ecFb0B";

        // TODO use real stealth addresses from user
        const stealthAddresses = [];

        const allAddresses = [mainAddress, ...stealthAddresses];

        const { data: portfolioData } = await oneInchApi.get(
          `/portfolio/portfolio/v4/overview/erc20/current_value`,
          {
            params: {
              addresses: allAddresses,
            },
            paramsSerializer: {
              indexes: null,
            },
          }
        );

        // STEP 1 get value
        const totalBalanceUsd = portfolioData.result.filter(
          (data) =>
            data.protocol_name === "native" || data.protocol_name === "token"
        )
          ? portfolioData.result
              .filter(
                (data) =>
                  data.protocol_name === "native" ||
                  data.protocol_name === "token"
              )
              .flatMap((data) => data.result)
              .filter((data) => ALLOWED_CHAIN_IDS.includes(data.chain_id))
              .reduce((acc, curr) => {
                return acc + parseFloat(curr.value_usd);
              }, 0)
          : 0;

        const tokens = [];

        // STEP 2 get token details
        for (const chain of ALLOWED_CHAIN_IDS) {
          for (const address of allAddresses) {
            const { data: tokenData } = await moralisApi.get(
              `/wallets/${address}/tokens?chain=${toHex(chain)}`
            );

            const token = tokenData.result.map((token) => {
              return {
                token_address: token.token_address,
                symbol: token.symbol,
                name: token.name,
                logo: token.logo,
                balance: token.balance,
                decimals: token.decimals,
                usd_value: token.usd_value,
                native_token: token.native_token,
                chainId: chain,
              };
            });

            tokens.push(...token);

            await sleep(100);
          }
        }

        // STEP 3 save token data to db
        for (const token of tokens) {
          const existingToken = await prismaClient.token.findFirst({
            where: {
              address: token.token_address,
            },
          });

          if (!existingToken) {
            await prismaClient.token.create({
              data: {
                address: token.token_address,
                symbol: token.symbol,
                name: token.name,
                logo: token.logo,
                decimals: token.decimals,
                chain: {
                  connect: {
                    id: token.chainId,
                  },
                },
              },
            });
          }
        }

        await sleep(1000);

        //STEP 4 get chart data
        const { data: balanceChartData } = await oneInchApi.get(
          `/portfolio/portfolio/v4/general/value_chart?addresses=${mainAddress}&chain_id=1&timerange=1day`
        );

        const result = {
          totalBalanceUsd,
          tokens,
          balanceChartData: balanceChartData.result,
        };

        return reply.send({
          message: "Success getting user wallet assets",
          data: result,
        });
      } catch (e) {
        console.log("Error getting wallet assets", e);
        return reply.status(500).send({
          message: "Error getting wallet assets",
        });
      }
    }
  );

  done();
};
