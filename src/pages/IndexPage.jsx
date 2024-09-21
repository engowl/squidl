import { ScrollRestoration } from "react-router-dom";
import Dashboard from "../components/home/dashboard/Dashboard";

export default function IndexPage() {
  return (
    <>
      <Dashboard />
      <ScrollRestoration />
    </>
  );
}
