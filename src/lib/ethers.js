import { ethers } from "ethers";

export async function signAuthToken(signer, verifyingContract, chainId) {
  const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds (uint32 format)
  const user = await signer.getAddress(); // Get the user's address

  // Define the domain for EIP-712 signature
  const domain = {
    name: "SignInExample.SignIn",
    version: "1",
    chainId: chainId,
    verifyingContract: verifyingContract, // Get contract address
  };

  // Define the types for the signTypedData structure
  const types = {
    SignIn: [
      { name: "user", type: "address" },
      { name: "time", type: "uint32" },
    ],
  };

  // Values to sign
  const values = {
    user,
    time: currentTime,
  };

  // Ask the user to sign the typed data
  const signature = await signer.signTypedData(domain, types, values);

  // Extract r, s, v from the signature
  const { r, s, v } = ethers.Signature.from(signature);

  const auth = { user, time: currentTime, r, s, v };
  return auth;
}
