import { verifyDynamicToken } from "../dynamic/auth.js";

export const authMiddleware = async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return reply.status(401).send({ error: "Authorization header missing" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = await verifyDynamicToken(token);
    request.user = decoded;
    return true;
  } catch (err) {
    return reply.status(401).send({ error: "Invalid token" });
  }
};

export const getUserJwtData = (decodedToken) => {
  return {
    address: decodedToken?.verified_credentials[0].address,
  };
};
