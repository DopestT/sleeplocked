import React, { useLayoutEffect } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { useDreams } from "@/hooks/useDreams";
import { DreamCard } from "@/components/DreamCard";
import { EmptyState } from "@/components/EmptyState";
import { colors } from "@/theme/colors";

type Nav = NativeStackNavigationProp<RootStackParamList, "Home">;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { dreams, isLoading } = useDreams();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerActions}>
          <Pressable onPress={() => navigation.navigate("Patterns")}>
            <Text style={styles.headerLink}>Patterns</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate("Settings")}>
            <Text style={styles.headerLink}>Settings</Text>
          </Pressable>
        </View>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <FlatList
        data={dreams}
        keyExtractor={(dream) => dream.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <DreamCard
            dream={item}
            onPress={() =>
              navigation.navigate("DreamDetail", { dreamId: item.id })
            }
          />
        )}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              title="No dreams logged yet"
              subtitle="Tap “Log a Dream” to write one down and see it visualized."
            />
          ) : null
        }
      />
      <Pressable
        style={styles.newButton}
        onPress={() => navigation.navigate("NewDream")}
      >
        <Text style={styles.newButtonText}>+ Log a Dream</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: 16,
    paddingBottom: 96,
    flexGrow: 1,
  },
  headerActions: {
    flexDirection: "row",
    gap: 16,
  },
  headerLink: {
    color: colors.accent,
    fontSize: 14,
    marginLeft: 16,
  },
  newButton: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  newButtonText: {
    color: colors.background,
    fontWeight: "700",
    fontSize: 16,
  },
});
