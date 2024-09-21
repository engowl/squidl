import { LayoutGroup } from "framer-motion";
import { Toaster } from "react-hot-toast";

export const RootLayout = ({ children }) => {
  return (
    <div className="dark">
      <Toaster />
      <LayoutGroup>{children}</LayoutGroup>
    </div>
  );
};
