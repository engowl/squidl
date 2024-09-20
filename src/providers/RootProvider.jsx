import { NextUIProvider } from "@nextui-org/react";
import DynamicProvider from "./DynamicProvider.jsx";
import AuthProvider from "./AuthProvider.jsx";
import GlobalComponentProvider from "./GlobalComponentProvider.jsx";

export default function RootProvider({ children }) {
  return (
    <NextUIProvider>
      <DynamicProvider>
        <AuthProvider>
          <GlobalComponentProvider>{children}</GlobalComponentProvider>
        </AuthProvider>
      </DynamicProvider>
    </NextUIProvider>
  );
}
