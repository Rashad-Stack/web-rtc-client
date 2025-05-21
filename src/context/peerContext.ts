import React from "react";

interface PeerContextType {
  peer: RTCPeerConnection;
  remoteStream: MediaStream | null;
  createOffer: () => Promise<RTCSessionDescriptionInit | null>;
  createAnswer: (
    offer: RTCSessionDescriptionInit
  ) => Promise<RTCSessionDescriptionInit | null>;
  setRemoteAnswer: (answer: RTCSessionDescriptionInit) => Promise<void>;
  sendStream: (stream: MediaStream) => void;
  connectionState: RTCPeerConnectionState;
}

const PeerContext = React.createContext<PeerContextType | null>(null);

export default PeerContext;
