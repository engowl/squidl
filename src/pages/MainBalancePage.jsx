import Transactions from "../components/transactions/transactions";

export default function MainBalancePage() {
  return (
    <div className="flex min-h-screen w-full items-start justify-center py-20 px-4 md:px-10">
      <Transactions />
    </div>
  );
}
