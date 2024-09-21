import { createBrowserRouter } from "react-router-dom";
import IndexPage from "./pages/IndexPage.jsx";
import AuthLayout from "./layouts/AuthLayout.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";
import PlainLayout from "./layouts/PlainLayout.jsx";
import PaymentPage from "./pages/PaymentPage.jsx";
import { AliasDetailPage } from "./pages/AliasDetailPage.jsx";
import TransferPage from "./pages/TransferPage.jsx";
import PaymentLinksPage from "./pages/PaymentLinksPage.jsx";
import TransactionsPage from "./pages/TransactionsPage.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <IndexPage />,
      },
      {
        path: "/:alias/detail/:parent",
        element: <AliasDetailPage />,
        children: [
          {
            path: "transfer",
            element: <TransferPage />,
          },
        ],
      },
      {
        path: "/:alias/transfer",
        element: <TransferPage />,
      },
      {
        path: "/payment-links",
        element: <PaymentLinksPage />,
      },
      {
        path: "/transactions",
        element: <TransactionsPage />,
      },
    ],
  },
  {
    path: "/payment",
    element: <PlainLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/payment",
        element: <PaymentPage />,
      },
    ],
  },
]);
