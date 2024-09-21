import { motion } from "framer-motion";
import { cnm } from "../../utils/style.js";
import { useNavigate } from "react-router-dom";
import {
  AVAILABLE_CARDS_BG,
  paymentLinks,
} from "../home/dashboard/PaymentLinksDashboard.jsx";
import useSWR from "swr";
import { squidlAPI } from "../../api/squidl.js";

export default function PaymentLinks() {
  const navigate = useNavigate();

  const { data: aliases, isLoading } = useSWR(
    "/stealth-address/aliases",
    async (url) => {
      const { data } = await squidlAPI.get(url);
      return data;
    }
  );

  console.log({ aliases });

  return (
    <div
      className={
        "relative flex flex-col gap-9 w-full max-w-md items-start justify-center bg-[#F9F9FA] rounded-[32px] p-4 md:p-6"
      }
    >
      <h1 className="text-[#19191B] font-medium text-lg">Recently Created</h1>

      <div className="w-full flex flex-col -mt-3 px-6">
        {paymentLinks.map((link, idx) => {
          const bgImage = AVAILABLE_CARDS_BG[idx % AVAILABLE_CARDS_BG.length];

          return (
            <motion.div
              key={idx}
              onClick={() =>
                navigate(`/${link.name}/detail/2`, {
                  state: { layoutId: `payment-card-${link.name}-2` },
                  preventScrollReset: false,
                })
              }
              layout
              layoutId={`payment-card-${link.name}-2`}
              transition={{ duration: 0.4 }}
              className={cnm(
                "relative rounded-2xl h-52 md:h-60 w-full",
                link.colorClassname,
                idx > 0 && "-mt-36 md:-mt-44"
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
                  "relative  px-6 py-5 w-full flex items-center justify-between",
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
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
