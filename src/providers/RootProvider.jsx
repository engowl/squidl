import { NextUIProvider } from "@nextui-org/react";
import DynamicProvider from "./DynamicProvider.jsx";
import AuthProvider from "./AuthProvider.jsx";

export default function RootProvider({ children }) {
  return (
    <NextUIProvider>
      <DynamicProvider>
        <AuthProvider>{children}</AuthProvider>
      </DynamicProvider>
    </NextUIProvider>
  );
}
