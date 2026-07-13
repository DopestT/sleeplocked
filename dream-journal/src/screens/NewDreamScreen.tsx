import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { useDreams } from "@/hooks/useDreams";
import { MoodPicker } from "@/components/MoodPicker";
import { TagInput } from "@/components/TagInput";
import { MoodId } from "@/constants/moods";
import { colors } from "@/theme/colors";

type Nav = NativeStackNavigationProp<RootStackParamList, "NewDream">;

export function NewDreamScreen() {
  const navigation = useNavigation<Nav>();
  const { addDream } = useDreams();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mood, setMood] = useState<MoodId>("strange");
  const [tags, setTags] = useState<string[]>([]);
  const [sleepQuality, setSleepQuality] = useState(3);

  const canSave = description.trim().length > 0;

  async function handleSave() {
    if (!canSave) return;
    const dream = await addDream({
      title: title.trim(),
      description: description.trim(),
      mood,
      tags,
      sleepQuality,
    });
    navigation.replace("DreamDetail", { dreamId: dream.id });
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="A short title for this dream"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>What happened?</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the dream in as much detail as you remember..."
          placeholderTextColor={colors.textMuted}
          multiline
        />

        <Text style={styles.label}>Mood</Text>
        <MoodPicker value={mood} onChange={setMood} />

        <Text style={styles.label}>Tags</Text>
        <TagInput tags={tags} onChange={setTags} />

        <Text style={styles.label}>Sleep quality</Text>
        <View style={styles.qualityRow}>
          {[1, 2, 3, 4, 5].map((value) => (
            <Pressable
              key={value}
              style={[
                styles.qualityDot,
                value <= sleepQuality && styles.qualityDotSelected,
              ]}
              onPress={() => setSleepQuality(value)}
            >
              <Text style={styles.qualityDotText}>{value}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!canSave}
        >
          <Text style={styles.saveButtonText}>Save & Visualize</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: {
    padding: 16,
    paddingBottom: 48,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: colors.textPrimary,
    fontSize: 15,
  },
  multiline: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  qualityRow: {
    flexDirection: "row",
    gap: 8,
  },
  qualityDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  qualityDotSelected: {
    backgroundColor: colors.accentMuted,
    borderColor: colors.accent,
  },
  qualityDotText: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 32,
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonText: {
    color: colors.background,
    fontWeight: "700",
    fontSize: 16,
  },
});
