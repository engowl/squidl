import { cnm } from "../../../utils/style";

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
          <div
            className={cnm(
              "rounded-xl h-[269px] w-full",
              link.colorClassname,
              idx > 0 && "-mt-48"
            )}
          >
            <div className="text-white px-6 py-5 w-full flex items-center justify-between">
              <p className="font-medium">{link.name}</p>
              <p>${(293912).toLocaleString("en-US")}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
