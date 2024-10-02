import { motion } from "framer-motion";
import { cnm } from "../../../utils/style.js";
import { useNavigate } from "react-router-dom";
import { useAtom, useAtomValue } from "jotai";
import { isBackAtom } from "../../../store/payment-card-store.js";
import { Button, Skeleton } from "@nextui-org/react";
import useSWR from "swr";
import { squidlAPI } from "../../../api/squidl.js";
import { isCreateLinkDialogAtom } from "../../../store/dialog-store.js";
import SquidLogo from "../../../assets/squidl-logo.svg?react";
import { useEffect } from "react";

export const paymentLinks = [
  {
    name: "blabla.squidl.me",
  },
  {
    name: "john.squidl.me",
  },
  {
    name: "marquee.squidl.me",
  },
  {
    name: "test.squidl.me",
  },
  {
    name: "dd.squidl.me",
  },
  {
    name: "ss.squidl.me",
  },
  {
    name: "xx.squidl.me",
  },
  {
    name: "doe.squidl.me",
  },
];

export const AVAILABLE_CARDS_BG = [
  "/assets/card-1.png",
  "/assets/card-2.png",
  "/assets/card-3.png",
  "/assets/card-4.png",
];

export const CARDS_SCHEME = [0, 1, 2, 3];

export default function PaymentLinksDashboard({ user }) {
  const [isOpen, setOpen] = useAtom(isCreateLinkDialogAtom);
  const navigate = useNavigate();
  const isBackValue = useAtomValue(isBackAtom);

  const {
    data: aliases,
    isLoading,
    mutate,
    isValidating,
  } = useSWR("/stealth-address/aliases", async (url) => {
    const { data } = await squidlAPI.get(url);
    return data;
  });

  useEffect(() => {
    if (!isOpen) {
      mutate();
    }
  }, [isOpen]);

  return (
    <div
      id="payment-links"
      className="w-full rounded-3xl pb-6 relative overflow-hidden"
    >
      <motion.div
        initial={{
          opacity: isBackValue.isBack ? 0 : 1,
        }}
        animate={{
          opacity: 1,
          transition: {
            duration: 0.6,
          },
        }}
        className="bg-neutral-100 absolute inset-0"
      />
      <motion.div
        initial={{
          y: isBackValue.isBack ? "-2rem" : "0",
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
          transition: {
            duration: 0.6,
          },
        }}
        className="w-full flex items-center justify-between px-6 py-6 relative"
      >
        <p className="text-xl">Payment Links</p>
        <Button
          onClick={() => {
            navigate("/payment-links");
          }}
          className="bg-purply-50 rounded-full px-4 text-purply h-10 flex items-center"
        >
          See More
        </Button>
      </motion.div>
      {isLoading ? (
        <Skeleton className="rounded-2xl w-full h-72" />
      ) : (
        <div className="w-full flex flex-col px-6">
          {aliases && aliases.length > 0 ? (
            aliases.slice(0, 4).map((alias, idx) => {
              console.log({ alias });
              const bgImage =
                AVAILABLE_CARDS_BG[idx % AVAILABLE_CARDS_BG.length];
              const userAlias = alias.alias
                ? `${alias.alias}.${user?.username}`
                : user?.username;
              const colorScheme = CARDS_SCHEME[idx % CARDS_SCHEME.length];
              return (
                <motion.button
                  key={idx}
                  onClick={() =>
                    navigate(`/${userAlias}/detail/1?scheme=${colorScheme}`, {
                      state: { layoutId: `payment-card-${userAlias}-1` },
                      preventScrollReset: false,
                    })
                  }
                  layout
                  layoutId={`payment-card-${userAlias}-1`}
                  transition={{ duration: 0.4 }}
                  className={cnm(
                    "relative rounded-2xl h-60 w-full flex items-start",
                    idx > 0 && "-mt-36 md:-mt-44"
                  )}
                  whileHover={{ rotate: -5, y: -20 }}
                >
                  <img
                    src={bgImage}
                    alt="card-bg"
                    className="absolute w-full h-full object-cover rounded-[24px] inset-0"
                  />

                  <div
                    className={cnm(
                      "relative px-6 py-5 w-full flex items-center justify-between",
                      `${
                        bgImage === "/assets/card-2.png"
                          ? "text-black"
                          : "text-white"
                      }`
                    )}
                  >
                    <p className="font-medium">
                      {alias.alias ? `${alias.alias}.` : ``}
                      {user?.username}
                      .squidl.me
                    </p>
                    <p>${alias.balanceUsd.toLocaleString("en-US")}</p>
                  </div>

                  <div className="absolute left-5 bottom-6 flex items-center justify-between">
                    <h1
                      className={cnm(
                        "font-bold text-2xl",
                        bgImage === "/assets/card-2.png"
                          ? "text-black"
                          : "text-white"
                      )}
                    >
                      SQUIDL
                    </h1>
                  </div>

                  <div className="absolute right-5 bottom-6 flex items-center justify-between">
                    {/* <img
                      src="/assets/squidl-logo-only.png"
                      alt="logo"
                      className="object-contain w-12 h-16 invert"
                    /> */}
                    <SquidLogo
                      className={cnm(
                        "w-12 ",
                        bgImage === "/assets/card-2.png"
                          ? "fill-black"
                          : "fill-white"
                      )}
                    />
                  </div>
                </motion.button>
              );
            })
          ) : (
            <div className="w-full min-h-64 flex flex-col items-center justify-center gap-4 font-medium relative">
              <p className="text-sm">No payment links available yet</p>
              <Button
                onClick={() => {
                  setOpen(true);
                }}
                className="px-4 py-2 rounded-full bg-purply text-white"
              >
                Create Payment Link
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
