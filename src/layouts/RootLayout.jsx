import { Toaster } from "react-hot-toast";

export const RootLayout = ({ children }) => {
  return (
    <div className="dark">
      <Toaster />
      {children}
    </div>
  );
};
