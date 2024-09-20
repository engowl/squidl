import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import RootProvider from "./providers/RootProvider";
import { RootLayout } from "./layouts/RootLayout.jsx";

function App() {
  return (
    <RootLayout>
      <RootProvider>
        <RouterProvider router={router} />
      </RootProvider>
    </RootLayout>
  );
}

export default App;
