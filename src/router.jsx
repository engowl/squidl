import { createBrowserRouter } from "react-router-dom";
import IndexPage from "./pages/IndexPage.jsx";
import AuthLayout from "./layouts/AuthLayout.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";
import PlainLayout from "./layouts/PlainLayout.jsx";
import PaymentPage from "./pages/PaymentPage.jsx";
import { AliasDetailPage } from "./pages/AliasDetailPage.jsx";

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
        path: "/:alias/detail",
        element: <AliasDetailPage />,
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
