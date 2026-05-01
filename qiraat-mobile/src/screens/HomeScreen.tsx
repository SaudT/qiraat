import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useAudioPlayerContext } from "../context/AudioPlayerContext";
import { RootStackParamList } from "../navigation/AppNavigator";
import { getRecitations, Recitation } from "../services/recitationService";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const { setCurrentRecitation, recentlyPlayed } = useAudioPlayerContext();
  const [recitations, setRecitations] = useState<Recitation[]>([]);
  const [reciters, setReciters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReciter, setSelectedReciter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filteredRecitations = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return recitations.filter((recitation) => {
      const matchesReciter =
        selectedReciter === "All" || recitation.reciter_name === selectedReciter;
      if (!matchesReciter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const title = recitation.title.toLowerCase();
      const reciterName = recitation.reciter_name.toLowerCase();
      return (
        title.includes(normalizedQuery) ||
        reciterName.includes(normalizedQuery)
      );
    });
  }, [recitations, searchQuery, selectedReciter]);

  const loadRecitations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRecitations();
      setRecitations(data);
      const uniqueReciters = Array.from(
        new Set(data.map((recitation) => recitation.reciter_name))
      ).sort((a, b) => a.localeCompare(b));
      setReciters(uniqueReciters);
    } catch {
      setError("Could not load recitations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRecitations();
  }, []);

  const hasSearchOrFilter =
    searchQuery.trim().length > 0 || selectedReciter !== "All";

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="small" />
        <Text style={styles.statusText}>Loading recitations...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.statusText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={loadRecitations}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.headerTitle}>Qiraat</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search surah or reciter..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={styles.reciterFilterContainer}>
          <FlatList
            horizontal
            data={["All", ...reciters]}
            keyExtractor={(item) => `reciter-filter-${item}`}
            showsHorizontalScrollIndicator={false}
            style={styles.reciterFilterList}
            contentContainerStyle={styles.reciterFilterRow}
            renderItem={({ item: reciter }) => {
              const isSelected = selectedReciter === reciter;
              return (
                <Pressable
                  style={[
                    styles.reciterChip,
                    isSelected && styles.reciterChipSelected,
                  ]}
                  onPress={() => setSelectedReciter(reciter)}
                >
                  <Text
                    style={[
                      styles.reciterChipText,
                      isSelected && styles.reciterChipTextSelected,
                    ]}
                  >
                    {reciter}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>

        {recentlyPlayed.length > 0 ? (
          <View style={styles.recentSection}>
            <Text style={styles.recentHeader}>Now Playing</Text>
            <Pressable
              style={styles.recentItem}
              onPress={() => {
                setCurrentRecitation(recentlyPlayed[0], false);
                navigation.navigate("RecitationDetail", { recitation: recentlyPlayed[0] });
              }}
            >
              <Text style={styles.recentItemTitle}>{recentlyPlayed[0].title}</Text>
              <Text style={styles.recentItemSubtitle}>{recentlyPlayed[0].reciter_name}</Text>
            </Pressable>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>All Recitations</Text>

        {filteredRecitations.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>
              {recitations.length === 0
                ? "No recitations available yet."
                : hasSearchOrFilter
                  ? "No recitations match your search or filter."
                  : "No recitations found."}
            </Text>
          </View>
        ) : null}
        <FlatList
          data={filteredRecitations}
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
              <View style={styles.itemIconWrap}>
                <Text style={styles.itemIconText}>▶</Text>
              </View>
              <View style={styles.itemTextWrap}>
                <Text style={styles.itemTitle}>{recitation.title}</Text>
                <Text style={styles.itemSubtitle}>{recitation.reciter_name}</Text>
              </View>
              <Text style={styles.itemDuration}>{formatDuration(recitation.duration)}</Text>
            </Pressable>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#ECECEC",
    padding: 12,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    flex: 1,
    borderRadius: 32,
    backgroundColor: "#F6F6F6",
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
    marginTop: 8,
    textAlign: "center",
  },
  headerTitle: {
    fontSize: 40,
    fontWeight: "700",
    marginBottom: 12,
    color: "#141414",
  },
  listContent: {
    paddingBottom: 120,
  },
  recentSection: {
    marginBottom: 12,
  },
  recentHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  recentItem: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    backgroundColor: "#fafafa",
    marginBottom: 8,
  },
  recentItemTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  recentItemSubtitle: {
    fontSize: 13,
    color: "#666666",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#0F766E",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  reciterFilterContainer: {
    minHeight: 52,
    marginBottom: 12,
    justifyContent: "center",
  },
  reciterFilterRow: {
    paddingVertical: 4,
    alignItems: "center",
  },
  reciterFilterList: {
    flexGrow: 0,
  },
  reciterChip: {
    height: 36,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#cfcfcf",
    backgroundColor: "#ffffff",
    marginRight: 8,
  },
  reciterChipSelected: {
    borderColor: "#0F766E",
    backgroundColor: "#0F766E",
  },
  reciterChipText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "500",
    color: "#333333",
  },
  reciterChipTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
    color: "#151515",
  },
  emptyStateContainer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 15,
    color: "#666666",
    textAlign: "center",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 52,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: "#F6F6F6",
  },
  itemIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#D4E5E0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  itemIconText: {
    color: "#0F766E",
    fontSize: 14,
    marginLeft: 1,
  },
  itemTextWrap: {
    flex: 1,
    marginRight: 8,
  },
  separator: {
    height: 10,
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 2,
    color: "#1A1A1A",
  },
  itemSubtitle: {
    fontSize: 14,
    color: "#666666",
  },
  itemDuration: {
    minWidth: 52,
    fontSize: 13,
    textAlign: "right",
    color: "#777777",
  },
  retryButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#333333",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}
