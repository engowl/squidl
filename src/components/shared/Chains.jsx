export default function Chains() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[#A1A1A3] text-sm mt-3">on these supported chain</p>

      <div className="flex gap-1 items-center justify-center">
        <div className="size-6 rounded-full bg-[#A1A1A3]">
          <img
            src="/assets/bsc-logo.png"
            alt="ch"
            className="object-cover w-full h-full"
          />
        </div>
        <div className="size-6 rounded-full bg-[#A1A1A3]">
          <img
            src="/assets/ethc-logo.png"
            alt="ch"
            className="object-cover w-full h-full"
          />
        </div>
        <div className="size-6 rounded-full bg-[#A1A1A3]">
          <img
            src="/assets/line-logo.png"
            alt="ch"
            className="object-cover w-full h-full"
          />
        </div>
        <div className="size-6 rounded-full bg-[#A1A1A3]">
          <img
            src="/assets/flow-logo.png"
            alt="ch"
            className="object-cover w-full h-full"
          />
        </div>
        <div className="size-6 rounded-full bg-[#A1A1A3]">
          <img
            src="/assets/morph-logo.png"
            alt="ch"
            className="object-cover w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}
