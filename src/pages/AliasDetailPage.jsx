import { motion } from "framer-motion";
import AliasDetail from "../components/alias/AliasDetail.jsx";

export function AliasDetailPage() {
  return (
    <motion.div
      layoutScroll
      className="flex h-screen w-full items-start justify-center my-4 px-4 md:px-10 overflow-y-auto"
    >
      <AliasDetail />
    </motion.div>
  );
}
