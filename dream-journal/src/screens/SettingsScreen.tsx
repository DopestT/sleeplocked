import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useDreams } from "@/hooks/useDreams";
import { colors } from "@/theme/colors";

export function SettingsScreen() {
  const { dreams, clearAllDreams } = useDreams();

  function handleClearData() {
    Alert.alert(
      "Clear all dreams?",
      `This deletes all ${dreams.length} logged dreams from this device. This can't be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => clearAllDreams(),
        },
      ]
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>About</Text>
      <Text style={styles.body}>
        Dream Visualizer turns a written dream journal entry into a generated
        visual scene and surfaces patterns (mood, recurring tags, sleep
        quality) across your entries over time.
      </Text>
      <Text style={styles.body}>
        Visualizations today are generated entirely on-device from your
        dream's text and mood — no photo or network call involved. That
        keeps journaling private and instant, and is designed so a real
        image-generation backend can be swapped in later behind the same
        interface (see services/dreamVisualization).
      </Text>

      <Text style={styles.sectionTitle}>Data</Text>
      <View style={styles.row}>
        <Text style={styles.body}>{dreams.length} dreams stored on this device</Text>
      </View>
      <Pressable style={styles.dangerButton} onPress={handleClearData}>
        <Text style={styles.dangerButtonText}>Clear all dreams</Text>
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
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 8,
  },
  body: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  row: {
    marginBottom: 12,
  },
  dangerButton: {
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  dangerButtonText: {
    color: colors.danger,
    fontWeight: "600",
  },
});
