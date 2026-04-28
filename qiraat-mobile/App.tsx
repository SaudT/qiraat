import { useEffect } from "react";
import { setAudioModeAsync } from "expo-audio";

import { AudioPlayerProvider } from "./src/context/AudioPlayerContext";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "duckOthers",
      allowsRecording: false,
    });
  }, []);

  return (
    <AudioPlayerProvider>
      <AppNavigator />
    </AudioPlayerProvider>
  );
}
