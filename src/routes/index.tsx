import Room from "@/pages/Room";
import { createBrowserRouter } from "react-router";
import Home from "../pages/Home";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    hydrateFallbackElement: <div>Loading...</div>,
    errorElement: <div>Error</div>,
  },
  {
    path: "/room/:userId",
    element: <Room />,
    hydrateFallbackElement: <div>Loading...</div>,
    errorElement: <div>Error</div>,
  },
]);

export default router;
