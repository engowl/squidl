import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useEffect, useState } from "react";
import { squidlPublicAPI } from "../api/squidl";
import { isGetStartedDialogAtom } from "../store/dialog-store";
import { useAtom } from "jotai";
import { useWeb3 } from "./Web3Provider";
import { CONTRACT_ADDRESS } from "../config";
import { signAuthToken } from "../lib/ethers";
import { useCookies } from "react-cookie";
import { isSignedInAtom } from "../store/auth-store";
import { useSession } from "../hooks/use-session";
import toast from "react-hot-toast";

let loginCalledTimes = 0;

export default function AuthProvider({ children }) {
  const { isLoaded, provider, signer } = useWeb3();
  const [, setCookie, removeCookie] = useCookies(["access_token"]);
  const { handleLogOut, user } = useDynamicContext();
  const [isReadyToSign, setIsReadyToSign] = useState(false);
  const [isSigningIn, setSigningIn] = useState(false);
  const [, setOpen] = useAtom(isGetStartedDialogAtom);
  const [isSignedIn, setSignedIn] = useAtom(isSignedInAtom);
  const { isSignedIn: session, isLoading } = useSession();

  console.log({ loginCalledTimes });

  const login = async (user) => {
    console.log("login called", { isSigningIn, user, loginCalledTimes });
    if (isSigningIn || !user || loginCalledTimes > 0) return;

    setSigningIn(true);

    try {
      toast.loading("Verifying data, please wait...", {
        id: "signing",
      });

      const { data } = await squidlPublicAPI.post("/auth/login", {
        address: user.verifiedCredentials[0].address,
      });

      // console.log("data from backend", { data });

      // console.log("called should be once!!!!!!!");

      toast.loading("Please sign the request to continue", {
        id: "signing",
      });

      // Add signer to local storage with contract
      const network = await provider.getNetwork();
      const chainId = network.chainId;

      const auth = await signAuthToken(signer, CONTRACT_ADDRESS, chainId);

      localStorage.setItem("auth_signer", JSON.stringify(auth));
      setCookie("access_token", data.access_token);

      if (!data.user?.username) {
        setOpen(true);
      }
      toast.success("Signed in successfully", {
        id: "signing",
      });
    } catch (e) {
      toast.error("Error signing in", {
        id: "signing",
      });
      loginCalledTimes = 0;
      setSignedIn(false);
      localStorage.removeItem("auth_signer");
      removeCookie("access_token");
      if (user) {
        console.log("Error while logging in and user is present", e);
        handleLogOut();
      }
      console.error("Error logging in", e);
    } finally {
      toast.dismiss("signing");
      setSigningIn(false);
    }
  };

  // console.log({ session, isLoading, isReadyToSign });

  useEffect(() => {
    if (session || isLoading) return;
    if (isReadyToSign && user) {
      login(user);
      loginCalledTimes++;
    }
  }, [isReadyToSign, session, isLoading, user]);

  useEffect(() => {
    if (user && isLoaded) {
      console.log("is ready to sign");
      setIsReadyToSign(true);
    }
  }, [user, isLoaded]);

  return children;
}
