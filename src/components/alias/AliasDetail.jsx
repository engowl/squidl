import { Button } from "@nextui-org/react";
import { Icons } from "../shared/Icons.jsx";
import TxItem from "./TxItem.jsx";
import { shortenId } from "../../utils/FormattingUtils.js";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function AliasDetail() {
  const navigate = useNavigate();
  const onCopy = (text) => {
    toast.success("Copied to clipboard", {
      id: "copy",
      duration: 1000,
      position: "bottom-center",
    });
    navigator.clipboard.writeText(text);
  };

  return (
    <div
      className={
        "flex flex-col w-full max-w-md items-start justify-center bg-[#F9F9FA] rounded-[32px] p-4 md:p-6 gap-6"
      }
    >
      <div className="flex items-center justify-between w-full">
        <Button className="flex items-center gap-1 bg-white rounded-[21px] h-10 pl-3 pr-4">
          <Icons.back className="text-black" />
          <p className="font-bold text-sm text-[#19191B]">Back</p>
        </Button>

        <div className="size-10 p-2 bg-white rounded-full">
          <div className="h-full w-full rounded-full bg-slate-400" />
        </div>
      </div>

      {/* Card */}

      <motion.div
        layout
        layoutId="payment-card"
        className="relative w-full h-full"
      >
        <img
          src="/assets/card.png"
          alt="card-placeholder"
          className="absolute w-full h-full object-cover rounded-[24px]"
        />

        <div className="relative w-full h-52 md:h-60 flex flex-col items-center justify-start py-6 px-5">
          <div className="flex flex-row gap-2 items-center mr-auto">
            <h1 className="text-white font-bold">
              maisontatsuya.jane.squidl.me
            </h1>

            <button onClick={() => onCopy("link")}>
              <Icons.copy className="text-[#848484] size-4" />
            </button>
          </div>

          <h1 className="absolute top-1/2 -translate-y-1/2 text-white font-extrabold text-2xl">
            $8,888,888.88
          </h1>

          <div className="absolute left-5 bottom-6 flex items-center justify-between">
            <h1 className="text-[#484B4E] font-bold text-2xl">SQUIDL</h1>
          </div>

          <div className="absolute right-5 bottom-6 flex items-center justify-between">
            <img
              src="/assets/squidl-logo-only.png"
              alt="logo"
              className="object-contain w-12 h-16"
            />
          </div>
        </div>
      </motion.div>

      <div className="flex gap-4 items-center w-full">
        <Button className="h-16 bg-[#19191B] w-full rounded-[42px] font-bold">
          Share
        </Button>
        <Button
          onClick={() => navigate("/alias/transfer")}
          className="h-16 bg-[#19191B] w-full rounded-[42px] font-bold"
        >
          Transfer
        </Button>
      </div>

      {/* Assets */}

      <div className="flex flex-col w-full gap-3">
        <h1 className="font-bold text-[#19191B] text-lg">Assets</h1>

        <div className="flex flex-col w-full">
          <TxItem
            tokenImg={"/assets/eth-logo.png"}
            chainImg={"/assets/eth-logo.png"}
            title={"Ethereum"}
            subtitle={"Ethereum"}
            value={"0.512"}
            subValue={"$124.29"}
          />

          <TxItem
            tokenImg={"/assets/eth-logo.png"}
            chainImg={"/assets/eth-logo.png"}
            title={"Ethereum"}
            subtitle={"Ethereum"}
            value={"0.512"}
            subValue={"$124.29"}
          />

          <TxItem
            tokenImg={"/assets/eth-logo.png"}
            chainImg={"/assets/eth-logo.png"}
            title={"Ethereum"}
            subtitle={"Ethereum"}
            value={"0.512"}
            subValue={"$124.29"}
          />
        </div>
      </div>

      {/* Transactions */}

      <div className="flex flex-col w-full gap-3">
        <h1 className="font-bold text-[#19191B] text-lg">Transactions</h1>
        <p className="text-[#A1A1A3] font-medium text-sm mt-1">09/20/2024</p>
        <div className="flex flex-col w-full">
          <TxItem
            tokenImg={"/assets/eth-logo.png"}
            chainImg={"/assets/eth-logo.png"}
            title={"Ethereum"}
            subtitle={`from ${shortenId(
              "0x02919065a8Ef7A782Bb3D9f3DEFef2FA0a4d1f37"
            )}`}
            value={"0.512"}
          />

          <TxItem
            tokenImg={"/assets/eth-logo.png"}
            chainImg={"/assets/eth-logo.png"}
            title={"Ethereum"}
            subtitle={`from ${shortenId(
              "0x02919065a8Ef7A782Bb3D9f3DEFef2FA0a4d1f37"
            )}`}
            value={"0.512"}
          />

          <TxItem
            tokenImg={"/assets/eth-logo.png"}
            chainImg={"/assets/eth-logo.png"}
            title={"Ethereum"}
            subtitle={`from ${shortenId(
              "0x02919065a8Ef7A782Bb3D9f3DEFef2FA0a4d1f37"
            )}`}
            value={"0.512"}
          />
        </div>
      </div>
    </div>
  );
}
