import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="flex items-center px-12 h-20 justify-between">
      <div className="w-24">
        <img
          src="/assets/squidl-logo.png"
          alt="squidl-logo"
          className="w-full h-full object-contain"
        />
      </div>

      <div className="flex items-center gap-3">
        <Link
          to={"/"}
          className="text-purply bg-neutral-50 px-3 py-2 rounded-xl"
        >
          Dashboard
        </Link>
        <Link
          to="/payment"
          className="text-purply bg-neutral-50 px-3 py-2 rounded-xl"
        >
          Payment
        </Link>
        <Link
          to={"/wallet"}
          className="text-purply bg-neutral-50 px-3 py-2 rounded-xl"
        >
          Wallet
        </Link>
      </div>
    </nav>
  );
}
