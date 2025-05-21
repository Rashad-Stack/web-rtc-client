import { RouterProvider } from "react-router";

import PeerProvider from "./context/PeerProvider";
import SocketProvider from "./context/SocketProvider";
import router from "./routes";

export default function App() {
  return (
    <SocketProvider>
      <PeerProvider>
        <RouterProvider router={router} />
      </PeerProvider>
    </SocketProvider>
  );
}
