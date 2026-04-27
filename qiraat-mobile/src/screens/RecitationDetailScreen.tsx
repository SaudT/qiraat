import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";

import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "RecitationDetail">;

export default function RecitationDetailScreen({ route }: Props) {
  const recitation = route.params?.recitation;
  const [error, setError] = useState<string | null>(null);
  const [isTogglingPlayback, setIsTogglingPlayback] = useState(false);
  const [isStartingPlayback, setIsStartingPlayback] = useState(false);
  const player = useAudioPlayer({ uri: recitation?.audio_url ?? "" });
  const status = useAudioPlayerStatus(player);
  const isPlaying = status.playing;
  const isLoadingAudio = isStartingPlayback || status.isBuffering;
  const isValidAudioUrl = useMemo(
    () =>
      !!recitation &&
      (recitation.audio_url.startsWith("http://") ||
        recitation.audio_url.startsWith("https://")),
    [recitation]
  );

  useFocusEffect(
    useCallback(() => {
      return () => {
        // Stop and unload when leaving detail screen for reliable cleanup.
        try {
          player.pause();
          player.seekTo(0).catch(() => null);
          player.replace(null);
        } catch {
          // Ignore if native player was already released.
        }
      };
    }, [player])
  );

  if (!recitation) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Recitation data is missing.</Text>
      </View>
    );
  }

  const handlePlayPause = async () => {
    if (isTogglingPlayback) {
      return;
    }

    if (!isValidAudioUrl) {
      setError("Audio URL is invalid for this recitation.");
      return;
    }

    try {
      setIsTogglingPlayback(true);
      setError(null);

      if (isPlaying) {
        player.pause();
      } else {
        setIsStartingPlayback(true);
        player.play();
      }
    } catch {
      setError("Audio failed to load or play. Please try another recitation.");
    } finally {
      setIsTogglingPlayback(false);
    }
  };

  useEffect(() => {
    if (!isStartingPlayback) {
      return;
    }

    if (status.playing) {
      setIsStartingPlayback(false);
      return;
    }

    if (!status.isBuffering && !status.playing && !status.isLoaded) {
      setIsStartingPlayback(false);
      setError("Audio failed to load or play. Please try another recitation.");
    }
  }, [isStartingPlayback, status.isBuffering, status.isLoaded, status.playing]);

  return (
    <View style={styles.centerContainer}>
      <Text style={styles.title}>{recitation.title}</Text>
      <Text style={styles.subtitle}>{recitation.reciter_name}</Text>
      {isLoadingAudio ? <Text style={styles.infoText}>Loading audio...</Text> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <Pressable
        style={[
          styles.playButton,
          (isLoadingAudio || isTogglingPlayback) && styles.playButtonDisabled,
        ]}
        onPress={handlePlayPause}
        disabled={isLoadingAudio || isTogglingPlayback}
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
