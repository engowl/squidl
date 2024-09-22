import { NextUIProvider } from "@nextui-org/react";
import DynamicProvider from "./DynamicProvider.jsx";
import AuthProvider from "./AuthProvider.jsx";
import Web3Provider from "./Web3Provider.jsx";

export default function RootProvider({ children }) {
  return (
    <NextUIProvider>
      <DynamicProvider>
        <Web3Provider>
          <AuthProvider>{children}</AuthProvider>
        </Web3Provider>
      </DynamicProvider>
    </NextUIProvider>
  );
}
