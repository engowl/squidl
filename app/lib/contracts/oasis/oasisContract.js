import * as sapphire from '@oasisprotocol/sapphire-paratime';
import { ethers } from 'ethers';

// StealthSignerContract.js
export const OASIS_CONTRACT = {
  mainnet: {
    address: "",
    explorerUrl: "",
    network: {
      id: 23294,
      name: "Oasis Sapphire Mainnet",
      nativeToken: "ROSE",
      rpcUrl: "https://sapphire.oasis.io",
    }
  },
  testnet: {
    address: "0x8Bb2E0Ec042918bbE00404C3b606EB7a081D1cfc",
    explorerUrl: "https://explorer.oasis.io/testnet/sapphire/address/0x8Bb2E0Ec042918bbE00404C3b606EB7a081D1cfc",
    network: {
      id: 23295,
      name: "Oasis Sapphire Testnet",
      nativeToken: "TEST",
      rpcUrl: "https://testnet.sapphire.oasis.io",
    }
  }
}

export const stealthSignerGenerateStealthAddress = async ({
  chainId,
  userId
}) => {
  const network = Object.values(OASIS_CONTRACT).find(
    (network) => network.network.id === chainId
  ).network;
  const provider = sapphire.wrap(ethers.getDefaultProvider(network.rpcUrl));

  const contract = new ethers.Contract(
    OASIS_CONTRACT.testnet.address,
    [
      "function generateStealthAddress(uint32 k) public view returns (address stealthAddress, bytes memory ephemeralPub, bytes1 viewHint)",
    ],
    provider
  );

  const generatedStealthAddress = await contract.generateStealthAddress.staticCall(2);
  const [stealthAddress, ephemeralPub, viewHint] = generatedStealthAddress;

  const data = {
    stealthAddress,
    ephemeralPub,
    viewHint,
  }

  console.log(data);
  return data;
}

stealthSignerGenerateStealthAddress({
  chainId: 23295,
  userId: "0x8Bb2E0Ec042918bbE00404C3b606EB7a081D1cfc"
});