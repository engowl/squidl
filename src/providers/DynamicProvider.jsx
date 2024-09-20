import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";

export default function DynamicProvider({ children }) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: "23b6b7de-b73b-4ae8-a65c-4e6f96c8d6f3",
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}
