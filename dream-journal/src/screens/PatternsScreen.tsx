import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useDreams } from "@/hooks/useDreams";
import { colors, moodColors } from "@/theme/colors";
import { MOODS } from "@/constants/moods";
import { BarChart } from "@/components/BarChart";
import { LineChart } from "@/components/LineChart";
import { EmptyState } from "@/components/EmptyState";

export function PatternsScreen() {
  const { dreams } = useDreams();

  const moodData = useMemo(
    () =>
      MOODS.map((mood) => ({
        label: mood.emoji,
        value: dreams.filter((dream) => dream.mood === mood.id).length,
        color: moodColors[mood.id],
      })).filter((datum) => datum.value > 0 || dreams.length === 0),
    [dreams]
  );

  const tagData = useMemo(() => {
    const counts = new Map<string, number>();
    dreams.forEach((dream) =>
      dream.tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1))
    );
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([tag, count]) => ({ label: `#${tag}`, value: count }));
  }, [dreams]);

  const sleepTrend = useMemo(
    () =>
      [...dreams]
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        .slice(-14)
        .map((dream) => dream.sleepQuality),
    [dreams]
  );

  if (dreams.length === 0) {
    return (
      <EmptyState
        title="Nothing to show yet"
        subtitle="Log a few dreams and your patterns will appear here."
      />
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.summary}>{dreams.length} dreams logged</Text>

      <Text style={styles.sectionTitle}>Moods</Text>
      <View style={styles.card}>
        <BarChart data={moodData} />
      </View>

      {tagData.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Most common tags</Text>
          <View style={styles.card}>
            <BarChart data={tagData} />
          </View>
        </>
      )}

      <Text style={styles.sectionTitle}>Sleep quality trend</Text>
      <View style={styles.card}>
        <LineChart values={sleepTrend} />
        <Text style={styles.caption}>Last {sleepTrend.length} entries, oldest to newest</Text>
      </View>
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
  summary: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 16,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  caption: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 8,
    textAlign: "center",
  },
});
