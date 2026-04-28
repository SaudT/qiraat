import { useEffect, useMemo, useState } from "react";
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useAudioPlayerContext } from "../context/AudioPlayerContext";
import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "RecitationDetail">;

export default function RecitationDetailScreen({ route }: Props) {
  const {
    currentRecitation,
    isPlaying,
    isBuffering,
    isLoaded,
    currentTime,
    duration,
    setCurrentRecitation,
    togglePlayPause,
    seekTo,
  } = useAudioPlayerContext();
  const routeRecitation = route.params?.recitation;
  const recitation = currentRecitation ?? routeRecitation;
  const [error, setError] = useState<string | null>(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const [progressBarWidth, setProgressBarWidth] = useState(0);
  const [dragProgress, setDragProgress] = useState<number | null>(null);
  const isLoadingAudio = isBuffering && !isPlaying;
  const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;
  const displayedProgress = dragProgress ?? progress;
  const displayedTime = displayedProgress * duration;
  const isValidAudioUrl = useMemo(
    () =>
      !!recitation &&
      (recitation.audio_url.startsWith("http://") ||
        recitation.audio_url.startsWith("https://")),
    [recitation]
  );

  useEffect(() => {
    if (routeRecitation) {
      setCurrentRecitation(routeRecitation, false);
    }
  }, [routeRecitation, setCurrentRecitation]);

  if (!recitation) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Recitation data is missing.</Text>
      </View>
    );
  }

  const handlePlayPause = () => {
    if (!isValidAudioUrl) {
      setError("Audio URL is invalid for this recitation.");
      return;
    }

    try {
      setError(null);
      togglePlayPause();
    } catch {
      setError("Audio failed to load or play. Please try another recitation.");
    }
  };

  const handleProgressBarLayout = (event: LayoutChangeEvent) => {
    setProgressBarWidth(event.nativeEvent.layout.width);
  };

  const getSeekRatioFromLocation = (locationX: number) => {
    const clampedLocation = Math.max(0, Math.min(locationX, progressBarWidth));
    return progressBarWidth > 0 ? clampedLocation / progressBarWidth : 0;
  };

  const seekToRatio = async (seekRatio: number) => {
    if (!isLoaded || duration <= 0 || progressBarWidth <= 0 || isSeeking) {
      return;
    }

    try {
      setIsSeeking(true);
      setError(null);
      const targetSeconds = seekRatio * duration;
      await seekTo(targetSeconds);
    } catch {
      setError("Unable to seek audio position right now.");
    } finally {
      setIsSeeking(false);
    }
  };

  const handleSeekPress = (event: GestureResponderEvent) => {
    const seekRatio = getSeekRatioFromLocation(event.nativeEvent.locationX);
    void seekToRatio(seekRatio);
  };

  const handleDragStart = (
    event: { nativeEvent: { locationX: number } }
  ) => {
    if (!isLoaded || duration <= 0) {
      return;
    }
    const seekRatio = getSeekRatioFromLocation(event.nativeEvent.locationX);
    setDragProgress(seekRatio);
  };

  const handleDragMove = (
    event: { nativeEvent: { locationX: number } }
  ) => {
    if (!isLoaded || duration <= 0) {
      return;
    }
    const seekRatio = getSeekRatioFromLocation(event.nativeEvent.locationX);
    setDragProgress(seekRatio);
  };

  const handleDragEnd = () => {
    if (dragProgress === null) {
      return;
    }
    const finalRatio = dragProgress;
    setDragProgress(null);
    void seekToRatio(finalRatio);
  };

  return (
    <View style={styles.centerContainer}>
      <Text style={styles.title}>{recitation.title}</Text>
      <Text style={styles.subtitle}>{recitation.reciter_name}</Text>
      <View style={styles.progressSection}>
        <Pressable
          onLayout={handleProgressBarLayout}
          style={styles.progressBarTrack}
          onPress={handleSeekPress}
          disabled={!isLoaded || isSeeking}
          onStartShouldSetResponder={() => isLoaded && duration > 0}
          onMoveShouldSetResponder={() => isLoaded && duration > 0}
          onResponderGrant={handleDragStart}
          onResponderMove={handleDragMove}
          onResponderRelease={handleDragEnd}
          onResponderTerminate={handleDragEnd}
        >
          <View
            style={[styles.progressBarFill, { width: `${displayedProgress * 100}%` }]}
          />
          <View
            style={[styles.progressHandle, { left: `${displayedProgress * 100}%` }]}
          />
        </Pressable>
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(displayedTime)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>
      {isLoadingAudio ? <Text style={styles.infoText}>Loading audio...</Text> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <Pressable
        style={[
          styles.playButton,
          isLoadingAudio && styles.playButtonDisabled,
        ]}
        onPress={handlePlayPause}
        disabled={isLoadingAudio}
      >
        <Text style={styles.playButtonText}>{isPlaying ? "Pause" : "Play"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#555555",
    textAlign: "center",
    marginBottom: 24,
  },
  infoText: {
    fontSize: 15,
    marginBottom: 12,
  },
  progressSection: {
    width: "100%",
    marginBottom: 20,
  },
  progressBarTrack: {
    width: "100%",
    height: 8,
    borderRadius: 999,
    backgroundColor: "#d9d9d9",
    justifyContent: "center",
  },
  progressBarFill: {
    position: "absolute",
    left: 0,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#3f3f3f",
  },
  progressHandle: {
    position: "absolute",
    marginLeft: -6,
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: "#1f1f1f",
  },
  timeRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeText: {
    fontSize: 13,
    color: "#555555",
  },
  errorText: {
    fontSize: 15,
    color: "#b00020",
    textAlign: "center",
    marginBottom: 12,
  },
  playButton: {
    minWidth: 140,
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: "#222222",
    borderRadius: 10,
    backgroundColor: "#f3f3f3",
  },
  playButtonDisabled: {
    opacity: 0.5,
  },
  playButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },
});

function formatTime(seconds: number): string {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}
