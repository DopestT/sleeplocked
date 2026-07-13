import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "@/theme/colors";
import { SUGGESTED_TAGS } from "@/constants/tags";

interface Props {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ tags, onChange }: Props) {
  const [draft, setDraft] = useState("");

  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase().replace(/\s+/g, "-");
    if (!tag || tags.includes(tag)) return;
    onChange([...tags, tag]);
    setDraft("");
  }

  function removeTag(tag: string) {
    onChange(tags.filter((existing) => existing !== tag));
  }

  const suggestions = SUGGESTED_TAGS.filter((tag) => !tags.includes(tag));

  return (
    <View>
      <View style={styles.row}>
        {tags.map((tag) => (
          <Pressable key={tag} style={styles.tag} onPress={() => removeTag(tag)}>
            <Text style={styles.tagText}>#{tag} ✕</Text>
          </Pressable>
        ))}
      </View>
      <TextInput
        style={styles.input}
        value={draft}
        onChangeText={setDraft}
        placeholder="Add a tag and press enter"
        placeholderTextColor={colors.textMuted}
        onSubmitEditing={() => addTag(draft)}
        returnKeyType="done"
      />
      <View style={styles.row}>
        {suggestions.slice(0, 6).map((tag) => (
          <Pressable
            key={tag}
            style={styles.suggestion}
            onPress={() => addTag(tag)}
          >
            <Text style={styles.suggestionText}>+ {tag}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  tagText: {
    color: colors.accent,
    fontSize: 13,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  suggestion: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  suggestionText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
});
