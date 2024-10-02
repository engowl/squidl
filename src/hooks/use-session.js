import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { isSignedInAtom } from "../store/auth-store";
import { useAtom } from "jotai";

export const useSession = () => {
  const isLoggedIn = useIsLoggedIn();
  const [cookies, , removeCookies] = useCookies(["access_token"]);
  const [isSignedIn, setSignedIn] = useAtom(isSignedInAtom);
  const [isLoading, setIsLoading] = useState(false);
  const { handleLogOut } = useDynamicContext();

  console.log(cookies.access_token === "undefined", "is undefined");

  useEffect(() => {
    const auth_signer = localStorage.getItem("auth_signer");
    const access_token = cookies.access_token;

    if (isLoggedIn && auth_signer && access_token) {
      setIsLoading(true);
      setSignedIn(true);
      setIsLoading(false);
    }
  }, [isLoggedIn, cookies.access_token]);

  return {
    isSignedIn,
    isLoading,
  };
};
