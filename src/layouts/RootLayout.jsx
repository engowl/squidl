import { LayoutGroup } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { ScrollRestoration } from "react-router-dom";

export const RootLayout = ({ children }) => {
  return (
    <div className="dark">
      <Toaster />
      <LayoutGroup>{children}</LayoutGroup>
      {/* <ScrollRestoration /> */}
    </div>
  );
};
