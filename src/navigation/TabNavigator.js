import { View, Platform, Text, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from "../context/ThemeContext";

// Import your screens
import FavoritesScreen from "../screens/FavoritesScreen";

// Create stacks
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Use the centralized StackNavigator that includes Products, Details, Checkout and PaymentResult
import StackNavigator from "./StackNavigator";

// Helper function to determine tab bar visibility
const getTabBarVisibility = (route) => {
  const routeName = getFocusedRouteNameFromRoute(route) ?? '';
  
  // Hide tab bar on these screens for full immersive experience
  const screensWithoutTabBar = ['Details', 'Cart', 'Checkout', 'PaymentResult'];
  
  return !screensWithoutTabBar.includes(routeName);
};

export default function TabNavigator() {
  const { isDark, colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        headerShown: false, // We use our own custom headers in the screens
        tabBarShowLabel: false, // Clean look (icons only)
        tabBarStyle: (() => {
          const isVisible = getTabBarVisibility(route);
          
          if (!isVisible) {
            return { display: 'none' };
          }
          
          return {
            position: "absolute",
            // Lift tab bar above system navigation by ~20px (safe-area aware)
            bottom: insets.bottom + 0,
            left: 20,
            right: 20,
            elevation: 8, // Higher elevation for Android to avoid conflicts
            backgroundColor: colors.card,
            borderRadius: 15,
            height: 50 ,
            paddingBottom: Platform.OS === 'android' ? Math.max(5, insets.bottom / 2) : insets.bottom ? insets.bottom : 0,
            borderTopWidth: 0, // Remove default border
            ...styles.shadow, // Shadow for iOS
          };
        })(),
        tabBarHideOnKeyboard: true, // Hide tab bar when keyboard appears on Android
        // Icon logic (supports badges for cart & favorites)
        tabBarIcon: ({ focused }) => {
          const IconWithBadge = () => {
            // Import hooks inside to use React hooks
            const { useCart } = require("../context/CartContext");
            const { useFavorites } = require("../context/FavoritesContext");
            const { count: cartCount } = useCart();
            const { count: favCount } = useFavorites();

            const color = focused ? colors.primary : (isDark ? "#777" : "#C1C1C1");
            let iconName = "";
            let badge = undefined;

            if (route.name === "HomeTab") {
              iconName = "🏠";
              // Home tab does not show a counter/badge
            } else if (route.name === "FavoritesTab") {
              iconName = "❤️";
              badge = favCount > 0 ? String(favCount) : 0;
            }

            return (
              <View style={{ alignItems: "center", justifyContent: "center", top: Platform.OS === "ios" ? 10 : 0 }}>
                <Text style={{ fontSize: 25, color: color }}>{iconName}</Text>
                {badge > 0 && (
                  <View style={{ position: "absolute", right: -6, top: 2, backgroundColor: "#FF3B30", minWidth: 18, paddingHorizontal: 6, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>{badge}</Text>
                  </View>
                )}
                {focused && (
                  <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: color, marginTop: 20 }} />
                )}
              </View>
            );
          };

          return <IconWithBadge />;
        },
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={StackNavigator}
        listeners={({ navigation, route }) => ({
          tabPress: (e) => {
            // Reset stack to Products screen when Home tab is pressed
            const state = navigation.getState();
            const homeState = state.routes.find(r => r.name === 'HomeTab');
            
            // If already on HomeTab and on a nested screen, reset to Products
            if (homeState && getFocusedRouteNameFromRoute(homeState) !== 'Products') {
              navigation.navigate('HomeTab', { screen: 'Products' });
            }
          },
        })}
      />
      <Tab.Screen 
        name="FavoritesTab" 
        component={FavoritesScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Scroll to top or refresh when tab is pressed again
          },
        })}
      />
    </Tab.Navigator>
  );
}

// Styles for the shadow
const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
});