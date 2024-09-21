import { Outlet } from "react-router-dom";
import {
  DynamicEmbeddedWidget,
  useIsLoggedIn,
} from "@dynamic-labs/sdk-react-core";
import AuthProvider from "../providers/AuthProvider";
import { Toaster } from "react-hot-toast";
import Header from "../components/shared/Header";
import Navbar from "../components/shared/Navbar";

export default function AuthLayout() {
  const isLoggedIn = useIsLoggedIn();
  // const isLoggedIn = true;

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center px-5 md:px-10">
        <div className="w-full max-w-md">
          <DynamicEmbeddedWidget background="with-border" />
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <Toaster />
      <Header />
      <Outlet />
      <Navbar />
    </AuthProvider>
  );
}
