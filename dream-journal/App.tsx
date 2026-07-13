import React from "react";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { DreamsProvider } from "@/context/DreamsContext";
import { RootNavigator } from "@/navigation/RootNavigator";
import { colors } from "@/theme/colors";

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.background,
    text: colors.textPrimary,
    border: colors.border,
    primary: colors.accent,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <DreamsProvider>
        <StatusBar style="light" />
        <NavigationContainer theme={navigationTheme}>
          <RootNavigator />
        </NavigationContainer>
      </DreamsProvider>
    </SafeAreaProvider>
  );
}
