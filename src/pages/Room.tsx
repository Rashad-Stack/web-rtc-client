import usePeer from "@/hooks/usePeer";
import useSocketContext from "@/hooks/useSocketContext";
import { useCallback, useEffect, useState } from "react";
import ReactPlayer from "react-player";

export default function Room() {
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "connecting" | "connected"
  >("idle");
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [remoteEmailId, setRemoteEmailId] = useState<string>("");
  const socket = useSocketContext();
  const {
    createOffer,
    createAnswer,
    setRemoteAnswer,
    sendStream,
    remoteStream,
    connectionState,
  } = usePeer();

  const handleNewUserJoined = useCallback(
    async (data: { emailId: string }) => {
      try {
        const { emailId } = data;
        console.log("New user joined:", emailId);
        setConnectionStatus("connecting");
        setRemoteEmailId(emailId);

        if (myStream) {
          console.log("Sending stream and creating offer...");
          await sendStream(myStream);
          const offer = await createOffer();
          socket.emit("call-user", { offer, emailId });
        }
      } catch (error) {
        console.error("Error handling new user:", error);
        setConnectionStatus("idle");
      }
    },
    [createOffer, socket, myStream, sendStream]
  );

  const handleIncomingCall = useCallback(
    async (data: { from: string; offer: RTCSessionDescriptionInit }) => {
      try {
        const { from, offer } = data;
        console.log("Incoming call from:", from);
        setConnectionStatus("connecting");
        setRemoteEmailId(from);

        // Send answer only if we have local stream
        if (myStream) {
          await sendStream(myStream); // Send stream before creating answer
          const answer = await createAnswer(offer);
          socket.emit("call-accepted", { emailId: from, answer });
        }
      } catch (error) {
        console.error("Error handling incoming call:", error);
        setConnectionStatus("idle");
      }
    },
    [createAnswer, socket, myStream, sendStream]
  );

  const handleCallAccepted = useCallback(
    async (data: { emailId: string; answer: RTCSessionDescriptionInit }) => {
      try {
        console.log("Call accepted by:", data.emailId);
        await setRemoteAnswer(data.answer);
        setConnectionStatus("connected");
      } catch (error) {
        console.error("Error handling call accepted:", error);
        setConnectionStatus("idle");
      }
    },
    [setRemoteAnswer]
  );

  const getUserMediaStream = useCallback(async () => {
    try {
      console.log("Requesting media stream...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true,
      });
      console.log("Got local stream:", stream.id);
      setMyStream(stream);
    } catch (error) {
      console.error("Error getting user media:", error);
    }
  }, []);

  // Get user media on component mount
  useEffect(() => {
    getUserMediaStream();
  }, [getUserMediaStream]);

  // Monitor connection state changes
  useEffect(() => {
    console.log("Connection state changed:", connectionState);
    if (connectionState === "connected") {
      setConnectionStatus("connected");
    }
  }, [connectionState]);

  // Set up socket listeners
  useEffect(() => {
    if (!socket.connected) {
      console.log("Socket not connected");
      return;
    }

    console.log("Setting up socket listeners");
    socket.on("incoming-call", handleIncomingCall);
    socket.on("user-connected", handleNewUserJoined);
    socket.on("call-accepted", handleCallAccepted);

    return () => {
      console.log("Cleaning up socket listeners");
      socket.off("incoming-call");
      socket.off("user-connected");
      socket.off("call-accepted");
    };
  }, [socket, handleIncomingCall, handleNewUserJoined, handleCallAccepted]);

  // Debug logging
  useEffect(() => {
    console.log("Remote stream updated:", remoteStream?.id);
  }, [remoteStream]);

  return (
    <div className="w-screen h-screen flex flex-col p-4">
      <h1 className="text-3xl mb-4">Room</h1>
      <div className="text-xl mb-4">
        Status: {connectionStatus}
        {remoteEmailId && ` - Connected with ${remoteEmailId}`}
      </div>

      <div className="flex-1 flex flex-row gap-4">
        {myStream ? (
          <div className="w-1/2 aspect-video bg-gray-900 rounded-lg overflow-hidden">
            <ReactPlayer
              url={myStream}
              playing
              muted
              width="100%"
              height="100%"
            />
          </div>
        ) : (
          <div className="w-1/2 aspect-video bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
            <p className="text-white text-2xl">Getting local stream...</p>
          </div>
        )}
        {remoteStream ? (
          <div className="w-1/2 aspect-video bg-gray-900 rounded-lg overflow-hidden">
            <ReactPlayer
              url={remoteStream}
              playing
              width="100%"
              height="100%"
            />
          </div>
        ) : (
          <div className="w-1/2 aspect-video bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
            <p className="text-white text-2xl">
              {connectionStatus === "connecting"
                ? "Connecting to peer..."
                : "Waiting for remote stream"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
