import PeerContext from "@/context/peerContext";
import React from "react";

export default function usePeer() {
  const peer = React.useContext(PeerContext);

  if (!peer) {
    throw new Error("useSocketContext must be used within a SocketProvider");
  }
  return peer;
}
