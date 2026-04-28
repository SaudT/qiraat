import {
  createContext,
  useEffect,
  useCallback,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from "react";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";

import { Recitation } from "../services/recitationService";

type AudioPlayerContextValue = {
  currentRecitation: Recitation | null;
  isPlaying: boolean;
  isBuffering: boolean;
  isLoaded: boolean;
  currentTime: number;
  duration: number;
  setCurrentRecitation: (recitation: Recitation, autoPlay?: boolean) => void;
  togglePlayPause: () => void;
  seekTo: (seconds: number) => Promise<void>;
};

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);

export function AudioPlayerProvider({ children }: PropsWithChildren) {
  const [currentRecitation, setCurrentRecitationState] = useState<Recitation | null>(
    null
  );
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);

  const player = useAudioPlayer(
    { uri: currentRecitation?.audio_url ?? "" },
    { updateInterval: 250 }
  );
  const status = useAudioPlayerStatus(player);

  const setCurrentRecitation = useCallback((recitation: Recitation, autoPlay = false) => {
    setCurrentRecitationState((prev) => {
      if (prev?.id === recitation.id) {
        return prev;
      }
      return recitation;
    });
    setShouldAutoPlay(autoPlay);
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!currentRecitation || !status.isLoaded) {
      return;
    }

    if (status.playing) {
      player.pause();
      return;
    }

    const isAtEnd = status.duration > 0 && status.currentTime >= status.duration - 0.25;
    if (isAtEnd) {
      void player.seekTo(0);
    }
    player.play();
  }, [currentRecitation, status.isLoaded, status.playing, status.duration, status.currentTime, player]);

  const seekTo = useCallback(async (seconds: number) => {
    if (!status.isLoaded) {
      return;
    }
    await player.seekTo(seconds);
  }, [status.isLoaded, player]);

  useEffect(() => {
    if (!shouldAutoPlay || !currentRecitation || !status.isLoaded || status.playing) {
      return;
    }

    player.play();
    setShouldAutoPlay(false);
  }, [
    shouldAutoPlay,
    currentRecitation,
    status.isLoaded,
    status.playing,
    player,
  ]);

  const value = useMemo<AudioPlayerContextValue>(
    () => ({
      currentRecitation,
      isPlaying: status.playing,
      isBuffering: status.isBuffering,
      isLoaded: status.isLoaded,
      currentTime: Math.max(status.currentTime || 0, 0),
      duration: Math.max(status.duration || 0, 0),
      setCurrentRecitation,
      togglePlayPause,
      seekTo,
    }),
    [
      currentRecitation,
      status.playing,
      status.isBuffering,
      status.isLoaded,
      status.currentTime,
      status.duration,
      setCurrentRecitation,
      togglePlayPause,
      seekTo,
    ]
  );

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayerContext() {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error("useAudioPlayerContext must be used inside AudioPlayerProvider.");
  }
  return context;
}
