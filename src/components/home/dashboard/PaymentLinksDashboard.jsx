import { motion } from "framer-motion";
import { cnm } from "../../../utils/style.js";
import { useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import { isBackAtom } from "../../../store/payment-card-store.js";

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

export default function PaymentLinksDashboard() {
  const navigate = useNavigate();
  const isBackValue = useAtomValue(isBackAtom);

  console.log(isBackValue);

  return (
    <div id="payment-links" className="w-full rounded-3xl pb-6 relative">
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
        <button className="bg-purply-50 rounded-full px-3 py-2 text-purply">
          See More
        </button>
      </motion.div>
      <div className="w-full flex flex-col px-6">
        {paymentLinks.map((link, idx) => {
          const bgImage = AVAILABLE_CARDS_BG[idx % AVAILABLE_CARDS_BG.length];

          return (
            <motion.button
              key={idx}
              onClick={() =>
                navigate(`/${link.name}/detail/1`, {
                  state: { layoutId: `payment-card-${link.name}-1` },
                  preventScrollReset: false,
                })
              }
              layout
              layoutId={`payment-card-${link.name}-1`}
              transition={{ duration: 0.4 }}
              className={cnm(
                "relative rounded-2xl h-52 md:h-60 w-full",
                link.colorClassname,
                idx > 0 && "-mt-36 md:-mt-44",
                idx >= 4 ? "opacity-0 hidden" : "opacity-100 block"
              )}
              whileHover={{ rotate: -5, y: -10 }}
              viewport={{ once: true, amount: 0.5 }}
            >
              <img
                src={bgImage}
                alt="card-bg"
                className="absolute w-full h-full object-cover rounded-[24px]"
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
                <p className="font-medium">{link.name}</p>
                <p>${(293912).toLocaleString("en-US")}</p>
              </div>

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
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
