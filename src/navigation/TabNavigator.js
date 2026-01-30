import { View, Platform, Text, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useTheme } from "../context/ThemeContext";

// Import your screens
import FavoritesScreen from "../screens/FavoritesScreen";

// Create stacks
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Use the centralized StackNavigator that includes Products, Details, Checkout and PaymentResult
import StackNavigator from "./StackNavigator";

export default function TabNavigator() {
  const { isDark, colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        headerShown: false, // We use our own custom headers in the screens
        tabBarShowLabel: false, // Clean look (icons only)
        tabBarStyle: ((route) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? '';
          
          // Hide tab bar on these screens for full immersive experience
          if (routeName === 'Details' || routeName === 'Cart' || routeName === 'Checkout' || routeName === 'PaymentResult') {
            return { display: 'none' };
          }
          
          return {
            position: "absolute",
            bottom: 25,
            left: 20,
            right: 20,
            elevation: 5, // Shadow for Android
            backgroundColor: colors.card,
            borderRadius: 15,
            height: 60,
            ...styles.shadow, // Shadow for iOS
          };
        })(route),
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
                {badge && (
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
        // Only show a badge for Favorites tab
        tabBarBadge: (() => {
          try {
            if (route.name === "FavoritesTab") {
              const { useFavorites } = require("../context/FavoritesContext");
              const { count } = useFavorites();
              return count > 0 ? count : undefined;
            }
            return undefined;
          } catch (e) {
            return undefined;
          }
        })(),
      })}
    >
      <Tab.Screen name="HomeTab" component={StackNavigator} />
      <Tab.Screen name="FavoritesTab" component={FavoritesScreen} />
      {/* <Tab.Screen name="CheckoutTab" component={PaymentResultScreen} /> */}
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