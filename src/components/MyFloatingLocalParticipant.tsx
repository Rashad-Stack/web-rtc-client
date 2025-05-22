import type { StreamVideoParticipant } from "@stream-io/video-react-sdk";

export const MyFloatingLocalParticipant = ({
  participant,
}: {
  participant: StreamVideoParticipant | null;
}) => {
  if (!participant) return null;

  return (
    <div
      className="floating-local-participant"
      style={{ position: "absolute", bottom: "20px", right: "20px" }}>
      <video
        autoPlay
        playsInline
        muted
        style={{ width: "150px", height: "100px", borderRadius: "8px" }}
        ref={(ref) => {
          if (ref && participant.videoStream) {
            ref.srcObject = participant.videoStream;
          }
        }}
      />
      <span>{participant.name || participant.userId}</span>
    </div>
  );
};
