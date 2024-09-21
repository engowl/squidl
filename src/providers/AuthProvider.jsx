import { getAuthToken, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useEffect } from "react";
import { squidlAPI } from "../api/squidl";

export default function AuthProvider({ children }) {
  const { user, handleLogOut } = useDynamicContext();
  useEffect(() => {
    // if (user) {
    //   squidlAPI
    //     .post("/auth/login", {
    //       address: user.verifiedCredentials[0].address,
    //       username: "",
    //     })
    //     .then(({ data }) => {
    //       console.log({ data });
    //     })
    //     .catch(() => {
    //       handleLogOut();
    //     });
    //   console.log({
    //     user,
    //   });
    // }
  }, [user]);
  return children;
}
