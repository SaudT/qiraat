import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAudioPlayerContext } from "../context/AudioPlayerContext";
import { RootStackParamList } from "../navigation/AppNavigator";

export default function MiniPlayer() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    currentRecitation,
    isPlaying,
    isBuffering,
    currentTime,
    duration,
    togglePlayPause,
  } = useAudioPlayerContext();
  const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;

  if (!currentRecitation) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.infoSection}
        onPress={() =>
          navigation.navigate("RecitationDetail", { recitation: currentRecitation })
        }
      >
        <Text style={styles.title} numberOfLines={1}>
          {currentRecitation.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {currentRecitation.reciter_name}
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </Pressable>
      <View style={styles.controlsSection}>
        <Pressable style={styles.button} onPress={togglePlayPause}>
          <Text style={styles.buttonText}>
            {isBuffering ? "..." : isPlaying ? "Pause" : "Play"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#d9d9d9",
    backgroundColor: "#f8f8f8",
  },
  infoSection: {
    flex: 1,
    marginRight: 10,
  },
  controlsSection: {
    marginLeft: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: "#555555",
    marginBottom: 6,
  },
  progressTrack: {
    height: 4,
    borderRadius: 999,
    backgroundColor: "#d0d0d0",
  },
  progressFill: {
    height: 4,
    borderRadius: 999,
    backgroundColor: "#0F766E",
  },
  button: {
    minWidth: 68,
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0F766E",
    backgroundColor: "#0F766E",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
