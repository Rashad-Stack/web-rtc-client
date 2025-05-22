import { useCallStateHooks } from "@stream-io/video-react-sdk";
import { MyFloatingLocalParticipant } from "./MyFloatingLocalParticipant";
import { MyParticipantList } from "./MyParticipantList";

export const MyUILayout = () => {
  const { useCallCallingState, useLocalParticipant, useRemoteParticipants } =
    useCallStateHooks();
  const callingState = useCallCallingState();
  const localParticipant = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();

  if (callingState !== "joined") {
    return <div>Loading...</div>;
  }

  return (
    <div className="ui-layout">
      <MyParticipantList participants={remoteParticipants} />
      <MyFloatingLocalParticipant participant={localParticipant!} />
    </div>
  );
};
