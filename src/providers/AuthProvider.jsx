import { getAuthToken, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useEffect } from "react";
import { squidlAPI } from "../api/squidl";
import { isGetStartedDialogAtom } from "../store/dialog-store";
import { useAtom } from "jotai";

export default function AuthProvider({ children }) {
  const { user, handleLogOut } = useDynamicContext();
  const [, setOpen] = useAtom(isGetStartedDialogAtom);
  useEffect(() => {
    if (user) {
      squidlAPI
        .post("/auth/login", {
          address: user.verifiedCredentials[0].address,
          username: "",
        })
        .then(({ data }) => {
          console.log({ data }, "ON LOGINNN");
          if (!data.username) {
            return setOpen(true);
          }
        })
        .catch(() => {
          handleLogOut();
        });
      console.log({
        user,
      });
    }
  }, [user]);
  return children;
}
