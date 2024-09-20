import { NextUIProvider } from "@nextui-org/react";
import DynamicProvider from "./DynamicProvider.jsx";

export default function RootProvider({ children }) {
  return (
    <NextUIProvider>
      <DynamicProvider>{children}</DynamicProvider>
    </NextUIProvider>
  );
}
