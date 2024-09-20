import { createBrowserRouter } from "react-router-dom";
import IndexPage from "./pages/IndexPage.jsx";
import AuthLayout from "./layouts/AuthLayout.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";

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
    ],
  },
]);
