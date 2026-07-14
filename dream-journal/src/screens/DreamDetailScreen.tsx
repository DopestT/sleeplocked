import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "@/navigation/types";
import { useDreams } from "@/hooks/useDreams";
import { getMood } from "@/constants/moods";
import { colors } from "@/theme/colors";
import { DreamVisualization } from "@/components/DreamVisualization";
import { DreamScene } from "@/services/dreamVisualization/types";
import { createVisualizationProvider } from "@/services/dreamVisualization";
import { EmptyState } from "@/components/EmptyState";

const provider = createVisualizationProvider();

type Nav = NativeStackNavigationProp<RootStackParamList, "DreamDetail">;
type Route = RouteProp<RootStackParamList, "DreamDetail">;

export function DreamDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { getDream, removeDream } = useDreams();
  const dream = getDream(route.params.dreamId);
  const [scene, setScene] = useState<DreamScene | null>(null);

  useEffect(() => {
    if (!dream) return;
    provider
      .generateScene({
        title: dream.title,
        description: dream.description,
        mood: dream.mood,
        tags: dream.tags,
        seed: dream.visualizationSeed,
      })
      .then(setScene);
  }, [dream]);

  if (!dream) {
    return <EmptyState title="Dream not found" subtitle="It may have been deleted." />;
  }

  const mood = getMood(dream.mood);
  const dreamId = dream.id;

  function handleDelete() {
    Alert.alert("Delete dream?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await removeDream(dreamId);
          navigation.goBack();
        },
      },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {scene && <DreamVisualization scene={scene} />}
      <Text style={styles.title}>{dream.title || "Untitled dream"}</Text>
      <Text style={styles.meta}>
        {mood.emoji} {mood.label} · {new Date(dream.createdAt).toLocaleString()} ·
        Sleep quality {dream.sleepQuality}/5
      </Text>
      {dream.tags.length > 0 && (
        <View style={styles.tagRow}>
          {dream.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}
      <Text style={styles.description}>{dream.description}</Text>
      <Pressable style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>Delete dream</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "700",
    marginTop: 16,
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 6,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  tag: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  tagText: {
    color: colors.accent,
    fontSize: 12,
  },
  description: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 20,
  },
  deleteButton: {
    marginTop: 32,
    alignItems: "center",
    paddingVertical: 12,
  },
  deleteButtonText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "600",
  },
});
