import { Button } from "@nextui-org/react";
import { Icons } from "../shared/Icons.jsx";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import TokenSelectionDialog from "../dialogs/TokenSelectionDialog.jsx";
import { useNavigate } from "react-router-dom";
import { squidlAPI } from "../../api/squidl.js";

export function Transfer() {
  const [amount, setAmount] = useState();
  const [openTokenDialog, setOpenTokenDialog] = useState(false);
  const navigate = useNavigate();

  const onCopy = (text) => {
    toast.success("Copied to clipboard", {
      id: "copy",
      duration: 1000,
      position: "bottom-center",
    });
    navigator.clipboard.writeText(text);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    const regex = /^[0-9]*[.]?[0-9]*$/;

    if (regex.test(value)) {
      setAmount(value);
    }

    const amountFloat = parseFloat(value);
    if (isNaN(amountFloat) || amountFloat <= 0) {
      setError("Please enter a valid amount");
    } else if (amountFloat > userSOLBalance) {
      setError("Insufficient SOL balance");
    } else {
      setError("");
    }
  };

  const handleKeyDown = (e) => {
    if (
      !/[0-9.]/.test(e.key) &&
      e.key !== "Backspace" &&
      e.key !== "Tab" &&
      e.key !== "ArrowLeft" &&
      e.key !== "ArrowRight" &&
      e.key !== "Delete"
    ) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    squidlAPI.get("/share-identity").then(({ data }) => {
      console.log({ data });
    });
  }, []);

  return (
    <div
      className={
        "relative flex flex-col w-full max-w-md items-start justify-center bg-[#F9F9FA] rounded-[32px] p-4 md:p-6"
      }
    >
      <TokenSelectionDialog
        open={openTokenDialog}
        setOpen={setOpenTokenDialog}
      />

      <div className="flex gap-4">
        <Button className="flex items-center gap-1 bg-white rounded-[21px] h-10 pl-3 pr-4">
          <Icons.back onClick={() => navigate(-1)} className="text-black" />
          <p className="font-bold text-sm text-[#19191B]">Back</p>
        </Button>

        <div className="flex flex-row gap-2 items-center mr-auto">
          <h1 className="text-[#161618] font-bold">
            maisontatsuya.jane.squidl.me
          </h1>

          <button onClick={() => onCopy("link")}>
            <Icons.copy className="text-[#848484] size-4" />
          </button>
        </div>
      </div>

      {/* Transfer */}

      <div className="flex flex-col gap-3 w-full mt-9">
        <h1 className="font-bold text-sm text-[#19191B]">Transfer</h1>

        <div className="relative flex border-[2px] gap-4 border-[#E4E4E4] rounded-[16px]">
          {/* Token */}

          <div
            onClick={() => setOpenTokenDialog(true)}
            className="cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-2 pl-4 py-5 w-full"
          >
            <h1 className="text-sm text-[#19191B]">Token</h1>

            <div className="flex flex-row gap-2">
              <div className="size-6">
                <img
                  src="/assets/eth-logo.png"
                  alt="ic"
                  className="object-contain w-full h-full"
                />
              </div>
              <p className="text-[#252525] font-bold">ETH</p>
              <Icons.dropdown className="text-[#252525]" />
            </div>
          </div>

          <div className="h-auto w-[4px] bg-[#E4E4E4] mx-auto" />

          {/* Chain */}

          <div
            onClick={() => setOpenTokenDialog(true)}
            className="cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between pr-4 py-5 w-full"
          >
            <h1 className="text-sm text-[#19191B]">Chain</h1>

            <div className="flex flex-row gap-2">
              <div className="size-6">
                <img
                  src="/assets/eth-logo.png"
                  alt="ic"
                  className="object-contain w-full h-full"
                />
              </div>
              <p className="text-[#252525] font-bold">ETH</p>
              <Icons.dropdown className="text-[#252525]" />
            </div>
          </div>
        </div>

        {/* Input Amount */}
        <div className="mt-1 flex items-center justify-between h-16 w-full rounded-[16px] border-[2px] border-[#E4E4E4] px-6">
          <input
            className="py-2 bg-transparent transition-colors placeholder:text-[#A1A1A3] focus-visible:outline-none focus-visible:ring-none disabled:cursor-not-allowed disabled:opacity-50"
            value={amount}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="0.00"
          />

          <div className="flex gap-4">
            <div className="flex flex-col items-end justify-center text-end">
              <p className="text-xs text-[#A1A1A3]">Balance</p>
              <p className="text-[#A1A1A3] text-sm">100.000</p>
            </div>

            <div className="h-16 w-[2px] bg-[#E4E4E4]" />

            <button className=" text-[#563EEA] font-bold text-sm">Max</button>
          </div>
        </div>
      </div>

      {/* To */}

      <div className="flex flex-col gap-3 w-full mt-9">
        <h1 className="font-bold text-sm text-[#19191B]">To</h1>

        <div className="flex items-center justify-between px-4 py-3 gap-4 bg-[#EEEEFF] border-[2px] border-[#3333CC] rounded-[16px]">
          <p className="text-[#161618]">maisontatsuya.jane.squidl.me</p>
          <div className="size-9">
            <img
              src="/assets/oasis-logo.png"
              alt="ic"
              className="object-contain w-full h-full"
            />
          </div>
        </div>
      </div>

      <Button className="h-16 mt-[10vh] md:mt-[15vh] bg-[#19191B] w-full rounded-[42px] font-bold">
        Transfer to Private Wallet
      </Button>
    </div>
  );
}
