import { NextUIProvider } from "@nextui-org/react";
import DynamicProvider from "./DynamicProvider.jsx";
import AuthProvider from "./AuthProvider.jsx";
import Web3Provider from "./Web3Provider.jsx";
import { SWRConfig } from "swr";
export default function RootProvider({ children }) {
  return (
    <SWRConfig
      value={{
        shouldRetryOnError: false,
        revalidateOnFocus: false,
      }}
    >
      <NextUIProvider>
        <DynamicProvider>
          <Web3Provider>
            <AuthProvider>{children}</AuthProvider>
          </Web3Provider>
        </DynamicProvider>
      </NextUIProvider>
    </SWRConfig>
  );
}
