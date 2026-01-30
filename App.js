import React, { useEffect, useRef } from "react";
import { StatusBar, BackHandler, Platform, AppState } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TabNavigator from "./src/navigation/TabNavigator";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { CartProvider } from "./src/context/CartContext";
import { FavoritesProvider } from "./src/context/FavoritesContext";

function AppContent() {
  const { isDark, navTheme, colors } = useTheme();
  const navigationRef = useRef(null);
  const routeNameRef = useRef();
  const appState = useRef(AppState.currentState);

  // Handle Android Back Button globally
  useEffect(() => {
    const backAction = () => {
      if (!navigationRef.current) return false;

      const currentRoute = navigationRef.current.getCurrentRoute();
      const routeName = currentRoute?.name;

      // Define root screens where back button should exit app
      const rootScreens = ['Products', 'FavoritesTab'];
      
      if (rootScreens.includes(routeName)) {
        // Allow default behavior (exit app)
        return false;
      }

      // For other screens, navigate back
      if (navigationRef.current.canGoBack()) {
        navigationRef.current.goBack();
        return true;
      }

      // If can't go back, exit app
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, []);

  // Handle app state changes (minimized/resumed)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to foreground - restore state if needed
        console.log('App resumed from background');
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  return (
    <NavigationContainer 
      ref={navigationRef}
      theme={navTheme}
      onReady={() => {
        routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
      }}
      onStateChange={async () => {
        const previousRouteName = routeNameRef.current;
        const currentRouteName = navigationRef.current?.getCurrentRoute()?.name;

        if (previousRouteName !== currentRouteName) {
          // Track navigation for analytics if needed
          console.log('Navigation:', previousRouteName, '→', currentRouteName);
        }

        routeNameRef.current = currentRouteName;
      }}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
        translucent={false}
      />

      <TabNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <FavoritesProvider>
            <CartProvider>
              <AppContent />
            </CartProvider>
          </FavoritesProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}