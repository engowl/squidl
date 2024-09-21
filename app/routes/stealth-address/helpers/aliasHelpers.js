import { prismaClient } from "../../../lib/db/prisma.js";

export const getNextAliasKey = async () => {
  const allUserAliasCount = await prismaClient.userAlias.count({
    where: {},
  });
  const nextAliasKey = allUserAliasCount + 1;

  return nextAliasKey;
};
