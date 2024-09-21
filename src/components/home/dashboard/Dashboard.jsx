import { useEffect, useState } from "react";
import { squidlAPI } from "../../../api/squidl";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { cnm } from "../../../utils/style";
import { Button } from "@nextui-org/react";
import QrCodeIcon from "../../../assets/icons/qr-code.svg?react";
import CopyIcon from "../../../assets/icons/copy.svg?react";
import PaymentLinks from "./PaymentLinks";

export default function Dashboard() {
  const { handleLogOut } = useDynamicContext();
  useEffect(() => {
    squidlAPI.get("/auth/me").then(({ data }) => {
      console.log(data);
    });
  }, []);

  const isBackValue = useAtomValue(isBackAtom);

  useEffect(() => {
    if (isBackValue.isBack) {
      const paymentLinks = document.querySelector("#payment-links");
      paymentLinks.scrollIntoView({
        behavior: "instant",
      });
    }
  }, [isBackValue.isBack]);
  return (
    <motion.div
      layoutScroll
      className="w-full h-screen flex flex-col items-center  overflow-y-auto"
    >
      <div className="w-full max-w-md flex flex-col items-center gap-4 pt-12 pb-20">
        <ReceiveCard />
        <TotalBalance />
        <PaymentLinks />
      </div>
    </motion.div>
  );
}

function ReceiveCard() {
  const [mode, setMode] = useState("ens");

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
        <p>jane.squidl.me</p>
        <div className="flex items-center gap-2">
          <div className="bg-purply-50 size-9 rounded-full flex items-center justify-center">
            <QrCodeIcon className="size-5" />
          </div>
          <div className="bg-purply-50 size-9 rounded-full flex items-center justify-center">
            <CopyIcon className="size-5" />
          </div>
        </div>
      </div>
    </div>
  );
}

function TotalBalance() {
  const [mode, setMode] = useState("available");
  return (
    <div className="w-full rounded-3xl bg-neutral-50">
      <div className="w-full flex items-center justify-between px-6 py-6">
        <p className="font-medium text-xl">Total Balance</p>
        <div className="bg-neutral-200 rounded-full p-1 flex relative items-center font-medium">
          <div
            className={cnm(
              "w-24 bg-white h-[calc(100%-8px)] absolute left-1 rounded-full transition-transform ease-in-out",
              mode === "ens" ? "translate-x-0" : "translate-x-full"
            )}
          ></div>
          <button
            onClick={() => {
              setMode("ens");
            }}
            className={cnm(
              "w-24 h-8 rounded-full flex items-center justify-center relative transition-colors",
              mode === "ens" ? "text-black" : "text-neutral-500"
            )}
          >
            Available
          </button>
          <button
            onClick={() => {
              setMode("address");
            }}
            className={cnm(
              "w-24 h-8 rounded-full flex items-center justify-center relative transition-colors",
              mode === "address" ? "text-black" : "text-neutral-500"
            )}
          >
            Private
          </button>
        </div>
      </div>

      <div className="w-full min-h-80">
        <PixelatedChart />
      </div>
      <div className="mt-4 w-full flex items-center gap-2 px-6 py-6 text-base">
        <Button className="bg-purply-50 text-purply flex-1 rounded-full">
          Details
        </Button>
        <Button className="bg-purply-500 text-white flex-1 rounded-full">
          Transfer
        </Button>
      </div>
    </div>
  );
}

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { motion } from "framer-motion";
import { useAtomValue } from "jotai";
import { isBackAtom } from "../../../store/payment-card-store";

const data = [
  { name: "Page A", uv: 400 },
  { name: "Page B", uv: 300 },
  { name: "Page C", uv: 200 },
  { name: "Page D", uv: 278 },
  { name: "Page E", uv: 189 },
  { name: "Page F", uv: 239 },
  { name: "Page G", uv: 349 },
];

const PixelatedChart = () => {
  return (
    <div style={{ position: "relative" }}>
      <svg width="0" height="0">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="1 1"
            stroke="rgba(128, 0, 255, 0.3)"
          />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="uv"
            stroke="#8884d8"
            fill="rgba(136, 132, 216, 0.5)"
            strokeWidth={0}
            fillOpacity={1}
            fillRule="evenodd"
            style={{
              filter: "url(#glow)",
              shapeRendering: "crispEdges", // To ensure pixel-like rendering
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
