import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Dream } from "@/types/dream";
import { getMood } from "@/constants/moods";
import { colors } from "@/theme/colors";
import { DreamVisualization } from "./DreamVisualization";
import { DreamScene } from "@/services/dreamVisualization/types";
import { createVisualizationProvider } from "@/services/dreamVisualization";

const provider = createVisualizationProvider();

interface Props {
  dream: Dream;
  onPress: () => void;
}

export function DreamCard({ dream, onPress }: Props) {
  const [scene, setScene] = useState<DreamScene | null>(null);
  const mood = getMood(dream.mood);

  useEffect(() => {
    let cancelled = false;
    provider
      .generateScene({
        title: dream.title,
        description: dream.description,
        mood: dream.mood,
        tags: dream.tags,
        seed: dream.visualizationSeed,
      })
      .then((result) => {
        if (!cancelled) setScene(result);
      });
    return () => {
      cancelled = true;
    };
  }, [dream]);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.thumb}>
        {scene && <DreamVisualization scene={scene} />}
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {dream.title || "Untitled dream"}
        </Text>
        <Text style={styles.meta}>
          {mood.emoji} {mood.label} · {new Date(dream.createdAt).toLocaleDateString()}
        </Text>
        {dream.tags.length > 0 && (
          <Text style={styles.tags} numberOfLines={1}>
            {dream.tags.map((tag) => `#${tag}`).join("  ")}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumb: {
    width: 64,
    height: 64,
    marginRight: 12,
  },
  body: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  tags: {
    color: colors.accent,
    fontSize: 12,
    marginTop: 4,
  },
});
