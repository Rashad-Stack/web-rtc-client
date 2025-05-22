import { StreamVideoClient, type User } from "@stream-io/video-react-sdk";

const apiKey = "mmhfdzb5evj2";
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Byb250by5nZXRzdHJlYW0uaW8iLCJzdWIiOiJ1c2VyL1p1Y2t1c3MiLCJ1c2VyX2lkIjoiWnVja3VzcyIsInZhbGlkaXR5X2luX3NlY29uZHMiOjYwNDgwMCwiaWF0IjoxNzQ3ODcwMTMxLCJleHAiOjE3NDg0NzQ5MzF9.5UrgxzRfQdVDGmiYkMyYeQX0gAkQV0V93f8yyJMlUP0";
const userId = "Zuckuss";

// set up the user object
const user: User = {
  id: userId,
  name: "Oliver",
  image: "https://getstream.io/random_svg/?id=oliver&name=Oliver",
};

export const client = new StreamVideoClient({ apiKey, user, token });
export const call = client.call("default", "9kX00siqZfXb");
