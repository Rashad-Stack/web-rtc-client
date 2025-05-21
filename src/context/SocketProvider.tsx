import SocketContext from "@/context/SocketContext";
import React, { useMemo } from "react";
import { io } from "socket.io-client";

export default function SocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const socket = useMemo(() => {
    const socket = io("http://localhost:5000", {
      transports: ["websocket"],
      autoConnect: true,
    });
    socket.on("connect", () => {
      console.log("Client connected, socket ID:", socket.id);
    });
    socket.on("connect_error", (error) => {
      console.error("Connection error:", error.message);
    });
    socket.on("disconnect", (reason) => {
      console.log("Disconnected:", reason);
    });
    socket.on("joined-room", ({ roomId }) => {
      console.log("Joined room:", roomId);
    });

    socket.onAny((eventName, ...args) => {
      console.log("DEBUG: Received event:", eventName, args);
    });
    return socket;
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}
