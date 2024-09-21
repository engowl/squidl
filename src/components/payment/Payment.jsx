import toast from "react-hot-toast";
import { Icons } from "../shared/Icons.jsx";
import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { Button } from "@nextui-org/react";
import { shortenId } from "../../utils/FormattingUtils.js";
import { QRCode } from "react-qrcode-logo";
import axios from "axios";
import useSWR from "swr";
import OnRampDialog from "../dialogs/OnrampDialog.jsx";
import { useState } from "react";
import SuccessDialog from "../dialogs/SuccessDialog.jsx";
import Chains from "../shared/Chains.jsx";

export default function Payment() {
  const isLoggedIn = useIsLoggedIn();
  const [openOnramp, setOpenOnramp] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const { setShowAuthFlow, primaryWallet } = useDynamicContext();

  const { data: aliasAddress, isLoading } = useSWR(
    "/stealth-address/address/new-address",
    async (url) => {
      const { data } = await axios.get(`https://api.squidl.me` + url);
      return data.address;
    }
  );

  const onCopy = (text) => {
    toast.success("Copied to clipboard", {
      id: "copy",
      duration: 1000,
      position: "bottom-center",
    });
    navigator.clipboard.writeText(text);
  };

  const onRampClick = () => {
    openFunding({
      token: "ETH",
      address: "0x02919065a8Ef7A782Bb3D9f3DEFef2FA0a4d1f37",
    }).then(() => {
      //TODO: trigger make payment from linea
      window.alert("Success!");
    });
  };

  const signTx = async () => {
    const signature = await primaryWallet.signMessage("send");
  };

  return (
    <>
      <SuccessDialog
        open={openSuccess}
        setOpen={setOpenSuccess}
        botButtonHandler={() => {
          setOpenSuccess(false);
        }}
        botButtonTitle={"Done"}
        title={"Transaction Submitted"}
        caption={
          "0.125 ETH transferred from Polygon to Oasis Sapphire Private Wallet"
        }
      />

      <OnRampDialog
        open={openOnramp}
        setOpen={setOpenOnramp}
        targetWallet={primaryWallet}
        onSuccessOnramp={() => {
          signTx();
        }}
      />

      <div
        className={
          "flex flex-col w-full max-w-md h-full max-h-screen items-center justify-center gap-5"
        }
      >
        <div className="w-36">
          <img
            src="/assets/squidl-logo.png"
            alt="squidl-logo"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Content */}
        <div className="bg-[#F9F9FA] rounded-[32px] py-9 px-10 md:px-20 flex flex-col items-center justify-center w-full h-full">
          <h1 className="font-medium text-xl">Send to Jane</h1>

          <Chains />

          <div className="bg-[#563EEA] rounded-3xl mt-7 p-5 flex flex-col items-center justify-center gap-4 w-full">
            <div className="w-full bg-white overflow-hidden p-1 rounded-xl">
              <QRCode
                value="https://bozo.squidl.me/0x32232332sa"
                qrStyle="dots"
                logoImage="/assets/squidl-logo-only.png"
                style={{
                  width: "100%",
                  height: "100%",
                }}
              />
            </div>

            <div className="flex flex-row items-center gap-2.5">
              <h1 className="font-medium text-lg text-[#F4F4F4]">
                jane.squidl.me
              </h1>
              <button onClick={() => onCopy("link")}>
                <Icons.copy className="text-[#B9BCFF]" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4 mt-4 items-center justify-center w-full">
            <div className="flex bg-white rounded-[30.5px] gap-4 w-full items-center justify-between">
              <h1 className="text-[#19191B] font-medium px-4 py-3">
                {isLoading ? "" : shortenId(aliasAddress)}
              </h1>
              <button
                onClick={() => onCopy("address")}
                className="flex p-3 bg-[#E9ECFC] rounded-full m-1"
              >
                <Icons.copy className="text-[#563EEA] size-6" />
              </button>
            </div>

            <p className="text-[#A1A1A3]">or</p>

            {/* OnRamp */}

            {isLoggedIn ? (
              <Button
                onClick={() => setOpenOnramp(true)}
                className="bg-[#563EEA] text-[#F4F4F4] font-bold py-5 px-6 h-16 w-full rounded-[32px]"
              >
                Pay with Credit Card
              </Button>
            ) : (
              <Button
                onClick={() => setShowAuthFlow(true)}
                className="bg-[#563EEA] text-[#F4F4F4] font-bold py-5 px-6 h-16 w-full rounded-[32px]"
              >
                Log in to pay with a credit card
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
