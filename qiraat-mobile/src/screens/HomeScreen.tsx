import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useAudioPlayerContext } from "../context/AudioPlayerContext";
import { RootStackParamList } from "../navigation/AppNavigator";
import { getRecitations, Recitation } from "../services/recitationService";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const { setCurrentRecitation } = useAudioPlayerContext();
  const [recitations, setRecitations] = useState<Recitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecitations = async () => {
      try {
        setError(null);
        const data = await getRecitations();
        setRecitations(data);
      } catch (fetchError) {
        setError("Failed to load recitations.");
      } finally {
        setLoading(false);
      }
    };

    loadRecitations();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.statusText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.statusText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Recitations</Text>
      <FlatList
        data={recitations}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item: recitation }) => (
        <Pressable
          style={styles.itemContainer}
          onPress={() => {
            setCurrentRecitation(recitation, false);
            navigation.navigate("RecitationDetail", { recitation });
          }}
        >
          <Text style={styles.itemTitle}>{recitation.title}</Text>
          <Text style={styles.itemSubtitle}>{recitation.reciter_name}</Text>
        </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 24,
  },
  itemContainer: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#d5d5d5",
    borderRadius: 8,
    backgroundColor: "#ffffff",
  },
  separator: {
    height: 10,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: "#555555",
  },
});
