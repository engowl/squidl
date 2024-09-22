import { getAuthToken, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useEffect } from "react";
import { squidlAPI } from "../api/squidl";
import { isGetStartedDialogAtom } from "../store/dialog-store";
import { useAtom } from "jotai";
import { useWeb3 } from "./Web3Provider";
import { CONTRACT_ADDRESS } from "../config";
import { signAuthToken } from "../lib/ethers";

export default function AuthProvider({ children }) {
  const { user, handleLogOut } = useDynamicContext();
  const [, setOpen] = useAtom(isGetStartedDialogAtom);
  const { signer, provider, isLoaded, contract } = useWeb3();

  async function login(params) {
    let auth;
    const network = await provider.getNetwork();
    const chainId = network.chainId;
    auth = await signAuthToken(signer, CONTRACT_ADDRESS, chainId);

    squidlAPI
      .post("/auth/login", {
        address: user.verifiedCredentials[0].address,
        username: "",
      })
      .then(async ({ data }) => {
        console.log({ data }, "ON LOGINNN");
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("auth_signer", JSON.stringify(auth));
        if (!data.user.username) {
          return setOpen(true);
        }
      })
      .catch((e) => {
        console.log(e, "error while login");
        // handleLogOut();
      });

    console.log({
      user,
    });
  }
  useEffect(() => {
    if (user && isLoaded) {
      login();
    }
  }, [user, isLoaded]);
  return children;
}
