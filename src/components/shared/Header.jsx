import { Button } from "@nextui-org/react";
import { Link } from "react-router-dom";
import { Icons } from "./Icons.jsx";
import Nounsies from "./Nounsies.jsx";
import {
  DynamicUserProfile,
  useDynamicContext,
  useUserWallets,
} from "@dynamic-labs/sdk-react-core";

export default function Header() {
  return (
    <nav className="flex items-center px-12 h-20 justify-between">
      <div className="flex flex-row items-center gap-12">
        <div className="w-24">
          <img
            src="/assets/squidl-logo.png"
            alt="squidl-logo"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      <div className="flex gap-4 items-center justify-center">
        <Button className={"bg-[#563EEA] h-12 rounded-[24px] px-4"}>
          <Icons.link />
          <h1 className={"text-sm font-medium"}>Create Link</h1>
        </Button>

        <UserProfileButton />
      </div>
    </nav>
  );
}

const UserProfileButton = () => {
  const userWallets = useUserWallets();
  const { setShowDynamicUserProfile } = useDynamicContext();

  return (
    <div className={"flex flex-col"}>
      <button
        onClick={() => setShowDynamicUserProfile(true)}
        className="size-12 rounded-full overflow-hidden relative border-[4px] border-[#563EEA]"
      >
        <Nounsies address={userWallets[0]?.address || ""} />
      </button>

      <DynamicUserProfile variant={"dropdown"} />
    </div>
  );
};
