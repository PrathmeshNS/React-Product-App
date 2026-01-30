import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";
import { DefaultTheme, DarkTheme } from "@react-navigation/native";

const THEME_KEY = "appTheme";

// Navigation themes (compatible with react-navigation)
const MyLightNavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#007AFF",
    background: "#F8F9FA",
    card: "#FFFFFF",
    text: "#1A1A1A",
    border: "#E5E5EA",
    notification: "#FF3B30",
  },
};

const MyDarkNavTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: "#0A84FF",
    background: "#121212",
    card: "#1C1C1E",
    text: "#FFFFFF",
    border: "#2C2C2E",
    notification: "#FF453A",
  },
};

export const lightTheme = {
  background: "#F8F9FA",
  text: "#1A1A1A",
  card: "#FFFFFF",
  primary: "#007AFF",
  placeholder: "#999",
  searchBg: "#F0F2F5",
  error: "#FF3B30",
};

export const darkTheme = {
  background: "#121212",
  text: "#FFFFFF",
  card: "#1C1C1E",
  primary: "#0A84FF",
  placeholder: "#AAA",
  searchBg: "#171717",
  error: "#FF453A",
};

export const ThemeContext = createContext({
  themeName: "system",
  setTheme: () => {},
  toggleTheme: () => {},
  isDark: false,
  colors: lightTheme,
  navTheme: MyLightNavTheme,
});

export function ThemeProvider({ children }) {
  const system = useColorScheme();
  const [themeName, setThemeName] = useState("system"); // 'light' | 'dark' | 'system'

  // Load persisted theme on start
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_KEY);
        if (saved) setThemeName(saved);
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  // Persist changes
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(THEME_KEY, themeName);
      } catch (e) {
        // ignore
      }
    })();
  }, [themeName]);

  const isDark = themeName === "dark" || (themeName === "system" && system === "dark");
  const colors = isDark ? darkTheme : lightTheme;
  const navTheme = isDark ? MyDarkNavTheme : MyLightNavTheme;

  // Simple toggle: light <-> dark (system is treated as a default but toggle switches between explicit light/dark)
  const toggleTheme = () => setThemeName((prev) => (prev === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ themeName, setTheme: setThemeName, toggleTheme, isDark, colors, navTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  // convenience hook
  return React.useContext(ThemeContext);
}
