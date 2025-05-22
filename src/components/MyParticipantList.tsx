import type { StreamVideoParticipant } from "@stream-io/video-react-sdk";

export const MyParticipantList = ({
  participants,
}: {
  participants: StreamVideoParticipant[];
}) => {
  return (
    <div className="participant-list">
      {participants.map((participant) => (
        <div key={participant.sessionId} className="participant">
          <video
            autoPlay
            playsInline
            muted={participant.isLocalParticipant}
            style={{ width: "300px", height: "200px", margin: "10px" }}
            ref={(ref) => {
              if (ref && participant.videoStream) {
                ref.srcObject = participant.videoStream;
              }
            }}
          />
          <audio
            autoPlay
            muted={participant.isLocalParticipant}
            ref={(ref) => {
              if (ref && participant.audioStream) {
                ref.srcObject = participant.audioStream;
              }
            }}
          />
          <span>{participant.name || participant.userId}</span>
        </div>
      ))}
    </div>
  );
};
