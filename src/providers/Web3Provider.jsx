import { getSigner, getWeb3Provider } from "@dynamic-labs/ethers-v6";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import {
  wrapEthersProvider,
  wrapEthersSigner,
} from "@oasisprotocol/sapphire-ethers-v6";
import { ethers } from "ethers";
import { createContext, useContext, useEffect, useState } from "react";
import { CONTRACT_ADDRESS } from "../config";
import ContractABI from "../abi/StealthSigner.json";

const Web3Context = createContext({});

export const useWeb3 = () => useContext(Web3Context);

export default function Web3Provider({ children }) {
  const { primaryWallet } = useDynamicContext();

  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [isLoaded, setLoaded] = useState(null);

  async function init() {
    console.log("init");
    const _provider = await getWeb3Provider(primaryWallet);
    const _signer = await getSigner(primaryWallet);
    const wrappedProvider = wrapEthersProvider(_provider);
    const wrappedSigner = wrapEthersSigner(_signer);
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      ContractABI.abi,
      wrappedSigner
    );
    setProvider(wrappedProvider);
    setSigner(wrappedSigner);
    setContract(contract);
    setLoaded(true);
  }

  useEffect(() => {
    if (primaryWallet) {
      init();
    }
  }, [primaryWallet]);

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        contract,
        isLoaded,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}
