import React, { useEffect, useState } from "react";
import PeerContext from "./peerContext";

export default function PeerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] =
    useState<RTCPeerConnectionState>("new");

  const peer = React.useMemo(() => {
    const newPeer = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:stun1.l.google.com:19302",
          ],
        },
      ],
    });

    // Log all peer connection events
    newPeer.oniceconnectionstatechange = () =>
      console.log("ICE Connection State:", newPeer.iceConnectionState);
    newPeer.onconnectionstatechange = () =>
      console.log("Connection State:", newPeer.connectionState);
    newPeer.onsignalingstatechange = () =>
      console.log("Signaling State:", newPeer.signalingState);
    newPeer.onicecandidate = (event) =>
      console.log("ICE Candidate:", event.candidate);

    return newPeer;
  }, []);

  const createOffer = async () => {
    try {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      console.log("Created and set local offer:", offer);
      return offer;
    } catch (error) {
      console.error("Error creating offer:", error);
      throw error;
    }
  };

  const createAnswer = async (offer: RTCSessionDescriptionInit) => {
    try {
      console.log("Setting remote offer:", offer);
      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      console.log("Created and set local answer:", answer);
      return answer;
    } catch (error) {
      console.error("Error creating answer:", error);
      throw error;
    }
  };

  const setRemoteAnswer = async (answer: RTCSessionDescriptionInit) => {
    try {
      console.log("Setting remote answer:", answer);
      await peer.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error("Error setting remote answer:", error);
      throw error;
    }
  };

  const sendStream = async (stream: MediaStream) => {
    try {
      console.log("Adding local stream tracks:", stream.getTracks().length);
      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });
    } catch (error) {
      console.error("Error sending stream:", error);
      throw error;
    }
  };

  useEffect(() => {
    peer.ontrack = (event) => {
      console.log("Received remote track:", event.track.kind);
      const [stream] = event.streams;
      if (stream) {
        console.log("Setting remote stream:", stream.id);
        setRemoteStream(stream);
      }
    };

    peer.onconnectionstatechange = () => {
      console.log("Connection state changed to:", peer.connectionState);
      setConnectionState(peer.connectionState);
    };

    return () => {
      peer.ontrack = null;
      peer.onconnectionstatechange = null;
    };
  }, [peer]);

  const contextValue = React.useMemo(
    () => ({
      peer,
      createOffer,
      createAnswer,
      setRemoteAnswer,
      sendStream,
      remoteStream,
      connectionState,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [peer, remoteStream, connectionState]
  );

  return (
    <PeerContext.Provider value={contextValue}>{children}</PeerContext.Provider>
  );
}
