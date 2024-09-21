import { motion } from "framer-motion";
import { cnm } from "../../../utils/style";
import { Link, useNavigate } from "react-router-dom";

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

  return (
    <div className="w-full rounded-3xl bg-neutral-50 pb-6">
      <div className="w-full flex items-center justify-between px-6 py-6">
        <p className="text-xl">Payment Links</p>
        <button className="bg-purply-50 rounded-full px-3 py-2 text-purply">
          See More
        </button>
      </div>
      <div className="w-full flex flex-col mt-5 px-6">
        {paymentLinks.map((link, idx) => (
          <motion.div
            onClick={() =>
              navigate(`/${link.name}/detail`, {
                state: { layoutId: `payment-card-${link.name}` },
                preventScrollReset: false,
              })
            }
            layout
            layoutId={`payment-card-${link.name}`}
            transition={{ duration: 0.4 }}
            className={cnm(
              "relative rounded-xl h-[269px] w-full",
              link.colorClassname,
              idx > 0 && "-mt-48"
            )}
            whileHover={{ rotate: -5, y: -10 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ type: "ease", stiffness: 300, damping: 20 }}
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
