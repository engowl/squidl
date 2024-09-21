import { Outlet } from "react-router-dom";
import {
  DynamicEmbeddedWidget,
  useIsLoggedIn,
} from "@dynamic-labs/sdk-react-core";
import AuthProvider from "../providers/AuthProvider";
import { Toaster } from "react-hot-toast";
import Header from "../components/shared/Header";
import Navbar from "../components/shared/Navbar";
import CreateLinkDialog from "../components/dialogs/CreateLinkDialog.jsx";

export default function AuthLayout() {
  const isLoggedIn = useIsLoggedIn();

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
      <CreateLinkDialog/>
      <Toaster />
      <Header />
      <Outlet />
      <Navbar />
    </AuthProvider>
  );
}
