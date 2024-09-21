import { useEffect, useState } from "react";
import { squidlAPI } from "../../../api/squidl";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { cnm } from "../../../utils/style";
import { Button, Skeleton } from "@nextui-org/react";
import QrCodeIcon from "../../../assets/icons/qr-code.svg?react";
import CopyIcon from "../../../assets/icons/copy.svg?react";
import { AnimatePresence, motion } from "framer-motion";
import BalanceChart from "./BalanceChart";
import { useAtomValue } from "jotai";
import { isBackAtom } from "../../../store/payment-card-store";
import { Fingerprint, Handshake, Lock } from "lucide-react";
import QrDialog from "../../dialogs/QrDialog.jsx";
import PaymentLinksDashboard from "./PaymentLinksDashboard.jsx";
import useSWR from "swr";
import { shortenAddress } from "../../../utils/string.js";
import toast from "react-hot-toast";
import { Icons } from "../../shared/Icons.jsx";

export default function Dashboard() {
  const { handleLogOut } = useDynamicContext();
  const [openQr, setOpenQr] = useState(false);

  const isBackValue = useAtomValue(isBackAtom);

  const { data: user, isLoading } = useSWR("/auth/me", async (url) => {
    const { data } = await squidlAPI.get(url);
    return data;
  });

  useEffect(() => {
    if (isBackValue.isBack) {
      const paymentLinks = document.querySelector("#payment-links");
      paymentLinks.scrollIntoView({
        behavior: "instant",
      });
    }
  }, [isBackValue.isBack]);

  return (
    <>
      <QrDialog
        open={openQr}
        setOpen={setOpenQr}
        qrUrl={
          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/QR_Code_Example.svg/1200px-QR_Code_Example.svg.png"
        }
      />

      <motion.div
        layoutScroll
        className="w-full h-screen flex flex-col items-center overflow-y-auto"
      >
        <div className="flex flex-col items-center py-20 w-full">
          <div className="w-full max-w-md flex flex-col items-center gap-4 pt-12 pb-20">
            <ReceiveCard
              setOpenQr={setOpenQr}
              user={user}
              isLoading={isLoading}
            />
            <TotalBalance />
            <PaymentLinksDashboard />
          </div>
        </div>
      </motion.div>
    </>
  );
}

function ReceiveCard({ setOpenQr, user, isLoading }) {
  const [mode, setMode] = useState("ens");

  const onCopy = (text) => {
    navigator.clipboard.writeText(
      mode === "ens" ? `${user.username}.squidl.me` : `${user.address}`
    );
    toast.success("Copied to clipboard", {
      duration: 1000,
      position: "bottom-center",
    });
  };

  return (
    <div className="bg-purply p-4 rounded-3xl text-white w-full">
      <div className="w-full flex items-center justify-between">
        <p className="text-xl">Receive</p>
        <div className="bg-purply-800 rounded-full p-1 flex relative items-center font-medium">
          <div
            className={cnm(
              "w-24 bg-purply-600 h-[calc(100%-8px)] absolute left-1 rounded-full transition-transform ease-in-out",
              mode === "ens" ? "translate-x-0" : "translate-x-full"
            )}
          ></div>
          <button
            onClick={() => {
              setMode("ens");
            }}
            className={cnm(
              "w-24 h-8 rounded-full flex items-center justify-center relative transition-colors",
              mode === "ens" ? "text-white" : "text-purply-500"
            )}
          >
            ENS
          </button>
          <button
            onClick={() => {
              setMode("address");
            }}
            className={cnm(
              "w-24 h-8 rounded-full flex items-center justify-center relative transition-colors",
              mode === "address" ? "text-white" : "text-purply-500"
            )}
          >
            Address
          </button>
        </div>
      </div>
      <div className="bg-white rounded-full w-full h-14 mt-4 flex items-center justify-between pl-6 pr-2 text-black">
        {isLoading ? (
          <Skeleton className="w-32 h-5 rounded-xl" />
        ) : (
          <>
            {mode === "address" ? (
              <p>{shortenAddress(user.address)}</p>
            ) : (
              <p>{user.username}.squidl.me</p>
            )}
          </>
        )}
        <div className="flex items-center gap-2">
          {mode === "address" ? (
            <button className="bg-purply-50 size-9 rounded-full flex items-center justify-center">
              <Icons.refresh className="text-[#563EEA] size-5" />
            </button>
          ) : (
            <button
              onClick={() => setOpenQr(true)}
              className="bg-purply-50 size-9 rounded-full flex items-center justify-center"
            >
              <QrCodeIcon className="size-5" />
            </button>
          )}
          <button
            onClick={onCopy}
            className="bg-purply-50 size-9 rounded-full flex items-center justify-center"
          >
            <CopyIcon className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function TotalBalance() {
  const [mode, setMode] = useState("available");
  return (
    <div
      className={cnm(
        "w-full rounded-3xl overflow-hidden transition-colors duration-300",
        mode === "private" && "bg-oasis-blue"
      )}
    >
      <div className="w-full rounded-3xl bg-neutral-50 z-10">
        <div className="w-full flex items-center justify-between px-6 py-6">
          <p className="font-medium text-xl">Total Balance</p>
          <div className="bg-neutral-200 rounded-full flex relative items-center font-medium">
            <div
              className={cnm(
                "w-24 bg-white h-full absolute left-0 rounded-full transition-all ease-in-out",
                mode === "available"
                  ? "translate-x-0 bg-white"
                  : "translate-x-full bg-oasis-blue"
              )}
            ></div>
            <button
              onClick={() => {
                setMode("available");
              }}
              className={cnm(
                "w-24 h-9 rounded-full flex items-center justify-center relative transition-colors",
                mode === "ens" ? "text-black" : "text-neutral-500"
              )}
            >
              Available
            </button>
            <button
              onClick={() => {
                setMode("private");
              }}
              className={cnm(
                "w-24 h-9 rounded-full flex items-center justify-center relative transition-colors",
                mode === "private" ? "text-white" : "text-neutral-500"
              )}
            >
              Private
            </button>
          </div>
        </div>
        <BalanceMode mode={mode} />
      </div>
      <motion.div
        initial={{
          opacity: 0,
          height: 0,
        }}
        animate={{
          height: mode === "private" ? 40 : 0,
          opacity: mode === "private" ? 1 : 0,
        }}
        transition={{
          duration: 0.3,
        }}
        className="flex items-center justify-center text-white text-xs bg-oasis-blue"
      >
        On Oasis Saphire, your funds stay private and untraceable
      </motion.div>
    </div>
  );
}

function BalanceMode({ mode }) {
  return (
    <>
      <div className="w-full relative h-80">
        <AnimatePresence mode="wait">
          {mode === "available" ? (
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              className="w-full h-full relative"
            >
              <BalanceChart />
            </motion.div>
          ) : (
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              className="w-full relative h-full"
            >
              <RadarPrivate />
            </motion.div>
          )}
        </AnimatePresence>
        <p
          className={cnm(
            "text-4xl font-semibold absolute transition-all",
            "left-6 top-2"
          )}
        >
          $100,000
        </p>
      </div>
      <div className="mt-4 w-full flex items-center gap-2 px-6 py-6 text-lg">
        <Button
          className={cnm(
            " flex-1 rounded-full h-14",
            mode === "available"
              ? "bg-purply-50 text-purply"
              : "bg-oasis-blue/10 text-oasis-blue"
          )}
        >
          Details
        </Button>
        <Button
          className={cnm(
            " flex-1 rounded-full h-14",
            mode === "available"
              ? "bg-purply text-white"
              : "bg-oasis-blue text-white"
          )}
        >
          Transfer
        </Button>
      </div>
    </>
  );
}

function RadarPrivate() {
  return (
    <div
      style={{
        mask: `linear-gradient(0deg, transparent, #000 20%, #000 80%, transparent 100%)`,
      }}
      className="w-full h-full relative overflow-hidden"
    >
      <div className="w-full h-full absolute translate-y-1/2">
        <img
          src="/assets/radar-bg.png"
          alt="radar-bg"
          className="w-full h-full object-contain scale-[1.4] absolute"
        />
        <div className="w-full h-full relative">
          <div className="private-radar-scanner"></div>
          <div className="w-full h-full absolute">
            {/* Icon 1 */}
            <div className="absolute left-1/2 -translate-x-1/2 top-12">
              <div className="relative flex items-center justify-center">
                <div className="size-8 rounded-full bg-oasis-blue/10 animate-pulse"></div>
                <div className="size-5 rounded-full bg-oasis-blue/80 absolute animate-pulse flex items-center justify-center">
                  <Lock className="size-3 text-white" />
                </div>
              </div>
            </div>
            {/* Icon 2 */}
            <div className="absolute left-20 top-16">
              <div className="relative flex items-center justify-center">
                <div className="size-8 rounded-full bg-oasis-blue/10 animate-pulse"></div>
                <div className="size-5 rounded-full bg-oasis-blue/80 absolute animate-pulse flex items-center justify-center">
                  <Handshake className="size-3 text-white" />
                </div>
              </div>
            </div>
            {/* Icon 1 */}
            <div className="absolute right-24 top-24">
              <div className="relative flex items-center justify-center">
                <div className="size-8 rounded-full bg-oasis-blue/10 animate-pulse"></div>
                <div className="size-5 rounded-full bg-oasis-blue/80 absolute animate-pulse flex items-center justify-center">
                  <Fingerprint className="size-3 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
