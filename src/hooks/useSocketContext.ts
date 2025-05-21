import SocketContext from "@/context/SocketContext";
import React from "react";

export default function useSocketContext() {
  const socket = React.useContext(SocketContext);

  if (!socket) {
    throw new Error("useSocketContext must be used within a SocketProvider");
  }

  return socket;
}
