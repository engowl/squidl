import { motion } from "framer-motion";
import { cnm } from "../../../utils/style";
import { Link, useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import { isBackAtom } from "../../../store/payment-card-store.js";

const paymentLinks = [
  {
    name: "blabla.squidl.me",
    colorClassname: "bg-green-500",
  },
  {
    name: "john.squidl.me",
    colorClassname: "bg-blue-500",
  },
  {
    name: "marquee.squidl.me",
    colorClassname: "bg-red-500",
  },
];

export default function PaymentLinks() {
  const navigate = useNavigate();
  const isBackValue = useAtomValue(isBackAtom);

  return (
    <div id="payment-links" className="w-full rounded-3xl bg-neutral-50 pb-6">
      <motion.div
        initial={{
          y: isBackValue ? "-2rem" : "0",
          opacity: isBackValue ? 0 : 1,
        }}
        animate={{
          y: isBackValue ? "0" : "-2rem",
          opacity: isBackValue ? 1 : 0,
          transition: {
            duration: 0.6,
          },
        }}
        className="w-full flex items-center justify-between px-6 py-6"
      >
        <p className="text-xl">Payment Links</p>
        <button className="bg-purply-50 rounded-full px-3 py-2 text-purply">
          See More
        </button>
      </motion.div>
      <div className="w-full flex flex-col mt-5 px-6">
        {paymentLinks.map((link, idx) => (
          <motion.div
            key={idx}
            onClick={() =>
              navigate(`/${link.name}/detail`, {
                state: { layoutId: `payment-card-${link.name}` },
                preventScrollReset: false,
              })
            }
            layout={isBackValue.layoutId != `payment-card-${link.name}`}
            layoutId={
              isBackValue.layoutId != `payment-card-${link.name}`
                ? ""
                : `payment-card-${link.name}`
            }
            initial={{
              y:
                isBackValue.isBack &&
                isBackValue.layoutId == `payment-card-${link.name}`
                  ? "-2rem"
                  : "0",
            }}
            animate={{
              y:
                isBackValue.isBack &&
                isBackValue.layoutId == `payment-card-${link.name}`
                  ? "0"
                  : "-2rem",
            }}
            transition={{ duration: 0.4 }}
            className={cnm(
              "relative rounded-xl h-[269px] w-full",
              link.colorClassname,
              idx > 0 && "-mt-48"
            )}
            whileHover={{ rotate: -5, y: -10 }}
            viewport={{ once: true, amount: 0.5 }}
          >
            <div className="text-white px-6 py-5 w-full flex items-center justify-between">
              <p className="font-medium">{link.name}</p>
              <p>${(293912).toLocaleString("en-US")}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
