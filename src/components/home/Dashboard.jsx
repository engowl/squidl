import { useEffect } from "react";
import { squidlAPI } from "../../api/squidl";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

export default function Dashboard() {
  const { handleLogOut } = useDynamicContext();
  useEffect(() => {
    squidlAPI.get("/auth/me").then(({ data }) => {
      console.log(data);
    });
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-col items-center">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="bg-purply p-4 rounded-xl text-white font-bold">
          Receive
        </div>

        <div onClick={handleLogOut}>Logout</div>
      </div>
    </div>
  );
}
