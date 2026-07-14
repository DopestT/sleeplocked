import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";
import { colors } from "@/theme/colors";
import { HomeScreen } from "@/screens/HomeScreen";
import { NewDreamScreen } from "@/screens/NewDreamScreen";
import { DreamDetailScreen } from "@/screens/DreamDetailScreen";
import { PatternsScreen } from "@/screens/PatternsScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Dream Visualizer" }}
      />
      <Stack.Screen
        name="NewDream"
        component={NewDreamScreen}
        options={{ title: "New Dream" }}
      />
      <Stack.Screen
        name="DreamDetail"
        component={DreamDetailScreen}
        options={{ title: "Dream" }}
      />
      <Stack.Screen
        name="Patterns"
        component={PatternsScreen}
        options={{ title: "Patterns" }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: "Settings" }}
      />
    </Stack.Navigator>
  );
}
