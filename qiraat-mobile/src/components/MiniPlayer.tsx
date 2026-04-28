import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAudioPlayerContext } from "../context/AudioPlayerContext";
import { RootStackParamList } from "../navigation/AppNavigator";

export default function MiniPlayer() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { currentRecitation, isPlaying, isBuffering, togglePlayPause } =
    useAudioPlayerContext();

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
  },
  button: {
    minWidth: 68,
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#222222",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
