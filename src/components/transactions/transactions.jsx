import { shortenId } from "../../utils/formatting-utils.js";
import TxItem from "../alias/TxItem.jsx";
import { Icons } from "../shared/Icons.jsx";

export default function Transactions() {
  return (
    <div
      className={
        "relative flex flex-col gap-2 w-full max-w-md items-start justify-center bg-[#F9F9FA] rounded-[32px] p-4 md:p-6"
      }
    >
      <div className="flex items-center justify-between w-full">
        <h1 className="font-bold text-lg text-[#19191B]">Transactions</h1>
        <div className="size-10 p-2 bg-white rounded-full flex items-center justify-center">
          <Icons.allChain className="text-black" />
        </div>
      </div>

      <p className="text-[#A1A1A3] font-medium text-sm mt-1">09/20/2024</p>

      <div className="flex flex-col w-full">
        <TxItem
          tokenImg={"/assets/eth-logo.png"}
          chainImg={"/assets/eth-logo.png"}
          title={"trivial.jane.squidl.me - Deposit"}
          isNounsies
          addressNounsies={"0x02919065a8Ef7A782Bb3D9f3DEFef2FA0a4d1f34"}
          subtitle={`from ${shortenId(
            "0x02919065a8Ef7A782Bb3D9f3DEFef2FA0a4d1f34"
          )}`}
          value={"0.512 USDC"}
          subValue={"$33912"}
        />

        <TxItem
          tokenImg={"/assets/eth-logo.png"}
          chainImg={"/assets/eth-logo.png"}
          title={"xx.jane.squidl.me - Deposit"}
          isNounsies
          addressNounsies={"0x02919065a8Ef7A782Bb3D9f3DEFef2F230a4d1f34"}
          subtitle={`from ${shortenId(
            "0x02919065a8Ef7A782Bb3D9f3DEFef2FA0a4d1f32"
          )}`}
          value={"0.512 USDC"}
          subValue={"$33912"}
        />

        <TxItem
          tokenImg={"/assets/eth-logo.png"}
          chainImg={"/assets/eth-logo.png"}
          title={"yy.jane.squidl.me - Deposit"}
          isNounsies
          addressNounsies={"0x02919065a8Ef7A782Bb3D9f3134Fef2FA0a4d1f34"}
          subtitle={`from ${shortenId(
            "0x02919065a8Ef7A782Bb3D9f3DEFef2FA0a4d1f35"
          )}`}
          value={"0.512 USDC"}
          subValue={"$33912"}
        />
      </div>
    </div>
  );
}
