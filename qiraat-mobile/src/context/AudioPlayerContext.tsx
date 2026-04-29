import {
  createContext,
  useEffect,
  useCallback,
  useRef,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";

import { Recitation } from "../services/recitationService";

type AudioPlayerContextValue = {
  currentRecitation: Recitation | null;
  isPlaying: boolean;
  isBuffering: boolean;
  isLoaded: boolean;
  currentTime: number;
  duration: number;
  recentlyPlayed: Recitation[];
  setCurrentRecitation: (recitation: Recitation, autoPlay?: boolean) => void;
  togglePlayPause: () => void;
  seekTo: (seconds: number) => Promise<void>;
};

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);
const RECENTLY_PLAYED_KEY = "qiraat_recently_played";
const PLAYBACK_POSITIONS_KEY = "qiraat_playback_positions";
const MAX_RECENTLY_PLAYED = 10;

export function AudioPlayerProvider({ children }: PropsWithChildren) {
  const [currentRecitation, setCurrentRecitationState] = useState<Recitation | null>(
    null
  );
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Recitation[]>([]);
  const [playbackPositions, setPlaybackPositions] = useState<Record<string, number>>({});
  const [pendingResumePosition, setPendingResumePosition] = useState<number | null>(null);
  const playbackPositionsRef = useRef<Record<string, number>>({});

  const player = useAudioPlayer(
    { uri: currentRecitation?.audio_url ?? "" },
    { updateInterval: 250 }
  );
  const status = useAudioPlayerStatus(player);

  const updateRecentlyPlayed = useCallback((recitation: Recitation) => {
    setRecentlyPlayed((prev) => {
      const deduped = prev.filter((item) => item.id !== recitation.id);
      return [recitation, ...deduped].slice(0, MAX_RECENTLY_PLAYED);
    });
  }, []);

  const setCurrentRecitation = useCallback((recitation: Recitation, autoPlay = false) => {
    setCurrentRecitationState((prev) => {
      if (prev?.id === recitation.id) {
        return prev;
      }
      return recitation;
    });
    const savedPosition = playbackPositionsRef.current[String(recitation.id)] ?? 0;
    setPendingResumePosition(savedPosition);
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

    updateRecentlyPlayed(currentRecitation);
    const isAtEnd = status.duration > 0 && status.currentTime >= status.duration - 0.25;
    if (isAtEnd) {
      void player.seekTo(0);
    }
    player.play();
  }, [
    currentRecitation,
    status.isLoaded,
    status.playing,
    status.duration,
    status.currentTime,
    player,
    updateRecentlyPlayed,
  ]);

  const seekTo = useCallback(async (seconds: number) => {
    if (!status.isLoaded) {
      return;
    }
    await player.seekTo(seconds);
  }, [status.isLoaded, player]);

  useEffect(() => {
    const hydratePersistedState = async () => {
      try {
        const [recentlyPlayedRaw, playbackPositionsRaw] = await Promise.all([
          AsyncStorage.getItem(RECENTLY_PLAYED_KEY),
          AsyncStorage.getItem(PLAYBACK_POSITIONS_KEY),
        ]);

        if (recentlyPlayedRaw) {
          const parsedRecentlyPlayed = JSON.parse(recentlyPlayedRaw) as Recitation[];
          setRecentlyPlayed(Array.isArray(parsedRecentlyPlayed) ? parsedRecentlyPlayed : []);
        }

        if (playbackPositionsRaw) {
          const parsedPositions = JSON.parse(playbackPositionsRaw) as Record<string, number>;
          setPlaybackPositions(parsedPositions ?? {});
        }
      } catch {
        // Ignore persistence errors to keep player functional.
      }
    };

    void hydratePersistedState();
  }, []);

  useEffect(() => {
    void AsyncStorage.setItem(RECENTLY_PLAYED_KEY, JSON.stringify(recentlyPlayed));
  }, [recentlyPlayed]);

  useEffect(() => {
    void AsyncStorage.setItem(
      PLAYBACK_POSITIONS_KEY,
      JSON.stringify(playbackPositions)
    );
  }, [playbackPositions]);

  useEffect(() => {
    playbackPositionsRef.current = playbackPositions;
  }, [playbackPositions]);

  useEffect(() => {
    if (!currentRecitation || !status.isLoaded || pendingResumePosition === null) {
      return;
    }

    // Always seek on track load, even to 0, so position doesn't leak from prior recitation.
    void player.seekTo(Math.max(0, pendingResumePosition));
    setPendingResumePosition(null);
  }, [currentRecitation, status.isLoaded, pendingResumePosition, player]);

  useEffect(() => {
    if (!currentRecitation || !status.isLoaded) {
      return;
    }

    setPlaybackPositions((prev) => {
      const key = String(currentRecitation.id);
      const nextPosition = Math.max(status.currentTime || 0, 0);
      const previousPosition = prev[key] ?? 0;
      if (Math.abs(previousPosition - nextPosition) < 1) {
        return prev;
      }
      return { ...prev, [key]: nextPosition };
    });
  }, [currentRecitation, status.isLoaded, status.currentTime]);

  useEffect(() => {
    if (!shouldAutoPlay || !currentRecitation || !status.isLoaded || status.playing) {
      return;
    }

    updateRecentlyPlayed(currentRecitation);
    player.play();
    setShouldAutoPlay(false);
  }, [
    shouldAutoPlay,
    currentRecitation,
    status.isLoaded,
    status.playing,
    player,
    updateRecentlyPlayed,
  ]);

  const value = useMemo<AudioPlayerContextValue>(
    () => ({
      currentRecitation,
      isPlaying: status.playing,
      isBuffering: status.isBuffering,
      isLoaded: status.isLoaded,
      currentTime: Math.max(status.currentTime || 0, 0),
      duration: Math.max(status.duration || 0, 0),
      recentlyPlayed,
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
      recentlyPlayed,
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
