import {
  DynamicContextProvider,
  mergeNetworks,
} from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { customEvmNetworks } from "../config";
import { useAtom } from "jotai";
import { isSignedInAtom } from "../store/auth-store";
import Cookies from "js-cookie";

export default function DynamicProvider({ children }) {
  const [, setSignedIn] = useAtom(isSignedInAtom);
  return (
    <DynamicContextProvider
      settings={{
        environmentId: import.meta.env.VITE_DYNAMIC_ENV_ID,
        walletConnectors: [EthereumWalletConnectors],
        overrides: {
          evmNetworks: (networks) => mergeNetworks(customEvmNetworks, networks),
        },
        events: {
          onLogout: (args) => {
            Cookies.remove("access_token");
            localStorage.removeItem("auth_signer");
            setSignedIn(false);
            window.location.reload();
            console.log("onLogout was called", args);
          },
        },
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}
