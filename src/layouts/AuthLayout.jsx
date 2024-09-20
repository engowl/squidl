import { Outlet } from "react-router-dom";
import Navbar from "../components/shared/Navbar";
import {
  DynamicEmbeddedWidget,
  useIsLoggedIn,
} from "@dynamic-labs/sdk-react-core";

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
    <div>
      <Navbar />
      <Outlet />
    </div>
  );
}
