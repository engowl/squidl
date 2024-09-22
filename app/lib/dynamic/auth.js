import jwt from "jsonwebtoken";
import { JwksClient } from "jwks-rsa";

export async function verifyDynamicToken(encodedJwt) {
  try {
    const jwksUrl = `https://app.dynamic.xyz/api/v0/sdk/${process.env.DYNAMIC_ENV_ID}/.well-known/jwks`;

    const client = new JwksClient({
      jwksUri: jwksUrl,
      rateLimit: true,
      cache: true,
      cacheMaxEntries: 5,
      cacheMaxAge: 600000,
    });

    const signingKey = await client.getSigningKey();
    const publicKey = signingKey.getPublicKey();

    const decodedToken = jwt.verify(encodedJwt, publicKey, {
      ignoreExpiration: false,
      maxAge: 5 * 86400,
    });

    console.log({ decodedToken });

    return decodedToken;
  } catch (e) {
    console.log("failed to verify dynamic token", e);
    throw new Error(e);
  }
}
