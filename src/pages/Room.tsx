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
          // First ensure our stream is added to peer connection
          console.log("Adding local stream to peer connection...");
          await sendStream(myStream);

          // Then create and send offer
          console.log("Creating offer for:", emailId);
          const offer = await createOffer();
          console.log("Sending offer to:", emailId);
          socket.emit("call-user", { offer, emailId });
        } else {
          console.error("No local stream available for new user");
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
        console.log("Processing incoming call from:", from);
        setConnectionStatus("connecting");
        setRemoteEmailId(from);

        if (myStream) {
          // First add our stream
          console.log("Adding local stream before creating answer...");
          await sendStream(myStream);

          // Then create and send answer
          console.log("Creating answer for:", from);
          const answer = await createAnswer(offer);
          console.log("Sending answer to:", from);
          socket.emit("call-accepted", { emailId: from, answer });
        } else {
          console.error("No local stream available for incoming call");
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
        console.log("Processing call accepted from:", data.emailId);

        if (!data.answer) {
          throw new Error("No answer received in call-accepted event");
        }

        // Set remote description
        console.log("Setting remote answer...");
        await setRemoteAnswer(data.answer);

        // Verify connection state
        console.log(
          "Call accepted - current connection state:",
          connectionState
        );
        setConnectionStatus("connected");

        // Ensure our stream is still being sent
        if (myStream) {
          console.log("Re-sending stream after connection established");
          await sendStream(myStream);
        }
      } catch (error) {
        console.error("Error handling call accepted:", error);
        setConnectionStatus("idle");
      }
    },
    [setRemoteAnswer, myStream, sendStream, connectionState]
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

  // Debug effects
  useEffect(() => {
    console.log("Connection state update:", {
      connectionState,
      connectionStatus,
      hasRemoteStream: !!remoteStream,
      remoteStreamTracks: remoteStream?.getTracks().length ?? 0,
    });
  }, [connectionState, connectionStatus, remoteStream]);

  useEffect(() => {
    if (remoteStream) {
      console.log("Remote stream received:", {
        id: remoteStream.id,
        tracks: remoteStream.getTracks().map((t) => ({
          kind: t.kind,
          enabled: t.enabled,
          muted: t.muted,
        })),
      });
    }
  }, [remoteStream]);

  // Socket connection monitoring
  useEffect(() => {
    if (!socket.connected) {
      console.warn("Socket disconnected - reconnecting...");
      socket.connect();
    }

    return () => {
      if (connectionStatus === "connected") {
        console.log("Cleaning up connection...");
        setConnectionStatus("idle");
      }
    };
  }, [socket, connectionStatus]);

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

    // Debug listener
    socket.onAny((event, ...args) => {
      console.log("Socket event received:", event, args);
    });

    // Add explicit handler for call-accepted
    const onCallAccepted = (data: any) => {
      console.log("call-accepted event received:", data);
      handleCallAccepted(data);
    };

    socket.on("incoming-call", handleIncomingCall);
    socket.on("user-connected", handleNewUserJoined);
    socket.on("call-accepted", onCallAccepted);

    return () => {
      console.log("Cleaning up socket listeners");
      socket.off("incoming-call");
      socket.off("user-connected");
      socket.off("call-accepted");
      socket.offAny();
    };
  }, [socket, handleIncomingCall, handleNewUserJoined, handleCallAccepted]);

  // Debug logging
  useEffect(() => {
    console.log("Remote stream updated:", remoteStream);
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
