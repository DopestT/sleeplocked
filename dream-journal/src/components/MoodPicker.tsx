import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MOODS, MoodId } from "@/constants/moods";
import { colors } from "@/theme/colors";

interface Props {
  value: MoodId;
  onChange: (mood: MoodId) => void;
}

export function MoodPicker({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {MOODS.map((mood) => {
        const selected = mood.id === value;
        return (
          <Pressable
            key={mood.id}
            style={[styles.chip, selected && styles.chipSelected]}
            onPress={() => onChange(mood.id)}
          >
            <Text style={styles.emoji}>{mood.emoji}</Text>
            <Text style={[styles.label, selected && styles.labelSelected]}>
              {mood.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  chipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceRaised,
  },
  emoji: {
    fontSize: 16,
    marginRight: 6,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  labelSelected: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
});
