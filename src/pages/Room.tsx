import { call, client } from "@/api/steam";
import { MyUILayout } from "@/components/MyUILayout";

import {
  CallingState,
  StreamCall,
  StreamVideo,
  StreamVideoClient,
  useCall,
  useCallStateHooks,
  User,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { useEffect } from "react";




export default function Room() {
  useEffect(() => {
    call.join({ create: true });
    return () => {
      call.leave();
    };
  }, []);

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <StreamTheme>
          <MyUILayout />
        </StreamTheme>
      </StreamCall>
    </StreamVideo>
  );
}
