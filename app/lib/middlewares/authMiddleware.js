import jwt from "jsonwebtoken";

export const authMiddleware = async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return reply.status(401).send({ error: "Authorization header missing" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    request.user = decoded;
    return true;
  } catch (err) {
    return reply.status(401).send({ error: "Invalid token" });
  }
};
