export default function TxItem({
  tokenImg,
  chainImg,
  title,
  subtitle,
  value,
  subValue,
}) {
  return (
    <div className="flex gap-4 w-full py-3">
      <div className="relative size-12">
        <img src={tokenImg} alt="ic" className="object-contain w-full h-full" />
        <img
          src={chainImg}
          alt="ic"
          className="absolute top-0 -right-2 object-contain size-6"
        />
      </div>

      <div className="flex items-start justify-between w-full">
        <div className="flex flex-col">
          <h1 className="font-bold text-[#161618]">{title}</h1>
          {subtitle && (
            <p className="font-medium text-[#A1A1A3] text-sm">{subtitle}</p>
          )}
        </div>

        <div className="flex flex-col text-end items-end">
          <h1 className="font-bold text-[#161618]">{value}</h1>
          {subValue && (
            <p className="font-medium text-[#A1A1A3] text-sm">{subValue}</p>
          )}
        </div>
      </div>
    </div>
  );
}
