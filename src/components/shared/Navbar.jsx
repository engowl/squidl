import { Link } from "react-router-dom";
import { DollarSign, LayoutDashboard, Wallet } from "lucide-react";

export default function Navbar() {
  return (
    <div className="w-full pointer-events-none py-5 flex items-center justify-center fixed bottom-0 left-0">
      <div className="bg-neutral-100 rounded-full p-1 flex text-sm">
        <Link
          to={"/"}
          className="px-3 py-2 rounded-full flex items-center gap-1 bg-neutral-800 text-white"
        >
          <LayoutDashboard className="size-3" />
          Dashboard
        </Link>
        <Link
          to={"/"}
          className="px-3 py-2 rounded-full flex items-center gap-1"
        >
          <Wallet className="size-3" />
          Wallet
        </Link>
        <Link
          to={"/"}
          className="px-3 py-2 rounded-full flex items-center gap-1"
        >
          <DollarSign className="size-3" />
          Payment
        </Link>
      </div>
    </div>
  );
}
